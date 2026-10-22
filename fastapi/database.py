import os
from sqlalchemy import create_engine
from dotenv import load_dotenv

load_dotenv()

SUPABASE_DB_URL = os.getenv("SUPABASE_DB_URL")
if SUPABASE_DB_URL and "?pgbouncer=true" in SUPABASE_DB_URL:
    SUPABASE_DB_URL = SUPABASE_DB_URL.replace("?pgbouncer=true", "")

# Create SQLAlchemy engine if the DB URL is provided
engine = create_engine(SUPABASE_DB_URL) if SUPABASE_DB_URL else None
