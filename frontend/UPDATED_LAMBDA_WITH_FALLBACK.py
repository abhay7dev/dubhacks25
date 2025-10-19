import json
import os
import urllib3
import time
import boto3
from decimal import Decimal

# Initialize HTTP client outside handler for reuse
http = urllib3.PoolManager()

# Initialize DynamoDB
try:
    dynamodb = boto3.resource('dynamodb')
    DYNAMODB_TABLE_NAME = os.environ.get('DYNAMODB_TABLE_NAME', 'ResuMAXUsers') 
    DYNAMODB_TABLE = dynamodb.Table(DYNAMODB_TABLE_NAME)
except Exception as e:
    print(f"Error initializing DynamoDB: {e}")

# Configuration
GEMINI_MODEL_NAME = 'gemini-pro'
MAX_RETRIES = 3
INITIAL_DELAY = 1

# CORS headers
CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
}

def create_response(status_code, body, headers=None):
    response_headers = {
        'Content-Type': 'application/json',
        **CORS_HEADERS
    }
    if headers:
        response_headers.update(headers)
    
    return {
        'statusCode': status_code,
        'headers': response_headers,
        'body': json.dumps(body)
    }

def get_resume_data(user_id):
    try:
        response = DYNAMODB_TABLE.get_item(
            Key={
                'userID': user_id,
                'dataType': 'RESUME_DATA'
            }
        )
        
        item = response.get('Item')
        
        if not item:
            print(f"No resume data found for user {user_id}")
            return None, None
        
        resume_text = item.get('resumeText', 'No resume uploaded.')
        recommendations = item.get('recommendations', {})
        
        return resume_text, recommendations
    
    except Exception as e:
        print(f"DynamoDB Read Error: {e}")
        return None, None


def get_chat_history(user_id):
    try:
        response = DYNAMODB_TABLE.get_item(
            Key={
                'userID': user_id,
                'dataType': 'CHAT_HISTORY'
            }
        )
        
        item = response.get('Item')
        
        if not item:
            return []
        
        chat_history = item.get('chatHistory', [])
        return chat_history
    
    except Exception as e:
        print(f"DynamoDB Read Error: {e}")
        return []


def update_chat_history(user_id, new_history):
    trimmed_history = new_history[-10:]
    
    try:
        DYNAMODB_TABLE.put_item(
            Item={
                'userID': user_id,
                'dataType': 'CHAT_HISTORY',
                'chatHistory': trimmed_history,
                'updatedAt': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
            }
        )
        return True
    except Exception as e:
        print(f"DynamoDB Write Error: {e}")
        return False


def format_recommendations(recommendations):
    if not recommendations:
        return "No recommendations available yet."
    
    formatted = []
    
    if 'strengths' in recommendations:
        formatted.append("STRENGTHS:")
        strengths = recommendations['strengths']
        if isinstance(strengths, list):
            for strength in strengths:
                formatted.append(f"  • {strength}")
        else:
            formatted.append(f"  • {strengths}")
    
    if 'gaps' in recommendations:
        formatted.append("\nGAPS TO ADDRESS:")
        gaps = recommendations['gaps']
        if isinstance(gaps, list):
            for gap in gaps:
                formatted.append(f"  • {gap}")
        else:
            formatted.append(f"  • {gaps}")
    
    if 'actionPlan' in recommendations:
        action_plan = recommendations['actionPlan']
        
        if 'immediate' in action_plan:
            formatted.append("\nIMMEDIATE ACTIONS:")
            for action in action_plan['immediate']:
                if isinstance(action, dict):
                    formatted.append(f"  • {action.get('action', '')}")
                else:
                    formatted.append(f"  • {action}")
        
        if 'shortTerm' in action_plan:
            formatted.append("\nSHORT-TERM GOALS:")
            for action in action_plan['shortTerm']:
                if isinstance(action, dict):
                    formatted.append(f"  • {action.get('action', '')}")
                else:
                    formatted.append(f"  • {action}")
        
        if 'longTerm' in action_plan:
            formatted.append("\nLONG-TERM GOALS:")
            for action in action_plan['longTerm']:
                if isinstance(action, dict):
                    formatted.append(f"  • {action.get('action', '')}")
                else:
                    formatted.append(f"  • {action}")
    
    return '\n'.join(formatted)


