#!/bin/bash

# Create the Lambda function
FUNCTION_NAME="resumax-save-user"
REGION="us-east-1"

echo "Creating Lambda function: $FUNCTION_NAME in region $REGION..."

# Create a simple Python function
cat > lambda_function.py << 'EOF'
import json
import boto3
from datetime import datetime

def lambda_handler(event, context):
    # CORS headers
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS'
    }
    
    # Handle OPTIONS preflight request
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({'message': 'CORS preflight successful'})
        }
    
    try:
        # Initialize DynamoDB
        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table('resumax-user-data')
        
        # Get user ID from JWT token (if available)
        user_id = 'anonymous'
        if 'headers' in event and 'Authorization' in event['headers']:
            # Extract user ID from JWT token here
            # For now, using a simple approach
            user_id = 'user_' + str(int(datetime.now().timestamp()))
        
        # Handle different HTTP methods
        http_method = event.get('httpMethod', 'POST')
        
        if http_method == 'GET':
            # Get user data
            response = table.get_item(
                Key={
                    'userId': user_id,
                    'dataType': 'profile'
                }
            )
            
            if 'Item' in response:
                return {
                    'statusCode': 200,
                    'headers': cors_headers,
                    'body': json.dumps(response['Item'])
                }
            else:
                return {
                    'statusCode': 404,
                    'headers': cors_headers,
                    'body': json.dumps({'message': 'User data not found'})
                }
        
        elif http_method in ['POST', 'PUT']:
            # Save/update user data
            body = json.loads(event.get('body', '{}'))
            
            item = {
                'userId': user_id,
                'dataType': 'profile',
                'data': body,
                'lastUpdated': datetime.now().isoformat()
            }
            
            table.put_item(Item=item)
            
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({
                    'message': 'User data saved successfully',
                    'userId': user_id
                })
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': cors_headers,
                'body': json.dumps({'message': 'Method not allowed'})
            }
            
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({
                'message': 'Internal server error',
                'error': str(e)
            })
        }
EOF

# Create deployment package
zip lambda_function.zip lambda_function.py

# Create the Lambda function
aws lambda create-function \
    --function-name $FUNCTION_NAME \
    --runtime python3.9 \
    --role arn:aws:iam::137792805243:role/lambda-execution-role \
    --handler lambda_function.lambda_handler \
    --zip-file fileb://lambda_function.zip \
    --region $REGION

if [ $? -eq 0 ]; then
    echo "✅ Lambda function $FUNCTION_NAME created successfully!"
    
    # Add DynamoDB permissions
    echo "Adding DynamoDB permissions..."
    aws lambda add-permission \
        --function-name $FUNCTION_NAME \
        --statement-id dynamodb-permissions \
        --action lambda:InvokeFunction \
        --principal dynamodb.amazonaws.com \
        --region $REGION
else
    echo "❌ Error creating Lambda function. It might already exist."
fi

# Clean up
rm lambda_function.py lambda_function.zip

echo "Done!"
