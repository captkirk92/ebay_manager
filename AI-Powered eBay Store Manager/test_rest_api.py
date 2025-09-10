#!/usr/bin/env python3
"""
Test script for eBay REST API methods
"""

from ebay_api_client import eBayAPIClient
import json

def test_rest_apis():
    """Test the REST API methods"""
    print("🔧 Testing eBay REST API methods...")
    
    client = eBayAPIClient()
    
    print(f"🏪 Store: {client.store_name}")
    print(f"👤 User: {client.user_id}")
    print(f"🌍 Environment: {client.environment}")
    print(f"🔑 Token available: {'Yes' if client.access_token else 'No'}")
    
    # Test Account API
    print("\n📊 Testing Account API...")
    account_result = client.get_account_info_rest()
    print(f"Account API Response: {json.dumps(account_result, indent=2)}")
    
    # Test Fulfillment API (Orders)
    print("\n📦 Testing Fulfillment API (Orders)...")
    orders_result = client.get_orders_rest(limit=10)
    print(f"Orders API Response: {json.dumps(orders_result, indent=2)}")
    
    # Test Inventory API
    print("\n📋 Testing Inventory API...")
    inventory_result = client.get_inventory_rest(limit=10)
    print(f"Inventory API Response: {json.dumps(inventory_result, indent=2)}")

if __name__ == "__main__":
    test_rest_apis()
