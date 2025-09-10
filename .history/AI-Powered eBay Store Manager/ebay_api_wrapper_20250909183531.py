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
        
        # Parse XML response to extract images and details
        try:
            import xml.etree.ElementTree as ET
            root = ET.fromstring(response)
            ns = {'ns': 'urn:ebay:apis:eBLBaseComponents'}
            
            item = root.find('.//ns:Item', ns)
            if item is not None:
                # Extract basic info
                item_data = {
                    'ItemID': item.find('ns:ItemID', ns).text if item.find('ns:ItemID', ns) is not None else '',
                    'Title': item.find('ns:Title', ns).text if item.find('ns:Title', ns) is not None else '',
                    'Description': item.find('ns:Description', ns).text if item.find('ns:Description', ns) is not None else '',
                    'CurrentPrice': float(item.find('.//ns:CurrentPrice', ns).text) if item.find('.//ns:CurrentPrice', ns) is not None else 0.0,
                    'ViewItemURL': item.find('ns:ViewItemURL', ns).text if item.find('ns:ViewItemURL', ns) is not None else '',
                    'GalleryURL': item.find('ns:GalleryURL', ns).text if item.find('ns:GalleryURL', ns) is not None else '',
                    'PictureURL': []
                }
                
                # Extract picture URLs
                picture_details = item.find('ns:PictureDetails', ns)
                if picture_details is not None:
                    # Look for PictureURL elements
                    for pic_url in picture_details.findall('ns:PictureURL', ns):
                        if pic_url.text:
                            item_data['PictureURL'].append(pic_url.text)
                    
                    # Also check for GalleryURL in PictureDetails
                    gallery_url = picture_details.find('ns:GalleryURL', ns)
                    if gallery_url is not None and gallery_url.text:
                        item_data['GalleryURL'] = gallery_url.text
                
                return {
                    'success': True,
                    'data': item_data
                }
            else:
                return {
                    'success': False,
                    'error': 'No item data found in response'
                }
                
        except Exception as parse_error:
            return {
                'success': False,
                'error': f"Failed to parse item XML: {str(parse_error)}"
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
