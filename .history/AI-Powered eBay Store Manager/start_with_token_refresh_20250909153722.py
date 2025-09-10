#!/usr/bin/env python3
"""
Start the eBay Store Manager with automatic token refresh
This script starts the token refresh service and then launches the Node.js server
"""

import os
import sys
import time
import subprocess
import signal
import threading
from pathlib import Path

# Add current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from token_refresh_service import start_token_service, get_token_service

class StoreManagerLauncher:
    def __init__(self):
        self.node_process = None
        self.token_service = None
        self.is_running = False
        
    def start_token_service(self):
        """Start the token refresh service"""
        print("🔄 Starting token refresh service...")
        
        try:
            self.token_service = start_token_service(check_interval_minutes=15)
            
            if self.token_service:
                print("✅ Token refresh service started successfully")
                
                # Test the service
                print("🧪 Testing token system...")
                if self.token_service.test_connection():
                    print("✅ Token system test passed")
                else:
                    print("⚠️  Token system test failed, but service is running")
                
                return True
            else:
                print("❌ Failed to start token refresh service")
                return False
                
        except Exception as e:
            print(f"❌ Error starting token service: {e}")
            return False
    
    def start_node_server(self):
        """Start the Node.js server"""
        print("🚀 Starting Node.js server...")
        
        try:
            # Change to backend directory
            backend_dir = Path(__file__).parent / "backend"
            os.chdir(backend_dir)
            
            # Start Node.js server
            self.node_process = subprocess.Popen(
                ["node", "server.js"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            # Wait a moment for server to start
            time.sleep(3)
            
            if self.node_process.poll() is None:
                print("✅ Node.js server started successfully")
                print("📊 Dashboard available at http://localhost:5000")
                return True
            else:
                stdout, stderr = self.node_process.communicate()
                print(f"❌ Node.js server failed to start:")
                print(f"STDOUT: {stdout}")
                print(f"STDERR: {stderr}")
                return False
                
        except Exception as e:
            print(f"❌ Error starting Node.js server: {e}")
            return False
    
    def start_frontend(self):
        """Start the React frontend"""
        print("⚛️  Starting React frontend...")
        
        try:
            # Change to project root
            project_root = Path(__file__).parent
            os.chdir(project_root)
            
            # Start React development server
            frontend_process = subprocess.Popen(
                ["npm", "run", "dev"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            # Wait a moment for server to start
            time.sleep(5)
            
            if frontend_process.poll() is None:
                print("✅ React frontend started successfully")
                print("🌐 Frontend available at http://localhost:3000")
                return frontend_process
            else:
                stdout, stderr = frontend_process.communicate()
                print(f"❌ React frontend failed to start:")
                print(f"STDOUT: {stdout}")
                print(f"STDERR: {stderr}")
                return None
                
        except Exception as e:
            print(f"❌ Error starting React frontend: {e}")
            return None
    
    def monitor_processes(self):
        """Monitor running processes"""
        print("👀 Monitoring processes...")
        
        while self.is_running:
            try:
                # Check Node.js server
                if self.node_process and self.node_process.poll() is not None:
                    print("❌ Node.js server stopped unexpectedly")
                    break
                
                # Check token service
                if self.token_service:
                    status = self.token_service.get_service_status()
                    if not status['service_running']:
                        print("❌ Token service stopped unexpectedly")
                        break
                
                time.sleep(10)  # Check every 10 seconds
                
            except KeyboardInterrupt:
                print("\n🛑 Shutdown requested by user")
                break
            except Exception as e:
                print(f"❌ Error monitoring processes: {e}")
                time.sleep(5)
    
    def cleanup(self):
        """Clean up running processes"""
        print("🧹 Cleaning up processes...")
        
        self.is_running = False
        
        # Stop Node.js server
        if self.node_process:
            try:
                self.node_process.terminate()
                self.node_process.wait(timeout=5)
                print("✅ Node.js server stopped")
            except:
                try:
                    self.node_process.kill()
                    print("⚠️  Node.js server force killed")
                except:
                    pass
        
        # Stop token service
        if self.token_service:
            try:
                self.token_service.stop()
                print("✅ Token service stopped")
            except:
                pass
    
    def run(self):
        """Main run method"""
        print("🚀 Starting eBay Store Manager with Token Refresh")
        print("=" * 60)
        
        # Set up signal handlers for graceful shutdown
        def signal_handler(signum, frame):
            print(f"\n🛑 Received signal {signum}, shutting down...")
            self.cleanup()
            sys.exit(0)
        
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
        
        try:
            # Start token service
            if not self.start_token_service():
                print("❌ Failed to start token service, exiting")
                return False
            
            # Start Node.js server
            if not self.start_node_server():
                print("❌ Failed to start Node.js server, exiting")
                return False
            
            # Start React frontend
            frontend_process = self.start_frontend()
            if not frontend_process:
                print("⚠️  Frontend failed to start, but backend is running")
            
            self.is_running = True
            
            print("\n" + "=" * 60)
            print("✅ eBay Store Manager is running!")
            print("📊 Backend API: http://localhost:5000")
            print("🌐 Frontend: http://localhost:3000")
            print("🔄 Token refresh: Running every 15 minutes")
            print("🛑 Press Ctrl+C to stop")
            print("=" * 60)
            
            # Monitor processes
            self.monitor_processes()
            
        except Exception as e:
            print(f"❌ Error in main run: {e}")
            return False
        finally:
            self.cleanup()
        
        return True

def main():
    """Main entry point"""
    launcher = StoreManagerLauncher()
    success = launcher.run()
    
    if success:
        print("✅ Application stopped gracefully")
    else:
        print("❌ Application stopped with errors")
        sys.exit(1)

if __name__ == "__main__":
    main()
