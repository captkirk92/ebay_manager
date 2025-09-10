"""
eBay Token Refresh Service
Background service to automatically refresh tokens and prevent expiration
"""

import os
import time
import threading
import schedule
from datetime import datetime, timedelta
from token_manager import eBayTokenManager
import logging

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('token_refresh.log'),
        logging.StreamHandler()
    ]
)

class TokenRefreshService:
    """Background service for automatic token refresh"""
    
    def __init__(self, check_interval_minutes: int = 15):
        self.token_manager = eBayTokenManager()
        self.check_interval = check_interval_minutes
        self.is_running = False
        self.refresh_thread = None
        self.last_refresh = None
        self.refresh_count = 0
        
        logging.info(f"Token Refresh Service initialized (checking every {check_interval_minutes} minutes)")
    
    def start(self):
        """Start the background refresh service"""
        if self.is_running:
            logging.warning("Token refresh service is already running")
            return
        
        self.is_running = True
        self.refresh_thread = threading.Thread(target=self._refresh_loop, daemon=True)
        self.refresh_thread.start()
        
        logging.info("✅ Token refresh service started")
        
        # Also set up scheduled refresh as backup
        schedule.every(self.check_interval).minutes.do(self._scheduled_refresh)
        
        # Start scheduler in separate thread
        scheduler_thread = threading.Thread(target=self._scheduler_loop, daemon=True)
        scheduler_thread.start()
    
    def stop(self):
        """Stop the background refresh service"""
        self.is_running = False
        if self.refresh_thread:
            self.refresh_thread.join(timeout=5)
        logging.info("🛑 Token refresh service stopped")
    
    def _refresh_loop(self):
        """Main refresh loop"""
        while self.is_running:
            try:
                self._check_and_refresh()
                time.sleep(self.check_interval * 60)  # Convert minutes to seconds
            except Exception as e:
                logging.error(f"Error in refresh loop: {e}")
                time.sleep(60)  # Wait 1 minute before retrying
    
    def _scheduler_loop(self):
        """Scheduler loop for backup refresh"""
        while self.is_running:
            try:
                schedule.run_pending()
                time.sleep(30)  # Check every 30 seconds
            except Exception as e:
                logging.error(f"Error in scheduler loop: {e}")
                time.sleep(60)
    
    def _scheduled_refresh(self):
        """Scheduled refresh as backup"""
        try:
            self._check_and_refresh()
        except Exception as e:
            logging.error(f"Error in scheduled refresh: {e}")
    
    def _check_and_refresh(self):
        """Check token status and refresh if needed"""
        try:
            status = self.token_manager.get_token_status()
            
            # Log current status
            logging.info(f"Token status: {status['time_until_expiry']} until expiry, expired: {status['is_expired']}")
            
            # Check if token needs refresh
            if status['is_expired'] or not status['has_access_token']:
                logging.warning("Token expired or missing, attempting refresh...")
                
                if self.token_manager.refresh_access_token():
                    self.last_refresh = datetime.now()
                    self.refresh_count += 1
                    logging.info(f"✅ Token refreshed successfully (refresh #{self.refresh_count})")
                    
                    # Log new status
                    new_status = self.token_manager.get_token_status()
                    logging.info(f"New token status: {new_status['time_until_expiry']} until expiry")
                else:
                    logging.error("❌ Token refresh failed!")
            else:
                # Token is still valid, log time until expiry
                time_until_expiry = status['time_until_expiry']
                if time_until_expiry != "Unknown":
                    logging.info(f"Token still valid: {time_until_expiry} until expiry")
                
        except Exception as e:
            logging.error(f"Error checking token status: {e}")
    
    def force_refresh(self):
        """Force an immediate token refresh"""
        logging.info("🔄 Forcing immediate token refresh...")
        
        if self.token_manager.refresh_access_token():
            self.last_refresh = datetime.now()
            self.refresh_count += 1
            logging.info(f"✅ Forced refresh successful (refresh #{self.refresh_count})")
            return True
        else:
            logging.error("❌ Forced refresh failed!")
            return False
    
    def get_service_status(self):
        """Get current service status"""
        token_status = self.token_manager.get_token_status()
        
        return {
            'service_running': self.is_running,
            'check_interval_minutes': self.check_interval,
            'last_refresh': self.last_refresh.isoformat() if self.last_refresh else None,
            'refresh_count': self.refresh_count,
            'token_status': token_status
        }
    
    def test_connection(self):
        """Test the connection with current token"""
        try:
            # Try a simple API call to test the token
            client = eBayAPIClient()
            result = client.get_account_info_rest()
            
            if 'error' in result:
                logging.error(f"Token test failed: {result['error']}")
                return False
            else:
                logging.info("✅ Token test successful - API connection working")
                return True
                
        except Exception as e:
            logging.error(f"Token test error: {e}")
            return False

# Global service instance
_token_service = None

def start_token_service(check_interval_minutes: int = 15):
    """Start the global token refresh service"""
    global _token_service
    
    if _token_service and _token_service.is_running:
        logging.warning("Token service is already running")
        return _token_service
    
    _token_service = TokenRefreshService(check_interval_minutes)
    _token_service.start()
    
    return _token_service

def stop_token_service():
    """Stop the global token refresh service"""
    global _token_service
    
    if _token_service:
        _token_service.stop()
        _token_service = None

def get_token_service():
    """Get the current token service instance"""
    return _token_service

def test_token_system():
    """Test the entire token system"""
    print("🔧 TESTING TOKEN REFRESH SYSTEM")
    print("=" * 50)
    
    # Test token manager
    manager = eBayTokenManager()
    status = manager.get_token_status()
    
    print("Current Token Status:")
    for key, value in status.items():
        print(f"  {key}: {value}")
    
    print("\nTesting token refresh...")
    if manager.refresh_access_token():
        print("✅ Token refresh successful!")
        
        # Test service
        print("\nStarting token refresh service...")
        service = start_token_service(check_interval_minutes=1)  # Check every minute for testing
        
        # Wait a bit and check status
        time.sleep(5)
        service_status = service.get_service_status()
        
        print("\nService Status:")
        for key, value in service_status.items():
            if key != 'token_status':
                print(f"  {key}: {value}")
        
        print("\nTesting API connection...")
        if service.test_connection():
            print("✅ API connection test successful!")
        else:
            print("❌ API connection test failed!")
        
        # Stop service
        print("\nStopping service...")
        service.stop()
        
    else:
        print("❌ Token refresh failed!")

if __name__ == "__main__":
    test_token_system()
