# 🚨 Resumax.work CORS Debugging Guide

## The Problem
Even though the server returns `Access-Control-Allow-Origin: *`, CORS is still failing.

## 🔍 Common CORS Issues

### 1. Missing Preflight Response
**Problem**: Browser sends OPTIONS request, but server doesn't handle it properly.

**Solution**: Server must respond to OPTIONS with:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

### 2. Headers Not on Preflight
**Problem**: CORS headers are only on POST response, not OPTIONS response.

**Solution**: BOTH OPTIONS and POST responses need CORS headers.

### 3. Wrong Content-Type
**Problem**: Server expects different Content-Type.

**Solution**: Try without Content-Type header or with `application/x-www-form-urlencoded`.

### 4. HTTPS/Mixed Content
**Problem**: Frontend is HTTPS, backend is HTTP (or vice versa).

**Solution**: Both must be same protocol.

## 🧪 Testing Steps

1. **Open test-resumax-cors.html** in browser
2. **Open DevTools** (F12) → Network tab
3. **Click "Test OPTIONS"** - should return 200
4. **Click "Test POST"** - check if it works
5. **Look for TWO requests** in Network tab:
   - OPTIONS (preflight)
   - POST (actual request)

## 📊 What to Check

### In DevTools Network Tab:
1. **OPTIONS Request**:
   - Status should be **200** or **204**
   - Response headers should include:
     ```
     access-control-allow-origin: *
     access-control-allow-methods: POST, OPTIONS
     access-control-allow-headers: content-type
     ```

2. **POST Request**:
   - Response headers should include:
     ```
     access-control-allow-origin: *
     ```

## 🔧 Possible Solutions

### Solution 1: Remove Content-Type Header
If the server doesn't need JSON:
```javascript
const response = await fetch('https://llama-endpoint.resumax.work/generate', {
  method: 'POST',
  body: JSON.stringify(requestData)
  // No headers at all
})
```

### Solution 2: Use Form Data
If server expects form data:
```javascript
const formData = new FormData()
formData.append('desired_job', 'Software Engineer')
// ... etc

const response = await fetch('https://llama-endpoint.resumax.work/generate', {
  method: 'POST',
  body: formData
  // No Content-Type header
})
```

### Solution 3: Use Proxy
Create a simple proxy that forwards requests:
```javascript
// In your backend
app.post('/api/recommendations', async (req, res) => {
  const response = await fetch('https://llama-endpoint.resumax.work/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req.body)
  })
  const data = await response.json()
  res.json(data)
})
```

## 🚨 If Server CORS is Correct

If the server IS returning correct CORS headers but it's still failing:

1. **Browser cache**: Clear browser cache and try again
2. **CORS extension**: Disable any CORS browser extensions
3. **Incognito mode**: Try in incognito/private window
4. **Different browser**: Try in different browser

## 📞 Next Steps

1. **Test with the HTML file first**
2. **Check DevTools Network tab for exact error**
3. **Share the exact error message** from Console
4. **Share the OPTIONS response headers** from Network tab

Then we can fix the exact issue!
