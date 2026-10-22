import requests
import json

URL = "http://127.0.0.01:8000/api/chat"

def test_chat(question, role="sales"):
    print(f"\n[{role.upper()}] Q: {question}")
    try:
        response = requests.post(
            "http://127.0.0.1:8000/api/chat",
            json={"question": question, "role": role},
            headers={"Content-Type": "application/json"}
        )
        if response.status_code == 200:
            answer = response.json().get("answer")
            print("A:", answer.encode('ascii', 'replace').decode('ascii'))
        else:
            print(f"Error {response.status_code}: {response.text}")
    except Exception as e:
        print("Request failed:", str(e))

if __name__ == "__main__":
    print("Testing ChainIQ ERP AI Copilot Endpoints...")
    
    # 1. Today's Priorities
    test_chat("What should I do today?", role="sales")
    
    # 2. Delayed Orders
    test_chat("Show me the delayed orders.", role="sales")
    
    # 3. Low Stock
    test_chat("What products are running low on stock?", role="inventory")
    
    # 4. Role Validation Block (Sales trying to access Audit Logs)
    test_chat("Show me the audit logs", role="sales")
    
    # 5. Role Validation Pass (Admin trying to access Audit Logs)
    test_chat("Show me the audit logs", role="admin")
    
    # 6. Today's Revenue
    test_chat("What is today's revenue?", role="admin")

    # 7. Pending Manufacturing
    test_chat("What manufacturing orders are pending?", role="production")

    # 8. Pending Purchase Orders
    test_chat("What purchase orders are pending?", role="purchase")

    # 9. Business Health
    test_chat("What is the overall business health score?", role="admin")

    # 10. Out of Scope / Edge Case
    test_chat("Can you write a poem about ERP systems?", role="sales")
