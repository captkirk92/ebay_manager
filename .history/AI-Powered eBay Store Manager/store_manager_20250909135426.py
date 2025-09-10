"""
eBay Store Management Utilities
Advanced functions for managing your eBay store
"""

import json
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from ebay_api_client import eBayAPIClient

class eBayStoreManager:
    """Advanced eBay store management class"""
    
    def __init__(self):
        self.client = eBayAPIClient()
    
    def get_store_analytics(self, days_back=30):
        """Get comprehensive store analytics"""
        analytics = {
            'period': f"Last {days_back} days",
            'generated_at': datetime.now().isoformat(),
            'store_name': self.client.store_name,
            'environment': self.client.environment
        }
        
        # Get account info (REST API)
        account_data = self.client.get_account_info_rest()
        if 'error' not in account_data:
            analytics['account_info'] = account_data
        
        # Get orders data (REST API)
        orders_data = self.client.get_orders_rest(limit=100)
        if 'error' not in orders_data:
            analytics['orders_summary'] = self._extract_orders_summary_rest(orders_data)
        
        # Get inventory data (REST API)
        inventory_data = self.client.get_inventory_rest(limit=100)
        if 'error' not in inventory_data:
            analytics['inventory_summary'] = self._extract_inventory_summary_rest(inventory_data)
        
        # Fallback to Trading API if REST API fails
        if 'orders_summary' not in analytics:
            orders_data = self.client.get_orders(days_back=days_back)
            if 'error' not in orders_data:
                analytics['orders_summary'] = self._extract_orders_summary(orders_data)
        
        # Get selling data (Trading API as fallback)
        selling_data = self.client.get_my_ebay_selling()
        if 'error' not in selling_data:
            analytics['selling_summary'] = self._extract_selling_summary(selling_data)
        
        return analytics
    
    def _extract_selling_summary(self, selling_data):
        """Extract key metrics from selling data"""
        summary = {
            'active_listings': 0,
            'total_sold': 0,
            'total_revenue': 0.0,
            'average_price': 0.0
        }
        
        try:
            if 'ActiveList' in selling_data and 'ItemArray' in selling_data['ActiveList']:
                items = selling_data['ActiveList']['ItemArray']
                if not isinstance(items, list):
                    items = [items]
                
                summary['active_listings'] = len(items)
                
                total_price = 0
                for item in items:
                    price_text = item.get('SellingStatus', {}).get('CurrentPrice', {}).get('text', '0')
                    try:
                        price = float(price_text)
                        total_price += price
                    except:
                        pass
                
                if items:
                    summary['average_price'] = total_price / len(items)
            
            if 'SoldList' in selling_data and 'ItemArray' in selling_data['SoldList']:
                sold_items = selling_data['SoldList']['ItemArray']
                if not isinstance(sold_items, list):
                    sold_items = [sold_items]
                
                summary['total_sold'] = len(sold_items)
                
                total_revenue = 0
                for item in sold_items:
                    price_text = item.get('SellingStatus', {}).get('CurrentPrice', {}).get('text', '0')
                    try:
                        price = float(price_text)
                        total_revenue += price
                    except:
                        pass
                
                summary['total_revenue'] = total_revenue
                
        except Exception as e:
            summary['error'] = str(e)
        
        return summary
    
    def _extract_orders_summary_rest(self, orders_data):
        """Extract key metrics from REST API orders data"""
        summary = {
            'total_orders': 0,
            'total_revenue': 0.0,
            'orders_by_status': {},
            'recent_orders': []
        }
        
        try:
            if 'orders' in orders_data:
                orders = orders_data['orders']
                summary['total_orders'] = len(orders)
                
                for order in orders:
                    # Extract revenue
                    if 'pricingSummary' in order and 'total' in order['pricingSummary']:
                        total_value = float(order['pricingSummary']['total']['value'])
                        summary['total_revenue'] += total_value
                    
                    # Count by status
                    status = order.get('orderFulfillmentStatus', 'Unknown')
                    summary['orders_by_status'][status] = summary['orders_by_status'].get(status, 0) + 1
                    
                    # Add to recent orders (limit to 10)
                    if len(summary['recent_orders']) < 10:
                        order_info = {
                            'orderId': order.get('orderId', ''),
                            'creationDate': order.get('creationDate', ''),
                            'status': status,
                            'total': order.get('pricingSummary', {}).get('total', {}).get('value', '0'),
                            'currency': order.get('pricingSummary', {}).get('total', {}).get('currency', 'USD'),
                            'buyer': order.get('buyer', {}).get('username', 'Unknown')
                        }
                        summary['recent_orders'].append(order_info)
                
                # Calculate average order value
                if summary['total_orders'] > 0:
                    summary['average_order_value'] = summary['total_revenue'] / summary['total_orders']
                else:
                    summary['average_order_value'] = 0.0
                    
        except Exception as e:
            summary['error'] = f"Error processing orders data: {str(e)}"
            
        return summary
    
    def _extract_inventory_summary_rest(self, inventory_data):
        """Extract key metrics from REST API inventory data"""
        summary = {
            'total_listings': 0,
            'active_listings': 0,
            'total_quantity': 0,
            'categories': {},
            'price_ranges': {'0-25': 0, '25-50': 0, '50-100': 0, '100+': 0}
        }
        
        try:
            if 'inventoryItems' in inventory_data:
                items = inventory_data['inventoryItems']
                summary['total_listings'] = len(items)
                
                for item in items:
                    # Check if active (this might vary based on actual API response)
                    availability = item.get('availability', {})
                    if availability.get('shipToLocationAvailability', {}).get('quantity', 0) > 0:
                        summary['active_listings'] += 1
                        summary['total_quantity'] += int(availability.get('shipToLocationAvailability', {}).get('quantity', 0))
                    
                    # Extract category info
                    product = item.get('product', {})
                    category = product.get('category', 'Unknown')
                    summary['categories'][category] = summary['categories'].get(category, 0) + 1
                    
                    # Price range analysis
                    condition = item.get('condition', '')
                    if condition:  # If there's condition info, item might have pricing
                        # This is a simplified approach - actual pricing might be in offers
                        pass
                        
        except Exception as e:
            summary['error'] = f"Error processing inventory data: {str(e)}"
            
        return summary
    
    def _extract_orders_summary(self, orders_data):
        """Extract key metrics from orders data"""
        summary = {
            'total_orders': 0,
            'total_value': 0.0,
            'average_order_value': 0.0,
            'order_status_breakdown': {}
        }
        
        try:
            if 'OrderArray' in orders_data:
                orders = orders_data['OrderArray']
                if not isinstance(orders, list):
                    orders = [orders]
                
                summary['total_orders'] = len(orders)
                
                total_value = 0
                status_counts = {}
                
                for order in orders:
                    # Get order value
                    try:
                        value_text = order.get('Total', {}).get('text', '0')
                        value = float(value_text)
                        total_value += value
                    except:
                        pass
                    
                    # Count by status
                    status = order.get('OrderStatus', 'Unknown')
                    status_counts[status] = status_counts.get(status, 0) + 1
                
                summary['total_value'] = total_value
                summary['order_status_breakdown'] = status_counts
                
                if orders:
                    summary['average_order_value'] = total_value / len(orders)
                    
        except Exception as e:
            summary['error'] = str(e)
        
        return summary
    
    def _extract_inventory_summary(self, inventory_data):
        """Extract key metrics from inventory data"""
        summary = {
            'total_items': 0,
            'items_with_quantity': 0,
            'total_quantity': 0,
            'low_stock_items': 0
        }
        
        try:
            if 'inventoryItems' in inventory_data:
                items = inventory_data['inventoryItems']
                if not isinstance(items, list):
                    items = [items]
                
                summary['total_items'] = len(items)
                
                for item in items:
                    quantity = item.get('quantity', 0)
                    if quantity > 0:
                        summary['items_with_quantity'] += 1
                        summary['total_quantity'] += quantity
                        
                        if quantity <= 5:  # Consider low stock if 5 or fewer
                            summary['low_stock_items'] += 1
                            
        except Exception as e:
            summary['error'] = str(e)
        
        return summary
    
    def generate_sales_report(self, days_back=30, filename=None):
        """Generate a detailed sales report"""
        if not filename:
            filename = f"ebay_sales_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
        
        # Get analytics data
        analytics = self.get_store_analytics(days_back)
        
        # Create Excel writer
        with pd.ExcelWriter(filename, engine='openpyxl') as writer:
            # Summary sheet
            summary_data = []
            for key, value in analytics.items():
                if isinstance(value, dict):
                    for sub_key, sub_value in value.items():
                        summary_data.append({
                            'Category': key,
                            'Metric': sub_key,
                            'Value': sub_value
                        })
                else:
                    summary_data.append({
                        'Category': 'General',
                        'Metric': key,
                        'Value': value
                    })
            
            summary_df = pd.DataFrame(summary_data)
            summary_df.to_excel(writer, sheet_name='Summary', index=False)
            
            # Get detailed listings data
            selling_data = self.client.get_my_ebay_selling()
            if 'error' not in selling_data and 'ActiveList' in selling_data:
                listings_data = self._prepare_listings_data(selling_data['ActiveList'])
                if listings_data:
                    listings_df = pd.DataFrame(listings_data)
                    listings_df.to_excel(writer, sheet_name='Active_Listings', index=False)
            
            # Get detailed orders data
            orders_data = self.client.get_orders(days_back=days_back)
            if 'error' not in orders_data and 'OrderArray' in orders_data:
                orders_list = self._prepare_orders_data(orders_data['OrderArray'])
                if orders_list:
                    orders_df = pd.DataFrame(orders_list)
                    orders_df.to_excel(writer, sheet_name='Recent_Orders', index=False)
        
        print(f"Sales report generated: {filename}")
        return filename
    
    def _prepare_listings_data(self, active_list):
        """Prepare listings data for export"""
        listings = []
        
        if 'ItemArray' in active_list:
            items = active_list['ItemArray']
            if not isinstance(items, list):
                items = [items]
            
            for item in items:
                listing = {
                    'Item ID': item.get('ItemID', ''),
                    'Title': item.get('Title', ''),
                    'Current Price': item.get('SellingStatus', {}).get('CurrentPrice', {}).get('text', ''),
                    'Currency': item.get('SellingStatus', {}).get('CurrentPrice', {}).get('@attributes', {}).get('currencyID', ''),
                    'Quantity': item.get('Quantity', ''),
                    'Quantity Sold': item.get('SellingStatus', {}).get('QuantitySold', ''),
                    'Listing Type': item.get('ListingType', ''),
                    'Start Time': item.get('ListingDetails', {}).get('StartTime', ''),
                    'End Time': item.get('ListingDetails', {}).get('EndTime', ''),
                    'View URL': item.get('ListingDetails', {}).get('ViewItemURL', ''),
                    'Condition': item.get('ConditionID', ''),
                    'Category ID': item.get('PrimaryCategoryID', ''),
                    'Category Name': item.get('PrimaryCategoryName', '')
                }
                listings.append(listing)
        
        return listings
    
    def _prepare_orders_data(self, order_array):
        """Prepare orders data for export"""
        orders = []
        
        if not isinstance(order_array, list):
            order_array = [order_array]
        
        for order in order_array:
            order_data = {
                'Order ID': order.get('OrderID', ''),
                'Order Status': order.get('OrderStatus', ''),
                'Total': order.get('Total', {}).get('text', ''),
                'Currency': order.get('Total', {}).get('@attributes', {}).get('currencyID', ''),
                'Created Time': order.get('CreatedTime', ''),
                'Paid Time': order.get('PaidTime', ''),
                'Shipped Time': order.get('ShippedTime', ''),
                'Buyer User ID': order.get('BuyerUserID', ''),
                'Buyer Email': order.get('TransactionArray', {}).get('Transaction', {}).get('Buyer', {}).get('Email', ''),
                'Shipping Address': self._format_shipping_address(order.get('ShippingAddress', {}))
            }
            orders.append(order_data)
        
        return orders
    
    def _format_shipping_address(self, address):
        """Format shipping address for display"""
        if not address:
            return ''
        
        parts = []
        if address.get('Name'):
            parts.append(address['Name'])
        if address.get('Street1'):
            parts.append(address['Street1'])
        if address.get('Street2'):
            parts.append(address['Street2'])
        if address.get('CityName'):
            parts.append(address['CityName'])
        if address.get('StateOrProvince'):
            parts.append(address['StateOrProvince'])
        if address.get('PostalCode'):
            parts.append(address['PostalCode'])
        if address.get('CountryName'):
            parts.append(address['CountryName'])
        
        return ', '.join(parts)
    
    def check_low_stock_items(self, threshold=5):
        """Check for items with low stock"""
        inventory_data = self.client.get_inventory_items()
        low_stock_items = []
        
        if 'error' not in inventory_data and 'inventoryItems' in inventory_data:
            items = inventory_data['inventoryItems']
            if not isinstance(items, list):
                items = [items]
            
            for item in items:
                quantity = item.get('quantity', 0)
                if quantity <= threshold:
                    low_stock_items.append({
                        'SKU': item.get('sku', ''),
                        'Title': item.get('title', ''),
                        'Current Quantity': quantity,
                        'Alert Level': 'Low' if quantity > 0 else 'Out of Stock'
                    })
        
        return low_stock_items
    
    def get_performance_metrics(self, days_back=30):
        """Get key performance metrics"""
        analytics = self.get_store_analytics(days_back)
        
        metrics = {
            'conversion_rate': 0.0,
            'average_listing_price': 0.0,
            'total_revenue': 0.0,
            'active_listings': 0,
            'orders_fulfilled': 0
        }
        
        # Calculate conversion rate
        selling_summary = analytics.get('selling_summary', {})
        orders_summary = analytics.get('orders_summary', {})
        
        active_listings = selling_summary.get('active_listings', 0)
        total_orders = orders_summary.get('total_orders', 0)
        
        if active_listings > 0:
            metrics['conversion_rate'] = (total_orders / active_listings) * 100
        
        metrics['average_listing_price'] = selling_summary.get('average_price', 0)
        metrics['total_revenue'] = selling_summary.get('total_revenue', 0)
        metrics['active_listings'] = active_listings
        metrics['orders_fulfilled'] = total_orders
        
        return metrics

# Example usage
if __name__ == "__main__":
    manager = eBayStoreManager()
    
    print("eBay Store Manager initialized!")
    
    # Get store analytics
    analytics = manager.get_store_analytics()
    print("\nStore Analytics:")
    print(json.dumps(analytics, indent=2))
    
    # Check low stock items
    low_stock = manager.check_low_stock_items()
    if low_stock:
        print(f"\nLow Stock Items ({len(low_stock)}):")
        for item in low_stock:
            print(f"- {item['Title']}: {item['Current Quantity']} ({item['Alert Level']})")
    
    # Get performance metrics
    metrics = manager.get_performance_metrics()
    print(f"\nPerformance Metrics:")
    print(f"Conversion Rate: {metrics['conversion_rate']:.2f}%")
    print(f"Average Listing Price: ${metrics['average_listing_price']:.2f}")
    print(f"Total Revenue: ${metrics['total_revenue']:.2f}")
    print(f"Active Listings: {metrics['active_listings']}")
    print(f"Orders Fulfilled: {metrics['orders_fulfilled']}")
