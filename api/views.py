"""
api/views.py

Django REST Framework API views.

Endpoints:
    POST /chat             → ChatView
    POST /speech-to-text   → SpeechToTextView
    POST /ingest           → DocumentIngestView (for loading project data)
    GET  /health           → HealthCheckView

Each view is a class-based APIView for clean separation of concerns.
Service instances are created lazily (on first request) to avoid
importing heavy ML libraries at Django startup time.
"""

import os
import json
import logging
import tempfile
from pathlib import Path

from rest_framework.views import APIView
from django.db import connection
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from .serializers import ChatRequestSerializer, SpeechToTextResponseSerializer
from utils.service_registry import get_rag_service, get_speech_service

logger = logging.getLogger("api")


# ==================================================================
# Health Check
# ==================================================================

class HealthCheckView(APIView):
    """
    GET /health
    Simple health check endpoint.
    Returns 200 OK with provider information if services are running.
    """

    def get(self, request):
        provider = os.getenv("LLM_PROVIDER", "openai")

        # Include Redis cache stats for observability
        try:
            from utils.service_registry import get_cache_service
            cache_stats = get_cache_service().get_stats()
        except Exception as e:
            cache_stats = {"status": "error", "details": str(e)}

        return Response(
            {
                "status": "ok",
                "llm_provider": provider,
                "message": "Chatbot API is running.",
                "cache": cache_stats,
            },
            status=status.HTTP_200_OK,
        )


# ==================================================================
# Chat  —  POST /chat
# ==================================================================

