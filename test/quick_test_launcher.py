#!/usr/bin/env python3
"""
Quick Test Launcher for Agentic AI Platform
Installs dependencies and runs comprehensive tests
"""

import subprocess
import sys
import os
import json
import time
from datetime import datetime

class TestLauncher:
    def __init__(self):
        self.test_dir = os.path.dirname(os.path.abspath(__file__))
        self.project_root = os.path.dirname(self.test_dir)
        os.chdir(self.test_dir)
        
    def log(self, message, level="INFO"):
        """Enhanced logging with timestamps"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        icons = {"INFO": "ℹ️", "SUCCESS": "✅", "WARNING": "⚠️", "ERROR": "❌", "STEP": "🔄"}
        icon = icons.get(level, "ℹ️")
        print(f"[{timestamp}] {icon} {message}")
        
    def run_command(self, command, shell=True):
        """Run a command and return the result"""
        self.log(f"Executing command: {command}")
        try:
            result = subprocess.run(command, shell=shell, capture_output=True, text=True)
            if result.returncode == 0:
                self.log(f"Command completed successfully", "SUCCESS")
            else:
                self.log(f"Command failed with exit code {result.returncode}", "ERROR")
                if result.stderr:
                    self.log(f"Error output: {result.stderr[:200]}...", "ERROR")
            return result.returncode == 0, result.stdout, result.stderr
        except Exception as e:
            self.log(f"Command execution failed: {e}", "ERROR")
            return False, "", str(e)
    
    def check_dependencies(self):
        """Check and install required dependencies"""
        self.log("Checking dependencies", "STEP")
        
        # Check Python packages
        python_packages = ['requests', 'beautifulsoup4', 'fastapi', 'uvicorn']
        for package in python_packages:
            self.log(f"Checking Python package: {package}")
            success, _, _ = self.run_command(f"python -c 'import {package}'")
            if not success:
                self.log(f"Installing {package}...", "WARNING")
                success, stdout, stderr = self.run_command(f"pip install {package}")
                if success:
                    self.log(f"Successfully installed {package}", "SUCCESS")
                else:
                    self.log(f"Failed to install {package}: {stderr}", "ERROR")
        
        # Check Node.js packages
        if not os.path.exists(os.path.join(self.project_root, 'node_modules')):
            print("Installing Node.js dependencies...")
            self.run_command(f"cd {self.project_root} && npm install")
        
        print("✅ Dependencies checked")
    
    def check_services(self):
        """Check if backend and frontend are running"""
        print("🔍 Checking services...")
        
        # Check backend
        backend_running = False
        try:
            import requests
            response = requests.get("http://localhost:8000/health", timeout=5)
            backend_running = response.status_code == 200
        except:
            pass
        
        # Check frontend
        frontend_running = False
        for port in [3000, 3001]:
            try:
                import requests
                response = requests.get(f"http://localhost:{port}", timeout=5)
                if response.status_code == 200:
                    frontend_running = True
                    self.frontend_port = port
                    break
            except:
                continue
        
        return backend_running, frontend_running
    
    def start_services(self):
        """Start backend and frontend if not running"""
        backend_running, frontend_running = self.check_services()
        
        processes = []
        
        if not backend_running:
            print("🚀 Starting backend...")
            backend_path = os.path.join(self.project_root, 'rag_backend.py')
            if os.path.exists(backend_path):
                proc = subprocess.Popen([sys.executable, backend_path])
                processes.append(('backend', proc))
                time.sleep(5)  # Wait for backend to start
        
        if not frontend_running:
            print("🚀 Starting frontend...")
            proc = subprocess.Popen(['npm', 'run', 'dev'], cwd=self.project_root)
            processes.append(('frontend', proc))
            time.sleep(10)  # Wait for frontend to start
        
        return processes
    
    def run_backend_tests(self):
        """Run backend API tests"""
        print("\n🧪 Running Backend Tests...")
        
        if os.path.exists('test_complete_system.py'):
            success, stdout, stderr = self.run_command(f"{sys.executable} test_complete_system.py")
            return success, stdout, stderr
        else:
            return False, "", "Backend test file not found"
    
    def run_frontend_tests(self):
        """Run frontend UI tests"""
        print("\n🧪 Running Frontend Tests...")
        
        if os.path.exists('test_frontend_ui.js'):
            # Set environment variable for frontend URL
            env = os.environ.copy()
            env['FRONTEND_URL'] = f"http://localhost:{getattr(self, 'frontend_port', 3000)}"
            
            try:
                result = subprocess.run(['node', 'test_frontend_ui.js'], 
                                      capture_output=True, text=True, env=env)
                return result.returncode == 0, result.stdout, result.stderr
            except Exception as e:
                return False, "", str(e)
        else:
            return False, "", "Frontend test file not found"
    
    def generate_report(self, backend_result, frontend_result):
        """Generate a comprehensive test report"""
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        
        report = {
            "timestamp": timestamp,
            "test_suite": "Complete Agentic AI Platform Tests",
            "backend_tests": {
                "success": backend_result[0],
                "output": backend_result[1],
                "error": backend_result[2]
            },
            "frontend_tests": {
                "success": frontend_result[0],
                "output": frontend_result[1],
                "error": frontend_result[2]
            },
            "overall_success": backend_result[0] and frontend_result[0]
        }
        
        # Save detailed report
        report_file = f"test_summary_{timestamp}.json"
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        # Print summary
        print("\n" + "="*60)
        print("📊 TEST RESULTS SUMMARY")
        print("="*60)
        print(f"Backend Tests: {'✅ PASSED' if backend_result[0] else '❌ FAILED'}")
        print(f"Frontend Tests: {'✅ PASSED' if frontend_result[0] else '❌ FAILED'}")
        print(f"Overall: {'🎉 ALL TESTS PASSED' if report['overall_success'] else '🚨 SOME TESTS FAILED'}")
        print(f"\n📄 Detailed report saved to: {report_file}")
        
        return report
    
    def cleanup(self, processes):
        """Clean up started processes"""
        print("\n🧹 Cleaning up...")
        for name, proc in processes:
            try:
                proc.terminate()
                print(f"Stopped {name}")
            except:
                pass
    
    def run_complete_test_suite(self):
        """Run the complete test suite"""
        print("🚀 Starting Complete Test Suite for Agentic AI Platform")
        print("="*60)
        
        try:
            # Step 1: Check dependencies
            self.check_dependencies()
            
            # Step 2: Start services if needed
            processes = self.start_services()
            
            # Step 3: Run tests
            backend_result = self.run_backend_tests()
            frontend_result = self.run_frontend_tests()
            
            # Step 4: Generate report
            report = self.generate_report(backend_result, frontend_result)
            
            # Step 5: Cleanup
            self.cleanup(processes)
            
            return report['overall_success']
            
        except KeyboardInterrupt:
            print("\n⏹️  Tests interrupted by user")
            self.cleanup(processes if 'processes' in locals() else [])
            return False
        except Exception as e:
            print(f"\n❌ Error during testing: {e}")
            return False

def main():
    launcher = TestLauncher()
    success = launcher.run_complete_test_suite()
    
    if success:
        print("\n🎉 All tests completed successfully!")
        sys.exit(0)
    else:
        print("\n🚨 Some tests failed. Check the results above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
