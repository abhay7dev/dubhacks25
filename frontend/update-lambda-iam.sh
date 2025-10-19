#!/bin/bash

# Update Lambda IAM role with DynamoDB permissions
LAMBDA_FUNCTION_NAME="resumax-save-user"
ACCOUNT_ID="137792805243"
REGION="us-east-1"

# Get the Lambda function's role name
ROLE_NAME=$(aws lambda get-function --function-name $LAMBDA_FUNCTION_NAME --region $REGION --query 'Configuration.Role' --output text | cut -d'/' -f2)

echo "Lambda function: $LAMBDA_FUNCTION_NAME"
echo "IAM Role: $ROLE_NAME"

# Create policy document for DynamoDB access
cat > dynamodb-policy.json << 'POLICY_EOF'
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:GetItem",
                "dynamodb:PutItem",
                "dynamodb:UpdateItem",
                "dynamodb:DeleteItem",
                "dynamodb:Query",
                "dynamodb:Scan"
            ],
            "Resource": [
                "arn:aws:dynamodb:us-east-1:137792805243:table/resumax-user-data",
                "arn:aws:dynamodb:us-east-1:137792805243:table/resumax-user-data/index/*"
            ]
        }
    ]
}
POLICY_EOF

# Attach the policy to the Lambda role
aws iam put-role-policy \
    --role-name $ROLE_NAME \
    --policy-name ResuMAXDynamoDBPolicy \
    --policy-document file://dynamodb-policy.json

echo "DynamoDB permissions added to Lambda role: $ROLE_NAME"
echo "Policy: ResuMAXDynamoDBPolicy"

# Clean up
rm dynamodb-policy.json
