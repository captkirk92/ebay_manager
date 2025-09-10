#!/usr/bin/env python3
"""
eBay API Wrapper for Dashboard Integration
This script provides command-line interface for the eBay API client
"""

import sys
import json
import argparse
from ebay_api_client import eBayAPIClient
from store_manager import eBayStoreManager
from order_analysis_ai import OrderFinancialAnalysisAI

def get_store_summary():
    """Get store summary data using Trading API (for web-created listings)"""
    try:
        client = eBayAPIClient()
        
        # Get live listings using Trading API
        selling_data = client.get_active_listings()
        
        # Initialize summary with proper structure expected by frontend
        summary = {
            'store_name': client.store_name,
            'user_id': client.user_id,
            'selling_data': {
                'active_listings': 0,
                'total_sales': 0,
                'total_revenue': 0.0
            }
        }
        
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
                    if item_key in items:
                        if isinstance(items[item_key], list):
                            summary['selling_data']['active_listings'] = len(items[item_key])
                        else:
                            summary['selling_data']['active_listings'] = 1
                
                # Get pagination info for total count
                pagination_key = '{urn:ebay:apis:eBLBaseComponents}PaginationResult'
                if pagination_key in active_list:
                    pagination = active_list[pagination_key]
                    total_key = '{urn:ebay:apis:eBLBaseComponents}TotalNumberOfEntries'
                    if total_key in pagination:
                        try:
                            summary['selling_data']['active_listings'] = int(pagination[total_key]['text'])
                        except (ValueError, KeyError):
                            pass
            
            # Extract summary data for sales metrics
            summary_key = '{urn:ebay:apis:eBLBaseComponents}Summary'
            if summary_key in selling_data:
                summary_data = selling_data[summary_key]
                
                # Extract key metrics
                sold_count_key = '{urn:ebay:apis:eBLBaseComponents}TotalSoldCount'
                sold_value_key = '{urn:ebay:apis:eBLBaseComponents}TotalSoldValue'
                
                if sold_count_key in summary_data:
                    try:
                        summary['selling_data']['total_sales'] = int(summary_data[sold_count_key]['text'])
                    except (ValueError, KeyError):
                        pass
                        
                if sold_value_key in summary_data:
                    try:
                        sold_value = summary_data[sold_value_key]
                        summary['selling_data']['total_revenue'] = float(sold_value.get('text', '0'))
                    except (ValueError, KeyError):
                        pass
        
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
    """Get recent orders using Trading API"""
    try:
        client = eBayAPIClient()
        orders = client.get_orders(days_back=days_back)
        
        # Transform orders to the format expected by frontend
        if orders and 'OrderArray' in orders:
            order_array = orders['OrderArray']
            if isinstance(order_array, list):
                # Orders are already in a list
                formatted_orders = order_array
            else:
                # Single order, wrap in a list
                formatted_orders = [order_array] if order_array else []
        else:
            formatted_orders = []
        
        # Ensure each order has the required fields
        for order in formatted_orders:
            if 'OrderID' not in order:
                order['OrderID'] = order.get('OrderID', 'N/A')
            if 'OrderStatus' not in order:
                order['OrderStatus'] = order.get('OrderStatus', 'Active')
            if 'Total' not in order:
                order['Total'] = order.get('Total', '0.00')
            if 'CreatedTime' not in order:
                order['CreatedTime'] = order.get('CreatedTime', '')
            if 'BuyerUserID' not in order:
                order['BuyerUserID'] = order.get('BuyerUserID', 'Anonymous')
        
        return {
            "success": True,
            "data": {
                "OrderArray": formatted_orders,
                "PaginationResult": orders.get('PaginationResult', {})
            }
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def get_listings():
    """Get active listings using Trading API"""
    try:
        client = eBayAPIClient()
        selling_data = client.get_active_listings()
        
        # Parse Trading API response
        ack_key = '{urn:ebay:apis:eBLBaseComponents}Ack'
        if ack_key in selling_data and selling_data[ack_key]['text'] == 'Success':
            active_key = '{urn:ebay:apis:eBLBaseComponents}ActiveList'
            if active_key in selling_data:
                active_list = selling_data[active_key]
                
                # Extract listings
                listings = []
                count_key = '{urn:ebay:apis:eBLBaseComponents}ItemArray'
                if count_key in active_list:
                    items = active_list[count_key]
                    item_key = '{urn:ebay:apis:eBLBaseComponents}Item'
                    if item_key in items:
                        raw_items = items[item_key]
                        if isinstance(raw_items, list):
                            for item in raw_items:
                                # Extract key info for each listing in the format expected by frontend
                                
                                # Get current price from SellingStatus
                                selling_status = item.get('{urn:ebay:apis:eBLBaseComponents}SellingStatus', {})
                                current_price = selling_status.get('{urn:ebay:apis:eBLBaseComponents}CurrentPrice', {}).get('text', '0')
                                
                                # Fallback to BuyItNowPrice if CurrentPrice not available
                                if current_price == '0':
                                    current_price = item.get('{urn:ebay:apis:eBLBaseComponents}BuyItNowPrice', {}).get('text', '0')
                                
                                listing = {
                                    'ItemID': item.get('{urn:ebay:apis:eBLBaseComponents}ItemID', {}).get('text', ''),
                                    'Title': item.get('{urn:ebay:apis:eBLBaseComponents}Title', {}).get('text', 'No title'),
                                    'CurrentPrice': current_price,
                                    'Quantity': int(item.get('{urn:ebay:apis:eBLBaseComponents}Quantity', {}).get('text', '0')),
                                    'QuantityAvailable': int(item.get('{urn:ebay:apis:eBLBaseComponents}QuantityAvailable', item.get('{urn:ebay:apis:eBLBaseComponents}Quantity', {})).get('text', '0')),
                                    'ListingStatus': 'Active',
                                    'StartTime': item.get('{urn:ebay:apis:eBLBaseComponents}ListingDetails', {}).get('{urn:ebay:apis:eBLBaseComponents}StartTime', {}).get('text', ''),
                                    'EndTime': item.get('{urn:ebay:apis:eBLBaseComponents}ListingDetails', {}).get('{urn:ebay:apis:eBLBaseComponents}EndTime', {}).get('text', ''),
                                    'ViewItemURL': item.get('{urn:ebay:apis:eBLBaseComponents}ListingDetails', {}).get('{urn:ebay:apis:eBLBaseComponents}ViewItemURL', {}).get('text', '')
                                }
                                listings.append(listing)
                        elif isinstance(raw_items, dict):
                            # Single item
                            
                            # Get current price from SellingStatus
                            selling_status = raw_items.get('{urn:ebay:apis:eBLBaseComponents}SellingStatus', {})
                            current_price = selling_status.get('{urn:ebay:apis:eBLBaseComponents}CurrentPrice', {}).get('text', '0')
                            
                            # Fallback to BuyItNowPrice if CurrentPrice not available
                            if current_price == '0':
                                current_price = raw_items.get('{urn:ebay:apis:eBLBaseComponents}BuyItNowPrice', {}).get('text', '0')
                            
                            listing = {
                                'ItemID': raw_items.get('{urn:ebay:apis:eBLBaseComponents}ItemID', {}).get('text', ''),
                                'Title': raw_items.get('{urn:ebay:apis:eBLBaseComponents}Title', {}).get('text', 'No title'),
                                'CurrentPrice': current_price,
                                'Quantity': int(raw_items.get('{urn:ebay:apis:eBLBaseComponents}Quantity', {}).get('text', '0')),
                                'QuantityAvailable': int(raw_items.get('{urn:ebay:apis:eBLBaseComponents}QuantityAvailable', raw_items.get('{urn:ebay:apis:eBLBaseComponents}Quantity', {})).get('text', '0')),
                                'ListingStatus': 'Active',
                                'StartTime': raw_items.get('{urn:ebay:apis:eBLBaseComponents}ListingDetails', {}).get('{urn:ebay:apis:eBLBaseComponents}StartTime', {}).get('text', ''),
                                'EndTime': raw_items.get('{urn:ebay:apis:eBLBaseComponents}ListingDetails', {}).get('{urn:ebay:apis:eBLBaseComponents}EndTime', {}).get('text', ''),
                                'ViewItemURL': raw_items.get('{urn:ebay:apis:eBLBaseComponents}ListingDetails', {}).get('{urn:ebay:apis:eBLBaseComponents}ViewItemURL', {}).get('text', '')
                            }
                            listings.append(listing)
                
                # Get total count
                total_count = len(listings)
                pagination_key = '{urn:ebay:apis:eBLBaseComponents}PaginationResult'
                if pagination_key in active_list:
                    pagination = active_list[pagination_key]
                    total_key = '{urn:ebay:apis:eBLBaseComponents}TotalNumberOfEntries'
                    if total_key in pagination:
                        try:
                            total_count = int(pagination[total_key]['text'])
                        except (ValueError, KeyError):
                            total_count = len(listings)
                
                return {
                    "success": True,
                    "data": {
                        "total": total_count,
                        "listings": listings
                    }
                }
        
        return {
            "success": False,
            "error": "Failed to get listings from Trading API"
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
        selling_data = client.get_active_listings()
        
        # Calculate comprehensive analytics
        order_array = orders.get('OrderArray', [])
        if not isinstance(order_array, list):
            order_array = [order_array] if order_array else []
        
        total_orders = len(order_array)
        total_revenue = 0
        
        # Calculate total revenue safely
        for order in order_array:
            if order.get('Total'):
                try:
                    total_revenue += float(order['Total'])
                except (ValueError, TypeError):
                    pass
        
        # Get total listings from active listings
        total_listings = 0
        if selling_data and selling_data.get('{urn:ebay:apis:eBLBaseComponents}Ack', {}).get('text') == 'Success':
            active_key = '{urn:ebay:apis:eBLBaseComponents}ActiveList'
            if active_key in selling_data:
                active_list = selling_data[active_key]
                pagination_key = '{urn:ebay:apis:eBLBaseComponents}PaginationResult'
                if pagination_key in active_list:
                    pagination = active_list[pagination_key]
                    total_key = '{urn:ebay:apis:eBLBaseComponents}TotalNumberOfEntries'
                    if total_key in pagination:
                        try:
                            total_listings = int(pagination[total_key]['text'])
                        except (ValueError, KeyError):
                            pass
        
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
                        order_total = float(order.get('Total', 0))
                        daily_revenue[order_date] += order_total
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
            if order.get('BuyerUserID'):
                recent_customers.append({
                    "date": order.get('CreatedTime', ''),
                    "customer": order.get('BuyerUserID', 'Unknown'),
                    "total": float(order.get('Total', 0)) if order.get('Total') else 0,
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

def get_store_health():
    """Get comprehensive store health analysis"""
    try:
        manager = eBayStoreManager()
        health_data = manager.analyze_store_health()
        
        return health_data
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def analyze_order(order_id):
    """Analyze a specific order for financial and fulfillment status"""
    try:
        analyzer = OrderFinancialAnalysisAI()
        
        # Get order data from eBay API
        client = eBayAPIClient()
        
        # For now, we'll use mock data structure
        # In production, this would fetch real order data
        order_data = {
            'orderId': order_id,
            'orderDate': '2025-09-09T12:00:00Z',
            'payment': {'status': 'Paid', 'amount': 29.99},
            'shipping': {'purchased': True, 'cost': 4.25, 'trackingNumber': '1Z123456789'},
            'returns': {'hasReturn': False, 'refundAmount': 0.0},
            'payout': {'status': 'Completed'}
        }
        
        analysis = analyzer.analyze_order(order_data)
        
        return {
            "success": True,
            "data": {
                "orderId": analysis.order_id,
                "status": analysis.status,
                "analysis": analysis.analysis,
                "profit": analysis.profit,
                "actionRequired": analysis.action_required,
                "riskScore": analysis.risk_score
            }
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def get_order_health_report():
    """Get store-wide order health report"""
    try:
        analyzer = OrderFinancialAnalysisAI()
        
        # Get recent orders data
        # For now, using mock data - in production would fetch real orders
        mock_orders = [
            {
                'orderId': '12345',
                'orderDate': '2025-09-09T10:00:00Z',
                'payment': {'status': 'Paid', 'amount': 29.99},
                'shipping': {'purchased': True, 'cost': 4.25, 'trackingNumber': '1Z123456789'},
                'returns': {'hasReturn': False, 'refundAmount': 0.0},
                'payout': {'status': 'Completed'}
            },
            {
                'orderId': '12346',
                'orderDate': '2025-09-09T11:00:00Z',
                'payment': {'status': 'Paid', 'amount': 45.50},
                'shipping': {'purchased': False, 'cost': 6.75, 'trackingNumber': None},
                'returns': {'hasReturn': False, 'refundAmount': 0.0},
                'payout': {'status': 'Pending'}
            },
            {
                'orderId': '12347',
                'orderDate': '2025-09-08T15:00:00Z',
                'payment': {'status': 'Paid', 'amount': 18.99},
                'shipping': {'purchased': True, 'cost': 3.50, 'trackingNumber': '1Z987654321'},
                'returns': {'hasReturn': True, 'refundAmount': 18.99, 'status': 'Open'},
                'payout': {'status': 'Completed'}
            }
        ]
        
        health_report = analyzer.generate_store_health_report(mock_orders)
        
        return {
            "success": True,
            "data": {
                "reportDate": health_report.report_date,
                "totalOrders": health_report.total_orders,
                "ordersNeedingAttention": health_report.orders_needing_attention,
                "totalRevenue": health_report.total_revenue,
                "totalProfit": health_report.total_profit,
                "averageMargin": health_report.average_margin,
                "criticalIssues": health_report.critical_issues,
                "recommendations": health_report.recommendations,
                "healthScore": health_report.health_score
            }
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def get_listing_details(item_id):
    """Get detailed listing information including images"""
    try:
        client = eBayAPIClient()
        
        # Get detailed item information
        response = client.get_item(item_id)
        
        if 'error' in response:
            return {
                'success': False,
                'error': f"Failed to get listing details: {response['error']}"
            }
        
        # Work with the dictionary response directly
        try:
            # The response is already a parsed dictionary with XML namespace prefixes
            item_key = None
            for key in response.keys():
                if 'Item' in key:
                    item_key = key
                    break
            
            if item_key and response[item_key]:
                item = response[item_key]
                
                # Helper function to find values with namespace prefixes
                def find_value(obj, field_name):
                    if isinstance(obj, dict):
                        # Try direct access first
                        if field_name in obj:
                            return obj[field_name]
                        # Try with namespace prefix
                        for key in obj.keys():
                            if field_name in key:
                                value = obj[key]
                                if isinstance(value, dict) and 'text' in value:
                                    return value['text']
                                return value
                    return ''
                
                # Extract basic info with namespace handling
                item_data = {
                    'ItemID': find_value(item, 'ItemID'),
                    'Title': find_value(item, 'Title'),
                    'Description': find_value(item, 'Description'),
                    'CurrentPrice': 0.0,  # Will extract from StartPrice
                    'ViewItemURL': find_value(item, 'ViewItemURL'),
                    'GalleryURL': find_value(item, 'GalleryURL'),
                    'PictureURL': []
                }
                
                # Extract price
                start_price = None
                for key in item.keys():
                    if 'StartPrice' in key:
                        start_price = item[key]
                        break
                
                if start_price and isinstance(start_price, dict):
                    if 'text' in start_price:
                        try:
                            item_data['CurrentPrice'] = float(start_price['text'])
                        except:
                            pass
                
                # Extract picture URLs with namespace handling
                picture_details = None
                for key in item.keys():
                    if 'PictureDetails' in key:
                        picture_details = item[key]
                        break
                
                if picture_details:
                    # Look for PictureURL in PictureDetails
                    for key in picture_details.keys():
                        if 'PictureURL' in key:
                            picture_urls = picture_details[key]
                            if isinstance(picture_urls, list):
                                # Handle list of picture objects
                                for pic in picture_urls:
                                    if isinstance(pic, dict) and 'text' in pic:
                                        item_data['PictureURL'].append(pic['text'])
                                    elif isinstance(pic, str):
                                        item_data['PictureURL'].append(pic)
                            elif isinstance(picture_urls, dict) and 'text' in picture_urls:
                                item_data['PictureURL'].append(picture_urls['text'])
                            elif isinstance(picture_urls, str):
                                item_data['PictureURL'].append(picture_urls)
                            break
                    
                    # Also check for GalleryURL in PictureDetails
                    for key in picture_details.keys():
                        if 'GalleryURL' in key:
                            gallery_url = picture_details[key]
                            if isinstance(gallery_url, dict) and 'text' in gallery_url:
                                item_data['GalleryURL'] = gallery_url['text']
                            elif isinstance(gallery_url, str):
                                item_data['GalleryURL'] = gallery_url
                            break
                
                return {
                    'success': True,
                    'data': item_data
                }
            else:
                return {
                    'success': False,
                    'error': 'No item data found in response',
                    'debug_response': response
                }
                
        except Exception as parse_error:
            return {
                'success': False,
                'error': f"Failed to parse item data: {str(parse_error)}",
                'debug_response': response
            }
            
    except Exception as e:
        return {
            'success': False,
            'error': f"Error getting listing details: {str(e)}"
        }

def main():
    parser = argparse.ArgumentParser(description='eBay API Wrapper for Dashboard')
    parser.add_argument('--summary', action='store_true', help='Get store summary')
    parser.add_argument('--orders', type=int, help='Get orders for last N days')
    parser.add_argument('--listings', action='store_true', help='Get active listings')
    parser.add_argument('--analytics', type=int, help='Get analytics for last N days')
    parser.add_argument('--health', action='store_true', help='Get store health analysis')
    parser.add_argument('--details', type=str, help='Get detailed listing info for specific item ID')
    
    args = parser.parse_args()
    
    if args.summary:
        result = get_store_summary()
    elif args.orders:
        result = get_orders(args.orders)
    elif args.listings:
        result = get_listings()
    elif args.analytics:
        result = get_analytics(args.analytics)
    elif args.health:
        result = get_store_health()
    elif args.details:
        result = get_listing_details(args.details)
    else:
        result = {"success": False, "error": "No command specified"}
    
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
