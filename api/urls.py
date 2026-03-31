"""
api/urls.py — URL routing for the chatbot API.

All routes are prefixed with /api/v1/ for versioning.
"""

from django.urls import path
from .views import ChatView, SpeechToTextView, DocumentIngestView, HealthCheckView

app_name = "api"

urlpatterns = [
    # Health check
    path("api/v1/health/", HealthCheckView.as_view(), name="health"),

    # Main chat endpoint
    path("api/v1/chat/", ChatView.as_view(), name="chat"),

    # Speech-to-text endpoint
    path("api/v1/speech-to-text/", SpeechToTextView.as_view(), name="speech_to_text"),

    # Document ingestion endpoint (load knowledge base)
    path("api/v1/ingest/", DocumentIngestView.as_view(), name="ingest"),
]
