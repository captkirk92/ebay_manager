#!/usr/bin/env python3
"""
Store Data Pipeline AI
Gathers, normalizes, and structures eBay store data according to schema
"""

import json
import sys
from datetime import datetime, timedelta
from ebay_api_wrapper import get_store_summary, get_orders, get_listings, get_analytics

class StoreDataPipeline:
    def __init__(self):
        self.raw_data = {}
        self.structured_data = {
            "orders": [],
            "customers": [],
            "returns": [],
            "fulfillment": [],
            "financials": {
                "sales": 0.0,
                "refunds": 0.0,
                "fees": 0.0,
                "profitMargin": 0.0
            },
            "policyMetrics": {
                "defectRate": 0.0,
                "lateShipmentRate": 0.0,
                "casesClosedWithoutSellerResolution": 0,
                "feedbackScore": 0.0
            }
        }
    
    def collect_raw_data(self):
        """STEP 1: Gather raw data from eBay API endpoints"""
        print("🔄 STEP 1: Data Collection from eBay API...")
        
        try:
            # Collect from all available endpoints
            self.raw_data['summary'] = get_store_summary()
            self.raw_data['orders'] = get_orders()
            self.raw_data['listings'] = get_listings()
            self.raw_data['analytics'] = get_analytics()
            
            print("✅ Raw data collection complete")
            return True
            
        except Exception as e:
            print(f"❌ Error collecting raw data: {e}")
            return False

    def process_and_save(self):
        """STEP 2: Process raw data into structured format and save for frontend"""
        print("🔄 STEP 2: Processing and saving data...")
        
        try:
            # Process summary data
            if 'summary' in self.raw_data:
                summary = self.raw_data['summary']
                
                # Handle API response structure with 'data' wrapper
                if isinstance(summary, dict) and 'data' in summary:
                    data = summary['data']
                    self.structured_data['store_info'] = {
                        'name': data.get('store_name', 'Unknown'),
                        'user_id': data.get('user_id', 'Unknown'),
                        'active_listings': data.get('selling_data', {}).get('active_listings', 0)
                    }
                    
                    # Add selling data to structured data
                    selling_data = data.get('selling_data', {})
                    self.structured_data['financials']['sales'] = selling_data.get('total_revenue', 0.0)
                    self.structured_data['total_orders'] = selling_data.get('total_sales', 0)
                else:
                    # Fallback for direct data format
                    if isinstance(summary, str):
                        summary = json.loads(summary)
                        
                    self.structured_data['store_info'] = {
                        'name': summary.get('store_name', 'Unknown'),
                        'user_id': summary.get('user_id', 'Unknown'),
                        'active_listings': summary.get('selling_data', {}).get('active_listings', 0)
                    }

            # Process orders data
            if 'orders' in self.raw_data:
                orders_data = self.raw_data['orders']
                
                # Handle API response structure with 'data' wrapper
                if isinstance(orders_data, dict) and 'data' in orders_data:
                    orders_list = orders_data['data']
                else:
                    orders_list = orders_data if isinstance(orders_data, list) else []
                
                self.structured_data['orders'] = orders_list
                
                # Calculate financial metrics if we have order data
                if orders_list:
                    total_sales = sum(float(order.get('total', 0)) for order in orders_list if isinstance(order, dict))
                    self.structured_data['financials']['sales'] = total_sales

            # Process analytics data
            if 'analytics' in self.raw_data:
                analytics = self.raw_data['analytics']
                
                # Handle API response structure with 'data' wrapper
                if isinstance(analytics, dict) and 'data' in analytics:
                    analytics_data = analytics['data']
                else:
                    analytics_data = analytics
                    
                if isinstance(analytics_data, dict) and 'metrics' in analytics_data:
                    metrics = analytics_data['metrics']
                    self.structured_data['policyMetrics'].update({
                        'defectRate': metrics.get('defect_rate', 0.0),
                        'lateShipmentRate': metrics.get('late_shipment_rate', 0.0),
                        'feedbackScore': metrics.get('feedback_score', 0)
                    })

            # Save structured data to file for frontend
            data_path = 'src/data/store_data.json'
            with open(data_path, 'w') as f:
                json.dump(self.structured_data, f, indent=2)
            
            print(f"✅ Data saved to {data_path}")
            return True

        except Exception as e:
            print(f"❌ Error processing data: {e}")
            raise
    
    def normalize_orders(self):
        """Normalize orders data to schema"""
        orders_raw = self.raw_data.get('orders', {}).get('data', {}).get('OrderArray', [])
        
        for order_raw in orders_raw:
            # Extract order details
            order = {
                "orderId": order_raw.get('OrderID', ''),
                "date": order_raw.get('CreatedTime', '')[:10] if order_raw.get('CreatedTime') else '',
                "items": [],
                "status": self._normalize_order_status(order_raw.get('OrderStatus', '')),
                "shippingMethod": order_raw.get('ShippingMethod', ''),
                "tracking": order_raw.get('TrackingNumber', ''),
                "customerId": order_raw.get('BuyerUserID', '')
            }
            
            # Extract items
            transactions = order_raw.get('TransactionArray', [])
            for transaction in transactions:
                item = {
                    "sku": transaction.get('Item', {}).get('SKU', ''),
                    "title": transaction.get('Item', {}).get('Title', ''),
                    "quantity": int(transaction.get('QuantityPurchased', 0)),
                    "price": float(transaction.get('TransactionPrice', {}).get('Value', 0))
                }
                order["items"].append(item)
            
            self.structured_data["orders"].append(order)
    
    def normalize_listings_as_inventory(self):
        """Use listings data to infer business metrics"""
        listings_raw = self.raw_data.get('listings', {}).get('data', {}).get('listings', [])
        
        total_inventory_value = 0
        active_listings = len(listings_raw)
        
        for listing in listings_raw:
            price = float(listing.get('CurrentPrice', 0))
            quantity = int(listing.get('Quantity', 0))
            total_inventory_value += price * quantity
        
        # Update financials based on listings
        summary_data = self.raw_data.get('summary', {}).get('data', {}).get('selling_data', {})
        self.structured_data["financials"] = {
            "sales": float(summary_data.get('total_revenue', 0)),
            "refunds": 0.0,  # Not available in current API
            "fees": float(summary_data.get('total_revenue', 0)) * 0.13,  # Estimated eBay fees ~13%
            "profitMargin": 0.0  # Would need cost data
        }
    
    def normalize_store_health(self):
        """Extract policy metrics from available data"""
        summary_data = self.raw_data.get('summary', {}).get('data', {})
        
        # Extract what we can from summary data
        selling_data = summary_data.get('selling_data', {})
        
        self.structured_data["policyMetrics"] = {
            "defectRate": 0.0,  # Would need detailed metrics API
            "lateShipmentRate": 0.0,  # Would need shipping performance data
            "casesClosedWithoutSellerResolution": 0,  # Would need case management API
            "feedbackScore": 100.0  # Placeholder - would need feedback API
        }
    
    def _normalize_order_status(self, status):
        """Normalize eBay order status to schema format"""
        status_mapping = {
            'Active': 'Pending',
            'Completed': 'Delivered',
            'Cancelled': 'Cancelled',
            'Shipped': 'Shipped'
        }
        return status_mapping.get(status, 'Pending')
    
    def categorize_and_structure(self):
        """STEP 2: Categorization and normalization"""
        print("🔄 STEP 2: Data Categorization & Normalization...")
        
        try:
            self.normalize_orders()
            self.normalize_listings_as_inventory()
            self.normalize_store_health()
            
            print("✅ Data categorization complete")
            return True
            
        except Exception as e:
            print(f"❌ Error in categorization: {e}")
            return False
    
    def generate_structured_output(self):
        """STEP 3: Generate structured JSON output"""
        print("🔄 STEP 3: Generating Structured Output...")
        
        # Add metadata
        self.structured_data["_metadata"] = {
            "generated_at": datetime.now().isoformat(),
            "store_name": self.raw_data.get('summary', {}).get('data', {}).get('store_name', ''),
            "data_sources": list(self.raw_data.keys()),
            "total_listings": len(self.raw_data.get('listings', {}).get('data', {}).get('listings', [])),
            "total_orders": len(self.structured_data["orders"])
        }
        
        print("✅ Structured output generated")
        return self.structured_data
    
    def run_pipeline(self):
        """Execute complete data pipeline"""
        print("🤖 Store Data Pipeline AI - Starting...")
        
        # Execute pipeline steps
        if not self.collect_raw_data():
            return {"status": "FAILED", "step": "data_collection"}
        
        if not self.categorize_and_structure():
            return {"status": "FAILED", "step": "categorization"}
        
        structured_output = self.generate_structured_output()
        
        # Validation
        missing_fields = []
        if not structured_output.get("_metadata", {}).get("store_name"):
            missing_fields.append("store_name")
        
        status = "OK" if not missing_fields else "Missing fields"
        
        return {
            "status": status,
            "missing_fields": missing_fields,
            "structured_data": structured_output
        }

def main():
    pipeline = StoreDataPipeline()
    result = pipeline.run_pipeline()
    
    print(f"\n📊 DATA PIPELINE STATUS: {result['status']}")
    
    if result['status'] != 'FAILED':
        print(f"📈 Store: {result['structured_data']['_metadata']['store_name']}")
        print(f"📦 Total Listings: {result['structured_data']['_metadata']['total_listings']}")
        print(f"🛒 Total Orders: {result['structured_data']['_metadata']['total_orders']}")
        print(f"💰 Sales: ${result['structured_data']['financials']['sales']}")
        
        # Output structured JSON
        print("\n" + "="*50)
        print("STRUCTURED JSON OUTPUT:")
        print("="*50)
        print(json.dumps(result['structured_data'], indent=2))
    
    return result

if __name__ == "__main__":
    main()
