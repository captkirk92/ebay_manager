#!/usr/bin/env python3
"""
Test additional eBay Trading API data sources
"""

from ebay_api_client import eBayAPIClient
import json

def test_trading_api_data():
    """Test all available Trading API data sources"""
    
    client = eBayAPIClient()
    print("=" * 60)
    print("🔍 Testing eBay Trading API Data Sources")
    print("=" * 60)
    
    # Test 1: My eBay Selling (active and sold listings)
    print("📊 Testing: My eBay Selling")
    print("-" * 50)
    selling_data = client.get_my_ebay_selling()
    if 'error' not in selling_data:
        print("✅ SUCCESS - My eBay Selling data retrieved")
        # Look for available data
        if 'ActiveList' in selling_data:
            active_count = len(selling_data.get('ActiveList', {}).get('ItemArray', {}).get('Item', []))
            print(f"   📈 Active listings: {active_count}")
        if 'SoldList' in selling_data:
            sold_count = len(selling_data.get('SoldList', {}).get('OrderTransactionArray', {}).get('OrderTransaction', []))
            print(f"   💰 Sold items: {sold_count}")
        print(f"   📋 Data keys: {list(selling_data.keys())}")
    else:
        print(f"❌ FAILED: {selling_data['error']}")
    
    print()
    
    # Test 2: Store data
    print("📊 Testing: Get Store")
    print("-" * 50)
    try:
        store_xml = f"""
        <?xml version="1.0" encoding="utf-8"?>
        <GetStoreRequest xmlns="urn:ebay:apis:eBLBaseComponents">
            <RequesterCredentials>
                <eBayAuthToken>{client.access_token}</eBayAuthToken>
            </RequesterCredentials>
        </GetStoreRequest>
        """
        store_data = client._make_trading_request('GetStore', store_xml)
        if 'error' not in store_data:
            print("✅ SUCCESS - Store data retrieved")
            print(f"   📋 Data keys: {list(store_data.keys())}")
        else:
            print(f"❌ FAILED: {store_data['error']}")
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
    
    print()
    
    # Test 3: Seller dashboard
    print("📊 Testing: Get Seller Dashboard")
    print("-" * 50)
    try:
        dashboard_xml = f"""
        <?xml version="1.0" encoding="utf-8"?>
        <GetSellerDashboardRequest xmlns="urn:ebay:apis:eBLBaseComponents">
            <RequesterCredentials>
                <eBayAuthToken>{client.access_token}</eBayAuthToken>
            </RequesterCredentials>
        </GetSellerDashboardRequest>
        """
        dashboard_data = client._make_trading_request('GetSellerDashboard', dashboard_xml)
        if 'error' not in dashboard_data:
            print("✅ SUCCESS - Seller dashboard data retrieved")
            print(f"   📋 Data keys: {list(dashboard_data.keys())}")
        else:
            print(f"❌ FAILED: {dashboard_data['error']}")
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
    
    print()
    
    # Test 4: Account info
    print("📊 Testing: Get Account")
    print("-" * 50)
    try:
        account_xml = f"""
        <?xml version="1.0" encoding="utf-8"?>
        <GetAccountRequest xmlns="urn:ebay:apis:eBLBaseComponents">
            <RequesterCredentials>
                <eBayAuthToken>{client.access_token}</eBayAuthToken>
            </RequesterCredentials>
            <AccountHistorySelection>LastInvoice</AccountHistorySelection>
        </GetAccountRequest>
        """
        account_data = client._make_trading_request('GetAccount', account_xml)
        if 'error' not in account_data:
            print("✅ SUCCESS - Account data retrieved")
            print(f"   📋 Data keys: {list(account_data.keys())}")
        else:
            print(f"❌ FAILED: {account_data['error']}")
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
    
    print()
    
    # Test 5: Categories
    print("📊 Testing: Get Categories")
    print("-" * 50)
    try:
        categories_xml = f"""
        <?xml version="1.0" encoding="utf-8"?>
        <GetCategoriesRequest xmlns="urn:ebay:apis:eBLBaseComponents">
            <RequesterCredentials>
                <eBayAuthToken>{client.access_token}</eBayAuthToken>
            </RequesterCredentials>
            <CategorySiteID>0</CategorySiteID>
            <DetailLevel>ReturnAll</DetailLevel>
        </GetCategoriesRequest>
        """
        categories_data = client._make_trading_request('GetCategories', categories_xml)
        if 'error' not in categories_data:
            print("✅ SUCCESS - Categories data retrieved")
            print(f"   📋 Data keys: {list(categories_data.keys())}")
        else:
            print(f"❌ FAILED: {categories_data['error']}")
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
    
    print()
    
    # Test 6: User info
    print("📊 Testing: Get User")
    print("-" * 50)
    try:
        user_xml = f"""
        <?xml version="1.0" encoding="utf-8"?>
        <GetUserRequest xmlns="urn:ebay:apis:eBLBaseComponents">
            <RequesterCredentials>
                <eBayAuthToken>{client.access_token}</eBayAuthToken>
            </RequesterCredentials>
        </GetUserRequest>
        """
        user_data = client._make_trading_request('GetUser', user_xml)
        if 'error' not in user_data:
            print("✅ SUCCESS - User data retrieved")
            print(f"   📋 Data keys: {list(user_data.keys())}")
        else:
            print(f"❌ FAILED: {user_data['error']}")
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")

if __name__ == "__main__":
    test_trading_api_data()
