import json
import os
import boto3
from datetime import datetime
import urllib3

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('ResuMAXUsers')

# HTTP client
http = urllib3.PoolManager()

# Environment variable for your Gemini API key
API_KEY = os.environ.get('GEMINI_API_KEY')
MODEL = "gemini-2.5-flash"

def lambda_handler(event, context):
    # CORS headers
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS'
    }
    
    # Handle OPTIONS preflight
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({'message': 'CORS preflight successful'})
        }
    
    try:
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        user_id = body.get('userID', 'anonymous')
        message = body.get('message', '')
        user_profile = body.get('userProfile', {})
        recommendations = body.get('recommendations', {})
        previous_chats = body.get('previousChats', [])

        # Build context prompt
        context_prompt = build_context_prompt(user_profile, recommendations, previous_chats)
        full_prompt = f"{context_prompt}\n\nUser message: {message}\n\nRespond helpfully and conversationally."

        # Call Gemini API
        payload = {
            "model": MODEL,
            "input": full_prompt
        }

        response = http.request(
            "POST",
            f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={API_KEY}",
            body=json.dumps(payload),
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {API_KEY}"
            }
        )

        # Debug logs
        raw_response = response.data.decode("utf-8")
        print("HTTP status:", response.status)
        print("Raw Gemini response:", raw_response)

        # Try parsing JSON safely
        try:
            resp_data = json.loads(raw_response)
            ai_response = resp_data.get("outputText", "No output received.")
        except json.JSONDecodeError:
            ai_response = f"Error decoding Gemini response: {raw_response}"

        # Update chat history in DynamoDB
        updated_chats = update_chat_history(user_id, message, ai_response, previous_chats)

        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({
                'reply': ai_response,
                'chatHistory': updated_chats,
                'timestamp': datetime.now().isoformat()
            })
        }

    except Exception as e:
        print(f"Error in Lambda: {str(e)}")
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': str(e)})
        }


def build_context_prompt(user_profile, recommendations, previous_chats):
    profile_context = f"""
USER PROFILE:
- Name: {user_profile.get('firstName', '')} {user_profile.get('lastName', '')}
- Email: {user_profile.get('email', '')}
- School: {user_profile.get('school', '')}
- Major: {user_profile.get('major', '')}
- GPA: {user_profile.get('gpa', '')}
- Graduation Year: {user_profile.get('graduationYear', '')}
- Desired Occupation: {user_profile.get('desiredOccupation', '')}
- Target Companies: {', '.join(user_profile.get('targetCompanies', []))}
- Skills: {', '.join(user_profile.get('skills', []))}
- Interests: {', '.join(user_profile.get('interests', []))}
"""

    rec_context = ""
    if recommendations:
        rec_context = "\nCURRENT RECOMMENDATIONS:\n"
        if recommendations.get('actionPlan'):
            rec_context += "Action Plan:\n"
            for phase in recommendations['actionPlan']:
                rec_context += f"- {phase.get('priority', '')}: {phase.get('duration', '')}\n"
                for task in phase.get('tasks', []):
                    rec_context += f"  * {task.get('title', '')}: {task.get('description', '')[:100]}...\n"
        if recommendations.get('classes'):
            rec_context += f"Recommended Classes: {', '.join(recommendations['classes'])}\n"
        if recommendations.get('companies'):
            rec_context += f"Target Companies: {', '.join(recommendations['companies'])}\n"
        if recommendations.get('skills'):
            rec_context += f"Skills to Develop: {', '.join(recommendations['skills'])}\n"

    chat_context = ""
    if previous_chats:
        chat_context = "\nRECENT CONVERSATION HISTORY:\n"
        for chat in previous_chats[-5:]:
            chat_context += f"{chat.get('type').capitalize()}: {chat.get('content', '')}\n"

    instructions = """
INSTRUCTIONS:
You are a helpful AI Career Advisor. Use the user's profile, recommendations, and chat history to provide personalized, actionable advice. Be encouraging and conversational.
"""

    return f"{instructions}{profile_context}{rec_context}{chat_context}"


def update_chat_history(user_id, user_message, ai_response, previous_chats):
    user_chat = {
        'id': int(datetime.now().timestamp() * 1000) - 1,
        'type': 'user',
        'content': user_message,
        'timestamp': datetime.now().isoformat()
    }

    ai_chat = {
        'id': int(datetime.now().timestamp() * 1000),
        'type': 'ai',
        'content': ai_response,
        'timestamp': datetime.now().isoformat()
    }

    all_chats = previous_chats + [user_chat, ai_chat]
    recent_chats = all_chats[-10:]

    try:
        table.put_item(
            Item={
                'userID': user_id,
                'dataType': 'user-data',
                'previousChats': recent_chats,
                'lastUpdated': datetime.now().isoformat()
            }
        )
    except Exception as e:
        print(f"Error updating DynamoDB: {str(e)}")

    return recent_chats

