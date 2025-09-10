#!/usr/bin/env python3
"""
eBay API Wrapper for Dashboard Integration
This script provides command-line interface for the eBay API client
"""

import sys
import json
import argparse
from ebay_api_client import eBayAPIClient

def get_store_summary():
    """Get store summary data"""
    try:
        client = eBayAPIClient()
        summary = client.get_store_summary()
        return {
            "success": True,
            "data": summary
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def get_orders(days_back=30):
    """Get recent orders"""
    try:
        client = eBayAPIClient()
        orders = client.get_orders(days_back=days_back)
        return {
            "success": True,
            "data": orders
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def get_listings():
    """Get active listings"""
    try:
        client = eBayAPIClient()
        selling_data = client.get_my_ebay_selling()
        listings = selling_data.get('ActiveList', {}).get('ItemArray', [])
        return {
            "success": True,
            "data": {
                "listings": listings,
                "total": len(listings)
            }
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def get_analytics(days_back=30):
    """Get analytics data"""
    try:
        client = eBayAPIClient()
        orders = client.get_orders(days_back=days_back)
        selling_data = client.get_my_ebay_selling()
        
        # Calculate comprehensive analytics
        order_array = orders.get('OrderArray', [])
        total_orders = len(order_array)
        total_revenue = sum(float(order.get('Total', 0)) for order in order_array if order.get('Total'))
        
        listings = selling_data.get('ActiveList', {}).get('ItemArray', [])
        total_listings = len(listings)
        
        # Calculate daily revenue trends (last 7 days)
        from datetime import datetime, timedelta
        import dateutil.parser
        
        daily_revenue = {}
        daily_orders = {}
        
        # Initialize last 7 days
        for i in range(7):
            date = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
            daily_revenue[date] = 0
            daily_orders[date] = 0
        
        # Group orders by date
        for order in order_array:
            if order.get('CreatedTime'):
                try:
                    order_date = dateutil.parser.parse(order['CreatedTime']).strftime('%Y-%m-%d')
                    if order_date in daily_revenue:
                        daily_revenue[order_date] += float(order.get('Total', 0))
                        daily_orders[order_date] += 1
                except:
                    continue
        
        # Format chart data
        chart_data = []
        for i in range(6, -1, -1):  # Last 7 days in chronological order
            date = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
            chart_data.append({
                "date": date,
                "revenue": daily_revenue.get(date, 0),
                "orders": daily_orders.get(date, 0)
            })
        
        # Calculate performance metrics
        avg_order_value = total_revenue / total_orders if total_orders > 0 else 0
        
        # Recent customer activity (from orders)
        recent_customers = []
        for order in order_array[:10]:  # Last 10 orders
            if order.get('BuyerUserID') and order.get('CreatedTime'):
                recent_customers.append({
                    "date": order.get('CreatedTime', ''),
                    "customer": order.get('BuyerUserID', 'Unknown'),
                    "total": float(order.get('Total', 0)),
                    "status": order.get('OrderStatus', 'Unknown'),
                    "order_id": order.get('OrderID', '')
                })
        
        return {
            "success": True,
            "data": {
                "orders": {
                    "total": total_orders,
                    "revenue": total_revenue,
                    "average_value": avg_order_value
                },
                "listings": {
                    "total": total_listings
                },
                "period_days": days_back,
                "chart_data": chart_data,
                "recent_customers": recent_customers
            }
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def main():
    parser = argparse.ArgumentParser(description='eBay API Wrapper for Dashboard')
    parser.add_argument('--summary', action='store_true', help='Get store summary')
    parser.add_argument('--orders', type=int, help='Get orders for last N days')
    parser.add_argument('--listings', action='store_true', help='Get active listings')
    parser.add_argument('--analytics', type=int, help='Get analytics for last N days')
    
    args = parser.parse_args()
    
    if args.summary:
        result = get_store_summary()
    elif args.orders:
        result = get_orders(args.orders)
    elif args.listings:
        result = get_listings()
    elif args.analytics:
        result = get_analytics(args.analytics)
    else:
        result = {"success": False, "error": "No command specified"}
    
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
