#!/bin/bash

source .env

aws dynamodb create-table \
  --table-name $DDB_TABLE_NAME \
  --attribute-definitions \
    AttributeName=pk,AttributeType=S \
    AttributeName=sk,AttributeType=S \
    AttributeName=status,AttributeType=S \
    AttributeName=created_at,AttributeType=N \
    AttributeName=title,AttributeType=S \
    AttributeName=id,AttributeType=S \
    AttributeName=catagory,AttributeType=S \
  --key-schema \
    AttributeName=pk,KeyType=HASH \
    AttributeName=sk,KeyType=RANGE \
  --global-secondary-indexes '[
    {
      "IndexName": "status-index",
      "KeySchema": [
        {"AttributeName": "status", "KeyType": "HASH"},
        {"AttributeName": "created_at", "KeyType": "RANGE"}
      ],
      "Projection": {"ProjectionType": "ALL"}
    },
    {
      "IndexName": "title-index",
      "KeySchema": [
        {"AttributeName": "title", "KeyType": "HASH"},
        {"AttributeName": "id", "KeyType": "RANGE"}
      ],
      "Projection": {"ProjectionType": "ALL"}
    },
    {
      "IndexName": "catagory-index",
      "KeySchema": [
        {"AttributeName": "catagory", "KeyType": "HASH"},
        {"AttributeName": "id", "KeyType": "RANGE"}
      ],
      "Projection": {"ProjectionType": "ALL"}
    }
  ]' \
  --billing-mode PAY_PER_REQUEST \
  --endpoint-url $DDB_ENDPOINT_URL \
  --region $REGION
