# Facebook API Setup Guide

This guide will walk you through setting up Facebook posting functionality for your application.

## Prerequisites

1. **Facebook Page** (personal profiles cannot be used for posting via API)
2. **Facebook Developer Account**
3. **Meta App** with Facebook permissions
4. **Page Admin Access** to the Facebook Page you want to post to

## Step-by-Step Setup

### 1. Create Facebook Page (if you don't have one)

1. Go to [Facebook Pages](https://www.facebook.com/pages/create/)
2. Choose **Business or Brand**
3. Fill in your page details:
   - **Page Name**: Your business/brand name
   - **Category**: Select appropriate category
   - **Description**: Brief description of your page
4. Complete the page setup process
5. **Important**: Make sure you're an admin of this page

### 2. Create Facebook Developer App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **My Apps** → **Create App**
3. Choose **Business** as app type
4. Fill in app details:
   - **App Name**: Your app name
   - **App Contact Email**: Your email
   - **Business Account**: Select or create one
5. Click **Create App**

### 3. Add Facebook Graph API Product

1. In your Facebook App dashboard, click **Add Product**
2. Find **Facebook Graph API** and click **Set Up**
3. This allows you to read from and post to Facebook

### 4. Configure App Settings

1. Go to **Settings** → **Basic**
2. Add your **App Domains**: `yourdomain.com`
3. Add **Privacy Policy URL**: Your privacy policy URL
4. Add **Terms of Service URL**: Your terms of service URL
5. **Save Changes**

### 5. Generate Access Token

#### Method 1: Using Facebook Graph API Explorer (Recommended)

1. Go to [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Select your app from the dropdown
3. Click **Generate Access Token**
4. Add these permissions:
   - `pages_manage_posts` - Create, edit and delete posts
   - `pages_read_engagement` - Read page engagement data
   - `pages_show_list` - List pages you manage
   - `publish_to_groups` - (Optional) Post to groups
5. Click **Generate Access Token** and copy it

#### Method 2: Using Facebook Access Token Tool

1. Go to [Access Token Tool](https://developers.facebook.com/tools/accesstoken/)
2. Find your app and click **Generate Token**
3. Select required permissions
4. Copy the **User Access Token**

### 6. Get Your Facebook Page ID and Page Access Token

#### Using Graph API Explorer:

1. In Graph API Explorer, paste this in the query field:
   ```
   me/accounts
   ```
2. Click **Submit** to see your Facebook Pages
3. Find your Facebook Page and copy:
   - `id` - This is your **Page ID**
   - `access_token` - This is your **Page Access Token**

#### Using Browser (Alternative):

1. Go to your Facebook Page
2. Click **About** tab
3. Scroll down to find **Page ID** in the page info
4. Or check the URL: `facebook.com/YourPageName-123456789` (numbers are Page ID)

### 7. Convert to Long-lived Page Access Token

Page Access Tokens are more stable than User Access Tokens:

```bash
# First, get a long-lived user access token
curl -i -X GET "https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id={APP_ID}&client_secret={APP_SECRET}&fb_exchange_token={SHORT_LIVED_USER_TOKEN}"

# Then use it to get a long-lived page access token
curl -i -X GET "https://graph.facebook.com/v18.0/me/accounts?access_token={LONG_LIVED_USER_TOKEN}"
```

### 8. Add Environment Variables

Create or update your `.env` file:

```env
# Facebook API Configuration
FACEBOOK_APP_ID=your_facebook_app_id_here
FACEBOOK_APP_SECRET=your_facebook_app_secret_here
FACEBOOK_USER_ACCESS_TOKEN=your_facebook_user_access_token_here
FACEBOOK_PAGE_ACCESS_TOKEN=your_facebook_page_access_token_here
FACEBOOK_PAGE_ID=your_facebook_page_id_here
```

### 9. Test Your Setup

1. Run your application
2. Generate a social media post with Facebook selected
3. Click the **Post to Facebook** button
4. Check if the post appears on your Facebook Page

## Important Notes

### Token Types and Expiration

- **User Access Tokens**: 
  - Short-lived: 1-2 hours
  - Long-lived: 60 days
- **Page Access Tokens**: 
  - Long-lived: Never expire (unless user changes password or app permissions are revoked)
  - **Recommended**: Use Page Access Tokens for posting

### Facebook Posting Requirements

1. **Text posts**: Minimum content required
2. **Image formats**: JPG, PNG, GIF, BMP, TIFF, WEBP
3. **Image size**: Max 4096x4096 pixels
4. **File size**: Max 4MB for images
5. **Video formats**: MP4, MOV, AVI (max 1GB, 240 minutes)

### Post Types Supported

- **Text-only posts**
- **Photo posts** (single or multiple images)
- **Link posts** (with preview)
- **Video posts**
- **Poll posts**
- **Event posts**

### Common Issues

#### "Invalid Access Token"
- Token might be expired
- Make sure you have the right permissions
- Use Page Access Token instead of User Access Token for posting

#### "Insufficient Permissions"
- Add required permissions: `pages_manage_posts`, `pages_show_list`
- Make sure you're admin of the Facebook Page
- Re-generate token with correct permissions

#### "Page Not Found"
- Verify Page ID is correct
- Ensure you have admin access to the page
- Check if page is published (not draft)

#### "Duplicate Post"
- Facebook prevents posting identical content
- Add unique elements or wait before reposting
- Modify content slightly to avoid duplication

#### "Rate Limit Exceeded"
- Reduce posting frequency
- Implement exponential backoff
- Monitor API usage

### Permissions Required

- `pages_manage_posts` - Create, edit and delete posts on pages
- `pages_read_engagement` - Read page engagement metrics
- `pages_show_list` - Get list of pages you manage
- `publish_to_groups` - (Optional) Post to groups you admin

### API Limits

- **Rate limiting**: 200 calls per hour per user
- **Page posts**: 1440 posts per day per page
- **Concurrent posts**: No specific limit, but avoid rapid posting
- **Content restrictions**: Follow Facebook Community Standards

## Advanced Features

### Scheduling Posts

```javascript
// Schedule a post for later
const scheduledTime = Math.floor(new Date('2024-12-31 10:00:00').getTime() / 1000);

const postData = {
  message: 'Your post content here',
  scheduled_publish_time: scheduledTime,
  published: false
};
```

### Adding Images to Posts

```javascript
// Upload photo first, then create post
const photoUpload = await fetch(`https://graph.facebook.com/v18.0/${pageId}/photos`, {
  method: 'POST',
  body: formData, // FormData with image
  headers: {
    'Authorization': `Bearer ${pageAccessToken}`
  }
});

const photoResponse = await photoUpload.json();
const photoId = photoResponse.id;

// Create post with photo
const postData = {
  message: 'Your post caption',
  object_attachment: photoId
};
```

### Link Posts

```javascript
const postData = {
  message: 'Check out this awesome link!',
  link: 'https://example.com',
  name: 'Link Title',
  description: 'Link description'
};
```

## App Review Process

### When Do You Need App Review?

- **Standard permissions**: Usually don't require review
- **Advanced permissions**: Require review for production use
- **Business verification**: May be required for certain features

### Required for Review

1. **Privacy Policy**: Must be publicly accessible
2. **Terms of Service**: Must be publicly accessible  
3. **App Icon**: 1024x1024 pixels
4. **App Description**: Clear explanation of app purpose
5. **Screen recordings**: Showing how permissions are used

### Review Timeline

- **Standard review**: 7-14 business days
- **Advanced features**: Up to 30 business days
- **Business verification**: Additional time may be required

## Troubleshooting

### Check App Status
1. Go to your Facebook App dashboard
2. Check **App Review** tab for status
3. For testing, Development mode works with test users
4. For production, submit for App Review

### Verify Token Permissions
```bash
curl -i -X GET "https://graph.facebook.com/v18.0/me/permissions?access_token={ACCESS_TOKEN}"
```

### Test Page Access
```bash
curl -i -X GET "https://graph.facebook.com/v18.0/{PAGE_ID}?access_token={PAGE_ACCESS_TOKEN}"
```

### Debug Access Token
```bash
curl -i -X GET "https://graph.facebook.com/v18.0/debug_token?input_token={TOKEN_TO_DEBUG}&access_token={APP_TOKEN}"
```

### Common API Endpoints

```bash
# Get page info
GET https://graph.facebook.com/v18.0/{PAGE_ID}

# Create post
POST https://graph.facebook.com/v18.0/{PAGE_ID}/feed

# Get page posts
GET https://graph.facebook.com/v18.0/{PAGE_ID}/posts

# Upload photo
POST https://graph.facebook.com/v18.0/{PAGE_ID}/photos

# Get page insights
GET https://graph.facebook.com/v18.0/{PAGE_ID}/insights
```

## Support Resources

- [Facebook Graph API Documentation](https://developers.facebook.com/docs/graph-api)
- [Facebook Pages API Documentation](https://developers.facebook.com/docs/pages-api)
- [Facebook App Review Guidelines](https://developers.facebook.com/docs/app-review)
- [Meta Business Help Center](https://www.facebook.com/business/help)
- [Facebook Developer Community](https://developers.facebook.com/community/)

## Security Best Practices

1. **Never commit tokens to git** - Use environment variables
2. **Use Page Access Tokens** - More stable than User Access Tokens
3. **Rotate tokens regularly** - Set up automatic token refresh
4. **Use HTTPS** - For all webhook and redirect URLs
5. **Validate permissions** - Check token permissions before API calls
6. **Monitor usage** - Track API calls and respect rate limits
7. **Handle errors gracefully** - Implement proper error handling
8. **Store tokens securely** - Use encrypted storage in production
9. **Implement logging** - Track API usage for debugging
10. **Follow Facebook policies** - Adhere to Platform Policy and Community Standards

## Testing Checklist

- [ ] Facebook Developer App created
- [ ] Facebook Page created and you're admin
- [ ] Required permissions granted
- [ ] Page Access Token generated
- [ ] Environment variables configured
- [ ] Test post successful
- [ ] Error handling implemented
- [ ] Rate limiting handled
- [ ] Token refresh mechanism in place
- [ ] Production deployment tested 