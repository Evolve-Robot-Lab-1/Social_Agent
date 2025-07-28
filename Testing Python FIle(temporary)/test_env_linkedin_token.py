import requests
import json
import os
from dotenv import load_dotenv

def test_linkedin_token_from_env():
    """Test LinkedIn access token from .env file"""
    
    # Load environment variables from .env file
    load_dotenv()
    
    access_token = os.getenv('LINKEDIN_ACCESS_TOKEN')
    user_id = os.getenv('LINKEDIN_USER_ID')
    
    print("=== Testing LinkedIn Token from .env File ===")
    print(f"Token preview: {access_token[:25] if access_token else 'None'}...")
    print(f"Token length: {len(access_token) if access_token else 0} characters")
    print(f"User ID from .env: {user_id}")
    print("-" * 60)
    
    if not access_token:
        print("❌ ERROR: LINKEDIN_ACCESS_TOKEN not found in .env file")
        return False
    
    # Test endpoints
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
            "name": "LinkedIn User ID",
            "url": "https://api.linkedin.com/v2/people/~:(id)",
            "description": "Gets user ID for posting"
        }
    ]
    
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    
    valid_token = False
    successful_calls = 0
    
    print("Testing LinkedIn API endpoints...")
    print()
    
    for i, endpoint in enumerate(test_endpoints, 1):
        print(f"🔍 Test {i}/3: {endpoint['name']}")
        print(f"   URL: {endpoint['url']}")
        print(f"   Purpose: {endpoint['description']}")
        
        try:
            response = requests.get(endpoint['url'], headers=headers, timeout=10)
            
            print(f"   Status Code: {response.status_code}")
            
            if response.status_code == 200:
                print("   ✅ SUCCESS!")
                data = response.json()
                print(f"   Response: {json.dumps(data, indent=4)}")
                valid_token = True
                successful_calls += 1
                
                # Extract and show user info
                if 'sub' in data:
                    print(f"   👤 User ID: {data['sub']}")
                if 'name' in data:
                    print(f"   👤 Name: {data['name']}")
                    
            elif response.status_code == 401:
                print("   ❌ UNAUTHORIZED - Token is invalid or expired")
                print(f"   Details: {response.text}")
            elif response.status_code == 403:
                print("   ❌ FORBIDDEN - Token doesn't have required permissions")
                print(f"   Details: {response.text}")
            else:
                print(f"   ❌ ERROR - {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Details: {json.dumps(error_data, indent=4)}")
                except:
                    print(f"   Details: {response.text}")
                
        except requests.exceptions.Timeout:
            print("   ⏱️ TIMEOUT - Request took too long")
        except requests.exceptions.RequestException as e:
            print(f"   ❌ NETWORK ERROR: {str(e)}")
        
        print()
    
    print("=" * 70)
    
    if valid_token and successful_calls > 0:
        print("🎉 LINKEDIN TOKEN IS WORKING! ✅")
        print(f"✅ {successful_calls}/3 API calls succeeded")
        print()
        print("🚀 READY FOR LINKEDIN POSTING!")
        print("Your LinkedIn integration should now work in the main app.")
        print()
        print("Next steps:")
        print("1. Your Flask app should now be able to post to LinkedIn")
        print("2. Try creating a social media post and selecting LinkedIn")
        print("3. The posting should work without the previous error")
        
    elif access_token and len(access_token) < 50:
        print("⚠️  TOKEN MIGHT BE INCOMPLETE!")
        print(f"Current token length: {len(access_token)} characters")
        print("LinkedIn tokens are usually 200+ characters long.")
        print()
        print("🔧 Possible solutions:")
        print("1. Check if the token in browser localStorage is complete")
        print("2. Look for 'linkedin_access_token' in browser dev tools")
        print("3. Re-run the OAuth flow to get a fresh complete token")
        
    else:
        print("❌ TOKEN IS NOT WORKING!")
        print("The token in your .env file is invalid or expired.")
        print()
        print("🔧 Next steps:")
        print("1. Get the complete token from the OAuth success page")
        print("2. Make sure it's not truncated with '...'")
        print("3. Update your .env file with the complete token")
    
    print("=" * 70)
    return valid_token

if __name__ == "__main__":
    test_linkedin_token_from_env() 