#!/bin/bash

# Create DynamoDB table for resume data
aws dynamodb create-table \
    --table-name resumax-user-data \
    --attribute-definitions \
        AttributeName=userId,AttributeType=S \
        AttributeName=dataType,AttributeType=S \
    --key-schema \
        AttributeName=userId,KeyType=HASH \
        AttributeName=dataType,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST \
    --region us-east-1

echo "DynamoDB table creation initiated..."
echo "Table name: resumax-user-data"
echo "Partition key: userId (String)"
echo "Sort key: dataType (String)"
echo ""
echo "Wait for table to be active, then update Lambda IAM role permissions."
