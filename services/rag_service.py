"""
services/rag_service.py

Retrieval-Augmented Generation (RAG) pipeline.

Flow:
    1. Receive user query + mode (global | project)
    2. Embed the query using the configured embedding model
    3. Retrieve top-k relevant documents from ChromaDB
    4. Build a prompt with retrieved context
    5. Pass prompt to the LLM
    6. Return AI response + source metadata (including image URLs)

Modes:
    - "ai"  → global search across all projects
    - "web" → project-specific search filtered by project_id
"""

import logging
from typing import Optional, Dict, Any, List

from langchain.schema import Document
from langchain.prompts import ChatPromptTemplate
from langchain.schema.runnable import RunnablePassthrough
from langchain.schema.output_parser import StrOutputParser
import json

logger = logging.getLogger("services")

import re

# ------------------------------------------------------------------
# Intent Classification Prompts
# ------------------------------------------------------------------
INTENT_SYSTEM_PROMPT = """You are an AI intent classifier for a portfolio chatbot system.

Your job is to classify a user's query based on intent and context.

## 🎯 Context
* The user may currently be viewing a specific project page.
* The system supports both:
  1. Project-specific queries
  2. Global portfolio queries
  3. General/off-topic conversation

You are given:
* `user_query`: the user's message
* `current_project`: the project the user is currently viewing (can be null)

## 🧠 Task
Classify the query into ONE of the following categories:
1. "project"
   → The query is specifically about the current project
2. "global"
   → The query is about other projects or the entire portfolio
3. "cross_project"
   → The query compares or refers to multiple projects
4. "other"
   → Irrelevant, general, or chitchat

## ⚠️ Rules
* If the query mentions something not related to the current project → do NOT classify as "project"
* If the query is ambiguous → prefer "global"
* Do NOT explain your answer
* Return ONLY a valid JSON

## 📦 Output Format
{{
"intent": "project | global | cross_project | other"
}}
"""

INTENT_HUMAN_PROMPT = "user_query: \"{user_query}\"\ncurrent_project: \"{current_project}\""

# ------------------------------------------------------------------
# System prompt template
# Instructs the LLM how to answer using provided context
# ------------------------------------------------------------------
RAG_SYSTEM_PROMPT = """You are a portfolio assistant. Your sole purpose is to answer questions strictly about the projects, skills, and work documented in the portfolio knowledge base provided to you.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔒 HARD RULES — MUST BE FOLLOWED WITHOUT EXCEPTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RULE 1 — CONTEXT IS YOUR ONLY SOURCE OF TRUTH
  • You MAY ONLY use facts explicitly present in the [Context] block below.
  • You MUST NOT use any knowledge from your training data, memory, or assumptions.
  • If a fact is not in the [Context], treat it as unknown — regardless of how confident you feel.

RULE 2 — DO NOT GUESS OR INFER
  • Never extrapolate, estimate, or make up details not directly stated in the [Context].
  • Do NOT say things like "likely", "probably", "I assume", or "it could be".
  • If you are unsure, use the exact fallback phrase from Rule 3.

RULE 3 — MANDATORY FALLBACK PHRASE
  • If the answer is not found in the [Context], you MUST respond with EXACTLY this phrase:
      "I don't have that information in this portfolio's knowledge base."
  • Do NOT apologize, elaborate, or guess after saying this phrase.

RULE 4 — SCOPE RESTRICTION
  • If the user asks about general topics (news, sports, weather, science, coding theory, etc.)
    that are NOT about THIS portfolio's projects or skills, respond with EXACTLY:
      "I can only answer questions about this portfolio and its projects."
  • Do NOT answer general-knowledge questions, even if you know the answer.

RULE 5 — NO HALLUCINATION UNDER ANY CIRCUMSTANCES
  • Never invent project names, statistics, technologies, dates, metrics, or names.
  • If the user asks for something specific (e.g., "What was the conversion rate?") and the
    [Context] doesn't state it, say the Rule 3 fallback — period.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Context] — THIS IS YOUR ONLY ALLOWED SOURCE:
{context}

[Chat History] — Use ONLY to resolve follow-up references (e.g., "the first one", "that project").
DO NOT use history to invent new facts:
{chat_history}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"""

