#!/usr/bin/env python3
"""
Diagnostic test script to identify where tests are hanging
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from test_complete_system import AgenticAITester

def run_diagnostic_tests():
    print("🔬 DIAGNOSTIC TEST MODE")
    print("=" * 50)
    
    tester = AgenticAITester()
    
    # Test 1: Backend Health
    print("\n🔬 Test 1: Backend Health Check")
    result1 = tester.test_backend_health()
    print(f"Result: {result1}")
    
    # Skip frontend test for now due to hanging issue
    print("\n🔬 Test 2: Frontend Accessibility (SKIPPED - known hanging issue)")
    
    # Test 3: System Status
    print("\n🔬 Test 3: System Status")
    try:
        result3 = tester.test_system_status()
        print(f"Result: {result3}")
    except Exception as e:
        print(f"Error in system status: {e}")
    
    # Test 4: Agents List
    print("\n🔬 Test 4: Agents List")
    try:
        result4 = tester.test_agents_list()
        print(f"Result: Found {len(result4)} agents")
    except Exception as e:
        print(f"Error in agents list: {e}")
    
    # Test 5: Create Agent
    print("\n🔬 Test 5: Create Agent")
    try:
        result5 = tester.test_create_agent()
        print(f"Result: {result5}")
    except Exception as e:
        print(f"Error in create agent: {e}")
    
    print("\n✅ Diagnostic tests completed!")

if __name__ == "__main__":
    try:
        run_diagnostic_tests()
    except KeyboardInterrupt:
        print("\n⏹️ Diagnostic tests interrupted")
    except Exception as e:
        print(f"\n❌ Diagnostic test error: {e}")
        import traceback
        traceback.print_exc()
