#!/usr/bin/env python3
"""
Initialize and test eBay API connection and data loading
"""

import sys
from ebay_api_client import eBayAPIClient
from store_data_pipeline import StoreDataPipeline
from token_manager import eBayTokenManager

def main():
    print("🔄 Initializing eBay Store Manager...")
    
    # Initialize token manager and get valid token
    token_manager = eBayTokenManager()
    token = token_manager.get_valid_token()
    
    if not token:
        print("❌ Failed to obtain valid OAuth token")
        return False
        
    print("✅ OAuth token obtained successfully")
    
    # Initialize API client
    client = eBayAPIClient()
    
    # Test API connection
    try:
        # Get active listings to verify connection
        listings = client.get_active_listings()
        if listings:
            print(f"✅ Connected to eBay Store: {client.store_name}")
        else:
            print("⚠️ Connected but no active listings found")
    except Exception as e:
        print(f"❌ Failed to connect to eBay store: {e}")
        return False
        
    # Initialize data pipeline
    pipeline = StoreDataPipeline()
    
    # Collect initial data
    print("\n🔄 Starting data collection...")
    if pipeline.collect_raw_data():
        print("✅ Initial data collection successful")
        
        # Save structured data for frontend
        try:
            pipeline.process_and_save()
            print("✅ Data processed and saved successfully")
            return True
        except Exception as e:
            print(f"❌ Failed to process and save data: {e}")
            return False
    else:
        print("❌ Failed to collect data from eBay API")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
