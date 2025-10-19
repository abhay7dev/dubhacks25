import json
import boto3
from datetime import datetime

def lambda_handler(event, context):
    # CORS headers for all responses
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS'
    }
    
    # Initialize DynamoDB
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('ResuMAXUsers')
    
    # Get HTTP method
    http_method = event.get('httpMethod')  # REST API format
    if not http_method and 'requestContext' in event:
        # HTTP API (v2) format
        http_method = event.get('requestContext', {}).get('http', {}).get('method', 'GET')    

    # Handle preflight OPTIONS request
    if http_method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({'message': 'CORS preflight'})
        }

    try:
        if http_method == 'GET':
            # GET: Only READ data, don't create anything
            print("GET request - reading data only")
            
            # Extract user ID from query parameters or use default
            query_params = event.get('queryStringParameters') or {}
            user_id = query_params.get('userId', 'authenticated_user')
            
            # Query DynamoDB for existing data - FIXED: userID not userId
            response = table.query(
                KeyConditionExpression=boto3.dynamodb.conditions.Key('userID').eq(user_id)
            )
            
            if response['Items']:
                # User data exists, return it
                user_data = response['Items'][0]  # Get first item
                return {
                    'statusCode': 200,
                    'headers': cors_headers,
                    'body': json.dumps({
                        'message': 'User data found',
                        'userId': user_id,
                        'data': user_data
                    })
                }
            else:
                # No data found, return 404 (don't create anything)
                return {
                    'statusCode': 404,
                    'headers': cors_headers,
                    'body': json.dumps({'message': 'No user data found', 'userId': user_id})
                }
        
        elif http_method == 'POST':
            # POST: CREATE/UPDATE data (upsert - no checking needed)
            print("POST request - creating/updating data")
            
            # Parse request body
            if not event.get('body'):
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'message': 'No data provided'})
                }
            
            body = json.loads(event['body'])
            
            # Extract user ID from Authorization header (JWT token)
            user_id = 'authenticated_user'  # Default fallback
            
            # Try to get user ID from the authorizer context (if using API Gateway authorizer)
            if 'requestContext' in event and 'authorizer' in event['requestContext']:
                authorizer = event['requestContext']['authorizer']
                # For JWT authorizers, the claims are in 'jwt.claims'
                if 'jwt' in authorizer and 'claims' in authorizer['jwt']:
                    user_id = authorizer['jwt']['claims'].get('sub') or authorizer['jwt']['claims'].get('cognito:username', 'authenticated_user')
                # For Lambda authorizers, check principalId
                elif 'principalId' in authorizer:
                    user_id = authorizer['principalId']
            
            # Fallback: check if userId is in the body
            if user_id == 'authenticated_user' and 'userId' in body:
                user_id = body.get('userId')
            
            print(f"👤 Using user ID: {user_id}")
            
            # Just save directly - put_item will create OR update
            item = {
                'userID': user_id,
                'dataType': 'user_data',
                'formData': body.get('formData', {}),
                'recommendations': body.get('recommendations', {}),
                'completedActivities': body.get('completedActivities', {}),
                'lastUpdated': datetime.utcnow().isoformat()
            }
            
            table.put_item(Item=item)  # This creates OR updates - no error!
            
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({
                    'message': 'User data saved successfully',
                    'userId': user_id,
                    'data': item
                })
            }
        
        elif http_method == 'PUT':
            # PUT: UPDATE existing data
            print("PUT request - updating existing data")
            
            # Parse request body
            if not event.get('body'):
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'message': 'No data provided'})
                }
            
            body = json.loads(event['body'])
            user_id = body.get('userId', 'authenticated_user')
            
            # Update existing item in DynamoDB - FIXED: userID not userId
            update_expression = "SET formData = :formData, recommendations = :recommendations, completedActivities = :completedActivities, lastUpdated = :lastUpdated"
            expression_values = {
                ':formData': body.get('formData', {}),
                ':recommendations': body.get('recommendations', {}),
                ':completedActivities': body.get('completedActivities', {}),
                ':lastUpdated': datetime.utcnow().isoformat()
            }
            
            table.update_item(
                Key={'userID': user_id, 'dataType': 'user_data'},  # Changed
                UpdateExpression=update_expression,
                ExpressionAttributeValues=expression_values
            )
            
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({
                    'message': 'User data updated successfully',
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
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'message': f'Internal server error: {str(e)}'})
        }