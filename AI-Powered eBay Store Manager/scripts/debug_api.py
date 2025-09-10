#!/usr/bin/env python3
"""
Debug API responses to understand data structure
"""

import sys
import json
from ebay_api_wrapper import get_store_summary

def main():
    print("🔍 Testing API response structure...")
    
    try:
        summary = get_store_summary()
        
        print(f"Summary type: {type(summary)}")
        print(f"Summary content: {summary}")
        
        if isinstance(summary, dict):
            print("✅ Summary is already a dictionary")
            for key, value in summary.items():
                print(f"  {key}: {type(value)} = {value}")
        elif isinstance(summary, str):
            print("⚠️  Summary is a string, attempting to parse as JSON")
            try:
                parsed = json.loads(summary)
                print(f"Parsed type: {type(parsed)}")
                print(f"Parsed content: {parsed}")
            except json.JSONDecodeError as e:
                print(f"❌ Failed to parse as JSON: {e}")
                print(f"Raw string: {repr(summary)}")
        else:
            print(f"❌ Unexpected summary type: {type(summary)}")
            
    except Exception as e:
        print(f"❌ Error getting summary: {e}")
        return False
        
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
