#!/usr/bin/env python3
"""
Enhanced eBay Data Pipeline - Comprehensive Data Collection
Pulls all available data from eBay APIs for dashboard enhancement
"""

from ebay_api_client import eBayAPIClient
import json
from datetime import datetime, timedelta
import time

class EnhancedEbayDataPipeline:
    def __init__(self):
        self.client = eBayAPIClient()
        
    def collect_comprehensive_data(self):
        """Collect all available eBay data for enhanced dashboard"""
        
        print("🚀 Starting comprehensive eBay data collection...")
        print("=" * 60)
        
        comprehensive_data = {
            'timestamp': datetime.now().isoformat(),
            'store_info': {},
            'account_info': {},
            'user_profile': {},
            'listings': {
                'active': [],
                'sold': [],
                'unsold': []
            },
            'financial': {
                'account_summary': {},
                'recent_transactions': []
            },
            'categories': {},
            'analytics': {
                'performance_metrics': {},
                'seller_dashboard': {}
            },
            'summary_stats': {}
        }
        
        # 1. Store Information
        print("📊 Collecting store information...")
        try:
            store_xml = f"""
            <?xml version="1.0" encoding="utf-8"?>
            <GetStoreRequest xmlns="urn:ebay:apis:eBLBaseComponents">
                <RequesterCredentials>
                    <eBayAuthToken>{self.client.access_token}</eBayAuthToken>
                </RequesterCredentials>
            </GetStoreRequest>
            """
            store_data = self.client._make_trading_request('GetStore', store_xml)
            if 'error' not in store_data and '{urn:ebay:apis:eBLBaseComponents}Store' in store_data:
                store = store_data['{urn:ebay:apis:eBLBaseComponents}Store']
                comprehensive_data['store_info'] = {
                    'name': store.get('Name', 'Unknown'),
                    'description': store.get('Description', ''),
                    'url': store.get('URL', ''),
                    'subscription_level': store.get('SubscriptionLevel', ''),
                    'creation_time': store.get('LastOpenedTime', ''),
                    'hits': store.get('Hits', 0)
                }
                print(f"   ✅ Store: {comprehensive_data['store_info']['name']}")
            else:
                print("   ⚠️  Store data not available")
        except Exception as e:
            print(f"   ❌ Store error: {e}")
        
        # 2. User Profile Information
        print("👤 Collecting user profile...")
        try:
            user_xml = f"""
            <?xml version="1.0" encoding="utf-8"?>
            <GetUserRequest xmlns="urn:ebay:apis:eBLBaseComponents">
                <RequesterCredentials>
                    <eBayAuthToken>{self.client.access_token}</eBayAuthToken>
                </RequesterCredentials>
            </GetUserRequest>
            """
            user_data = self.client._make_trading_request('GetUser', user_xml)
            if 'error' not in user_data and '{urn:ebay:apis:eBLBaseComponents}User' in user_data:
                user = user_data['{urn:ebay:apis:eBLBaseComponents}User']
                comprehensive_data['user_profile'] = {
                    'user_id': user.get('UserID', ''),
                    'feedback_score': user.get('FeedbackScore', 0),
                    'positive_feedback_percent': user.get('PositiveFeedbackPercent', 0),
                    'feedback_private': user.get('FeedbackPrivate', False),
                    'registration_date': user.get('RegistrationDate', ''),
                    'site': user.get('Site', ''),
                    'status': user.get('Status', ''),
                    'seller_info': user.get('SellerInfo', {})
                }
                print(f"   ✅ User: {comprehensive_data['user_profile']['user_id']}")
                print(f"   📈 Feedback: {comprehensive_data['user_profile']['feedback_score']} ({comprehensive_data['user_profile']['positive_feedback_percent']}%)")
            else:
                print("   ⚠️  User profile not available")
        except Exception as e:
            print(f"   ❌ User profile error: {e}")
        
        # 3. Account & Financial Information
        print("💰 Collecting account information...")
        try:
            account_xml = f"""
            <?xml version="1.0" encoding="utf-8"?>
            <GetAccountRequest xmlns="urn:ebay:apis:eBLBaseComponents">
                <RequesterCredentials>
                    <eBayAuthToken>{self.client.access_token}</eBayAuthToken>
                </RequesterCredentials>
                <AccountHistorySelection>LastInvoice</AccountHistorySelection>
            </GetAccountRequest>
            """
            account_data = self.client._make_trading_request('GetAccount', account_xml)
            if 'error' not in account_data:
                # Account Summary
                if '{urn:ebay:apis:eBLBaseComponents}AccountSummary' in account_data:
                    summary = account_data['{urn:ebay:apis:eBLBaseComponents}AccountSummary']
                    comprehensive_data['financial']['account_summary'] = {
                        'current_balance': summary.get('CurrentBalance', {}).get('text', '0'),
                        'currency': summary.get('Currency', 'USD'),
                        'last_invoice_date': summary.get('LastInvoiceDate', ''),
                        'account_state': summary.get('AccountState', '')
                    }
                
                # Account Entries (Recent Transactions)
                if '{urn:ebay:apis:eBLBaseComponents}AccountEntries' in account_data:
                    entries = account_data['{urn:ebay:apis:eBLBaseComponents}AccountEntries']
                    if isinstance(entries.get('AccountEntry'), list):
                        comprehensive_data['financial']['recent_transactions'] = [
                            {
                                'date': entry.get('Date', ''),
                                'description': entry.get('Description', ''),
                                'gross_detail_amount': entry.get('GrossDetailAmount', {}).get('text', '0'),
                                'account_details_entry_type': entry.get('AccountDetailsEntryType', ''),
                                'item_id': entry.get('ItemID', '')
                            }
                            for entry in entries['AccountEntry'][:10]  # Last 10 transactions
                        ]
                    
                print(f"   ✅ Balance: ${comprehensive_data['financial']['account_summary'].get('current_balance', '0')}")
                print(f"   📋 Transactions: {len(comprehensive_data['financial']['recent_transactions'])}")
            else:
                print("   ⚠️  Account data not available")
        except Exception as e:
            print(f"   ❌ Account error: {e}")
        
        # 4. Listing Data (Active, Sold, Unsold)
        print("📦 Collecting listing data...")
        try:
            selling_data = self.client.get_my_ebay_selling()
            if 'error' not in selling_data:
                # Active Listings
                if '{urn:ebay:apis:eBLBaseComponents}ActiveList' in selling_data:
                    active_list = selling_data['{urn:ebay:apis:eBLBaseComponents}ActiveList']
                    if 'ItemArray' in active_list and 'Item' in active_list['ItemArray']:
                        items = active_list['ItemArray']['Item']
                        if not isinstance(items, list):
                            items = [items]
                        
                        for item in items:
                            comprehensive_data['listings']['active'].append({
                                'item_id': item.get('ItemID', ''),
                                'title': item.get('Title', ''),
                                'current_price': item.get('SellingStatus', {}).get('CurrentPrice', {}).get('text', '0'),
                                'quantity': item.get('Quantity', 0),
                                'watchers': item.get('WatchCount', 0),
                                'time_left': item.get('TimeLeft', ''),
                                'listing_type': item.get('ListingType', ''),
                                'category_id': item.get('PrimaryCategory', {}).get('CategoryID', ''),
                                'start_time': item.get('ListingDetails', {}).get('StartTime', ''),
                                'end_time': item.get('ListingDetails', {}).get('EndTime', '')
                            })
                
                # Sold Listings
                if '{urn:ebay:apis:eBLBaseComponents}SoldList' in selling_data:
                    sold_list = selling_data['{urn:ebay:apis:eBLBaseComponents}SoldList']
                    if 'OrderTransactionArray' in sold_list and 'OrderTransaction' in sold_list['OrderTransactionArray']:
                        transactions = sold_list['OrderTransactionArray']['OrderTransaction']
                        if not isinstance(transactions, list):
                            transactions = [transactions]
                        
                        for transaction in transactions:
                            item = transaction.get('Transaction', {}).get('Item', {})
                            comprehensive_data['listings']['sold'].append({
                                'item_id': item.get('ItemID', ''),
                                'title': item.get('Title', ''),
                                'final_price': transaction.get('Transaction', {}).get('TransactionPrice', {}).get('text', '0'),
                                'quantity_sold': transaction.get('Transaction', {}).get('QuantityPurchased', 0),
                                'buyer_user_id': transaction.get('Transaction', {}).get('Buyer', {}).get('UserID', ''),
                                'end_time': item.get('EndTime', ''),
                                'category_id': item.get('PrimaryCategory', {}).get('CategoryID', '')
                            })
                
                # Unsold Listings
                if '{urn:ebay:apis:eBLBaseComponents}UnsoldList' in selling_data:
                    unsold_list = selling_data['{urn:ebay:apis:eBLBaseComponents}UnsoldList']
                    if 'ItemArray' in unsold_list and 'Item' in unsold_list['ItemArray']:
                        items = unsold_list['ItemArray']['Item']
                        if not isinstance(items, list):
                            items = [items]
                        
                        for item in items:
                            comprehensive_data['listings']['unsold'].append({
                                'item_id': item.get('ItemID', ''),
                                'title': item.get('Title', ''),
                                'start_price': item.get('StartPrice', {}).get('text', '0'),
                                'quantity': item.get('Quantity', 0),
                                'end_time': item.get('EndTime', ''),
                                'category_id': item.get('PrimaryCategory', {}).get('CategoryID', '')
                            })
                
                print(f"   ✅ Active: {len(comprehensive_data['listings']['active'])}")
                print(f"   ✅ Sold: {len(comprehensive_data['listings']['sold'])}")
                print(f"   ✅ Unsold: {len(comprehensive_data['listings']['unsold'])}")
            else:
                print("   ⚠️  Listing data not available")
        except Exception as e:
            print(f"   ❌ Listing error: {e}")
        
        # 5. Calculate Summary Statistics
        print("📊 Calculating summary statistics...")
        try:
            active_count = len(comprehensive_data['listings']['active'])
            sold_count = len(comprehensive_data['listings']['sold'])
            unsold_count = len(comprehensive_data['listings']['unsold'])
            
            # Calculate total revenue from sold items
            total_revenue = 0
            for item in comprehensive_data['listings']['sold']:
                try:
                    price = float(item['final_price'])
                    quantity = int(item['quantity_sold'])
                    total_revenue += price * quantity
                except:
                    pass
            
            # Calculate average sale price
            avg_sale_price = total_revenue / sold_count if sold_count > 0 else 0
            
            # Calculate success rate
            total_listings = active_count + sold_count + unsold_count
            success_rate = (sold_count / total_listings * 100) if total_listings > 0 else 0
            
            comprehensive_data['summary_stats'] = {
                'total_active_listings': active_count,
                'total_sold_items': sold_count,
                'total_unsold_items': unsold_count,
                'total_revenue': total_revenue,
                'average_sale_price': avg_sale_price,
                'success_rate': success_rate,
                'conversion_rate': success_rate,  # Same as success rate for now
                'feedback_score': comprehensive_data['user_profile'].get('feedback_score', 0),
                'positive_feedback_percent': comprehensive_data['user_profile'].get('positive_feedback_percent', 0)
            }
            
            print(f"   ✅ Total Revenue: ${total_revenue:.2f}")
            print(f"   ✅ Success Rate: {success_rate:.1f}%")
            print(f"   ✅ Avg Sale Price: ${avg_sale_price:.2f}")
            
        except Exception as e:
            print(f"   ❌ Stats calculation error: {e}")
        
        print("=" * 60)
        print("✅ Comprehensive data collection completed!")
        
        return comprehensive_data
    
    def save_enhanced_data(self, data, filename='src/data/enhanced_store_data.json'):
        """Save comprehensive data to JSON file"""
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"💾 Enhanced data saved to {filename}")
            return True
        except Exception as e:
            print(f"❌ Failed to save enhanced data: {e}")
            return False

if __name__ == "__main__":
    pipeline = EnhancedEbayDataPipeline()
    
    # Collect comprehensive data
    enhanced_data = pipeline.collect_comprehensive_data()
    
    # Save to file
    pipeline.save_enhanced_data(enhanced_data)
    
    # Print summary
    print("\n📈 ENHANCED DATA SUMMARY")
    print("=" * 40)
    print(f"Store: {enhanced_data['store_info'].get('name', 'Unknown')}")
    print(f"User: {enhanced_data['user_profile'].get('user_id', 'Unknown')}")
    print(f"Active Listings: {enhanced_data['summary_stats'].get('total_active_listings', 0)}")
    print(f"Sold Items: {enhanced_data['summary_stats'].get('total_sold_items', 0)}")
    print(f"Total Revenue: ${enhanced_data['summary_stats'].get('total_revenue', 0):.2f}")
    print(f"Success Rate: {enhanced_data['summary_stats'].get('success_rate', 0):.1f}%")
    print(f"Feedback Score: {enhanced_data['summary_stats'].get('feedback_score', 0)}")
