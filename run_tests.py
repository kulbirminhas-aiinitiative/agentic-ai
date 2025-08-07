#!/usr/bin/env python3
"""
Root launcher for Agentic AI Testing Suite
Navigates to test directory and runs the Python test launcher
"""

import os
import sys
import subprocess

def main():
    print("🚀 Agentic AI Platform - Test Suite Launcher")
    print("=" * 50)
    
    # Get the directory of this script (project root)
    project_root = os.path.dirname(os.path.abspath(__file__))
    test_dir = os.path.join(project_root, 'test')
    venv_path = os.path.join(project_root, 'v-agentic-ai', 'bin', 'python')
    
    # Check if test directory exists
    if not os.path.exists(test_dir):
        print("❌ Error: test directory not found")
        print("Please ensure you're in the project root directory")
        sys.exit(1)
    
    # Check if Python test launcher exists
    launcher_path = os.path.join(test_dir, 'quick_test_launcher.py')
    if not os.path.exists(launcher_path):
        print("❌ Error: quick_test_launcher.py not found in test directory")
        sys.exit(1)
    
    # Determine which Python interpreter to use
    python_cmd = venv_path if os.path.exists(venv_path) else sys.executable
    if os.path.exists(venv_path):
        print(f"🐍 Using v-agentic-ai environment: {venv_path}")
    else:
        print(f"🐍 Using system Python: {python_cmd}")
    
    print(f"📂 Test directory: {test_dir}")
    print(f"🐍 Running Python test launcher...")
    
    # Change to test directory and run the launcher
    os.chdir(test_dir)
    
    try:
        # Run the test launcher with the appropriate Python interpreter
        result = subprocess.run([python_cmd, 'quick_test_launcher.py'], 
                              cwd=test_dir)
        sys.exit(result.returncode)
    except KeyboardInterrupt:
        print("\n⏹️  Testing interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error running tests: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
