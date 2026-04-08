"""
scripts/seed_data.py

Sample script to populate ChromaDB with example project documents.
Run this once to have data to query against.

Usage:
    cd backend
    python scripts/seed_data.py
"""

import os
import sys
from pathlib import Path

# Add the backend directory to sys.path so imports work
sys.path.insert(0, str(Path(__file__).parent.parent))

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "chatbot_project.settings")

import django
django.setup()

from utils.service_registry import get_rag_service
from django.db import connection
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def fetch_projects_from_db():
    """
    Fetches real projects from the PostgreSQL database using a raw SQL cursor.
    Formats them into proper dictionaries for the vector store.
    """
    documents = []
    with connection.cursor() as cursor:
        cursor.execute("SELECT id, title, description, tech_stack, image_url FROM projects")
        rows = cursor.fetchall()
        for row in rows:
            proj_id, title, desc, tech, image_url = row
            
            # Combine into a rich content string for the LLM context
            content = f"Project Title: {title}\n"
            if desc:
                content += f"Description: {desc}\n"
            if tech:
                content += f"Technologies Used: {tech}\n"
            
            documents.append({
                "project_id": str(proj_id),
                "title": title or "Untitled",
                "content": content,
                "image_url": image_url or "",
            })
            
    # Also add a global summary document based on fetched dynamic data
    if documents:
        titles = [d["title"] for d in documents]
        summary_content = (
            "This is the global portfolio overview. "
            "I have worked on various projects, including: " + ", ".join(titles) + ". "
            "These projects demonstrate my development skills and capabilities."
        )
        documents.append({
            "project_id": "global_summary",
            "title": "Portfolio Personal Summary",
            "content": summary_content,
            "image_url": "",
        })
        
    return documents


def main():
    logger.info("Starting data seeding from PostgreSQL database...")

    try:
        rag_service = get_rag_service()
        vector_store = rag_service.vector_store

        # Clear existing collection so we don't have stale/duplicate hardcoded data
        logger.info("Clearing existing ChromaDB collection...")
        try:
            vector_store.vector_store.delete_collection()
            # We explicitly need to re-initialize it to continue adding documents
            vector_store.vector_store = vector_store._init_vector_store()
        except Exception as e:
            logger.warning(f"Could not clear collection (might already be empty): {e}")

        # Fetch dynamically from PostgreSQL
        db_documents = fetch_projects_from_db()
        if not db_documents:
            logger.warning("No projects found in the database. Database is empty.")
            return

        logger.info(f"Found {len(db_documents) - 1} projects in the PostgreSQL database. Ingesting to ChromaDB...")

        count = vector_store.add_documents(db_documents)
        logger.info(f"✅ Successfully added {count} documents to ChromaDB.")

        new_count = vector_store.get_collection_count()
        logger.info(f"New collection size: {new_count} documents")

        # Quick test search
        first_project_title = db_documents[0]["title"]
        logger.info(f"\n--- Test Search: '{first_project_title}' ---")
        results = vector_store.search_global(first_project_title, k=2)
        for r in results:
            logger.info(f"  Found: [{r.metadata['project_id']}] {r.metadata['title']}")

        logger.info("\n✅ Database to ChromaDB Sync Complete!")

    except Exception as e:
        logger.error(f"❌ Seeding failed: {e}", exc_info=True)
        sys.exit(1)


if __name__ == "__main__":
    main()
