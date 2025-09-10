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

    def analyze_store_health(self):
        """Comprehensive store health analysis using Seller Standards API"""
        try:
            client = eBayAPIClient()
            
            # Get seller standards profile
            standards_data = client.get_seller_standards_profile()
            if not standards_data:
                return self._generate_fallback_health_analysis()
            
            # Get customer service metrics
            inad_metrics = client.get_customer_service_metrics("ITEM_NOT_AS_DESCRIBED", "CURRENT")
            inr_metrics = client.get_customer_service_metrics("ITEM_NOT_RECEIVED", "CURRENT")
            
            # Get traffic report
            traffic_data = client.get_traffic_report()
            
            # Calculate health score
            health_score = self._calculate_health_score(standards_data, inad_metrics, inr_metrics, traffic_data)
            
            # Generate analysis
            analysis = self._generate_health_analysis(standards_data, inad_metrics, inr_metrics, traffic_data, health_score)
            
            return {
                "success": True,
                "data": {
                    "health_score": health_score,
                    "analysis": analysis,
                    "standards_data": standards_data,
                    "inad_metrics": inad_metrics,
                    "inr_metrics": inr_metrics,
                    "traffic_data": traffic_data
                }
            }
            
        except Exception as e:
            print(f"Error analyzing store health: {e}")
            return self._generate_fallback_health_analysis()

    def _calculate_health_score(self, standards_data, inad_metrics, inr_metrics, traffic_data):
        """Calculate store health score (0-100)"""
        try:
            score = 100  # Start with perfect score
            
            # Seller Standards Profile scoring
            if standards_data and 'standardsProfile' in standards_data:
                profile = standards_data['standardsProfile']
                
                # Performance tier scoring
                tier = profile.get('standardsLevel', 'Below Standard')
                if tier == 'Top Rated':
                    score -= 0  # Perfect
                elif tier == 'Above Standard':
                    score -= 10  # Good
                elif tier == 'Below Standard':
                    score -= 30  # Poor
                
                # Transaction defect rate
                defect_rate = profile.get('transactionDefectRate', 0)
                if defect_rate > 0.02:  # 2%
                    score -= min(25, defect_rate * 1000)  # Penalty up to 25 points
                
                # Late shipment rate
                late_shipment_rate = profile.get('lateShipmentRate', 0)
                if late_shipment_rate > 0.05:  # 5%
                    score -= min(20, late_shipment_rate * 200)  # Penalty up to 20 points
                
                # Cases closed without seller resolution
                cases_closed = profile.get('casesClosedWithoutSellerResolution', 0)
                if cases_closed > 0:
                    score -= min(15, cases_closed * 5)  # Penalty up to 15 points
            
            # Customer service metrics scoring
            if inad_metrics and 'evaluationCycle' in inad_metrics:
                inad_rate = inad_metrics['evaluationCycle'].get('rate', 0)
                if inad_rate > 0.01:  # 1%
                    score -= min(15, inad_rate * 1000)  # Penalty up to 15 points
            
            if inr_metrics and 'evaluationCycle' in inr_metrics:
                inr_rate = inr_metrics['evaluationCycle'].get('rate', 0)
                if inr_rate > 0.01:  # 1%
                    score -= min(15, inr_rate * 1000)  # Penalty up to 15 points
            
            # Traffic performance scoring (if available)
            if traffic_data and 'records' in traffic_data:
                records = traffic_data['records']
                if records:
                    # Calculate average CTR
                    total_impressions = sum(record.get('listingImpressionCount', 0) for record in records)
                    total_clicks = sum(record.get('listingClickCount', 0) for record in records)
                    if total_impressions > 0:
                        ctr = total_clicks / total_impressions
                        if ctr < 0.02:  # 2% CTR
                            score -= 10  # Low CTR penalty
            
            return max(0, min(100, int(score)))  # Ensure score is between 0-100
            
        except Exception as e:
            print(f"Error calculating health score: {e}")
            return 75  # Default score if calculation fails

    def _generate_health_analysis(self, standards_data, inad_metrics, inr_metrics, traffic_data, health_score):
        """Generate detailed health analysis and recommendations"""
        try:
            analysis = {
                "overall_health": self._get_health_status(health_score),
                "strengths": [],
                "concerns": [],
                "action_items": []
            }
            
            # Analyze seller standards
            if standards_data and 'standardsProfile' in standards_data:
                profile = standards_data['standardsProfile']
                tier = profile.get('standardsLevel', 'Below Standard')
                
                if tier == 'Top Rated':
                    analysis["strengths"].append("🎖️ Top Rated Seller status - excellent performance!")
                elif tier == 'Above Standard':
                    analysis["strengths"].append("✅ Above Standard seller - good performance")
                else:
                    analysis["concerns"].append("⚠️ Below Standard seller - needs improvement")
                
                # Transaction defect rate analysis
                defect_rate = profile.get('transactionDefectRate', 0)
                if defect_rate > 0.02:
                    analysis["concerns"].append(f"🔴 High defect rate: {defect_rate:.2%} (target: <2%)")
                    analysis["action_items"].append("Review and improve product descriptions to reduce defects")
                elif defect_rate > 0:
                    analysis["strengths"].append(f"✅ Low defect rate: {defect_rate:.2%}")
                
                # Late shipment analysis
                late_shipment_rate = profile.get('lateShipmentRate', 0)
                if late_shipment_rate > 0.05:
                    analysis["concerns"].append(f"🚚 High late shipment rate: {late_shipment_rate:.2%} (target: <5%)")
                    analysis["action_items"].append("Improve shipping processes and handling time accuracy")
                elif late_shipment_rate > 0:
                    analysis["strengths"].append(f"✅ Good shipping performance: {late_shipment_rate:.2%} late shipments")
                
                # Cases resolution analysis
                cases_closed = profile.get('casesClosedWithoutSellerResolution', 0)
                if cases_closed > 0:
                    analysis["concerns"].append(f"📞 {cases_closed} cases closed without resolution")
                    analysis["action_items"].append("Improve customer service response time and resolution rate")
            
            # Customer service metrics analysis
            if inad_metrics and 'evaluationCycle' in inad_metrics:
                inad_rate = inad_metrics['evaluationCycle'].get('rate', 0)
                if inad_rate > 0.01:
                    analysis["concerns"].append(f"📦 High 'Item Not As Described' rate: {inad_rate:.2%}")
                    analysis["action_items"].append("Improve product photos and descriptions accuracy")
            
            if inr_metrics and 'evaluationCycle' in inr_metrics:
                inr_rate = inr_metrics['evaluationCycle'].get('rate', 0)
                if inr_rate > 0.01:
                    analysis["concerns"].append(f"📮 High 'Item Not Received' rate: {inr_rate:.2%}")
                    analysis["action_items"].append("Improve shipping reliability and tracking")
            
            # Traffic performance analysis
            if traffic_data and 'records' in traffic_data:
                records = traffic_data['records']
                if records:
                    total_impressions = sum(record.get('listingImpressionCount', 0) for record in records)
                    total_clicks = sum(record.get('listingClickCount', 0) for record in records)
                    if total_impressions > 0:
                        ctr = total_clicks / total_impressions
                        if ctr < 0.02:
                            analysis["concerns"].append(f"👁️ Low click-through rate: {ctr:.2%} (target: >2%)")
                            analysis["action_items"].append("Optimize listing titles and images for better visibility")
                        else:
                            analysis["strengths"].append(f"✅ Good click-through rate: {ctr:.2%}")
            
            # Add general recommendations if no specific issues
            if not analysis["action_items"]:
                analysis["action_items"] = [
                    "Continue monitoring performance metrics daily",
                    "Maintain current high performance standards",
                    "Consider expanding successful product categories"
                ]
            
            return analysis
            
        except Exception as e:
            print(f"Error generating health analysis: {e}")
            return {
                "overall_health": "Unknown",
                "strengths": ["Data analysis in progress"],
                "concerns": ["Unable to retrieve performance data"],
                "action_items": ["Check API connectivity and try again"]
            }

    def _get_health_status(self, score):
        """Get health status based on score"""
        if score >= 90:
            return "Excellent"
        elif score >= 80:
            return "Good"
        elif score >= 70:
            return "Fair"
        elif score >= 60:
            return "Poor"
        else:
            return "Critical"

    def _generate_fallback_health_analysis(self):
        """Generate fallback analysis when API data is unavailable"""
        return {
            "success": True,
            "data": {
                "health_score": 75,
                "analysis": {
                    "overall_health": "Good",
                    "strengths": ["Store is operational", "Basic functionality working"],
                    "concerns": ["Performance metrics unavailable", "API permissions may need review"],
                    "action_items": [
                        "Check eBay API connectivity",
                        "Verify OAuth token permissions",
                        "Contact support if detailed metrics are needed"
                    ]
                },
                "standards_data": None,
                "inad_metrics": None,
                "inr_metrics": None,
                "traffic_data": None,
                "note": "Basic health check - detailed metrics unavailable"
            }
        }

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
