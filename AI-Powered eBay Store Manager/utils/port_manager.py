import socket
import psutil
import os
import logging
from typing import Optional, Tuple

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def is_port_in_use(port: int) -> Tuple[bool, Optional[int]]:
    """Check if a port is in use and return the process ID if found"""
    try:
        # Try to create a socket with the port
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        result = sock.connect_ex(('127.0.0.1', port))
        sock.close()
        
        if result == 0:  # Port is in use
            # Try to find the process using this port
            for proc in psutil.process_iter(['pid', 'name']):
                try:
                    connections = psutil.Process(proc.info['pid']).connections()
                    for conn in connections:
                        if hasattr(conn, 'laddr') and conn.laddr.port == port:
                            return True, proc.info['pid']
                except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                    continue
            return True, None  # Port in use but couldn't identify the process
        return False, None  # Port is available
    except socket.error:
        return False, None

def find_available_port(start_port: int, max_attempts: int = 10) -> int:
    """Find the next available port starting from start_port"""
    current_port = start_port
    attempts = 0

    while attempts < max_attempts:
        try:
            # Try to create a socket with the current port
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.bind(('', current_port))
            sock.close()
            return current_port
        except socket.error:
            current_port += 1
            attempts += 1

    raise RuntimeError(f"Could not find an available port after {max_attempts} attempts")

def kill_process_on_port(port: int) -> bool:
    """Kill the process using the specified port"""
    in_use, pid = is_port_in_use(port)
    if in_use and pid:
        try:
            process = psutil.Process(pid)
            process.terminate()
            process.wait(timeout=5)
            logger.info(f"Successfully terminated process {pid} on port {port}")
            return True
        except psutil.NoSuchProcess:
            logger.warning(f"Process {pid} no longer exists")
        except psutil.TimeoutExpired:
            logger.warning(f"Timeout while terminating process {pid}")
            process.kill()
        except Exception as e:
            logger.error(f"Error killing process on port {port}: {e}")
    return False

class PortManager:
    def __init__(self, config_file: str = '.env.development'):
        self.config_file = config_file
        self.load_config()

    def load_config(self):
        """Load port configuration from environment file"""
        try:
            with open(self.config_file, 'r') as f:
                for line in f:
                    if line.strip() and not line.startswith('#'):
                        key, value = line.strip().split('=', 1)
                        os.environ[key] = value
        except FileNotFoundError:
            logger.warning(f"Config file {self.config_file} not found, using defaults")

    def get_port(self, service_name: str) -> int:
        """Get the configured port for a service"""
        port_key = f"{service_name.upper()}_PORT"
        try:
            return int(os.getenv(port_key, 0))
        except ValueError:
            logger.error(f"Invalid port configuration for {service_name}")
            return 0

    def ensure_port_available(self, service_name: str, fallback_port: int = None) -> int:
        """Ensure a port is available for the service, find alternative if needed"""
        configured_port = self.get_port(service_name)
        if not configured_port and fallback_port:
            configured_port = fallback_port

        if not configured_port:
            raise ValueError(f"No port configured for {service_name}")

        in_use, pid = is_port_in_use(configured_port)
        if in_use:
            logger.warning(f"Port {configured_port} is in use by PID {pid}")
            if service_name.lower() in ['frontend', 'backend']:
                # For our main services, try to free up the configured port
                if kill_process_on_port(configured_port):
                    logger.info(f"Freed up port {configured_port}")
                    return configured_port
            
            # Find an alternative port
            new_port = find_available_port(configured_port + 1)
            logger.info(f"Using alternative port {new_port} for {service_name}")
            return new_port

        return configured_port

    def update_config(self, service_name: str, port: int):
        """Update the configuration file with a new port"""
        port_key = f"{service_name.upper()}_PORT"
        url_key = f"{service_name.upper()}_URL"
        
        try:
            with open(self.config_file, 'r') as f:
                lines = f.readlines()

            with open(self.config_file, 'w') as f:
                for line in lines:
                    if line.startswith(port_key):
                        f.write(f"{port_key}={port}\n")
                    elif line.startswith(url_key):
                        f.write(f"{url_key}=http://localhost:{port}\n")
                    else:
                        f.write(line)
                        
            logger.info(f"Updated {service_name} port to {port} in config")
        except Exception as e:
            logger.error(f"Error updating config: {e}")

if __name__ == "__main__":
    # Example usage
    port_manager = PortManager()
    frontend_port = port_manager.ensure_port_available('frontend', 3000)
    backend_port = port_manager.ensure_port_available('backend', 5001)
    print(f"Frontend port: {frontend_port}")
    print(f"Backend port: {backend_port}")
