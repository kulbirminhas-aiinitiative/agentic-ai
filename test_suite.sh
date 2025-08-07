#!/bin/bash

# Launcher script for Agentic AI Testing Suite
# This script navigates to the test directory and runs the complete test suite

echo "🚀 Agentic AI Platform - Complete Testing Suite"
echo "=============================================="

# Check if test directory exists
if [ ! -d "test" ]; then
    echo "❌ Error: test directory not found"
    echo "Please ensure you're in the project root directory"
    exit 1
fi

# Navigate to test directory
cd test

# Check if testing script exists
if [ ! -f "run_complete_tests.sh" ]; then
    echo "❌ Error: run_complete_tests.sh not found in test directory"
    exit 1
fi

# Make script executable if needed
chmod +x run_complete_tests.sh

# Run the complete test suite
echo "📂 Executing tests from: $(pwd)"
./run_complete_tests.sh
