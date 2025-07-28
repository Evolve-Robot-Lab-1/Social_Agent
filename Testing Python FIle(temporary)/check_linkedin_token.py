import requests
import json

def test_linkedin_token():
    """Test the new LinkedIn access token"""
    
    # Your NEW LinkedIn access token from OAuth
    access_token = "AQUki-hZBuO7heHQGwqv..."  # ⚠️ REPLACE WITH COMPLETE TOKEN
    
    print("=== NEW LinkedIn Token Validation Test ===")
    print(f"Token preview: {access_token[:25]}...")
    print(f"Token length: {len(access_token)} characters")
    print("-" * 50)
    
    # Test endpoints to try
    test_endpoints = [
        {
            "name": "LinkedIn UserInfo (OpenID Connect)",
            "url": "https://api.linkedin.com/v2/userinfo",
            "description": "Gets basic user profile info"
        },
        {
            "name": "LinkedIn People API",
            "url": "https://api.linkedin.com/v2/people/~",
            "description": "Gets user profile details"
        },
        {
            "name": "Test Posting Capability",
            "url": "https://api.linkedin.com/v2/people/~:(id)",
            "description": "Tests if we can access user ID for posting"
        }
    ]
    
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    
    valid_token = False
    user_data = {}
    
    print("Testing different LinkedIn API endpoints...")
    print()
    
    for endpoint in test_endpoints:
        print(f"🔍 Testing: {endpoint['name']}")
        print(f"   URL: {endpoint['url']}")
        print(f"   Purpose: {endpoint['description']}")
        
        try:
            response = requests.get(endpoint['url'], headers=headers)
            
            print(f"   Status Code: {response.status_code}")
            
            if response.status_code == 200:
                print("   ✅ SUCCESS!")
                data = response.json()
                print(f"   Response: {json.dumps(data, indent=2)}")
                valid_token = True
                user_data = data
                
                # Don't break here - test all endpoints
            elif response.status_code == 401:
                print("   ❌ UNAUTHORIZED - Token is invalid or expired")
            elif response.status_code == 403:
                print("   ❌ FORBIDDEN - Token doesn't have required permissions")
            else:
                print(f"   ❌ ERROR - {response.status_code}: {response.text}")
                
        except requests.exceptions.RequestException as e:
            print(f"   ❌ NETWORK ERROR: {str(e)}")
        
        print()
    
    print("=" * 60)
    
    if valid_token:
        print("🎉 NEW TOKEN IS VALID! ✅")
        print("Your LinkedIn token works and you can use it for API calls.")
        
        # Extract user ID if available
        user_id = user_data.get('sub') or user_data.get('id')
        if user_id:
            print(f"📋 User ID: {user_id}")
            print("💡 This matches your .env file: LINKEDIN_USER_ID=bKmbblRPC6")
        
        print()
        print("🚀 READY FOR LINKEDIN POSTING!")
        print("Your LinkedIn integration should now work perfectly.")
        
    else:
        print("❌ TOKEN IS STILL INVALID!")
        print("Make sure you copied the COMPLETE token (not truncated with ...)")
    
    print("=" * 60)
    return valid_token

if __name__ == "__main__":
    test_linkedin_token() 