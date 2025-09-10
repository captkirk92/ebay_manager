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
    """Get store summary data using Trading API (for web-created listings)"""
    try:
        client = eBayAPIClient()
        
        # Get basic store info
        summary = {
            'timestamp': client.token_manager.get_valid_token() and 'Token valid' or 'No token',
            'store_name': client.store_name,
            'user_id': client.user_id,
            'environment': client.environment
        }
        
        # Get live listings using Trading API
        selling_data = client.get_active_listings()
        
        # Parse Trading API response
        ack_key = '{urn:ebay:apis:eBLBaseComponents}Ack'
        if ack_key in selling_data and selling_data[ack_key]['text'] == 'Success':
            # Extract active listings
            active_key = '{urn:ebay:apis:eBLBaseComponents}ActiveList'
            if active_key in selling_data:
                active_list = selling_data[active_key]
                
                # Get count
                count_key = '{urn:ebay:apis:eBLBaseComponents}ItemArray'
                if count_key in active_list:
                    items = active_list[count_key]
                    item_key = '{urn:ebay:apis:eBLBaseComponents}Item'
                    if item_key in items and isinstance(items[item_key], list):
                        listings_count = len(items[item_key])
                        summary['active_listings'] = listings_count
                        summary['listings_data'] = items[item_key][:10]  # First 10 for summary
                    else:
                        summary['active_listings'] = 1 if item_key in items else 0
                        summary['listings_data'] = [items[item_key]] if item_key in items else []
                
                # Get pagination info
                pagination_key = '{urn:ebay:apis:eBLBaseComponents}PaginationResult'
                if pagination_key in active_list:
                    pagination = active_list[pagination_key]
                    total_key = '{urn:ebay:apis:eBLBaseComponents}TotalNumberOfEntries'
                    if total_key in pagination:
                        summary['total_listings'] = pagination[total_key]['text']
            
            # Extract summary data
            summary_key = '{urn:ebay:apis:eBLBaseComponents}Summary'
            if summary_key in selling_data:
                summary_data = selling_data[summary_key]
                
                # Extract key metrics
                sold_count_key = '{urn:ebay:apis:eBLBaseComponents}TotalSoldCount'
                sold_value_key = '{urn:ebay:apis:eBLBaseComponents}TotalSoldValue'
                
                if sold_count_key in summary_data:
                    summary['total_sold'] = summary_data[sold_count_key]['text']
                if sold_value_key in summary_data:
                    sold_value = summary_data[sold_value_key]
                    summary['total_revenue'] = f"{sold_value.get('text', '0')} {sold_value.get('@attributes', {}).get('currencyID', 'USD')}"
        
        # Also try REST API for additional data
        inventory_data = client.get_inventory_rest(limit=10)
        summary['rest_inventory'] = inventory_data
        
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
    """Get recent orders using REST API"""
    try:
        client = eBayAPIClient()
        orders = client.get_orders_rest(limit=100)
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
    """Get active listings using REST API"""
    try:
        client = eBayAPIClient()
        inventory_data = client.get_inventory_rest(limit=50)
        
        if 'error' in inventory_data:
            return {
                "success": False,
                "error": inventory_data['error']
            }
        
        return {
            "success": True,
            "data": {
                "total": inventory_data.get('total', 0),
                "size": inventory_data.get('size', 0),
                "listings": inventory_data.get('inventoryItems', [])
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
