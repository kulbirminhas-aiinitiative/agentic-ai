#!/usr/bin/env python3
"""
Complete System Testing Script for Agentic AI Platform
Tests all REST APIs and provides comprehensive system validation
"""

import requests
import json
import time
import os
import sys
from pathlib import Path
from typing import Dict, Any, List
import tempfile
from datetime import datetime

class AgenticAITester:
    def __init__(self, base_url: str = "http://localhost:8000", frontend_url: str = "http://localhost:3000"):
        self.base_url = base_url.rstrip('/')
        self.frontend_url = frontend_url.rstrip('/')
        self.session = requests.Session()
        self.test_results = []
        self.debug_mode = True  # Enable detailed logging
        
    def debug_log(self, message: str):
        """Enhanced debug logging"""
        if self.debug_mode:
            timestamp = datetime.now().strftime("%H:%M:%S.%f")[:-3]
            print(f"[{timestamp}] 🔍 DEBUG: {message}")
            sys.stdout.flush()  # Force immediate output
        
    def log_test_start(self, test_name: str):
        """Log test start with timestamp"""
        timestamp = datetime.now().strftime("%H:%M:%S.%f")[:-3]
        print(f"[{timestamp}] 🚀 STARTING: {test_name}")
        sys.stdout.flush()
        
    def log_test_end(self, test_name: str, success: bool):
        """Log test completion with timestamp"""
        timestamp = datetime.now().strftime("%H:%M:%S.%f")[:-3]
        status = "✅ COMPLETED" if success else "❌ FAILED"
        print(f"[{timestamp}] {status}: {test_name}")
        sys.stdout.flush()
    def log_test(self, test_name: str, success: bool, message: str = "", response_data: Any = None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {status} {test_name}: {message}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "message": message,
            "response_data": response_data,
            "timestamp": timestamp
        })
    
    def test_backend_health(self) -> bool:
        """Test backend health endpoint"""
        self.log_test_start("Backend Health Check")
        self.debug_log("Starting backend health check...")
        try:
            self.debug_log(f"Making GET request to: {self.base_url}/health")
            response = self.session.get(f"{self.base_url}/health", timeout=10)
            self.debug_log(f"Response status code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                self.debug_log(f"Response data: {data}")
                self.log_test("Backend Health Check", True, f"Status: {data.get('status', 'unknown')}")
                self.log_test_end("Backend Health Check", True)
                return True
            else:
                self.log_test("Backend Health Check", False, f"HTTP {response.status_code}")
                self.log_test_end("Backend Health Check", False)
                return False
        except Exception as e:
            self.debug_log(f"Exception occurred: {str(e)}")
            self.log_test("Backend Health Check", False, f"Connection failed: {str(e)}")
            self.log_test_end("Backend Health Check", False)
            return False
    
    def test_frontend_accessibility(self) -> bool:
        """Test if frontend is accessible"""
        self.log_test_start("Frontend Accessibility Check")
        self.debug_log("Starting frontend accessibility check...")
        try:
            self.debug_log(f"Making GET request to: {self.frontend_url}")
            # Reduce timeout to prevent hanging
            response = self.session.get(self.frontend_url, timeout=5)
            self.debug_log(f"Frontend response status code: {response.status_code}")
            
            if response.status_code == 200:
                self.log_test("Frontend Accessibility", True, "Frontend is accessible")
                self.log_test_end("Frontend Accessibility Check", True)
                return True
            else:
                self.log_test("Frontend Accessibility", False, f"HTTP {response.status_code}")
                self.log_test_end("Frontend Accessibility Check", False)
                return False
        except requests.exceptions.Timeout:
            self.debug_log("Frontend accessibility timeout - server may be unresponsive")
            self.log_test("Frontend Accessibility", False, "Timeout - frontend may not be running")
            self.log_test_end("Frontend Accessibility Check", False)
            return False
        except requests.exceptions.ConnectionError as e:
            self.debug_log(f"Frontend connection error: {str(e)}")
            self.log_test("Frontend Accessibility", False, "Connection refused - frontend not running")
            self.log_test_end("Frontend Accessibility Check", False)
            return False
        except Exception as e:
            self.debug_log(f"Frontend accessibility error: {str(e)}")
            self.log_test("Frontend Accessibility", False, f"Connection failed: {str(e)}")
            self.log_test_end("Frontend Accessibility Check", False)
            return False
    
    def test_system_status(self) -> bool:
        """Test system status endpoint"""
        self.debug_log("Starting system status check...")
        try:
            self.debug_log(f"Making GET request to: {self.base_url}/system-status")
            response = self.session.get(f"{self.base_url}/system-status", timeout=10)
            self.debug_log(f"System status response code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                self.debug_log(f"System status data: {data}")
                rag_available = data.get('rag_available', False)
                self.log_test("System Status", True, f"RAG Available: {rag_available}")
                return True
            else:
                self.log_test("System Status", False, f"HTTP {response.status_code}")
                return False
        except Exception as e:
            self.debug_log(f"System status error: {str(e)}")
            self.log_test("System Status", False, f"Error: {str(e)}")
            return False
    
    def test_agents_list(self) -> List[Dict]:
        """Test agents listing endpoint"""
        self.log_test_start("Agents List")
        self.debug_log("Starting agents list test...")
        try:
            self.debug_log(f"Making GET request to: {self.base_url}/agents")
            response = self.session.get(f"{self.base_url}/agents", timeout=10)
            self.debug_log(f"Agents list response code: {response.status_code}")
            
            if response.status_code == 200:
                agents = response.json()
                self.debug_log(f"Found {len(agents) if isinstance(agents, list) else 'unknown'} agents")
                self.log_test("Agents List", True, f"Found {len(agents)} agents")
                self.log_test_end("Agents List", True)
                return agents
            else:
                self.log_test("Agents List", False, f"HTTP {response.status_code}")
                self.log_test_end("Agents List", False)
                return []
        except Exception as e:
            self.debug_log(f"Agents list error: {str(e)}")
            self.log_test("Agents List", False, f"Error: {str(e)}")
            self.log_test_end("Agents List", False)
            return []
    
    def test_create_agent(self) -> Dict:
        """Test agent creation endpoint"""
        self.debug_log("Starting agent creation test...")
        test_agent_data = {
            "name": "test_agent_" + str(int(time.time())),
            "description": "Test agent created by automated testing",
            "display_name": "Test Agent",
            "rag_architecture": "llamaindex-pinecone"
        }
        
        self.debug_log(f"Creating agent with data: {test_agent_data}")
        try:
            self.debug_log(f"Making POST request to: {self.base_url}/agents")
            response = self.session.post(
                f"{self.base_url}/agents",
                json=test_agent_data,
                headers={"Content-Type": "application/json"},
                timeout=15
            )
            self.debug_log(f"Create agent response code: {response.status_code}")
            
            if response.status_code == 200:
                agent = response.json()
                self.log_test("Create Agent", True, f"Created agent: {agent.get('name')}")
                return agent
            else:
                self.log_test("Create Agent", False, f"HTTP {response.status_code}: {response.text}")
                return {}
        except Exception as e:
            self.log_test("Create Agent", False, f"Error: {str(e)}")
            return {}
    
    def test_agent_files(self, agent_id: str) -> List[str]:
        """Test agent files endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/agent-files/{agent_id}")
            if response.status_code == 200:
                data = response.json()
                files = data.get('files', [])
                self.log_test("Agent Files", True, f"Agent {agent_id} has {len(files)} files")
                return files
            else:
                self.log_test("Agent Files", False, f"HTTP {response.status_code}")
                return []
        except Exception as e:
            self.log_test("Agent Files", False, f"Error: {str(e)}")
            return []
    
    def test_file_upload(self, agent_id: str) -> bool:
        """Test file upload endpoint"""
        # Create a temporary test file
        test_content = """# Test Document
        
This is a test document for the Agentic AI platform.

## Key Information
- This is test data for RAG testing
- The document contains sample information
- Used for automated testing purposes

## Features
- Document processing
- RAG integration
- AI agent functionality
"""
        
        try:
            with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False) as f:
                f.write(test_content)
                temp_file_path = f.name
            
            with open(temp_file_path, 'rb') as f:
                files = {'file': ('test_document.md', f, 'text/markdown')}
                response = self.session.post(
                    f"{self.base_url}/upload-file/{agent_id}",
                    files=files
                )
            
            # Clean up temp file
            os.unlink(temp_file_path)
            
            if response.status_code == 200:
                data = response.json()
                self.log_test("File Upload", True, f"Uploaded: {data.get('filename')}")
                return True
            else:
                self.log_test("File Upload", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("File Upload", False, f"Error: {str(e)}")
            return False
    
    def test_frontend_compatible_files(self, agent_id: str) -> bool:
        """Test frontend-compatible files endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/frontend-compatible-files/{agent_id}")
            if response.status_code == 200:
                data = response.json()
                files = data.get('files', [])
                self.log_test("Frontend Compatible Files", True, f"Found {len(files)} compatible files")
                return True
            else:
                self.log_test("Frontend Compatible Files", False, f"HTTP {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Frontend Compatible Files", False, f"Error: {str(e)}")
            return False
    
    def test_query_agent(self, agent_id: str) -> bool:
        """Test agent query endpoint"""
        test_queries = [
            "What information do you have?",
            "Tell me about the documents you've processed",
            "What are the key features mentioned in your knowledge base?"
        ]
        
        for query in test_queries:
            try:
                query_data = {
                    "query": query,
                    "agent_id": agent_id,
                    "model": "gpt-4o"
                }
                
                response = self.session.post(
                    f"{self.base_url}/query/",
                    json=query_data,
                    headers={"Content-Type": "application/json"}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    rag_used = data.get('rag_used', False)
                    self.log_test(f"Query Agent - '{query[:30]}...'", True, 
                                f"RAG Used: {rag_used}, Status: {data.get('status')}")
                else:
                    self.log_test(f"Query Agent - '{query[:30]}...'", False, 
                                f"HTTP {response.status_code}")
                    return False
            except Exception as e:
                self.log_test(f"Query Agent - '{query[:30]}...'", False, f"Error: {str(e)}")
                return False
        
        return True
    
    def test_process_agent_file(self, agent_id: str) -> bool:
        """Test process agent file endpoint"""
        try:
            data = {"agent_id": agent_id}
            response = self.session.post(
                f"{self.base_url}/process-agent-file/",
                json=data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                result = response.json()
                self.log_test("Process Agent File", True, f"Status: {result.get('status')}")
                return True
            else:
                self.log_test("Process Agent File", False, f"HTTP {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Process Agent File", False, f"Error: {str(e)}")
            return False
    
    def test_clear_agent_index(self, agent_id: str) -> bool:
        """Test clear agent index endpoint"""
        try:
            response = self.session.delete(f"{self.base_url}/agent-index/{agent_id}")
            if response.status_code == 200:
                data = response.json()
                self.log_test("Clear Agent Index", True, f"Status: {data.get('status')}")
                return True
            else:
                self.log_test("Clear Agent Index", False, f"HTTP {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Clear Agent Index", False, f"Error: {str(e)}")
            return False
    
    def test_frontend_pages(self) -> bool:
        """Test all frontend pages accessibility"""
        pages = [
            "/",
            "/dashboard",
            "/agents",
            "/create-agent",
            "/chat",
            "/contact"
        ]
        
        all_passed = True
        for page in pages:
            try:
                response = self.session.get(f"{self.frontend_url}{page}")
                if response.status_code == 200:
                    self.log_test(f"Frontend Page {page}", True, "Page accessible")
                else:
                    self.log_test(f"Frontend Page {page}", False, f"HTTP {response.status_code}")
                    all_passed = False
            except Exception as e:
                self.log_test(f"Frontend Page {page}", False, f"Error: {str(e)}")
                all_passed = False
        
        return all_passed
    
    def run_complete_test_suite(self) -> Dict[str, Any]:
        """Run the complete test suite"""
        self.debug_log("Starting run_complete_test_suite function")
        
        # Basic connectivity tests
        print("\n📡 Testing Basic Connectivity...")
        self.debug_log("Starting basic connectivity tests")
        
        backend_healthy = self.test_backend_health()
        self.debug_log(f"Backend health check result: {backend_healthy}")
        
        frontend_accessible = self.test_frontend_accessibility()
        self.debug_log(f"Frontend accessibility result: {frontend_accessible}")
        
        if not backend_healthy:
            self.debug_log("Backend is not healthy, stopping tests")
            print("❌ Backend is not accessible. Please start the backend server:")
            print("   python rag_backend.py")
            return self.generate_summary()
        
        # Frontend is optional - don't stop tests if it fails
        if not frontend_accessible:
            print("⚠️  Frontend is not accessible - continuing with backend-only tests")
            print("   To test frontend: npm run dev")

        # System status tests
        print("\n🔍 Testing System Status...")
        self.debug_log("Starting system status tests")
        self.test_system_status()
        
        # Frontend page tests
        print("\n🌐 Testing Frontend Pages...")
        self.debug_log("Starting frontend page tests")
        self.test_frontend_pages()
        
        # Agent management tests
        print("\n🤖 Testing Agent Management...")
        self.debug_log("Starting agent management tests")
        agents = self.test_agents_list()
        self.debug_log(f"Agents list completed, found: {len(agents) if isinstance(agents, list) else 'unknown'}")
        
        test_agent = self.test_create_agent()
        self.debug_log(f"Agent creation completed: {test_agent is not None}")
        
        if test_agent and test_agent.get('name'):
            agent_name = test_agent['name']
            self.debug_log(f"Testing with agent: {agent_name}")
            
            # File management tests
            print(f"\n📁 Testing File Management for Agent: {agent_name}...")
            self.debug_log("Starting file management tests")
            self.test_agent_files(agent_name)
            self.test_file_upload(agent_name)
            self.test_frontend_compatible_files(agent_name)
            self.test_process_agent_file(agent_name)
            
            # Query tests
            print(f"\n💬 Testing Agent Query for Agent: {agent_name}...")
            self.test_query_agent(agent_name)
            
            # Index management tests
            print(f"\n🗂️ Testing Index Management for Agent: {agent_name}...")
            self.test_clear_agent_index(agent_name)
        
        return self.generate_summary()
    
    def generate_summary(self) -> Dict[str, Any]:
        """Generate test summary"""
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['success'])
        failed_tests = total_tests - passed_tests
        
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"📈 Success Rate: {(passed_tests/total_tests*100):.1f}%" if total_tests > 0 else "No tests run")
        
        if failed_tests > 0:
            print(f"\n❌ Failed Tests:")
            for result in self.test_results:
                if not result['success']:
                    print(f"   - {result['test']}: {result['message']}")
        
        summary = {
            "total_tests": total_tests,
            "passed_tests": passed_tests,
            "failed_tests": failed_tests,
            "success_rate": (passed_tests/total_tests*100) if total_tests > 0 else 0,
            "detailed_results": self.test_results
        }
        
        return summary

def main():
    """Main function to run tests"""
    print("🧪 Agentic AI Complete System Testing")
    print("=" * 60)
    
    # Check if custom URLs are provided
    backend_url = os.getenv("BACKEND_URL", "http://localhost:8000")
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    print(f"Backend URL: {backend_url}")
    print(f"Frontend URL: {frontend_url}")
    print(f"🕐 Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Initialize tester
    print("🔧 Initializing tester...")
    tester = AgenticAITester(backend_url, frontend_url)
    
    # Run tests
    print("🚀 Starting Complete Agentic AI System Tests...")
    print("=" * 60)
    summary = tester.run_complete_test_suite()
    
    # Save results to file
    results_file = "test_results.json"
    print(f"💾 Saving results to: {results_file}")
    with open(results_file, 'w') as f:
        json.dump(summary, f, indent=2)
    
    print(f"\n💾 Detailed results saved to: {results_file}")
    
    # Exit with appropriate code
    if summary['failed_tests'] > 0:
        print(f"\n🚨 Some tests failed. Please check the issues above.")
        sys.exit(1)
    else:
        print(f"\n🎉 All tests passed successfully!")
        sys.exit(0)

if __name__ == "__main__":
    main()
