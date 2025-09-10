"""
eBay Token Manager
Handles automatic token refresh and expiration management
"""

import os
import json
import time
from datetime import datetime, timedelta
from typing import Dict, Optional
import requests
import base64
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class eBayTokenManager:
    """Manages eBay OAuth tokens with automatic refresh"""
    
    def __init__(self):
        self.app_id = os.getenv('EBAY_APP_ID')
        self.cert_id = os.getenv('EBAY_CERT_ID')
        self.ru_name = os.getenv('EBAY_RUNAME')
        self.environment = os.getenv('EBAY_ENVIRONMENT', 'production')
        
        # Token URLs
        self.token_urls = {
            'sandbox': 'https://api.sandbox.ebay.com/identity/v1/oauth2/token',
            'production': 'https://api.ebay.com/identity/v1/oauth2/token'
        }
        
        self.token_url = self.token_urls[self.environment]
        
        # Load current tokens
        self.access_token = os.getenv('EBAY_ACCESS_TOKEN')
        self.refresh_token = os.getenv('EBAY_REFRESH_TOKEN')
        self.token_expires_at = None
        
        # Load token expiration from file if available
        self._load_token_expiration()
    
    def _load_token_expiration(self):
        """Load token expiration time from file"""
        try:
            with open('.token_info', 'r') as f:
                token_info = json.load(f)
                self.token_expires_at = datetime.fromisoformat(token_info.get('expires_at', ''))
        except (FileNotFoundError, ValueError, KeyError):
            # If no expiration info, assume token expires in 2 hours (eBay default)
            self.token_expires_at = datetime.now() + timedelta(hours=2)
    
    def _save_token_expiration(self, expires_in_seconds: int):
        """Save token expiration time to file"""
        self.token_expires_at = datetime.now() + timedelta(seconds=expires_in_seconds)
        
        token_info = {
            'expires_at': self.token_expires_at.isoformat(),
            'last_refresh': datetime.now().isoformat()
        }
        
        with open('.token_info', 'w') as f:
            json.dump(token_info, f)
    
    def _get_basic_auth(self):
        """Get basic auth string for OAuth requests"""
        credentials = f"{self.app_id}:{self.cert_id}"
        return base64.b64encode(credentials.encode()).decode()
    
    def refresh_access_token(self) -> bool:
        """Refresh the access token using refresh token"""
        if not self.refresh_token:
            print("❌ No refresh token available")
            return False
        
        print("🔄 Refreshing access token...")
        
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': f'Basic {self._get_basic_auth()}'
        }
        
        data = {
            'grant_type': 'refresh_token',
            'refresh_token': self.refresh_token,
            'scope': 'https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.inventory'
        }
        
        try:
            response = requests.post(self.token_url, headers=headers, data=data, timeout=30)
            
            if response.status_code == 200:
                token_data = response.json()
                
                # Update tokens
                self.access_token = token_data['access_token']
                self.refresh_token = token_data.get('refresh_token', self.refresh_token)
                
                # Save expiration time
                expires_in = token_data.get('expires_in', 7200)  # Default 2 hours
                self._save_token_expiration(expires_in)
                
                # Update environment variables
                os.environ['EBAY_ACCESS_TOKEN'] = self.access_token
                if 'refresh_token' in token_data:
                    os.environ['EBAY_REFRESH_TOKEN'] = self.refresh_token
                
                # Update .env file
                self._update_env_file()
                
                print(f"✅ Token refreshed successfully!")
                print(f"   Expires: {self.token_expires_at.strftime('%Y-%m-%d %H:%M:%S')}")
                print(f"   Time until expiry: {self._get_time_until_expiry()}")
                
                return True
            else:
                print(f"❌ Token refresh failed: {response.status_code}")
                print(f"   Error: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Token refresh error: {e}")
            return False
    
    def _update_env_file(self):
        """Update .env file with new tokens"""
        try:
            # Read existing .env file
            env_content = []
            try:
                with open('.env', 'r') as f:
                    env_content = f.readlines()
            except FileNotFoundError:
                pass
            
            # Update token lines
            token_lines = {
                'EBAY_ACCESS_TOKEN': self.access_token,
                'EBAY_REFRESH_TOKEN': self.refresh_token
            }
            
            # Remove existing token lines
            env_content = [line for line in env_content if not line.startswith(('EBAY_ACCESS_TOKEN=', 'EBAY_REFRESH_TOKEN='))]
            
            # Add new token lines
            for key, value in token_lines.items():
                env_content.append(f"{key}={value}\n")
            
            # Write back to file
            with open('.env', 'w') as f:
                f.writelines(env_content)
                
        except Exception as e:
            print(f"⚠️  Warning: Could not update .env file: {e}")
    
    def _get_time_until_expiry(self) -> str:
        """Get time until token expires"""
        if not self.token_expires_at:
            return "Unknown"
        
        time_diff = self.token_expires_at - datetime.now()
        
        if time_diff.total_seconds() <= 0:
            return "EXPIRED"
        
        hours = int(time_diff.total_seconds() // 3600)
        minutes = int((time_diff.total_seconds() % 3600) // 60)
        
        return f"{hours}h {minutes}m"
    
    def is_token_expired(self) -> bool:
        """Check if token is expired or will expire soon"""
        if not self.token_expires_at:
            return True
        
        # Refresh if expires within 5 minutes
        time_until_expiry = self.token_expires_at - datetime.now()
        return time_until_expiry.total_seconds() <= 300  # 5 minutes
    
    def ensure_valid_token(self) -> bool:
        """Ensure we have a valid, non-expired token"""
        if not self.access_token:
            print("❌ No access token available")
            return False
        
        if self.is_token_expired():
            print("⚠️  Token expired or expiring soon, refreshing...")
            return self.refresh_access_token()
        
        return True
    
    def get_valid_token(self) -> Optional[str]:
        """Get a valid access token, refreshing if necessary"""
        if self.ensure_valid_token():
            return self.access_token
        return None
    
    def get_token_status(self) -> Dict:
        """Get current token status information"""
        status = {
            'has_access_token': bool(self.access_token),
            'has_refresh_token': bool(self.refresh_token),
            'expires_at': self.token_expires_at.isoformat() if self.token_expires_at else None,
            'time_until_expiry': self._get_time_until_expiry(),
            'is_expired': self.is_token_expired(),
            'environment': self.environment
        }
        return status
    
    def setup_auto_refresh(self, check_interval_minutes: int = 30):
        """Set up automatic token refresh (for background processes)"""
        import threading
        
        def auto_refresh_worker():
            while True:
                try:
                    if self.is_token_expired():
                        print(f"🔄 Auto-refreshing token at {datetime.now().strftime('%H:%M:%S')}")
                        self.refresh_access_token()
                    time.sleep(check_interval_minutes * 60)
                except Exception as e:
                    print(f"❌ Auto-refresh error: {e}")
                    time.sleep(60)  # Wait 1 minute before retrying
        
        # Start background thread
        refresh_thread = threading.Thread(target=auto_refresh_worker, daemon=True)
        refresh_thread.start()
        print(f"✅ Auto-refresh started (checking every {check_interval_minutes} minutes)")

def test_token_manager():
    """Test the token manager"""
    print("🔧 TESTING TOKEN MANAGER")
    print("=" * 50)
    
    manager = eBayTokenManager()
    
    # Show current status
    status = manager.get_token_status()
    print("Current Token Status:")
    for key, value in status.items():
        print(f"  {key}: {value}")
    
    print()
    
    # Test token refresh
    if manager.refresh_access_token():
        print("✅ Token refresh successful!")
        
        # Show new status
        status = manager.get_token_status()
        print("\nNew Token Status:")
        for key, value in status.items():
            print(f"  {key}: {value}")
    else:
        print("❌ Token refresh failed!")

if __name__ == "__main__":
    test_token_manager()
