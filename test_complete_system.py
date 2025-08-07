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

class AgenticAITester:
    def __init__(self, base_url: str = "http://localhost:8000", frontend_url: str = "http://localhost:3001"):
        self.base_url = base_url.rstrip('/')
        self.frontend_url = frontend_url.rstrip('/')
        self.session = requests.Session()
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, message: str = "", response_data: Any = None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "message": message,
            "response_data": response_data
        })
    
    def test_backend_health(self) -> bool:
        """Test backend health endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/health")
            if response.status_code == 200:
                data = response.json()
                self.log_test("Backend Health Check", True, f"Status: {data.get('status', 'unknown')}")
                return True
            else:
                self.log_test("Backend Health Check", False, f"HTTP {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Backend Health Check", False, f"Connection failed: {str(e)}")
            return False
    
    def test_frontend_accessibility(self) -> bool:
        """Test if frontend is accessible"""
        try:
            response = self.session.get(self.frontend_url)
            if response.status_code == 200:
                self.log_test("Frontend Accessibility", True, "Frontend is accessible")
                return True
            else:
                self.log_test("Frontend Accessibility", False, f"HTTP {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Frontend Accessibility", False, f"Connection failed: {str(e)}")
            return False
    
    def test_system_status(self) -> bool:
        """Test system status endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/system-status")
            if response.status_code == 200:
                data = response.json()
                rag_available = data.get('rag_available', False)
                self.log_test("System Status", True, f"RAG Available: {rag_available}")
                return True
            else:
                self.log_test("System Status", False, f"HTTP {response.status_code}")
                return False
        except Exception as e:
            self.log_test("System Status", False, f"Error: {str(e)}")
            return False
    
    def test_agents_list(self) -> List[Dict]:
        """Test agents listing endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/agents")
            if response.status_code == 200:
                agents = response.json()
                self.log_test("Agents List", True, f"Found {len(agents)} agents")
                return agents
            else:
                self.log_test("Agents List", False, f"HTTP {response.status_code}")
                return []
        except Exception as e:
            self.log_test("Agents List", False, f"Error: {str(e)}")
            return []
    
    def test_create_agent(self) -> Dict:
        """Test agent creation endpoint"""
        test_agent_data = {
            "name": "test_agent_" + str(int(time.time())),
            "description": "Test agent created by automated testing",
            "display_name": "Test Agent",
            "rag_architecture": "llamaindex-pinecone"
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/agents",
                json=test_agent_data,
                headers={"Content-Type": "application/json"}
            )
            
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
        print("🚀 Starting Complete Agentic AI System Tests...")
        print("=" * 60)
        
        # Basic connectivity tests
        print("\n📡 Testing Basic Connectivity...")
        backend_healthy = self.test_backend_health()
        frontend_accessible = self.test_frontend_accessibility()
        
        if not backend_healthy:
            print("❌ Backend is not accessible. Please start the backend server:")
            print("   python rag_backend.py")
            return self.generate_summary()
        
        # System status tests
        print("\n🔍 Testing System Status...")
        self.test_system_status()
        
        # Frontend page tests
        print("\n🌐 Testing Frontend Pages...")
        self.test_frontend_pages()
        
        # Agent management tests
        print("\n🤖 Testing Agent Management...")
        agents = self.test_agents_list()
        test_agent = self.test_create_agent()
        
        if test_agent and test_agent.get('name'):
            agent_name = test_agent['name']
            
            # File management tests
            print(f"\n📁 Testing File Management for Agent: {agent_name}...")
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
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3001")
    
    print(f"Backend URL: {backend_url}")
    print(f"Frontend URL: {frontend_url}")
    
    # Initialize tester
    tester = AgenticAITester(backend_url, frontend_url)
    
    # Run tests
    summary = tester.run_complete_test_suite()
    
    # Save results to file
    results_file = "test_results.json"
    with open(results_file, 'w') as f:
        json.dump(summary, f, indent=2)
    
    print(f"\n💾 Detailed results saved to: {results_file}")
    
    # Exit with appropriate code
    if summary['failed_tests'] > 0:
        print("\n🚨 Some tests failed. Please check the issues above.")
        sys.exit(1)
    else:
        print("\n🎉 All tests passed successfully!")
        sys.exit(0)

if __name__ == "__main__":
    main()
