"""
eBay API Client for Store Management
Supports Trading API, Selling API, and Inventory API
"""

import requests
import xml.etree.ElementTree as ET
import json
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import os
from dotenv import load_dotenv
from token_manager import eBayTokenManager

# Load environment variables
load_dotenv()

class eBayAPIClient:
    """eBay API Client for managing store operations"""
    
    def __init__(self):
        self.app_id = os.getenv('EBAY_APP_ID')
        self.dev_id = os.getenv('EBAY_DEV_ID')
        self.cert_id = os.getenv('EBAY_CERT_ID')
        self.ru_name = os.getenv('EBAY_RUNAME')
        self.environment = os.getenv('EBAY_ENVIRONMENT', 'sandbox')
        self.store_name = os.getenv('EBAY_STORE_NAME')
        self.user_id = os.getenv('EBAY_USER_ID')
        
        # Initialize token manager
        self.token_manager = eBayTokenManager()
        self.access_token = self.token_manager.get_valid_token()
        
        # API Endpoints
        self.base_urls = {
            'sandbox': {
                'trading': 'https://api.sandbox.ebay.com/ws/api.dll',
                'selling': 'https://api.sandbox.ebay.com/sell/inventory/v1',
                'fulfillment': 'https://api.sandbox.ebay.com/sell/fulfillment/v1',
                'account': 'https://api.sandbox.ebay.com/sell/account/v1',
                'analytics': 'https://api.sandbox.ebay.com/sell/analytics/v1',
                'oauth': 'https://api.sandbox.ebay.com/identity/v1/oauth2/token'
            },
            'production': {
                'trading': 'https://api.ebay.com/ws/api.dll',
                'selling': 'https://api.ebay.com/sell/inventory/v1',
                'fulfillment': 'https://api.ebay.com/sell/fulfillment/v1',
                'account': 'https://api.ebay.com/sell/account/v1',
                'analytics': 'https://api.ebay.com/sell/analytics/v1',
                'oauth': 'https://api.ebay.com/identity/v1/oauth2/token'
            }
        }
        
        self.base_url = self.base_urls[self.environment]
        
    def _get_headers(self, api_type='trading'):
        """Get appropriate headers for API requests"""
        if api_type == 'trading':
            return {
                'X-EBAY-API-COMPATIBILITY-LEVEL': '967',
                'X-EBAY-API-DEV-NAME': self.dev_id,
                'X-EBAY-API-APP-NAME': self.app_id,
                'X-EBAY-API-CERT-NAME': self.cert_id,
                'X-EBAY-API-CALL-NAME': '',
                'X-EBAY-API-SITEID': '0',  # US site
                'X-EBAY-API-IAF-TOKEN': self.access_token,  # OAuth token for Trading API
                'Content-Type': 'text/xml'
            }
        elif api_type == 'selling':
            return {
                'Authorization': f'Bearer {self.access_token}',
                'Content-Type': 'application/json',
                'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US'
            }
        elif api_type == 'fulfillment':
            return {
                'Authorization': f'Bearer {self.access_token}',
                'Content-Type': 'application/json',
                'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US'
            }
                    elif api_type == 'account':
                        return {
                            'Authorization': f'Bearer {self.access_token}',
                            'Content-Type': 'application/json',
                            'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US'
                        }
                    elif api_type == 'analytics':
                        return {
                            'Authorization': f'Bearer {self.access_token}',
                            'Content-Type': 'application/json',
                            'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US'
                        }
        elif api_type == 'oauth':
            return {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': f'Basic {self._get_basic_auth()}'
            }
    
    def _get_basic_auth(self):
        """Get basic auth string for OAuth requests"""
        import base64
        credentials = f"{self.app_id}:{self.cert_id}"
        return base64.b64encode(credentials.encode()).decode()
    
    def refresh_access_token(self):
        """Refresh the OAuth access token using token manager"""
        return self.token_manager.refresh_access_token()
    
    def _make_trading_request(self, call_name: str, xml_data: str) -> Dict:
        """Make a Trading API request with automatic token refresh"""
        # Ensure we have a valid token
        if not self.token_manager.ensure_valid_token():
            return {'error': 'Unable to obtain valid access token'}
        
        # Update access token
        self.access_token = self.token_manager.get_valid_token()
        
        headers = self._get_headers('trading')
        headers['X-EBAY-API-CALL-NAME'] = call_name
        
        response = requests.post(self.base_url['trading'], headers=headers, data=xml_data)
        
        if response.status_code == 200:
            # Parse XML response
            root = ET.fromstring(response.content)
            return self._xml_to_dict(root)
        else:
            return {'error': f'Request failed with status {response.status_code}: {response.text}'}
    
    def _make_selling_request(self, method: str, endpoint: str, data: Dict = None) -> Dict:
        """Make a Selling API request with automatic token refresh"""
        # Ensure we have a valid token
        if not self.token_manager.ensure_valid_token():
            return {'error': 'Unable to obtain valid access token'}
        
        # Update access token
        self.access_token = self.token_manager.get_valid_token()
        
        headers = self._get_headers('selling')
        url = f"{self.base_url['selling']}/{endpoint}"
        
        if method.upper() == 'GET':
            response = requests.get(url, headers=headers)
        elif method.upper() == 'POST':
            response = requests.post(url, headers=headers, json=data)
        elif method.upper() == 'PUT':
            response = requests.put(url, headers=headers, json=data)
        elif method.upper() == 'DELETE':
            response = requests.delete(url, headers=headers)
        
        if response.status_code in [200, 201, 204]:
            try:
                return response.json()
            except:
                return {'success': True, 'status_code': response.status_code}
        else:
            return {'error': f'Request failed with status {response.status_code}: {response.text}'}
    
    def _xml_to_dict(self, element) -> Dict:
        """Convert XML element to dictionary"""
        result = {}
        
        # Add attributes
        if element.attrib:
            result['@attributes'] = element.attrib
        
        # Add text content
        if element.text and element.text.strip():
            result['text'] = element.text.strip()
        
        # Add children
        for child in element:
            child_data = self._xml_to_dict(child)
            if child.tag in result:
                if not isinstance(result[child.tag], list):
                    result[child.tag] = [result[child.tag]]
                result[child.tag].append(child_data)
            else:
                result[child.tag] = child_data
        
        return result
    
    # Trading API Methods
    def get_my_ebay_selling(self, detail_level='ReturnAll'):
        """Get selling summary and active listings"""
        xml_data = f"""
        <?xml version="1.0" encoding="utf-8"?>
        <GetMyeBaySellingRequest xmlns="urn:ebay:apis:eBLBaseComponents">
            <DetailLevel>{detail_level}</DetailLevel>
            <ActiveList>
                <Include>true</Include>
                <Pagination>
                    <EntriesPerPage>100</EntriesPerPage>
                    <PageNumber>1</PageNumber>
                </Pagination>
            </ActiveList>
            <SoldList>
                <Include>true</Include>
                <Pagination>
                    <EntriesPerPage>100</EntriesPerPage>
                    <PageNumber>1</PageNumber>
                </Pagination>
            </SoldList>
            <UnsoldList>
                <Include>true</Include>
                <Pagination>
                    <EntriesPerPage>100</EntriesPerPage>
                    <PageNumber>1</PageNumber>
                </Pagination>
            </UnsoldList>
        </GetMyeBaySellingRequest>
        """
        return self._make_trading_request('GetMyeBaySelling', xml_data)
    
    def get_item(self, item_id: str):
        """Get details of a specific item"""
        xml_data = f"""
        <?xml version="1.0" encoding="utf-8"?>
        <GetItemRequest xmlns="urn:ebay:apis:eBLBaseComponents">
            <ItemID>{item_id}</ItemID>
            <DetailLevel>ReturnAll</DetailLevel>
        </GetItemRequest>
        """
        return self._make_trading_request('GetItem', xml_data)
    
    def get_orders(self, order_status='All', days_back=30):
        """Get recent orders"""
        from_time = datetime.now() - timedelta(days=days_back)
        to_time = datetime.now()
        
        xml_data = f"""
        <?xml version="1.0" encoding="utf-8"?>
        <GetOrdersRequest xmlns="urn:ebay:apis:eBLBaseComponents">
            <OrderStatus>{order_status}</OrderStatus>
            <CreateTimeFrom>{from_time.strftime('%Y-%m-%dT%H:%M:%S.000Z')}</CreateTimeFrom>
            <CreateTimeTo>{to_time.strftime('%Y-%m-%dT%H:%M:%S.000Z')}</CreateTimeTo>
            <OrderRole>Seller</OrderRole>
            <DetailLevel>ReturnAll</DetailLevel>
            <Pagination>
                <EntriesPerPage>100</EntriesPerPage>
                <PageNumber>1</PageNumber>
            </Pagination>
        </GetOrdersRequest>
        """
        return self._make_trading_request('GetOrders', xml_data)
    
    def get_seller_list(self, days_back=30, entries_per_page=100):
        """Get seller's active listings using Trading API"""
        from_date = (datetime.now() - timedelta(days=days_back)).strftime('%Y-%m-%dT%H:%M:%S.000Z')
        to_date = datetime.now().strftime('%Y-%m-%dT%H:%M:%S.000Z')
        
        xml_data = f"""<?xml version="1.0" encoding="utf-8"?>
        <GetSellerListRequest xmlns="urn:ebay:apis:eBLBaseComponents">
            <DetailLevel>ReturnAll</DetailLevel>
            <GranularityLevel>Fine</GranularityLevel>
            <Pagination>
                <EntriesPerPage>{entries_per_page}</EntriesPerPage>
                <PageNumber>1</PageNumber>
            </Pagination>
            <StartTimeFrom>{from_date}</StartTimeFrom>
            <StartTimeTo>{to_date}</StartTimeTo>
        </GetSellerListRequest>"""
        
        return self._make_trading_request('GetSellerList', xml_data)
    
    def get_active_listings(self):
        """Get all active listings using Trading API"""
        xml_data = f"""<?xml version="1.0" encoding="utf-8"?>
        <GetMyeBaySellingRequest xmlns="urn:ebay:apis:eBLBaseComponents">
            <DetailLevel>ReturnAll</DetailLevel>
            <ActiveList>
                <Include>true</Include>
                <ListingType>All</ListingType>
                <Pagination>
                    <EntriesPerPage>200</EntriesPerPage>
                    <PageNumber>1</PageNumber>
                </Pagination>
            </ActiveList>
            <SoldList>
                <Include>true</Include>
                <Pagination>
                    <EntriesPerPage>50</EntriesPerPage>
                    <PageNumber>1</PageNumber>
                </Pagination>
            </SoldList>
        </GetMyeBaySellingRequest>"""
        
        return self._make_trading_request('GetMyeBaySelling', xml_data)
    
    # REST API Methods (preferred for OAuth)
    def get_orders_rest(self, limit=50, offset=0):
        """Get orders using REST API (Fulfillment API)"""
        if not self.token_manager.ensure_valid_token():
            return {'error': 'Unable to obtain valid access token'}
        
        self.access_token = self.token_manager.get_valid_token()
        
        headers = self._get_headers('fulfillment')
        url = f"{self.base_url['fulfillment']}/order"
        
        params = {
            'limit': limit,
            'offset': offset,
            'orderIds': '',  # Can filter by specific order IDs if needed
            'filter': 'orderfulfillmentstatus:{NOT_STARTED|IN_PROGRESS}'  # Active orders
        }
        
        try:
            response = requests.get(url, headers=headers, params=params)
            if response.status_code == 200:
                return response.json()
            else:
                return {
                    'error': f'API request failed with status {response.status_code}',
                    'details': response.text
                }
        except Exception as e:
            return {'error': f'Request failed: {str(e)}'}
    
    def get_inventory_rest(self, limit=50, offset=0):
        """Get inventory items using REST API (Inventory API)"""
        if not self.token_manager.ensure_valid_token():
            return {'error': 'Unable to obtain valid access token'}
        
        self.access_token = self.token_manager.get_valid_token()
        
        headers = self._get_headers('selling')
        url = f"{self.base_url['selling']}/inventory_item"
        
        params = {
            'limit': limit,
            'offset': offset
        }
        
        try:
            response = requests.get(url, headers=headers, params=params)
            if response.status_code == 200:
                return response.json()
            else:
                return {
                    'error': f'API request failed with status {response.status_code}',
                    'details': response.text
                }
        except Exception as e:
            return {'error': f'Request failed: {str(e)}'}
    
    def get_account_info_rest(self):
        """Get seller account information using REST API"""
        if not self.token_manager.ensure_valid_token():
            return {'error': 'Unable to obtain valid access token'}
        
        self.access_token = self.token_manager.get_valid_token()
        
        headers = self._get_headers('account')
        url = f"{self.base_url['account']}/privilege"
        
        try:
            response = requests.get(url, headers=headers)
            if response.status_code == 200:
                return response.json()
            else:
                return {
                    'error': f'API request failed with status {response.status_code}',
                    'details': response.text
                }
        except Exception as e:
            return {'error': f'Request failed: {str(e)}'}
    
    # Selling API Methods
    def get_inventory_items(self, limit=100, offset=0):
        """Get inventory items using Selling API"""
        endpoint = f"inventory_item?limit={limit}&offset={offset}"
        return self._make_selling_request('GET', endpoint)
    
    def get_inventory_item(self, sku: str):
        """Get specific inventory item by SKU"""
        endpoint = f"inventory_item/{sku}"
        return self._make_selling_request('GET', endpoint)
    
    def create_inventory_item(self, sku: str, item_data: Dict):
        """Create a new inventory item"""
        endpoint = f"inventory_item/{sku}"
        return self._make_selling_request('PUT', endpoint, item_data)
    
    def get_listings(self, limit=100, offset=0):
        """Get active listings"""
        endpoint = f"inventory_item?limit={limit}&offset={offset}"
        return self._make_selling_request('GET', endpoint)
    
    def get_fulfillment_orders(self, limit=100, offset=0):
        """Get fulfillment orders"""
        endpoint = f"fulfillment_order?limit={limit}&offset={offset}"
        return self._make_selling_request('GET', endpoint)
    
    # Utility Methods
    def get_store_summary(self):
        """Get comprehensive store summary"""
        summary = {
            'timestamp': datetime.now().isoformat(),
            'store_name': self.store_name,
            'user_id': self.user_id,
            'environment': self.environment
        }
        
        # Get selling data
        selling_data = self.get_my_ebay_selling()
        if 'error' not in selling_data:
            summary['selling_data'] = selling_data
        
        # Get recent orders
        orders_data = self.get_orders()
        if 'error' not in orders_data:
            summary['recent_orders'] = orders_data
        
        return summary
    
    def export_listings_to_csv(self, filename: str = None):
        """Export active listings to CSV file"""
        if not filename:
            filename = f"ebay_listings_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        
        # Get selling data
        selling_data = self.get_my_ebay_selling()
        
        if 'error' in selling_data:
            print(f"Error fetching data: {selling_data['error']}")
            return False
        
        # Process and export data
        import pandas as pd
        
        listings = []
        if 'ActiveList' in selling_data and 'ItemArray' in selling_data['ActiveList']:
            items = selling_data['ActiveList']['ItemArray']
            if not isinstance(items, list):
                items = [items]
            
            for item in items:
                listing = {
                    'ItemID': item.get('ItemID', ''),
                    'Title': item.get('Title', ''),
                    'CurrentPrice': item.get('SellingStatus', {}).get('CurrentPrice', {}).get('text', ''),
                    'Quantity': item.get('Quantity', ''),
                    'QuantitySold': item.get('SellingStatus', {}).get('QuantitySold', ''),
                    'ListingType': item.get('ListingType', ''),
                    'StartTime': item.get('ListingDetails', {}).get('StartTime', ''),
                    'EndTime': item.get('ListingDetails', {}).get('EndTime', ''),
                    'ViewItemURL': item.get('ListingDetails', {}).get('ViewItemURL', '')
                }
                listings.append(listing)
        
        if listings:
            df = pd.DataFrame(listings)
            df.to_csv(filename, index=False)
            print(f"Exported {len(listings)} listings to {filename}")
            return True
        else:
            print("No listings found to export")
            return False

# Example usage and testing
if __name__ == "__main__":
    # Initialize the client
    client = eBayAPIClient()
    
    # Check if credentials are set
    if not client.app_id:
        print("Please set up your eBay API credentials in the .env file")
        print("Copy env_example.txt to .env and fill in your credentials")
    else:
        print("eBay API Client initialized successfully!")
        print(f"Environment: {client.environment}")
        print(f"Store: {client.store_name}")
        
        # Test connection
        summary = client.get_store_summary()
        print("\nStore Summary:")
        print(json.dumps(summary, indent=2))
