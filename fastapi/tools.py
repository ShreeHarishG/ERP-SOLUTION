from langchain_core.tools import tool
from sqlalchemy import text
from database import engine

@tool
def get_low_stock_products() -> str:
    """Returns products that have on_hand_quantity less than min_stock_level."""
    if not engine:
        return "Database not connected. Please set SUPABASE_DB_URL."
    try:
        with engine.connect() as conn:
            result = conn.execute(
                text("""
                SELECT
                    name,
                    on_hand_quantity,
                    min_stock_level
                FROM products
                WHERE on_hand_quantity < min_stock_level
                """)
            )
            data = [dict(row._mapping) for row in result]
            return str(data) if data else "No low stock products found."
    except Exception as e:
        return f"Error querying database: {str(e)}"

@tool
def get_today_revenue() -> str:
    """Returns today's revenue from completed sales orders."""
    if not engine:
        return "Database not connected."
    try:
        with engine.connect() as conn:
            result = conn.execute(
                text("""
                SELECT COALESCE(SUM(total_amount), 0) as revenue
                FROM sales_orders
                WHERE DATE(created_at) = CURRENT_DATE AND status = 'delivered'
                """)
            )
            data = [dict(row._mapping) for row in result]
            return str(data)
    except Exception as e:
        return f"Error querying database: {str(e)}"

@tool
def get_delayed_orders() -> str:
    """Returns sales orders that are delayed beyond their expected delivery date."""
    if not engine:
        return "Database not connected."
    try:
        with engine.connect() as conn:
            result = conn.execute(
                text("""
                SELECT order_number, status, expected_delivery, total_amount
                FROM sales_orders
                WHERE expected_delivery < CURRENT_DATE AND status != 'delivered'
                """)
            )
            data = [dict(row._mapping) for row in result]
            return str(data) if data else "No delayed orders found."
    except Exception as e:
        return f"Error querying database: {str(e)}"

@tool
def get_pending_manufacturing() -> str:
    """Returns pending manufacturing orders."""
    if not engine:
        return "Database not connected."
    try:
        with engine.connect() as conn:
            result = conn.execute(
                text("""
                SELECT order_number, status, quantity_to_produce
                FROM manufacturing_orders
                WHERE status IN ('draft', 'confirmed', 'in_progress')
                """)
            )
            data = [dict(row._mapping) for row in result]
            return str(data) if data else "No pending manufacturing orders found."
    except Exception as e:
        return f"Error querying database: {str(e)}"

@tool
def get_pending_purchase_orders() -> str:
    """Returns pending purchase orders."""
    if not engine:
        return "Database not connected."
    try:
        with engine.connect() as conn:
            result = conn.execute(
                text("""
                SELECT order_number, status, expected_delivery
                FROM purchase_orders
                WHERE status IN ('draft', 'confirmed', 'partially_received')
                """)
            )
            data = [dict(row._mapping) for row in result]
            return str(data) if data else "No pending purchase orders found."
    except Exception as e:
        return f"Error querying database: {str(e)}"

@tool
def business_health_score() -> str:
    """Returns the overall business health score and summary based on DB metrics."""
    if not engine:
        return "Database not connected."
    try:
        with engine.connect() as conn:
            delayed_so = conn.execute(text("SELECT COUNT(*) FROM sales_orders WHERE expected_delivery < CURRENT_DATE AND status != 'delivered'")).scalar()
            total_so = conn.execute(text("SELECT COUNT(*) FROM sales_orders")).scalar()
            shortages = conn.execute(text("SELECT COUNT(*) FROM products WHERE on_hand_quantity < min_stock_level")).scalar()
            
            score = 100
            if total_so > 0:
                delay_penalty = (delayed_so / total_so) * 50
                score -= delay_penalty
            score -= (shortages * 2)
            score = max(0, int(score))
            
            return f"Business Health Score: {score}/100. Metrics: {delayed_so} delayed orders, {shortages} low stock products."
    except Exception as e:
        return f"Error computing health score: {str(e)}"

@tool
def recommend_actions() -> str:
    """Returns recommended actions for today based on delayed orders, shortages, manufacturing, and procurement."""
    if not engine:
        return "Database not connected."
    try:
        with engine.connect() as conn:
            recommendations = []
            
            # 1. Delayed Sales Orders with High Value
            result_so = conn.execute(text("""
                SELECT order_number, total_amount
                FROM sales_orders
                WHERE expected_delivery < CURRENT_DATE AND status != 'delivered'
                ORDER BY total_amount DESC
                LIMIT 2
            """))
            for row in result_so:
                recommendations.append(f"Deliver SO: {row.order_number} (Revenue Impact: ${row.total_amount})")
            
            # 2. Urgent Manufacturing Orders
            result_mo = conn.execute(text("""
                SELECT order_number, quantity_to_produce
                FROM manufacturing_orders
                WHERE status IN ('draft', 'confirmed', 'in_progress')
                ORDER BY created_at ASC
                LIMIT 2
            """))
            for row in result_mo:
                recommendations.append(f"Complete MO: {row.order_number} (Quantity: {row.quantity_to_produce})")
            
            # 3. Urgent Procurement (Low stock)
            result_po = conn.execute(text("""
                SELECT name, on_hand_quantity, min_stock_level
                FROM products
                WHERE on_hand_quantity < min_stock_level
                LIMIT 2
            """))
            for row in result_po:
                recommendations.append(f"Procure Product: {row.name} (Stock: {row.on_hand_quantity}/{row.min_stock_level})")
                
            if not recommendations:
                return "No urgent actions required today. Everything is on track."
                
            return "Today's Priorities:\n" + "\n".join([f"{i+1}. {rec}" for i, rec in enumerate(recommendations)])
    except Exception as e:
        return f"Error generating recommendations: {str(e)}"

@tool
def get_audit_logs() -> str:
    """Returns the most recent audit logs. (Admin only)."""
    if not engine:
        return "Database not connected."
    try:
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT user_name, action, entity_type, created_at
                FROM audit_logs
                ORDER BY created_at DESC
                LIMIT 10
            """))
            data = [dict(row._mapping) for row in result]
            for d in data:
                if d['created_at']:
                    d['created_at'] = str(d['created_at'])
            return str(data) if data else "No audit logs found."
    except Exception as e:
        return f"Error fetching audit logs: {str(e)}"

tools_list = [
    get_low_stock_products,
    get_today_revenue,
    get_delayed_orders,
    get_pending_manufacturing,
    get_pending_purchase_orders,
    business_health_score,
    recommend_actions,
    get_audit_logs
]

tools_map = {tool.name: tool for tool in tools_list}
