# API Security Documentation

## Current Security Issues

Your site currently stores the Google Drive API key and rootFolderId directly in client-side JavaScript code (visible in files like `videos.html:161-162`, `photos.html:161-162`, etc.):

```javascript
const CONFIG = {
    apiKey: 'AIzaSyA8lfUHsneUaeCaZnqA97nfxuE1KmdDbFY',
    rootFolderId: '106ou0uHbipb2aBFHSEatwPXaikLps2jv',
    // ...
};
```

### Security Vulnerabilities

1. **Exposed API Key**: Anyone viewing the page source can see and copy your API key
2. **Quota Abuse**: Attackers can use your API key for their own purposes, consuming your quota
3. **Data Access**: The rootFolderId exposes your Google Drive folder structure
4. **No Rate Limiting**: Client-side keys have no built-in protection against abuse
5. **Credential Rotation**: Changing compromised keys requires updating all HTML files

---

## Understanding Client-Side vs Server-Side Security

### Important Reality Check

**Client-side obfuscation is NOT real security.** Any code running in the browser can be:
- Inspected using DevTools
- Deobfuscated using readily available tools
- Intercepted at the network level
- Reverse-engineered from API calls

### Why This Matters

For Google Drive API keys used in public websites:
- The API key is **meant** to be somewhat public-facing for browser apps
- Google provides API key restrictions to mitigate abuse
- The key should be restricted, not hidden

---

## Recommended Security Measures

### 1. API Key Restrictions (CRITICAL - Do This First)

Configure your Google Cloud API key with the following restrictions:

#### Application Restrictions
```
Set HTTP referrers (websites):
  - https://yourdomain.com/*
  - http://localhost:* (for development)
```

#### API Restrictions
```
Restrict key to only:
  - Google Drive API
```

**How to Configure:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to: APIs & Services → Credentials
3. Click on your API key
4. Under "Application restrictions", select "HTTP referrers"
5. Add your domain(s)
6. Under "API restrictions", select "Restrict key"
7. Choose only "Google Drive API"

### 2. OAuth 2.0 Implementation (Most Secure)

Instead of API keys, implement OAuth 2.0 user authentication:

**Benefits:**
- Users authenticate with their own Google account
- No API key exposure
- Access is per-user, not per-application
- Built-in rate limiting per user

**Implementation:**
```javascript
function initClient() {
    gapi.client.init({
        clientId: 'YOUR_CLIENT_ID.apps.googleusercontent.com',
        scope: 'https://www.googleapis.com/auth/drive.readonly',
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
    }).then(() => {
        // Handle sign-in
        gapi.auth2.getAuthInstance().signIn();
    });
}
```

### 3. Backend Proxy Server (Recommended for Production)

Create a backend server that handles API requests:

**Architecture:**
```
Browser → Your Backend → Google Drive API
         (API key hidden)
```

**Example (Node.js/Express):**
```javascript
// server.js
const express = require('express');
const { google } = require('googleapis');
const app = express();

const drive = google.drive({
    version: 'v3',
    auth: process.env.GOOGLE_API_KEY // Stored securely
});

app.get('/api/files/:folderId', async (req, res) => {
    try {
        const response = await drive.files.list({
            q: `'${req.params.folderId}' in parents and trashed=false`,
            fields: 'files(id, name, mimeType, thumbnailLink)',
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch files' });
    }
});

app.listen(3000);
```

**Frontend Update:**
```javascript
async function loadFiles(folderId) {
    const response = await fetch(`/api/files/${folderId}`);
    const data = await response.json();
    // Process files...
}
```

---

## Obfuscation Techniques (Defense in Depth)

**⚠️ Warning:** These are NOT security measures, but can slow down casual attackers.

### Option 1: Environment Configuration File

Create a separate config file that's loaded dynamically:

**config.js:**
```javascript
(function(window) {
    window.APP_CONFIG = {
        apiKey: atob('QUl6YVN5QThsZlVIc25lVWFlQ2FabnFBOTduZnh1RTFLbWREYkZZ'),
        rootFolderId: atob('MTA2b3UwdUhiaXBiMmFCRkhTRWF0d1BYYWlrTHBzMmp2'),
    };
})(window);
```

**In HTML:**
```html
<script src="config.js"></script>
<script>
    const CONFIG = {
        apiKey: window.APP_CONFIG.apiKey,
        rootFolderId: window.APP_CONFIG.rootFolderId,
        // ...
    };
</script>
```

### Option 2: Base64 Encoding (Minimal Obfuscation)

