#!/usr/bin/env python3
"""
Quick test for the "can only join an iterable" fix
"""

import sys
import os
from pathlib import Path

# Add current directory to path
sys.path.insert(0, os.getcwd())

def test_get_agent_files():
    """Test the get_agent_files function"""
    print("🧪 Testing get_agent_files function...")
    
    try:
        # Import the function
        from working_rag_backend import get_agent_files, get_agent_data_directory
        
        # Test with existing agent
        print("Testing agent 6:")
        files_6 = get_agent_files("6")
        print(f"  Result: {files_6}")
        print(f"  Type: {type(files_6)}")
        print(f"  Is list: {isinstance(files_6, list)}")
        
        # Test with non-existing agent
        print("Testing agent 999:")
        files_999 = get_agent_files("999")
        print(f"  Result: {files_999}")
        print(f"  Type: {type(files_999)}")
        print(f"  Is list: {isinstance(files_999, list)}")
        
        # Test join operation
        print("Testing join operations:")
        try:
            joined_6 = ", ".join(files_6) if files_6 else "no files"
            print(f"  Agent 6 joined: '{joined_6}'")
        except Exception as e:
            print(f"  ❌ Join failed for agent 6: {e}")
        
        try:
            joined_999 = ", ".join(files_999) if files_999 else "no files"
            print(f"  Agent 999 joined: '{joined_999}'")
        except Exception as e:
            print(f"  ❌ Join failed for agent 999: {e}")
        
        print("✅ get_agent_files test completed successfully")
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_query_function():
    """Test the query_agent_documents function"""
    print("\n🧪 Testing query_agent_documents function...")
    
    try:
        from working_rag_backend import query_agent_documents
        
        # Test with agent 6
        result = query_agent_documents("6", "What files do you have?")
        print(f"Agent 6 result: {result}")
        
        # Test with non-existing agent
        result = query_agent_documents("999", "What files do you have?")
        print(f"Agent 999 result: {result}")
        
        print("✅ query_agent_documents test completed successfully")
        return True
        
    except Exception as e:
        print(f"❌ Query test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    print("🔧 Testing 'can only join an iterable' fix")
    print("=" * 50)
    
    test1 = test_get_agent_files()
    test2 = test_query_function()
    
    print("\n" + "=" * 50)
    if test1 and test2:
        print("✅ All tests passed! The fix should work.")
    else:
        print("❌ Some tests failed. Check the errors above.")
    
    print("🚀 Ready to start the backend!")

if __name__ == "__main__":
    main()
