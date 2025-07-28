import requests
import json

def test_direct_token():
    """Test LinkedIn token directly (hardcoded)"""
    
    # COMPLETE LinkedIn access token from localStorage
    access_token = "AQUki-hZBuO7heHQGwqvS5-l7F64K_Oev1tCzbbJEM__nWPOXoYs4vb-c9x8fvSnt0E5-S7DLuKnRr2grxw1v3h_2xX6x5U58_p49nf9QuzL8K7_QDBk4yUSrTheXBmcymOeaL81lV5zlcrqvTtpZW3O6jiS_i84rzoOyutfzVrmhMym0HcT_l-jKCXl4n-IzOPrA7M3_9FUKzUvpM60P0F0zUnzB2I2kuQu9k_LXPWhrtg-dIstcyF7fWFxuMW0LD_ejECBdsTSHE2-ozHkxSHTK39rXSNtJmS8G_cx36q7IhhA0pS8NFjVzvG6wUZHFH4LQccmMlbja1nHjstz6kKAPc1axA"
    
    print("=== Direct LinkedIn Token Test ===")
    print(f"Token preview: {access_token[:30]}...")
    print(f"Token length: {len(access_token)} characters")
    print("-" * 50)
    
    if access_token.endswith("..."):
        print("❌ TOKEN IS STILL TRUNCATED!")
        print("Please replace the ... with the complete token")
        print("The complete token should be 200+ characters long")
        return False
    
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    
    print("🔍 Testing LinkedIn API...")
    print()
    
    try:
        # Test the userinfo endpoint
        response = requests.get('https://api.linkedin.com/v2/userinfo', headers=headers)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ SUCCESS! TOKEN IS VALID!")
            data = response.json()
            print(f"User Data: {json.dumps(data, indent=2)}")
            print()
            print("🎉 YOUR LINKEDIN TOKEN WORKS!")
            print("You can now use LinkedIn posting in your app.")
            return True
            
        elif response.status_code == 401:
            print("❌ UNAUTHORIZED - Token is invalid")
            error_data = response.json()
            print(f"Error: {json.dumps(error_data, indent=2)}")
            
        else:
            print(f"❌ ERROR {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
    
    return False

if __name__ == "__main__":
    print("=" * 60)
    test_direct_token()
    print("=" * 60) 