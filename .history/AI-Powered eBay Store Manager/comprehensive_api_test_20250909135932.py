#!/usr/bin/env python3
"""
Comprehensive eBay API Test to find accessible data
"""

import requests
import json
from ebay_api_client import eBayAPIClient

def test_all_apis():
    """Test all available eBay APIs to find accessible data"""
    
    client = eBayAPIClient()
    token = client.token_manager.get_valid_token()
    
    print("=" * 60)
    print("🔍 COMPREHENSIVE eBay API TEST")
    print("=" * 60)
    print(f"Store: {client.store_name}")
    print(f"User: {client.user_id}")
    print(f"Environment: {client.environment}")
    print(f"Token: {'✅ Valid' if token else '❌ Missing'}")
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json',
        'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US'
    }
    
    # Test different API families
    apis_to_test = [
        # Browse API (Public listings)
        {
            'name': 'Browse - Search by seller',
            'url': 'https://api.ebay.com/buy/browse/v1/item_summary/search',
            'params': {'q': f'seller:{client.user_id}', 'limit': 5}
        },
        {
            'name': 'Browse - Search store name',
            'url': 'https://api.ebay.com/buy/browse/v1/item_summary/search', 
            'params': {'q': f'"{client.store_name}"', 'limit': 5}
        },
        
        # Sell APIs
        {
            'name': 'Inventory - Get items',
            'url': 'https://api.ebay.com/sell/inventory/v1/inventory_item',
            'params': {'limit': 10}
        },
        {
            'name': 'Inventory - Get offers',
            'url': 'https://api.ebay.com/sell/inventory/v1/offer',
            'params': {'limit': 10}
        },
        {
            'name': 'Fulfillment - Get orders',
            'url': 'https://api.ebay.com/sell/fulfillment/v1/order',
            'params': {'limit': 10}
        },
        
        # Account APIs
        {
            'name': 'Account - Privileges',
            'url': 'https://api.ebay.com/sell/account/v1/privilege',
            'params': {}
        },
        {
            'name': 'Account - Return policies',
            'url': 'https://api.ebay.com/sell/account/v1/return_policy',
            'params': {}
        },
        
        # Commerce APIs
        {
            'name': 'Commerce - Catalog search',
            'url': 'https://api.ebay.com/commerce/catalog/v1_beta/product_summary/search',
            'params': {'q': 'sticker', 'limit': 3}
        },
        
        # Analytics APIs
        {
            'name': 'Analytics - Seller standards',
            'url': 'https://api.ebay.com/sell/analytics/v1/seller_standards_profile',
            'params': {}
        }
    ]
    
    results = {}
    
    for api in apis_to_test:
        print(f"\n📡 Testing: {api['name']}")
        print("-" * 50)
        
        try:
            response = requests.get(api['url'], headers=headers, params=api['params'])
            status = response.status_code
            
            if status == 200:
                result = response.json()
                print(f"✅ SUCCESS ({status})")
                
                # Show key info based on API type
                if 'total' in result:
                    print(f"   📊 Total items: {result['total']}")
                if 'itemSummaries' in result:
                    items = result['itemSummaries'][:3]
                    for item in items:
                        title = item.get('title', 'No title')[:50]
                        seller = item.get('seller', {}).get('username', 'Unknown')
                        print(f"   📦 {title}... (by {seller})")
                if 'inventoryItems' in result:
                    print(f"   📦 Inventory items: {len(result['inventoryItems'])}")
                if 'offers' in result:
                    print(f"   💰 Offers: {len(result['offers'])}")
                if 'orders' in result:
                    print(f"   📋 Orders: {len(result['orders'])}")
                
                results[api['name']] = {'status': status, 'data': result}
                
            elif status == 204:
                print(f"✅ SUCCESS ({status}) - No content (empty but valid)")
                results[api['name']] = {'status': status, 'data': None}
                
            else:
                error_text = response.text[:200]
                print(f"❌ FAILED ({status})")
                print(f"   Error: {error_text}")
                results[api['name']] = {'status': status, 'error': error_text}
                
        except Exception as e:
            print(f"❌ EXCEPTION: {str(e)}")
            results[api['name']] = {'status': 'exception', 'error': str(e)}
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 SUMMARY")
    print("=" * 60)
    
    working_apis = [name for name, result in results.items() if result['status'] in [200, 204]]
    failed_apis = [name for name, result in results.items() if result['status'] not in [200, 204]]
    
    print(f"✅ Working APIs ({len(working_apis)}):")
    for api in working_apis:
        print(f"   - {api}")
    
    print(f"\n❌ Failed APIs ({len(failed_apis)}):")
    for api in failed_apis:
        status = results[api]['status']
        print(f"   - {api} ({status})")
    
    # Check if we found any listings
    browse_results = [r for name, r in results.items() if 'Browse' in name and r['status'] == 200]
    total_found = 0
    for result in browse_results:
        if 'data' in result and 'total' in result['data']:
            total_found += result['data']['total']
    
    print(f"\n🔍 Listings found via Browse API: {total_found}")
    
    return results

if __name__ == "__main__":
    test_all_apis()
