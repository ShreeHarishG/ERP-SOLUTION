import os
from sqlalchemy import text
from dotenv import load_dotenv

try:
    from database import engine
    from agent import llm
    from langchain_core.messages import HumanMessage
except ImportError as e:
    print(f"ERROR: Import failed: {e}")
    exit(1)

load_dotenv()

def test_database():
    print("Testing Database Connection...")
    if not engine:
        print("ERROR: Database engine is not configured (SUPABASE_DB_URL might be missing).")
        return False
        
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            row = result.fetchone()
            if row and row[0] == 1:
                print("SUCCESS: Database connection successful!")
                return True
            else:
                print("ERROR: Database connection failed: unexpected result.")
                return False
    except Exception as e:
        print(f"ERROR: Database connection failed: {e}")
        return False

def test_llm():
    print("\nTesting LLM Connection (Groq)...")
    if not os.getenv("GROQ_API_KEY") or os.getenv("GROQ_API_KEY") == "your_groq_api_key_here":
        print("ERROR: GROQ_API_KEY is not set or using the default template value.")
        return False
        
    try:
        response = llm.invoke([HumanMessage(content="Hello, respond with exactly the word 'SUCCESS'")])
        if response and response.content:
            print(f"SUCCESS: LLM connection successful! Response: {response.content.strip()}")
            return True
        else:
            print("ERROR: LLM connection failed: empty response.")
            return False
    except Exception as e:
        print(f"ERROR: LLM connection failed: {e}")
        return False

if __name__ == "__main__":
    db_ok = test_database()
    llm_ok = test_llm()
    
    print("\n--- Summary ---")
    if db_ok and llm_ok:
        print("SUCCESS: All connections are working perfectly! You are ready to go end-to-end.")
    else:
        print("WARNING: Some connections failed. Please check your .env credentials.")
