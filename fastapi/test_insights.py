import requests
import json

URL = "http://127.0.0.1:8000/api/insights"

# A representative sample context representing the Next.js database context
mock_context = {
  "inventory": {
    "totalValue": 150000.0,
    "rawMaterialsCount": 10,
    "finishedGoodsCount": 5,
    "lowStockItems": [
      {
        "name": "Wood Component",
        "sku": "RM-WD-001",
        "stock": 2,
        "reserved": 0,
        "free": 2,
        "safety": 10
      },
      {
        "name": "Screws",
        "sku": "RM-SC-001",
        "stock": 5,
        "reserved": 0,
        "free": 5,
        "safety": 20
      }
    ],
    "rawMaterials": [],
    "finishedGoods": []
  },
  "sales": {
    "openOrdersCount": 4,
    "delayedOrdersCount": 1,
    "revenue": 34000.0,
    "customerDemand": [],
    "recentOrders": []
  },
  "manufacturing": {
    "activeOrdersCount": 2,
    "delayedOrdersCount": 1,
    "activeRuns": [
      {
        "moNumber": "MO-001",
        "product": "Wooden Table",
        "qty": 5
      }
    ],
    "machineUtilization": []
  },
  "procurement": {
    "pendingPOsCount": 2,
    "delayedPOsCount": 1,
    "materialShortages": [
      {
        "name": "Screws",
        "sku": "RM-SC-001",
        "free": 5,
        "safety": 20
      }
    ],
    "vendorPerformance": [
      {
        "vendor": "Apex Fasteners Corp",
        "fulfilled": 5,
        "delays": 1
      }
    ]
  },
  "timeline": {
    "recentActivities": [],
    "failedOperations": []
  }
}

def test_insights(role="admin"):
    print(f"\n--- Testing Insights for Role: {role.upper()} ---")
    try:
        response = requests.post(
            URL,
            json={"role": role, "context": mock_context},
            headers={"Content-Type": "application/json"}
        )
        if response.status_code == 200:
            result = response.json()
            print("Successfully received response!")
            print(json.dumps(result, indent=2))
        else:
            print(f"Error {response.status_code}: {response.text}")
    except Exception as e:
        print("Request failed:", str(e))

if __name__ == "__main__":
    test_insights(role="admin")
    test_insights(role="sales")
