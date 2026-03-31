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
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ------------------------------------------------------------------
# Sample documents — replace with your own project data
# ------------------------------------------------------------------
SAMPLE_DOCUMENTS = [
    {
        "project_id": "ecommerce_001",
        "title": "ShopEasy E-Commerce Platform",
        "content": (
            "ShopEasy is a production-grade multi-vendor e-commerce platform built with React (frontend) and Node.js/Express (backend). "
            "The platform supports unlimited vendor storefronts under a single marketplace, each with its own product catalog, dashboard, and analytics. "
            "Key technical stack: React 18, Redux Toolkit for state management, Node.js with Express, PostgreSQL as primary database, Redis for caching, "
            "Elasticsearch for product search, and AWS S3 for media storage. "
            "Payment processing is handled via Stripe with support for multi-currency, recurring subscriptions, and split payouts to vendors. "
            "An AI-powered recommendation engine uses collaborative filtering to personalize the homepage and product suggestions. "
            "Scale: 50,000+ daily active users, $2M+ in monthly GMV, 99.9% uptime SLA. "
            "Standout features: abandoned cart recovery emails (increased conversion by 18%), dynamic pricing rules, bulk CSV order import, "
            "and a full mobile PWA for fast mobile checkout. "
            "The biggest engineering challenge was building the real-time inventory sync across vendors — solved using WebSockets and an event-driven architecture with RabbitMQ. "
            "Deployment: Dockerized, deployed on AWS ECS with auto-scaling, CloudFront CDN for static assets."
        ),
        "image_url": "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600",
    },
    {
        "project_id": "healthcare_002",
        "title": "MedConnect Patient Portal",
        "content": (
            "MedConnect is a HIPAA-compliant patient management system built for mid-to-large healthcare providers. "
            "Tech stack: Django (REST API backend), React (frontend), PostgreSQL, Celery for async task queues, and Twilio for SMS/voice notifications. "
            "Core features include: online appointment scheduling with calendar sync (Google/Outlook), telemedicine video calls via WebRTC, "
            "full electronic health record (EHR) management with HL7 FHIR integration, e-prescription workflows, secure patient-doctor messaging, "
            "and automated insurance eligibility checks via real-time API calls. "
            "Scale: 200+ clinics, 15,000+ registered patients, 3,000+ telemedicine sessions per month. "
            "The most complex feature was the EHR integration — different hospital systems use different HL7 versions, so a custom FHIR translation middleware was built. "
            "Security: All data is encrypted at rest (AES-256) and in transit (TLS 1.3). Role-based access control separates patient, doctor, nurse, and admin permissions. "
            "Deployment: HIPAA-compliant AWS infrastructure with audit logging, VPC isolation, and automated vulnerability scanning."
        ),
        "image_url": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600",
    },
    {
        "project_id": "fintech_003",
        "title": "FinFlow Budget Tracker",
        "content": (
            "FinFlow is a cross-platform personal finance app built with Flutter (iOS + Android) and Firebase (Firestore, Auth, Functions). "
            "Users connect their bank accounts securely via Plaid API, which pulls real-time transaction data across 10,000+ supported institutions. "
            "Core features: automatic expense categorization using ML classification, custom budget goal setting, bill payment reminders, "
            "investment portfolio tracking (stocks, ETFs, crypto), credit score monitoring, and monthly financial health reports. "
            "An AI insights engine analyzes spending patterns and surfaces personalized tips — e.g. 'You spent 40% more on dining this month compared to last'. "
            "Scale: 80,000+ active users, 4.8-star rating on both App Store and Play Store, averaging 12 app sessions per user per week. "
            "Technical challenges: Plaid's webhook system for real-time sync required careful event deduplication and idempotency handling. "
            "Firebase Cloud Functions handle all background processing to keep the mobile app lightweight. "
            "The crypto portfolio feature integrates with CoinGecko API for live pricing. "
            "Monetization: Freemium model — basic features free, premium tier at $4.99/month with advanced analytics."
        ),
        "image_url": "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=600",
    },
    {
        "project_id": "edtech_004",
        "title": "LearnAI Online Education Platform",
        "content": (
            "LearnAI is an adaptive online learning platform focused on data science, machine learning, and AI education. "
            "Tech stack: Next.js 14 (App Router) for frontend with SSR/SSG, Python FastAPI for backend APIs, PostgreSQL, Redis for session caching, "
            "and JupyterHub for interactive notebook environments. "
            "Course content is delivered through video lectures (hosted on Cloudflare Stream), interactive Jupyter notebooks that run in isolated Docker containers, "
            "live coding challenges, AI-generated quizzes that adapt based on student performance, and peer code review via GitHub integration. "
            "A mentorship marketplace connects students with industry mentors for 1:1 sessions, integrated with Calendly for scheduling and Stripe for payments. "
            "Scale: 500+ courses, 10,000+ active students from 60+ countries, 50+ company partners for job placement. "
            "The AI quiz engine uses spaced repetition (SM-2 algorithm) to resurface weak topics automatically. "
            "Completion rate is 72%, significantly above the industry average of ~15% for online courses — attributed to the adaptive learning path. "
            "Deployment: Vercel for Next.js frontend, FastAPI on Railway, JupyterHub on Kubernetes for scalable notebook execution."
        ),
        "image_url": "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=600",
    },
    {
        "project_id": "realestate_005",
        "title": "PropSearch Real Estate Marketplace",
        "content": (
            "PropSearch is a full-stack real estate marketplace built with Vue.js 3 (Composition API) and Laravel 10 for the backend REST API. "
            "The platform aggregates 2M+ property listings via MLS (Multiple Listing Service) data feeds, refreshed every 15 minutes via a custom ETL pipeline. "
            "Standout features: immersive 3D virtual tours powered by Matterport SDK integration, AI-powered property valuation using a gradient boosting model "
            "trained on 5 years of local sale data, neighborhood analytics (crime index, school ratings, walkability scores), "
            "interactive mortgage calculator comparing 20+ lenders in real-time, and a saved search alert system via email/SMS. "
            "Lead generation: 500K+ monthly users, 3,000+ registered real estate agents, with qualified lead forms that convert at 8.4%. "
            "The AI valuation model achieves a median absolute error of 3.2% compared to final sale price, outperforming Zillow's Zestimate benchmark in target markets. "
            "Tech details: PostgreSQL with PostGIS extension for geospatial property search (radius, polygon draw), Elasticsearch for full-text search, "
            "Mapbox for interactive map UI, and Redis queues (Laravel Horizon) for background MLS sync jobs. "
            "Mobile: responsive Vue PWA, with agent-facing native iOS/Android app built in React Native."
        ),
        "image_url": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600",
    },
]


def main():
    logger.info("Starting data seeding...")

    try:
        rag_service = get_rag_service()
        vector_store = rag_service.vector_store

        current_count = vector_store.get_collection_count()
        logger.info(f"Current collection size: {current_count} documents")

        count = vector_store.add_documents(SAMPLE_DOCUMENTS)
        logger.info(f"✅ Successfully added {count} documents to ChromaDB.")

        new_count = vector_store.get_collection_count()
        logger.info(f"New collection size: {new_count} documents")

        # Quick test search
        logger.info("\n--- Test Search: 'e-commerce payment' ---")
        results = vector_store.search_global("e-commerce payment", k=2)
        for r in results:
            logger.info(f"  Found: [{r.metadata['project_id']}] {r.metadata['title']}")

        logger.info("\n✅ Data seeding complete!")

    except Exception as e:
        logger.error(f"❌ Seeding failed: {e}", exc_info=True)
        sys.exit(1)


if __name__ == "__main__":
    main()
