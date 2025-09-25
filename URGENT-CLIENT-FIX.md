# 🚨 URGENT FIX - Client Connection Issues

## Your Current Issue
✅ Server running: `http://3.108.221.6:3000`  
✅ Postman working fine  
✅ Local client working  
❌ Vercel client not connecting  
❌ AWS client not connecting  

---

## 🎯 IMMEDIATE FIXES NEEDED

### 1. Fix Server CORS (Do This First!)

SSH to your AWS server and update the `.env` file:

```bash
# SSH to server
ssh -i "your-key.pem" ubuntu@3.108.221.6

# Go to server folder
cd /home/ubuntu/Yellow.ai/server

# Edit environment file
nano .env
```

**Replace this section in your `.env`:**
```env
# OLD - CHANGE THIS:
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:3000
NODE_ENV=development

# NEW - ADD THIS:
CLIENT_URL=http://localhost:5173
SERVER_URL=http://3.108.221.6:3000
NODE_ENV=production

# ADD YOUR DEPLOYED CLIENT URLS HERE:
ALLOWED_ORIGINS=http://localhost:5173,https://your-vercel-app.vercel.app,http://your-aws-client-ip
```

**Restart your server:**
```bash
pm2 restart yellowai-server
```

### 2. Fix Client Environment Variables

#### For Vercel Deployment:
1. Go to your Vercel dashboard
2. Select your Yellow.ai project
3. Go to Settings → Environment Variables
4. Add new variable:
   - **Name**: `VITE_SERVER_URL`
   - **Value**: `http://3.108.221.6:3000`
   - **Environment**: Production
5. Redeploy your project

#### For AWS EC2 Client:
```bash
# On your AWS client instance
cd /path/to/Yellow.ai/client

# Create production environment file
echo "VITE_SERVER_URL=http://3.108.221.6:3000" > .env.production

# Rebuild with production environment
npm run build

# If using nginx, copy dist folder
sudo cp -r dist/* /var/www/html/
```

---

## 🧪 Test the Fix

### 1. Quick Test - Check CORS:
```bash
# Test from command line
curl -H "Origin: https://your-vercel-app.vercel.app" \
     -X GET http://3.108.221.6:3000/health
```

### 2. Test in Browser:
1. Open your deployed client
2. Open Developer Tools (F12)
3. Go to Network tab
4. Try to login/register
5. Check if requests go to `3.108.221.6:3000` (not localhost)

---

## 📱 Step-by-Step Browser Test

### Open your deployed client and check:

1. **Console Tab**: Should NOT see CORS errors
2. **Network Tab**: All API calls should go to `3.108.221.6:3000`
3. **Login**: Should work without errors

### If still not working:

#### Check Console Errors:
- `Access-Control-Allow-Origin` error = CORS issue
- `net::ERR_NETWORK_CHANGED` = Wrong URL
- `Failed to fetch` = Server not responding

---

## 🔧 Advanced Debugging

### 1. Check What URL Client is Using:
Add this to your client console:
```javascript
console.log('Server URL:', import.meta.env.VITE_SERVER_URL);
```

### 2. Check Server CORS Logs:
```bash
# On AWS server
pm2 logs yellowai-server --lines 50
```

### 3. Test Direct Server Response:
```bash
# Should return server status
curl http://3.108.221.6:3000/health
```

---

## 💊 Quick Medicine (If Above Doesn't Work)

### Option 1: Disable CORS Temporarily (Testing Only!)
```javascript
// In server.js, temporarily replace corsOptions with:
const corsOptions = {
    origin: true,  // Allow all origins (TESTING ONLY!)
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
};
```

### Option 2: Add Wildcard for Testing:
```env
# In server .env, add:
ALLOWED_ORIGINS=*
```

⚠️ **Remove these after testing! They're not secure for production.**

---

## 🎯 Expected Results After Fix

### ✅ Working Scenario:
1. Open deployed client URL
2. Network tab shows requests to `3.108.221.6:3000`
3. No CORS errors in console
4. Login/register works
5. AI chat works
6. All features work like localhost

### ❌ Still Broken Signs:
- Network requests still go to `localhost:3000`
- Console shows CORS errors
- Login button does nothing
- "Network Error" messages

---

## 🆘 If Nothing Works - Nuclear Option

### Deploy Server on Vercel Too:
```bash
# In your server folder, add vercel.json:
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ]
}

# Deploy server to Vercel
vercel --prod
```

Then use the Vercel server URL instead of AWS.

---

## 📞 Need Help?

### Share These Details:
1. Your Vercel app URL
2. Your AWS client IP (if using EC2 for client)
3. Console error messages
4. Network tab screenshot

### Quick Debug Commands:
```bash
# Test server is running
curl http://3.108.221.6:3000/health

# Test CORS with your client URL
curl -H "Origin: YOUR_CLIENT_URL" http://3.108.221.6:3000/health

# Check server logs
ssh ubuntu@3.108.221.6 "cd /home/ubuntu/Yellow.ai/server && pm2 logs yellowai-server --lines 20"
```

**Run these fixes and your client should connect! 🎉**