RAG_HUMAN_PROMPT = "{question}"


class RAGService:
    """
    Orchestrates the full RAG pipeline:
      - Retrieves documents from VectorStoreService
      - Constructs a prompt with context
      - Queries the LLM
      - Returns response + metadata
    """

    def __init__(self, llm, vector_store_service):
        """
        Args:
            llm: A LangChain-compatible LLM (ChatOpenAI, ChatGoogleGenerativeAI, Ollama)
            vector_store_service: An instance of VectorStoreService
        """
        self.llm = llm
        self.vector_store = vector_store_service

        # Build a reusable prompt template
        self.prompt_template = ChatPromptTemplate.from_messages([
            ("system", RAG_SYSTEM_PROMPT),
            ("human", RAG_HUMAN_PROMPT),
        ])
        
        self.intent_template = ChatPromptTemplate.from_messages([
            ("system", INTENT_SYSTEM_PROMPT),
            ("human", INTENT_HUMAN_PROMPT),
        ])

        logger.info("RAGService initialized.")

    # ------------------------------------------------------------------
    # Main entry point
    # ------------------------------------------------------------------

    def chat(
        self,
        query: str,
        mode: str = "ai",
        project_id: Optional[str] = None,
        chat_history: Optional[List[Dict[str, str]]] = None,
        k: int = 5,
    ) -> Dict[str, Any]:
        """
        Full RAG pipeline for a user query.

        Args:
            query: The user's question
            mode: "ai" (global) or "web" (project-specific)
            project_id: Required when mode="web"
            k: Number of documents to retrieve

        Returns:
            dict with keys:
                - answer      (str): LLM-generated response
                - sources     (list): Retrieved document metadata
                - mode        (str): The mode used
                - project_id  (str|None): Project used (if any)
        """
        logger.info(f"RAG chat | mode='{mode}' | project_id='{project_id}' | query='{query[:60]}'")
        
        chat_history = chat_history or []

        # Step 0: Classify intent to auto-adjust routing and handle chitchat
        intent = self._classify_intent(query, project_id or "global portfolio")
        logger.info(f"Intent classified as: {intent}")
        
        # Short-circuit for general/chitchat questions ("hey how are you")
        if intent == "other":
            return {
                "answer": "Hello! I am an AI assistant here to help you explore this portfolio. Feel free to ask me questions about the projects, skills, or experience shown here.",
                "sources": [],
                "mode": mode,
                "project_id": project_id,
            }

        original_mode = mode
        if mode == "web" and project_id:
            # If user asks out-of-scope question while on project page, dynamically switch to global mode
            if intent in ["global", "cross_project"]:
                mode = "ai"
                # We keep project_id to know the context contextually, but mode='ai' avoids strict filtering.

        # Step 1: Retrieve relevant documents
        # Expand query with recent history to ensure follow-up questions retrieve relevant docs
        search_query = query
        if chat_history:
            recent_msgs = []
            for i in range(max(0, len(chat_history) - 2), len(chat_history)):
                recent_msgs.append(chat_history[i].get("content", ""))
            recent_context = " ".join(recent_msgs)
            search_query = f"{recent_context} {query}"

        documents = self._retrieve_documents(search_query, mode, project_id, k)

        # Short-circuit: if no relevant documents found, refuse immediately
        # (don't waste an LLM call on an out-of-scope query)
        if not documents:
            return {
                "answer": "I can only answer questions about this portfolio and its projects. I don't have information about that topic.",
                "sources": [],
                "mode": mode,
                "project_id": project_id,
            }

        # Step 2: Build context string from retrieved docs
        context = self._build_context(documents)

        # Step 3: Generate response from LLM
        answer = self._generate_answer(query, context, chat_history)

        # Step 4: Extract metadata from sources (for frontend)
        # We also want to remove duplicate sources if they exist
        sources = self._extract_sources(documents)

        logger.info(f"RAG response generated. Sources: {len(sources)}")

        return {
            "answer": answer,
            "sources": sources,
            "mode": mode,
            "project_id": project_id,
        }

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _classify_intent(self, query: str, project_id: str) -> str:
        """
        Uses the LLM to classify the query intent.
        Returns one of: 'project', 'global', 'cross_project', 'other'.
        """
        try:
            chain = self.intent_template | self.llm | StrOutputParser()
            response = chain.invoke({
                "user_query": query,
                "current_project": project_id
            })
            
            # Remove DeepSeek <think>...</think> blocks if present
            response = re.sub(r"<think>.*?</think>\n*", "", response, flags=re.DOTALL).strip()
            
            # Extremely basic JSON extraction in case there's markdown wrapper
            if "```json" in response:
                response = response.split("```json")[-1].split("```")[0].strip()
            elif "```" in response:
                response = response.split("```")[-1].split("```")[0].strip()
                
            data = json.loads(response)
            return data.get("intent", "global")
        except Exception as e:
            logger.error(f"Intent classification failed: {e}")
            return "global"  # safe fallback

    def _retrieve_documents(
        self,
        query: str,
        mode: str,
        project_id: Optional[str],
        k: int,
    ) -> List[Document]:
        """
        Dispatch to the correct search method based on mode.
        Falls back to global search if project_id is missing in web mode.
        """
        if mode == "web" and project_id:
            docs = self.vector_store.search_by_project(query, project_id, k=k)
            # Fallback: if no project docs found, do global search
            if not docs:
                logger.warning(
                    f"No docs found for project '{project_id}'. Falling back to global search."
                )
                docs = self.vector_store.search_global(query, k=k)
        else:
            # Default: global AI mode
            docs = self.vector_store.search_global(query, k=k)

        return docs

    def _build_context(self, documents: List[Document]) -> str:
        """
        Concatenate retrieved document contents into a single context string.
        Each document is prefixed with its project and title metadata.
        """
        if not documents:
            return "No relevant documents found in the knowledge base."

        context_parts = []
        for i, doc in enumerate(documents, start=1):
            meta = doc.metadata
            project = meta.get("project_id", "Unknown")
            title = meta.get("title", "Untitled")
            context_parts.append(
                f"[Document {i}] Project: {project} | Title: {title}\n{doc.page_content}"
            )

        return "\n\n---\n\n".join(context_parts)

    def _generate_answer(self, question: str, context: str, chat_history: List[Dict[str, str]]) -> str:
        """
        Build the final prompt and call the LLM.
        Uses LangChain's LCEL (LangChain Expression Language) chain.
        """
        history_str = ""
        for msg in chat_history:
            role = "User" if msg.get("role") == "user" else "Assistant"
            history_str += f"{role}: {msg.get('content')}\n"

        try:
            # Build LCEL chain: prompt → LLM → parse string output
            chain = self.prompt_template | self.llm | StrOutputParser()
            answer = chain.invoke({
                "context": context, 
                "question": question,
                "chat_history": history_str
            })
            
            # Remove DeepSeek <think>...</think> blocks if present
            answer = re.sub(r"<think>.*?</think>\n*", "", answer, flags=re.DOTALL).strip()
            
            return answer
        except Exception as e:
            logger.error(f"LLM generation failed: {e}")
            # Return a graceful error message instead of crashing
            return (
                "I'm sorry, I encountered an error generating a response. "
                f"Please check the server logs. Error: {str(e)}"
            )

    def _extract_sources(self, documents: List[Document]) -> List[Dict[str, Any]]:
        """
        Extract metadata from retrieved documents to send back to the frontend.
        Frontend can use 'image_url' to display related project images.
        """
        sources = []
        seen_titles = set()
        
        for doc in documents:
            meta = doc.metadata
            title = meta.get("title", "")
            
            # Deduplicate by title to avoid redundant sources
            if title in seen_titles:
                continue
            seen_titles.add(title)
            
            sources.append({
                "project_id": meta.get("project_id", ""),
                "title": title,
                "image_url": meta.get("image_url", ""),
                "snippet": doc.page_content[:200] + "..." if len(doc.page_content) > 200 else doc.page_content,
            })
        return sources