def call_gemini_api(message, history, system_instruction, api_key):
    url = f'https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL_NAME}:generateContent?key={api_key}'    
    
    contents = []
    for msg in history:
        role = 'user' if msg.get('role') == 'user' else 'model'
        contents.append({
            'role': role,
            'parts': [{'text': msg.get('content', '')}]
        })
    
    contents.append({
        'role': 'user',
        'parts': [{'text': message}]
    })
    
    payload = {
        'contents': contents,
        'systemInstruction': {
            'parts': [{'text': system_instruction}]
        },
        'generationConfig': {
            'temperature': 0.7,
            'topK': 40,
            'topP': 0.95,
            'maxOutputTokens': 2048,
        }
    }
    
    encoded_data = json.dumps(payload).encode('utf-8')
    
    response = http.request(
        'POST',
        url,
        body=encoded_data,
        headers={'Content-Type': 'application/json'}
    )
    
    if response.status != 200:
        error_details = response.data.decode()
        raise Exception(f'Gemini API error: {response.status} - {error_details}')
    
    result = json.loads(response.data.decode('utf-8'))
    
    prompt_feedback = result.get('promptFeedback', {})
    if prompt_feedback.get('blockReason'):
        return "I'm sorry, I cannot process that request due to safety policies."

    if 'candidates' in result and len(result['candidates']) > 0:
        candidate = result['candidates'][0]
        
        if candidate.get('finishReason') == 'SAFETY':
            return "The response was blocked by safety filters."

        if 'content' in candidate and 'parts' in candidate['content']:
            text_parts = [part['text'] for part in candidate['content']['parts'] if 'text' in part]
            if text_parts:
                return ' '.join(text_parts)
    
    raise Exception('Unexpected response format from Gemini API')


def call_gemini_api_with_retry(message, history, system_instruction, api_key):
    delay = INITIAL_DELAY
    for i in range(MAX_RETRIES):
        try:
            return call_gemini_api(message, history, system_instruction, api_key)
        except Exception as e:
            if i < MAX_RETRIES - 1:
                print(f"Retry {i+1}/{MAX_RETRIES} after error: {e}")
                time.sleep(delay)
                delay *= 2
            else:
                raise


def lambda_handler(event, context):
    # Get HTTP method
    http_method = event.get('httpMethod')
    if not http_method and 'requestContext' in event:
        http_method = event.get('requestContext', {}).get('http', {}).get('method')
    
    if not http_method:
        http_method = 'POST'
    
    print(f"HTTP Method: {http_method}")

    # Handle OPTIONS
    if http_method == 'OPTIONS':
        return create_response(200, {'message': 'CORS preflight'})
    
    try:
        body = json.loads(event.get('body', '{}'))
        user_message = body.get('message', '')
        user_id = body.get('userId')
        
        if not user_message:
            return create_response(400, {'error': 'Message is required'})
        
        if not user_id:
            return create_response(400, {'error': 'userId is required'})
        
        api_key = os.environ.get('GEMINI_API_KEY')
        if not api_key:
            return create_response(500, {'error': 'API key not configured'})
        
        # Get resume data and chat history
        resume_text, recommendations = get_resume_data(user_id)
        existing_history = get_chat_history(user_id)
        
        # Build system instruction based on available data
        if resume_text and resume_text != 'No resume uploaded.':
            # User has resume data - use it for context
            formatted_recs = format_recommendations(recommendations)
            
            system_instruction = f"""You are an expert resume advisor and career coach.

USER'S RESUME:
{resume_text[:3000]}

PERSONALIZED RECOMMENDATIONS:
{formatted_recs}

Help the user with their career questions. Be concise and actionable."""
        else:
            # No resume data - provide general career advice
            system_instruction = """You are a helpful career advisor and resume expert. The user hasn't uploaded a resume yet, so provide general career guidance and advice. 

You can help with:
- General career planning
- Resume writing tips
- Interview preparation
- Skill development
- Industry insights
- Networking strategies

Be encouraging, practical, and suggest they upload their resume for more personalized advice."""
        
        try:
            gemini_response = call_gemini_api_with_retry(
                user_message, 
                existing_history, 
                system_instruction, 
                api_key
            )
        except Exception as e:
            print(f"Gemini error: {e}")
            return create_response(500, {
                'error': 'Failed to get AI response',
                'details': str(e)
            })
        
        # Update chat history
        new_history = existing_history + [
            {'role': 'user', 'content': user_message},
            {'role': 'model', 'content': gemini_response}
        ]
        
        update_chat_history(user_id, new_history)
        
        return create_response(200, {
            'response': gemini_response,
            'request_id': context.aws_request_id
        })
        
    except json.JSONDecodeError:
        return create_response(400, {'error': 'Invalid JSON'})
    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return create_response(500, {
            'error': 'Internal server error',
            'details': str(e)
        })
