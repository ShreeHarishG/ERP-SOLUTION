import os
from sqlalchemy import create_engine
from dotenv import load_dotenv

load_dotenv()

SUPABASE_DB_URL = os.getenv("SUPABASE_DB_URL")
if SUPABASE_DB_URL and "?pgbouncer=true" in SUPABASE_DB_URL:
    SUPABASE_DB_URL = SUPABASE_DB_URL.replace("?pgbouncer=true", "")

# Create SQLAlchemy engine with resilient connection pooling
engine = (
    create_engine(
        SUPABASE_DB_URL,
        pool_pre_ping=True,  # Tests connection liveness before checkout to prevent dead socket errors
        pool_size=10,        # Max steady connections in pool
        max_overflow=20,     # Max burst connections beyond pool_size
        pool_recycle=300,    # Recycle connections every 5 minutes before proxy idle timeouts
        pool_timeout=30,     # Seconds to wait before giving up on acquiring connection
    )
    if SUPABASE_DB_URL
    else None
)
