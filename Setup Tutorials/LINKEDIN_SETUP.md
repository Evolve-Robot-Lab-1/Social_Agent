# LinkedIn API Setup Guide

This guide will walk you through setting up LinkedIn posting functionality for your application using the **current LinkedIn Posts API (v202506)**.

## Prerequisites

1. **LinkedIn Account** (personal or company)
2. **LinkedIn Developer Account**
3. **LinkedIn App** with posting permissions
4. **Company Page** (if posting to company page)

## Step-by-Step Setup

### 1. Create LinkedIn Developer Account

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Click **Sign In** with your LinkedIn account
3. Accept the LinkedIn Developer Program Terms
4. Complete your developer profile

### 2. Create LinkedIn App

1. Go to [LinkedIn Apps](https://www.linkedin.com/developers/apps)
2. Click **Create App**
3. Fill in required information:
   - **App name**: Your application name
   - **LinkedIn Page**: Select your company page (required)
   - **Privacy policy URL**: Your privacy policy
   - **App logo**: Upload a logo (required)
4. Check **Legal Agreement** and click **Create app**

### 3. Configure App Settings

#### Add Products
1. In your app dashboard, go to **Products** tab
2. Request access to these products:
   - **Share on LinkedIn** - For posting content
   - **Sign In with LinkedIn using OpenID Connect** - For authentication

#### Set Redirect URLs
1. Go to **Auth** tab
2. Add your redirect URLs:
   ```
   http://localhost:5001/auth/linkedin/callback
   https://yourdomain.com/auth/linkedin/callback
   ```

#### Get App Credentials
1. In **Auth** tab, note down:
   - **Client ID**
   - **Client Secret**
   - **Redirect URLs**

### 4. Generate Access Token

#### Method 1: OAuth 2.0 Flow (Recommended)

**Step 1: Get Authorization Code**

Construct this URL and visit it in your browser:
```
https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id={CLIENT_ID}&redirect_uri={REDIRECT_URI}&scope=openid%20profile%20w_member_social
```

**⚠️ IMPORTANT**: Use the updated scopes:
- `openid` - OpenID Connect
- `profile` - Basic profile access  
- `w_member_social` - Write access to share content

**Deprecated scopes** (no longer use):
- ❌ `r_liteprofile` (deprecated)
- ❌ `email` (use `openid profile` instead)

Replace:
- `{CLIENT_ID}` - Your app's Client ID
- `{REDIRECT_URI}` - Your encoded redirect URI

**Step 2: Exchange Code for Token**

After authorization, LinkedIn redirects to your URL with a `code` parameter. Use this code:

```bash
curl -X POST https://www.linkedin.com/oauth/v2/accessToken \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=authorization_code' \
  -d 'code={AUTHORIZATION_CODE}' \
  -d 'client_id={CLIENT_ID}' \
  -d 'client_secret={CLIENT_SECRET}' \
  -d 'redirect_uri={REDIRECT_URI}'
```

#### Method 2: Using Built-in OAuth Flow

Your application includes a built-in OAuth flow:

1. **Start OAuth**: Visit `http://localhost:5001/auth/linkedin`
2. **Authorize**: Complete LinkedIn authorization
3. **Get Token**: Token is stored in browser localStorage and .env file
4. **Verify**: Check `/test_linkedin_token` endpoint

### 5. Get Your LinkedIn User ID

**Using Current API (v202506):**
```bash
curl -X GET https://api.linkedin.com/v2/people/~?projection=(id,firstName,lastName) \
  -H 'Authorization: Bearer {ACCESS_TOKEN}' \
  -H 'LinkedIn-Version: 202506'
```

**Response:**
```json
{
  "id": "YOUR_LINKEDIN_USER_ID",
  "firstName": {
    "localized": {"en_US": "John"},
    "preferredLocale": {"country": "US", "language": "en"}
  },
  "lastName": {
    "localized": {"en_US": "Doe"},
    "preferredLocale": {"country": "US", "language": "en"}
  }
}
```

### 6. Add Environment Variables

Add to your `.env` file:

```env
# LinkedIn API Configuration
LINKEDIN_ACCESS_TOKEN=your_complete_linkedin_access_token_here
LINKEDIN_CLIENT_ID=your_client_id_here
LINKEDIN_CLIENT_SECRET=your_client_secret_here
LINKEDIN_USER_ID=your_linkedin_user_id_here
```

**⚠️ CRITICAL**: Ensure your access token is **complete** (typically 350+ characters). Truncated tokens will cause authentication failures.

### 7. Test Your Setup

Test your token with the current API version:
```bash
curl -X GET https://api.linkedin.com/v2/people/~ \
  -H 'Authorization: Bearer {ACCESS_TOKEN}' \
  -H 'LinkedIn-Version: 202506'
```

## LinkedIn Posts API (Current Implementation)

### ✅ Current API Version: 202506

**Important**: LinkedIn API versions are released monthly and supported for 1 year minimum. Always use the latest active version.

- ✅ **Active**: `202506` (June 2025)
- ❌ **Deprecated**: `202406` (June 2024) - **SUNSET**

### API Endpoints

#### Posts API (Replaces old Share/UGC APIs)
- **Endpoint**: `https://api.linkedin.com/rest/posts`
- **Method**: POST
- **Headers**: 
  ```
  Authorization: Bearer {token}
  Content-Type: application/json
  X-Restli-Protocol-Version: 2.0.0
  LinkedIn-Version: 202506
  ```

#### Images API (For image uploads)
- **Endpoint**: `https://api.linkedin.com/rest/images`
- **Method**: POST (initialize) + PUT (upload)

### Content Types Supported
- **Text posts** - Regular status updates
- **Image posts** - Single image with text
- **Video posts** - Upload videos
- **Article posts** - Share external articles
- **Multi-image posts** - Multiple images (organic only)
- **Poll posts** - Interactive polls (organic only)
- **Carousel posts** - Multiple images/videos (sponsored only)

### API Limits
- **Rate limiting**: 500 API calls per user per day
- **Posting limits**: 150 posts per user per day
- **Character limits**: 3000 characters for posts
- **Image size**: Max 20MB per image
- **Video size**: Max 200MB per video

### Required Scopes (Updated)
- `openid` - OpenID Connect authentication
- `profile` - Basic profile access
- `w_member_social` - Write access to share content

## Current Implementation (Fixed Version)

Here's the updated implementation using the current LinkedIn Posts API:

```python
def post_to_linkedin(user_id, text, image_url=None, access_token=None):
    """
    Posts content to LinkedIn using LinkedIn Posts API v202506
    """
    # Get LinkedIn access token from parameter or environment
    if not access_token:
        access_token = os.getenv('LINKEDIN_ACCESS_TOKEN')
    
    if not access_token:
        return {
            'success': False,
            'error': 'LinkedIn access token not configured'
        }
    
    # LinkedIn Posts API endpoint (current API)
    url = 'https://api.linkedin.com/rest/posts'
    
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
        'LinkedIn-Version': '202506'  # ✅ Current active version
    }
    
    # LinkedIn Posts API format
    post_data = {
        "author": f"urn:li:person:{user_id}",
        "commentary": text,
        "visibility": "PUBLIC",
        "distribution": {
            "feedDistribution": "MAIN_FEED",
            "targetEntities": [],
            "thirdPartyDistributionChannels": []
        },
        "lifecycleState": "PUBLISHED",
        "isReshareDisabledByAuthor": False
    }
    
    # Handle image posting if image URL is provided
    if image_url:
        try:
            # Step 1: Upload image to LinkedIn Images API to get image URN
            image_urn = upload_image_to_linkedin(image_url, user_id, access_token)
            
            if image_urn:
                # Step 2: Add image content to post
                post_data["content"] = {
                    "media": {
                        "id": image_urn,
                        "altText": "Image shared via blog generation"
                    }
                }
        except Exception as img_error:
            print(f"[WARNING] Image upload failed: {str(img_error)}, posting text-only")
    
    try:
        response = requests.post(url, headers=headers, json=post_data)
        
        if response.status_code == 201:
            # Success - get post ID from response header
            post_id = response.headers.get('x-restli-id', 'unknown')
            return {
                'success': True,
                'post_id': post_id,
                'message': 'Posted successfully to LinkedIn'
            }
        else:
            return {
                'success': False,
                'error': f"LinkedIn posting failed: {response.text}"
            }
            
    except Exception as e:
        return {
            'success': False,
            'error': f'LinkedIn posting failed: {str(e)}'
        }

def upload_image_to_linkedin(image_url, user_id, access_token):
    """
    Upload an image to LinkedIn Images API and return the image URN
    """
    try:
        # Step 1: Download the image
        img_response = requests.get(image_url, timeout=30)
        if img_response.status_code != 200:
            return None
        
        image_data = img_response.content
        
        # Step 2: Initialize upload with LinkedIn Images API
        init_url = 'https://api.linkedin.com/rest/images?action=initializeUpload'
        
        init_headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0',
            'LinkedIn-Version': '202506'  # ✅ Current active version
        }
        
        init_data = {
            "initializeUploadRequest": {
                "owner": f"urn:li:person:{user_id}"
            }
        }
        
        init_response = requests.post(init_url, headers=init_headers, json=init_data)
        
        if init_response.status_code != 200:
            return None
        
        init_result = init_response.json()
        upload_url = init_result['value']['uploadUrl']
        image_urn = init_result['value']['image']
        
        # Step 3: Upload the image binary data
        upload_headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/octet-stream'
        }
        
        upload_response = requests.put(upload_url, headers=upload_headers, data=image_data)
        
        if upload_response.status_code in [200, 201]:
            return image_urn
        else:
            return None
            
    except Exception as e:
        return None
```

## Recent Fixes Applied

### ✅ Version Update Fix (June 2025)
- **Problem**: "Requested version 20240601 is not active" error
- **Solution**: Updated from deprecated `202406` to current `202506`
- **Impact**: Fixed all LinkedIn posting functionality

### ✅ Image Posting Implementation
- **Problem**: Image posting was disabled for testing
- **Solution**: Implemented complete image upload workflow
- **Features**: 
  - Automatic image download from URLs
  - LinkedIn Images API integration
  - Image URN generation and post attachment
  - Fallback to text-only on image failures

### ✅ OAuth Integration
- **Built-in OAuth flow**: `/auth/linkedin` endpoint
- **Automatic token storage**: Environment and localStorage
- **Token validation**: `/test_linkedin_token` endpoint

## Common Issues & Solutions

### "Requested version X is not active"
- **Cause**: Using deprecated API version
- **Solution**: Update `LinkedIn-Version` header to current version (`202506`)
- **Prevention**: Check LinkedIn API documentation for latest versions

### "Invalid Client"
- Check your Client ID and Client Secret
- Ensure redirect URI matches exactly
- App might not be approved for posting

### "Insufficient Permissions" 
- Add required scopes: `openid profile w_member_social`
- Avoid deprecated scopes like `r_liteprofile`
- Some features require app review

### "Token Expired"
- LinkedIn tokens expire in 60 days
- Use the built-in OAuth flow to refresh
- Implement token refresh in production

### "Unpermitted fields present in REQUEST_BODY"
- **Cause**: Using old Share API format with Posts API
- **Solution**: Use correct Posts API format (implemented above)
- **Check**: Ensure using `commentary` not `shareCommentary`

### Truncated Access Token
- **Cause**: Copying incomplete token (ending with "...")
- **Solution**: Get complete token from browser localStorage
- **Verification**: Token should be 350+ characters

## API Migration Notes

### Old APIs (Deprecated)
- ❌ **Share API** (`/v2/shares`) - Replaced by Posts API
- ❌ **UGC Posts API** (`/v2/ugcPosts`) - Replaced by Posts API
- ❌ **Assets API** - Replaced by Images/Videos API

### New APIs (Current)
- ✅ **Posts API** (`/rest/posts`) - Main posting API
- ✅ **Images API** (`/rest/images`) - Image uploads
- ✅ **Videos API** (`/rest/videos`) - Video uploads

### Schema Changes
- `shareCommentary` → `commentary`
- `shareMediaCategory` → `content.media`
- `specificContent` → `content`
- `author` format unchanged: `urn:li:person:{id}`

## Testing Your Setup

### 1. Test Token Validity
```bash
curl -X GET https://api.linkedin.com/v2/people/~ \
  -H 'Authorization: Bearer {ACCESS_TOKEN}' \
  -H 'LinkedIn-Version: 202506'
```

### 2. Test Text Posting
Use the `/api/linkedin/post` endpoint with:
```json
{
  "user_id": "your_user_id",
  "text": "Test post from API"
}
```

### 3. Test Image Posting  
Use the `/api/linkedin/post` endpoint with:
```json
{
  "user_id": "your_user_id", 
  "text": "Test post with image",
  "image_url": "https://example.com/image.jpg"
}
```

### 4. Verify in LinkedIn
- Check your LinkedIn profile/feed
- Confirm posts appear correctly
- Verify images display properly

## Production Considerations

### App Review Process
For production use, you may need LinkedIn app review:

1. **Complete App Profile**: Add detailed description, screenshots, privacy policy
2. **Submit for Review**: Request access to required products
3. **Review Timeline**: 7-14 days typically
4. **Approval Requirements**: Demonstrate legitimate business use case

### Rate Limiting
- Implement exponential backoff
- Cache requests when possible
- Monitor API usage limits
- Use batch operations where available

### Error Handling
- Handle token expiration gracefully
- Implement retry logic for transient failures
- Provide meaningful error messages to users
- Log errors for debugging

## Support Resources

- [LinkedIn Developer Documentation](https://learn.microsoft.com/en-us/linkedin/)
- [Posts API Documentation](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api)
- [Images API Documentation](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/images-api)
- [OAuth 2.0 Guide](https://learn.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow)
- [API Versioning Guide](https://learn.microsoft.com/en-us/linkedin/marketing/versioning)

## Version History

- **June 2025**: Updated to API version 202506, fixed image posting
- **June 2024**: API version 202406 (now deprecated/sunset)
- **June 2022**: First versioned API release (202206) 