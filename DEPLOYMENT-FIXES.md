# 🚀 Deployment Fix Guide - Client Connection Issues

## Problem
Client deployed on Vercel/AWS can't connect to server, but works locally and Postman works fine.

## Root Cause
1. **CORS Configuration** - Server blocking requests from deployed client URLs
2. **Environment Variables** - Client using localhost URLs in production
3. **Hardcoded URLs** - Some components have hardcoded localhost URLs

---

## ✅ Solutions Applied

### 1. Server CORS Fix (server/.env)
```env
# Add your deployed client URLs
ALLOWED_ORIGINS=http://localhost:5173,https://your-vercel-app.vercel.app,http://your-aws-ec2-ip

# Update server URL
SERVER_URL=http://3.108.221.6:3000

# Set to production
NODE_ENV=production
```

### 2. Client Environment Configuration

#### For Vercel Deployment:
Add environment variable in Vercel dashboard:
```
VITE_SERVER_URL = http://3.108.221.6:3000
```

#### For AWS EC2 Deployment:
Create `.env.production` file:
```
VITE_SERVER_URL=http://3.108.221.6:3000
```

---

## 🔧 Step-by-Step Fix

### Step 1: Update Server Environment
```bash
# SSH to your AWS server
ssh -i "your-key.pem" ubuntu@3.108.221.6

# Edit server environment
cd /home/ubuntu/Yellow.ai/server
nano .env
```

Add these lines to `.env`:
```env
ALLOWED_ORIGINS=http://localhost:5173,https://your-vercel-app.vercel.app,http://your-aws-instance-ip
SERVER_URL=http://3.108.221.6:3000
NODE_ENV=production
```

### Step 2: Restart Server
```bash
pm2 restart yellowai-server
# or
pm2 restart all
```

### Step 3: Deploy Client with Correct Environment

#### For Vercel:
1. Go to your Vercel dashboard
2. Select your project → Settings → Environment Variables
3. Add: `VITE_SERVER_URL` = `http://3.108.221.6:3000`
4. Redeploy your project

#### For AWS EC2:
```bash
# Update client build with production env
cd /path/to/your/client
echo "VITE_SERVER_URL=http://3.108.221.6:3000" > .env.production
npm run build
```

---

## 🧪 Testing the Fix

### 1. Test CORS Headers
```bash
curl -H "Origin: https://your-vercel-app.vercel.app" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     http://3.108.221.6:3000/api/user/data
```

Should return CORS headers.

### 2. Test Client Connection
Open browser developer tools → Network tab → Try login/register

Should see requests going to `http://3.108.221.6:3000` instead of `localhost:3000`

---

## 📝 Vercel Configuration

### Add to vercel.json (client folder):
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "http://3.108.221.6:3000/api/:path*"
    }
  ],
  "env": {
    "VITE_SERVER_URL": "http://3.108.221.6:3000"
  }
}
```

### Or use Vercel Environment Variables:
1. Vercel Dashboard → Your Project
2. Settings → Environment Variables
3. Add: 
   - Name: `VITE_SERVER_URL`
   - Value: `http://3.108.221.6:3000`
   - Environments: Production, Preview

---

## 🔍 Debug Commands

### Check Server CORS:
```bash
# Test from your deployed client URL
curl -H "Origin: https://your-app.vercel.app" \
     -X GET http://3.108.221.6:3000/health
```

### Check Client Environment:
```javascript
// Add to your client console
console.log('Server URL:', import.meta.env.VITE_SERVER_URL);
console.log('All env vars:', import.meta.env);
```

### Check Server Logs:
```bash
# On your AWS server
pm2 logs yellowai-server
```

---

## 🚨 Common Issues & Fixes

### 1. Still Getting CORS Error
**Solution**: Add your exact deployed URL to `ALLOWED_ORIGINS`
```bash
# Get your exact Vercel URL and add it
ALLOWED_ORIGINS=http://localhost:5173,https://yellow-ai-abc123.vercel.app
```

### 2. Environment Variables Not Loading
**Solution**: Check Vite env var naming
- Must start with `VITE_`
- Rebuild after adding env vars

### 3. Mixed Content (HTTP/HTTPS)
**Solution**: If client is HTTPS, server should be HTTPS too
- Add SSL certificate to your AWS server
- Or deploy server on Vercel/Railway too

### 4. Still Using localhost
**Solution**: Clear browser cache and hard refresh
```
Ctrl+Shift+R (Windows)
Cmd+Shift+R (Mac)
```

---

## 🎯 Quick Verification Checklist

- [ ] Server `.env` has correct `ALLOWED_ORIGINS`
- [ ] Server restarted after env changes
- [ ] Client has `VITE_SERVER_URL` environment variable
- [ ] Client rebuilt after env changes
- [ ] Browser cache cleared
- [ ] No hardcoded localhost URLs in client code
- [ ] Network tab shows requests to correct server URL

---

## 💡 Pro Tips

1. **Use HTTPS**: Deploy both client and server with SSL
2. **Use Railway/Render**: They handle CORS automatically
3. **Environment Variables**: Always use env vars, never hardcode URLs
4. **Testing**: Test with your deployed URLs, not just localhost

---

**After applying these fixes, your client should connect successfully to the server from any deployment platform! 🎉**