```javascript
const CONFIG = {
    apiKey: atob('QUl6YVN5QThsZlVIc25lVWFlQ2FabnFBOTduZnh1RTFLbWREYkZZ'),
    rootFolderId: atob('MTA2b3UwdUhiaXBiMmFCRkhTRWF0d1BYYWlrTHBzMmp2'),
    collectionName: 'Videos',
};
```

**Note:** Easily reversible - anyone can run `atob()` in the console.

### Option 3: Simple Character Manipulation

```javascript
function decodeKey(encoded) {
    return encoded.split('').reverse().join('').replace(/_/g, '');
}

const CONFIG = {
    apiKey: decodeKey('YFbDdmK1EuxfnA_97nqAZnaCeaUen_sHUflA8ySazIA'),
    rootFolderId: decodeKey('vj2spLkiaXPwtaESlZHFBa2bpiHbu0uo601'),
    collectionName: 'Videos',
};
```

### Option 4: Split Storage

```javascript
const parts = {
    p1: 'AIzaSyA8lf',
    p2: 'UHsneUaeC',
    p3: 'aZnqA97nf',
    p4: 'xuE1KmdDbFY'
};

const CONFIG = {
    apiKey: parts.p1 + parts.p2 + parts.p3 + parts.p4,
    rootFolderId: '106ou0u' + 'Hbipb2a' + 'BFHSEa' + 'twPXaik' + 'Lps2jv',
};
```

### Option 5: Time-Based Rotation (Advanced)

Generate time-limited access tokens on a server:

```javascript
// Server generates short-lived tokens
app.get('/api/token', (req, res) => {
    const token = generateTemporaryToken(3600); // 1 hour
    res.json({ token, expiresIn: 3600 });
});

// Client fetches and uses token
async function getApiToken() {
    const response = await fetch('/api/token');
    const { token } = await response.json();
    return token;
}
```

---

## Implementation Roadmap

### Phase 1: Immediate Actions (Do Now)
1. ✅ Apply API key restrictions in Google Cloud Console
2. ✅ Restrict to your domain only
3. ✅ Limit to Drive API only
4. ✅ Monitor usage in Google Cloud Console

### Phase 2: Quick Improvements (This Week)
1. Extract configuration to separate file
2. Apply basic obfuscation (Base64 encoding)
3. Add loading state to prevent key exposure timing
4. Document security measures

### Phase 3: Production Security (Recommended)
1. Implement OAuth 2.0 authentication
2. Create backend proxy server
3. Add rate limiting
4. Implement logging and monitoring
5. Set up alerting for unusual activity

---

## Monitoring and Detection

### Google Cloud Console Monitoring

1. Navigate to: APIs & Services → Dashboard
2. Monitor:
   - Request volume
   - Error rates
   - Traffic sources
   - Quota usage

### Set Up Alerts

Create alerts for:
- Unusual traffic spikes
- Quota approaching limits
- Requests from unexpected referrers
- High error rates

---

## What to Do If Compromised

If you suspect your API key has been compromised:

1. **Immediately** generate a new API key in Google Cloud Console
2. Apply restrictions to the new key
3. Update all your HTML files with the new key
4. Delete the old key
5. Review usage logs for unauthorized access
6. Consider implementing OAuth 2.0 for better security

---

## Best Practices Summary

### ✅ DO
- Use API key restrictions (domain, API limits)
- Implement OAuth 2.0 for production
- Use a backend proxy for sensitive operations
- Monitor API usage regularly
- Rotate keys periodically
- Keep security measures documented

### ❌ DON'T
- Rely solely on obfuscation for security
- Expose API keys in public repositories
- Use the same key for development and production
- Ignore quota warnings
- Grant more API access than needed

---

## Additional Resources

- [Google API Key Best Practices](https://cloud.google.com/docs/authentication/api-keys)
- [Google Drive API Documentation](https://developers.google.com/drive/api/v3/about-sdk)
- [OAuth 2.0 for Client-side Web Apps](https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)

---

## Quick Reference: Encoding/Decoding

### Generate Base64 Encoded Values

```javascript
// In browser console:
btoa('YOUR_API_KEY')           // Encode
atob('ENCODED_STRING')         // Decode

// Example:
btoa('AIzaSyA8lfUHsneUaeCaZnqA97nfxuE1KmdDbFY')
// Returns: 'QUl6YVN5QThsZlVIc25lVWFlQ2FabnFBOTduZnh1RTFLbWREYkZZ'
```

---

## Conclusion

**The most important security measure is API key restriction in Google Cloud Console.** Obfuscation alone provides minimal security. For production applications handling sensitive data, implement OAuth 2.0 or a backend proxy server.

Remember: Security is a layered approach. Combine multiple techniques for the best protection.
