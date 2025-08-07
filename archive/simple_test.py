#!/usr/bin/env python3
import requests
import json

# Test agents API
print("Testing agents API...")
try:
    response = requests.get('http://localhost:3000/api/agents', timeout=5)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print("Agents found:")
        for agent in data.get('agents', []):
            print(f"  ID: {agent.get('id')}, Name: {agent.get('name')}")
    else:
        print(f"Error: {response.text}")
except Exception as e:
    print(f"Connection error: {e}")

print("\nTesting frontend not running...")
print("Starting basic tests without API calls...")

# Check file system
from pathlib import Path
agents_dir = Path("data/agents")
print(f"\nFile system check:")
if agents_dir.exists():
    for agent_dir in agents_dir.iterdir():
        if agent_dir.is_dir():
            files = [f.name for f in agent_dir.iterdir() if f.is_file()]
            print(f"Agent {agent_dir.name}: {len(files)} files")
else:
    print("No agents directory")
