#!/usr/bin/env python3
"""
Enhanced test runner with timeout and detailed logging
"""

import signal
import time
import sys
import os

class TimeoutHandler:
    def __init__(self, timeout_seconds=60):
        self.timeout_seconds = timeout_seconds
        
    def __enter__(self):
        signal.signal(signal.SIGALRM, self._timeout_handler)
        signal.alarm(self.timeout_seconds)
        return self
        
    def __exit__(self, type, value, traceback):
        signal.alarm(0)
        
    def _timeout_handler(self, signum, frame):
        print(f"\n⏰ TIMEOUT: Test execution exceeded {self.timeout_seconds} seconds")
        print("🚨 Possible issues:")
        print("   - Backend server is hanging")
        print("   - Database connection issues")
        print("   - Network connectivity problems")
        print("   - Infinite loop in test code")
        sys.exit(1)

def run_with_timeout():
    """Run the test with timeout protection"""
    print("🚀 Starting Enhanced Test Runner with Timeout Protection")
    print("=" * 60)
    
    try:
        with TimeoutHandler(timeout_seconds=120):  # 2 minute timeout
            print("⏱️  Test timeout set to 120 seconds")
            print("🔧 Importing test module...")
            
            # Import and run the test
            from test_complete_system import main
            
            print("✅ Test module imported successfully")
            print("🏃 Running main test function...")
            
            main()
            
    except KeyboardInterrupt:
        print("\n⏹️  Test interrupted by user (Ctrl+C)")
        sys.exit(1)
    except ImportError as e:
        print(f"❌ Failed to import test module: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Unexpected error during testing: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    run_with_timeout()
