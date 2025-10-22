"""Test script to verify counter flow functionality.

This script tests:
1. Counter user login
2. Creating counts
3. Viewing counts
4. Updating counts
5. Submitting counts for approval
"""
import asyncio
import httpx
import json
from datetime import date


async def test_counter_flow():
    base_url = "http://localhost:8000/api"
    
    async with httpx.AsyncClient() as client:
        print("Testing Counter Flow...")
        
        # 1. Login as counter user
        print("\n1. Testing counter user login...")
        login_data = {
            "username": "counter@example.com",
            "password": "counterpassword"
        }
        
        response = await client.post(f"{base_url}/auth/login", data=login_data)
        print(f"Login response: {response.status_code}")
        
        if response.status_code != 200:
            print(f"Login failed: {response.text}")
            return
        
        token_data = response.json()
        token = token_data["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("Login successful!")
        
        # 2. Test creating a count
        print("\n2. Testing count creation...")
        count_data = {
            "count_date": str(date.today()),
            "notes": "Test count created by counter user"
        }
        
        response = await client.post(f"{base_url}/counts/", json=count_data, headers=headers)
        print(f"Create count response: {response.status_code}")
        
        if response.status_code != 200:
            print(f"Count creation failed: {response.text}")
            return
        
        count = response.json()
        count_id = count["id"]
        print(f"Count created successfully with ID: {count_id}")
        
        # 3. Test viewing counts
        print("\n3. Testing count listing...")
        response = await client.get(f"{base_url}/counts/", headers=headers)
        print(f"List counts response: {response.status_code}")
        
        if response.status_code == 200:
            counts = response.json()
            print(f"Found {len(counts)} counts")
        
        # 4. Test counter-specific endpoints
        print("\n4. Testing counter-specific endpoints...")
        
        # Test drafts endpoint
        response = await client.get(f"{base_url}/counts/drafts", headers=headers)
        print(f"Drafts endpoint response: {response.status_code}")
        
        # Test today's counts endpoint
        response = await client.get(f"{base_url}/counts/today", headers=headers)
        print(f"Today's counts endpoint response: {response.status_code}")
        
        # 5. Test updating a count
        print("\n5. Testing count update...")
        update_data = {
            "notes": "Updated by counter user - testing functionality"
        }
        
        response = await client.put(f"{base_url}/counts/{count_id}", json=update_data, headers=headers)
        print(f"Update count response: {response.status_code}")
        
        if response.status_code == 200:
            print("Count updated successfully!")
        
        # 6. Test submitting count for approval
        print("\n6. Testing count submission...")
        submit_data = {
            "notes": "Ready for review - submitted by counter user"
        }
        
        response = await client.post(f"{base_url}/counts/{count_id}/submit", json=submit_data, headers=headers)
        print(f"Submit count response: {response.status_code}")
        
        if response.status_code == 200:
            print("Count submitted for approval successfully!")
        else:
            print(f"Count submission failed: {response.text}")
        
        print("\n✅ Counter flow test completed!")


if __name__ == "__main__":
    print("Starting counter flow test...")
    print("Make sure the FastAPI server is running on http://localhost:8000")
    asyncio.run(test_counter_flow())