class ChatView(APIView):
    """
    POST /chat

    Body (JSON):
        {
            "query": "What is this project about?",
            "mode": "ai",             // "ai" | "web"
            "project_id": "proj_001"  // required if mode="web"
        }

    Response:
        {
            "answer": "...",
            "mode": "ai",
            "project_id": null,
            "sources": [
                {
                    "project_id": "...",
                    "title": "...",
                    "image_url": "...",
                    "snippet": "..."
                }
            ]
        }
    """

    def post(self, request):
        logger.info(f"ChatView received request: {request.data}")

        # Step 1: Validate request data using serializer
        serializer = ChatRequestSerializer(data=request.data)
        if not serializer.is_valid():
            logger.warning(f"Chat request validation failed: {serializer.errors}")
            return Response(
                {"error": "Invalid request", "details": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        validated = serializer.validated_data
        query = validated["query"]
        mode = validated["mode"]
        project_id = validated.get("project_id")
        chat_history = validated.get("chat_history", [])

        # Step 2: Get RAG service (lazy initialized singleton)
        try:
            rag_service = get_rag_service()
        except Exception as e:
            logger.error(f"Failed to initialize RAG service: {e}")
            return Response(
                {
                    "error": "Service initialization failed.",
                    "details": str(e),
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        # Step 3: Run RAG pipeline
        try:
            result = rag_service.chat(
                query=query,
                mode=mode,
                project_id=project_id,
                chat_history=chat_history,
            )
        except Exception as e:
            logger.error(f"RAG pipeline error: {e}", exc_info=True)
            return Response(
                {
                    "error": "Failed to generate response.",
                    "details": str(e),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        logger.info(f"Chat response generated successfully for query: '{query[:50]}'")
        return Response(result, status=status.HTTP_200_OK)


# ==================================================================
# Speech-to-Text  —  POST /speech-to-text
# ==================================================================

class SpeechToTextView(APIView):
    """
    POST /speech-to-text

    Accepts an audio file (multipart/form-data) and returns transcribed text.

    Form Data:
        audio: <audio file> (required) — WebM, MP3, WAV, M4A, etc.

    Response:
        {
            "transcript": "Hello, can you tell me about project X?",
            "provider": "whisper"
        }
    """

    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        logger.info("SpeechToTextView received audio upload.")

        # Validate that an audio file was provided
        if "audio" not in request.FILES:
            return Response(
                {"error": "No audio file provided. Send audio as 'audio' field."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        audio_file = request.FILES["audio"]
        logger.info(
            f"Audio file received: name='{audio_file.name}' | "
            f"size={audio_file.size} bytes | type='{audio_file.content_type}'"
        )

        # Validate file size (max 25MB — Whisper API limit)
        max_size = 25 * 1024 * 1024  # 25MB
        if audio_file.size > max_size:
            return Response(
                {"error": "Audio file is too large. Maximum size is 25MB."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Save to temp file (Whisper needs a file path, not a stream)
        try:
            suffix = Path(audio_file.name).suffix or ".webm"
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                for chunk in audio_file.chunks():
                    tmp.write(chunk)
                tmp_path = tmp.name
            logger.debug(f"Audio saved to temp file: {tmp_path}")
        except Exception as e:
            logger.error(f"Failed to save audio file: {e}")
            return Response(
                {"error": "Failed to save audio file.", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # Transcribe
        try:
            speech_service = get_speech_service()
            transcript = speech_service.transcribe(tmp_path)
            provider = (
                "whisper"
                if os.getenv("LLM_PROVIDER", "openai") == "openai" and os.getenv("OPENAI_API_KEY")
                else "mock"
            )
        except Exception as e:
            logger.error(f"Transcription error: {e}", exc_info=True)
            return Response(
                {"error": "Transcription failed.", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        finally:
            # Always clean up temp file
            try:
                os.unlink(tmp_path)
                logger.debug(f"Temp file deleted: {tmp_path}")
            except Exception as cleanup_err:
                logger.warning(f"Could not delete temp file {tmp_path}: {cleanup_err}")

        logger.info(f"Transcription successful: '{transcript[:80]}'")
        return Response(
            {"transcript": transcript, "provider": provider},
            status=status.HTTP_200_OK,
        )


# ==================================================================
# Document Ingest  —  POST /ingest
# ==================================================================

class DocumentIngestView(APIView):
    """
    POST /ingest

    Adds documents to ChromaDB for later retrieval.
    Use this to populate the knowledge base with project data.

    Body (JSON):
        {
            "documents": [
                {
                    "project_id": "ecommerce_001",
                    "content": "This is an e-commerce platform that...",
                    "title": "E-Commerce Platform Overview",
                    "image_url": "https://example.com/image.png"
                }
            ]
        }

    Response:
        {
            "message": "Successfully ingested 3 document(s).",
            "count": 3
        }
    """

    def post(self, request):
        documents = request.data.get("documents", [])

        if not documents or not isinstance(documents, list):
            return Response(
                {"error": "Provide a non-empty 'documents' list in the request body."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate each document has required fields
        for i, doc in enumerate(documents):
            if "content" not in doc or "project_id" not in doc:
                return Response(
                    {
                        "error": f"Document at index {i} is missing required fields: 'content', 'project_id'."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        try:
            rag_service = get_rag_service()
            count = rag_service.vector_store.add_documents(documents)
            logger.info(f"Ingested {count} documents via API.")
            return Response(
                {"message": f"Successfully ingested {count} document(s).", "count": count},
                status=status.HTTP_201_CREATED,
            )
        except Exception as e:
            logger.error(f"Document ingestion error: {e}", exc_info=True)
            return Response(
                {"error": "Ingestion failed.", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

# ==================================================================
# Categories API
# ==================================================================

class CategoryListView(APIView):
    """
    GET /api/categories
    Returns all unique categories from the database.
    """
    def get(self, request):
        query = "SELECT name FROM categories ORDER BY display_order ASC, name ASC"
        try:
            with connection.cursor() as cursor:
                cursor.execute(query)
                rows = cursor.fetchall()
            
            categories = [row[0] for row in rows]
            return Response(categories, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error fetching categories: {e}", exc_info=True)
            return Response({"error": "Failed to fetch categories."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



# ==================================================================
# Projects API
# ==================================================================

def _parse_jsonb(value):
    """Safely parse a JSONB field that may come back as a JSON string or already as list/dict."""
    if value is None:
        return []
    if isinstance(value, (list, dict)):
        return value
    try:
        return json.loads(value)
    except (TypeError, ValueError):
        return []


# Column order must match all SELECT queries below (22 fields total)
_PROJECT_SELECT = """
    p.id, p.title, p.description, p.tech_stack, p.image_url, p.created_at, c.name AS category,
    p.short_description, p.motivation, p.goal, p.problem_solved,
    p.architecture, p.design_process, p.skills,
    p.key_features, p.target_users, p.challenges, p.results,
    p.future_improvements, p.tags, p.keywords, p.faq
"""


def map_project_row(row):
    """Maps a DB row (tuple) to a rich project dict. Column order matches _PROJECT_SELECT."""
    return {
        "id":                  row[0],
        "title":               row[1],
        "description":         row[2],
        "tech_stack":          row[3],
        "image_url":           row[4],
        "created_at":          row[5],
        "category":            row[6],
        # Rich scalar fields
        "short_description":   row[7],
        "motivation":          row[8],
        "goal":                row[9],
        "problem_solved":      row[10],
        "architecture":        row[11],
        "design_process":      row[12],
        "skills":              row[13],
        # JSONB array fields — use _parse_jsonb since Django raw cursor
        # returns JSONB as strings, not Python objects
        "key_features":        _parse_jsonb(row[14]),
        "target_users":        _parse_jsonb(row[15]),
        "challenges":          _parse_jsonb(row[16]),
        "results":             _parse_jsonb(row[17]),
        "future_improvements": _parse_jsonb(row[18]),
        "tags":                _parse_jsonb(row[19]),
        "keywords":            _parse_jsonb(row[20]),
        "faq":                 _parse_jsonb(row[21]),
    }


class ProjectListView(APIView):
    """
    GET /api/projects
    Returns all projects from the database.
    Optional query parameters for filtering: ?tech_stack=React
    """
    def get(self, request):
        tech_stack = request.query_params.get("tech_stack", "")
        title = request.query_params.get("title", "")
        category = request.query_params.get("category", "")

        query = f"SELECT {_PROJECT_SELECT} FROM projects p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1"
        params = []

        if category:
            query += " AND c.name ILIKE %s"
            params.append(f"%{category}%")

        if tech_stack:
            query += " AND p.tech_stack ILIKE %s"
            params.append(f"%{tech_stack}%")
        
        if title:
            query += " AND p.title ILIKE %s"
            params.append(f"%{title}%")
        
        query += " ORDER BY p.id ASC"

        try:
            with connection.cursor() as cursor:
                cursor.execute(query, params)
                rows = cursor.fetchall()
            
            projects = [map_project_row(row) for row in rows]
            return Response(projects, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error fetching projects: {e}", exc_info=True)
            return Response({"error": "Failed to fetch projects."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ProjectDetailView(APIView):
    """
    GET /api/projects/:id
    Returns single project details by ID.
    """
    def get(self, request, pk):
        query = f"SELECT {_PROJECT_SELECT} FROM projects p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = %s"
        try:
            with connection.cursor() as cursor:
                cursor.execute(query, [pk])
                row = cursor.fetchone()
            
            if row:
                return Response(map_project_row(row), status=status.HTTP_200_OK)
            return Response({"error": "Project not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error fetching project {pk}: {e}", exc_info=True)
            return Response({"error": "Failed to fetch project."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
