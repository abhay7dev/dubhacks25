# 🚨 URGENT: Fix CORS for Chatbot Lambda

## The Problem
Your Lambda function is returning responses but CORS headers are missing, causing "Failed to fetch" errors.

## 🔧 IMMEDIATE FIX

### Step 1: Update Your Lambda Function
Add these CORS headers to EVERY response in your Lambda:

```python
def lambda_handler(event, context):
    # ADD THIS AT THE TOP OF YOUR LAMBDA
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS'
    }
    
    # Handle OPTIONS preflight request
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({'message': 'CORS preflight'})
        }
    
    try:
        # Your existing code...
        
        # Return response with CORS headers
        return {
            'statusCode': 200,
            'headers': cors_headers,  # ADD THIS LINE
            'body': json.dumps({
                'response': gemini_response,
                'request_id': context.aws_request_id
            })
        }
        
    except Exception as e:
        # Error response with CORS headers
        return {
            'statusCode': 500,
            'headers': cors_headers,  # ADD THIS LINE
            'body': json.dumps({
                'error': 'Internal server error',
                'details': str(e)
            })
        }
```

### Step 2: Update API Gateway CORS (if using REST API)
1. Go to API Gateway Console
2. Select your API
3. Go to Actions → Enable CORS
4. Set these values:
   - Access-Control-Allow-Origin: *
   - Access-Control-Allow-Headers: Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token
   - Access-Control-Allow-Methods: GET,POST,PUT,OPTIONS
5. Click "Enable CORS and replace existing CORS headers"
6. Deploy API

### Step 3: For HTTP API (API Gateway v2)
1. Go to API Gateway Console
2. Select your HTTP API
3. Go to CORS in left sidebar
4. Configure CORS:
   - Access-Control-Allow-Origin: *
   - Access-Control-Allow-Headers: Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token
   - Access-Control-Allow-Methods: GET,POST,PUT,OPTIONS
   - Access-Control-Allow-Credentials: false
5. Save

## 🚀 QUICK TEST
After updating, test with the debug page to confirm CORS is working.

## 🔥 EMERGENCY WORKAROUND
If you need it working RIGHT NOW, temporarily disable CORS in your browser:
1. Open Chrome with: `chrome.exe --user-data-dir=/tmp/foo --disable-web-security --disable-features=VizDisplayCompositor`
2. Test your chatbot
3. Remember to fix CORS properly after testing!

## 💡 WHY THIS HAPPENS
Browsers block requests to different origins (your frontend → Lambda) unless the server explicitly allows it with CORS headers.
