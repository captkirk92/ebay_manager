#!/usr/bin/env python3
"""
eBay Orders Service - Following Integration Playbook Rules
Dedicated service for fetching eBay orders using Fulfillment API
"""

import os
import requests
from datetime import datetime
from typing import List, Dict, Any, Optional
from ebay_api_client import eBayAPIClient

class eBayOrdersService:
    """
    Modular eBay Orders Service
    Following playbook rules:
    - Uses OAuth2 tokens correctly
    - Makes backend calls with latest token
    - Returns parsed JSON, not raw responses
    """
    
    def __init__(self):
        self.client = eBayAPIClient()
    
    def get_orders(self, limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
        """
        Get orders using eBay Fulfillment API
        As specified in playbook: Orders → /sell/fulfillment/v1/order
        """
        try:
            # Use the REST API method following playbook guidelines
            response = self.client.get_orders_rest(limit=limit, offset=offset)
            
            if 'error' in response:
                return []
            
            # Extract orders array from response
            orders = response.get('orders', [])
            
            # Transform orders to dashboard-friendly format
            formatted_orders = []
            for order in orders:
                formatted_order = self._transform_order(order)
                formatted_orders.append(formatted_order)
                
            return formatted_orders
            
        except Exception as e:
            print(f"Error fetching orders: {e}")
            return []
    
    def _transform_order(self, order: Dict[str, Any]) -> Dict[str, Any]:
        """
        Transform eBay order to dashboard-friendly format
        Following playbook rules for clean API responses
        """
        return {
            'orderId': order.get('orderId', ''),
            'orderStatus': order.get('orderStatus', 'Unknown'),
            'createdDate': order.get('createdDate', ''),
            'buyer': {
                'username': order.get('buyer', {}).get('username', 'Unknown'),
                'email': order.get('buyer', {}).get('email', ''),
            },
            'pricingSummary': {
                'total': {
                    'value': order.get('pricingSummary', {}).get('total', {}).get('value', '0.00'),
                    'currency': order.get('pricingSummary', {}).get('total', {}).get('currency', 'USD')
                }
            },
            'fulfillmentInstructions': order.get('fulfillmentInstructions', {}),
            'lineItems': self._transform_line_items(order.get('lineItems', []))
        }
    
    def _transform_line_items(self, line_items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Transform order line items for dashboard display"""
        transformed_items = []
        
        for item in line_items:
            transformed_items.append({
                'lineItemId': item.get('lineItemId', ''),
                'legacyItemId': item.get('legacyItemId', ''),
                'title': item.get('title', 'Unknown Item'),
                'quantity': item.get('quantity', 1),
                'price': {
                    'value': item.get('total', {}).get('value', '0.00'),
                    'currency': item.get('total', {}).get('currency', 'USD')
                }
            })
            
        return transformed_items

def get_orders_for_api(limit: int = 50, offset: int = 0) -> Dict[str, Any]:
    """
    Main function for backend API to call
    Following playbook rules for backend integration
    """
    service = eBayOrdersService()
    orders = service.get_orders(limit=limit, offset=offset)
    
    return {
        "success": True,
        "data": {
            "orders": orders,
            "total": len(orders),
            "timestamp": datetime.now().isoformat()
        }
    }

# For direct testing
if __name__ == "__main__":
    result = get_orders_for_api()
    import json
    print(json.dumps(result, indent=2))