import AWS from 'aws-sdk';
const dynamodb = new AWS.DynamoDB.DocumentClient();

export const handler = async (event) => {
    // CORS headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS'
    };
    
    // Handle OPTIONS preflight request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ message: 'CORS preflight successful' })
        };
    }
    
    try {
        // Get user ID
        let userId = 'user_' + Date.now();
        
        const httpMethod = event.httpMethod || 'POST';
        
        if (httpMethod === 'GET') {
            // Get user data
            const params = {
                TableName: 'resumax-user-data',
                Key: {
                    userId: userId,
                    dataType: 'profile'
                }
            };
            
            const result = await dynamodb.get(params).promise();
            
            if (result.Item) {
                return {
                    statusCode: 200,
                    headers: corsHeaders,
                    body: JSON.stringify(result.Item)
                };
            } else {
                return {
                    statusCode: 404,
                    headers: corsHeaders,
                    body: JSON.stringify({ message: 'User data not found' })
                };
            }
        } 
        else if (httpMethod === 'POST' || httpMethod === 'PUT') {
            // Save user data
            const body = JSON.parse(event.body || '{}');
            
            const params = {
                TableName: 'resumax-user-data',
                Item: {
                    userId: userId,
                    dataType: 'profile',
                    data: body,
                    lastUpdated: new Date().toISOString()
                }
            };
            
            await dynamodb.put(params).promise();
            
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({
                    message: 'User data saved successfully',
                    userId: userId
                })
            };
        }
        else {
            return {
                statusCode: 405,
                headers: corsHeaders,
                body: JSON.stringify({ message: 'Method not allowed' })
            };
        }
        
    } catch (error) {
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                message: 'Internal server error',
                error: error.message
            })
        };
    }
};