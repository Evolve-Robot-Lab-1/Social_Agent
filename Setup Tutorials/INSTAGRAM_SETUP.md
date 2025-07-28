# Instagram API Setup Guide

This guide will walk you through setting up Instagram posting functionality for your application.

## Prerequisites

1. **Instagram Business Account** (not a personal account)
2. **Facebook Page** connected to your Instagram Business account
3. **Facebook Developer Account**
4. **Meta App** with Instagram permissions

## Step-by-Step Setup

### 1. Convert to Instagram Business Account

1. Open your Instagram app on mobile
2. Go to Settings → Account → Switch to professional account
3. Choose **Business** (not Creator)
4. Complete the business setup process
5. **Important**: Connect your Instagram Business account to a Facebook Page

### 2. Create Facebook Developer App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **My Apps** → **Create App**
3. Choose **Business** as app type
4. Fill in app details:
   - **App Name**: Your app name
   - **App Contact Email**: Your email
   - **Business Account**: Select or create one

### 3. Add Instagram Basic Display Product

1. In your Facebook App dashboard, click **Add Product**
2. Find **Instagram Basic Display** and click **Set Up**
3. Go to **Instagram Basic Display** → **Basic Display**
4. Add your website URL in **Valid OAuth Redirect URIs**:
   ```
   https://yourdomain.com/auth/instagram/callback
   ```

### 4. Add Instagram Graph API Product

1. In your app dashboard, click **Add Product**
2. Find **Instagram Graph API** and click **Set Up**
3. This allows you to post content (not just read)

### 5. Generate Access Token

#### Method 1: Using Facebook Graph API Explorer (Recommended)

1. Go to [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Select your app from the dropdown
3. Click **Generate Access Token**
4. Add these permissions:
   - `instagram_basic`
   - `instagram_content_publish`
   - `pages_read_engagement`
   - `pages_show_list`
5. Click **Generate Access Token** and copy it

#### Method 2: Using Facebook Access Token Tool

1. Go to [Access Token Tool](https://developers.facebook.com/tools/accesstoken/)
2. Find your app and click **Generate Token**
3. Copy the **User Access Token**

### 6. Get Your Instagram Business User ID

#### Using Graph API Explorer:

1. In Graph API Explorer, paste this in the query field:
   ```
   me/accounts
   ```
2. Click **Submit** to see your Facebook Pages
3. Find your Facebook Page and copy its `id`
4. Then query:
   ```
   {PAGE_ID}?fields=instagram_business_account
   ```
5. The response will contain your Instagram Business User ID

#### Using Browser (Alternative):

1. Open Instagram in browser
2. Go to your profile
3. Right-click → **View Page Source**
4. Search for `"profilePage_"` 
5. The number after it is your Instagram User ID

### 7. Add Environment Variables

Create or update your `.env` file:

```env
# Instagram API Configuration
INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token_here
INSTAGRAM_USER_ID=your_instagram_business_user_id_here

# Facebook API Configuration (if not already present)
FACEBOOK_USER_ACCESS_TOKEN=your_facebook_access_token_here
```

### 8. Test Your Setup

1. Run your application
2. Generate a social media post with Instagram selected
3. Click the **Post to Instagram** button
4. Enter your Instagram Business User ID when prompted
5. Check if the post appears on your Instagram account

## Important Notes

### Token Expiration

- **Short-lived tokens** expire in 1-2 hours
- **Long-lived tokens** expire in 60 days
- You need to refresh tokens before they expire

### To Get Long-lived Token:

```bash
curl -i -X GET "https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id={APP_ID}&client_secret={APP_SECRET}&fb_exchange_token={SHORT_LIVED_TOKEN}"
```

### Instagram Posting Requirements

1. **Images are required** - Instagram doesn't allow text-only posts
2. **Image formats**: JPG, PNG (HEIC not supported via API)
3. **Image size**: Min 320px, Max 8192px on any side
4. **Aspect ratio**: Between 4:5 and 1.91:1
5. **File size**: Max 8MB for images

### Common Issues

#### "Invalid User ID"
- Make sure you're using Instagram **Business** User ID, not personal
- Verify the account is connected to a Facebook Page

#### "Invalid Access Token"
- Token might be expired
- Make sure you have the right permissions
- Regenerate token if needed

#### "Image URL Not Accessible"
- Instagram must be able to access your image URL
- Make sure the URL is publicly accessible
- Use HTTPS URLs when possible

#### "Unsupported Image Format"
- Convert images to JPG or PNG
- Ensure image meets size requirements

### Permissions Required

- `instagram_basic` - Read basic profile info
- `instagram_content_publish` - Publish content
- `pages_read_engagement` - Read page engagement
- `pages_show_list` - List user's pages

### API Limits

- **Rate limiting**: 200 calls per hour per user
- **Daily limit**: 1000 posts per day
- **Concurrent posts**: Max 25 pending posts at a time

## Troubleshooting

### Check App Status
1. Go to your Facebook App dashboard
2. Check if app is in **Development** or **Live** mode
3. For testing, Development mode is fine
4. For production, submit app for review

### Verify Permissions
```bash
curl -i -X GET "https://graph.facebook.com/v18.0/me/permissions?access_token={ACCESS_TOKEN}"
```

### Test Token
```bash
curl -i -X GET "https://graph.facebook.com/v18.0/me?access_token={ACCESS_TOKEN}"
```

## Support Resources

- [Instagram Basic Display API Documentation](https://developers.facebook.com/docs/instagram-basic-display-api)
- [Instagram Graph API Documentation](https://developers.facebook.com/docs/instagram-api)
- [Facebook App Review Process](https://developers.facebook.com/docs/app-review)
- [Meta Business Help Center](https://www.facebook.com/business/help)

## Security Best Practices

1. **Never commit tokens to git** - Use environment variables
2. **Rotate tokens regularly** - Set up automatic refresh
3. **Use HTTPS** - For all webhook and redirect URLs
4. **Validate permissions** - Check token permissions regularly
5. **Monitor usage** - Keep track of API calls and limits 