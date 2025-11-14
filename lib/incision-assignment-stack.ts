import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as ApiGateway from 'aws-cdk-lib/aws-apigateway';
import * as Lambda from 'aws-cdk-lib/aws-lambda';
import * as DynamoDB from 'aws-cdk-lib/aws-dynamodb'
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { cleanEnv, str } from 'envalid';

process.loadEnvFile();
const env = cleanEnv(process.env, {
  DDB_ENDPOINT_URL: str(),
  DDB_TABLE_NAME: str(),
  REGION: str(),
});

export class IncisionAssignmentStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bedrockListPolicy = new PolicyStatement({
      actions: ['bedrock:ListFoundationModels'],
      resources: ['*']
    });
    const bedrockInvokePolicy = new PolicyStatement({
      actions: ['bedrock:InvokeModel'],
      resources: ['*'] // TODO: Resolve access denied error when specifying "arn:aws:bedrock:eu-central-1:893371871825:inference-profile/eu.amazon.nova-micro-v1:0"
    });

    // TODO: Fix directory structure in dependency Layer & exclude node_modeules from nestFunction
    // const nestLayer = new Lambda.LayerVersion(this, 'DependencyLayer', {
    //   code: Lambda.Code.fromAsset('api/node_modules'),
    //   compatibleRuntimes: [Lambda.Runtime.NODEJS_22_X]
    // });

    const nestFunction = new Lambda.Function(this, 'NestFunction', {
      // layers: [nestLayer],
      code: Lambda.Code.fromAsset('api/dist'),
      handler: 'main.handler',
      runtime: Lambda.Runtime.NODEJS_22_X,
      timeout: cdk.Duration.seconds(30),
      environment: {
        DDB_ENDPOINT_URL: env.DDB_ENDPOINT_URL,
        DDB_TABLE_NAME: env.DDB_TABLE_NAME,
        REGION: env.REGION,
      }
    });

    nestFunction.addToRolePolicy(bedrockListPolicy);
    nestFunction.addToRolePolicy(bedrockInvokePolicy);

    const catalogApi = new ApiGateway.LambdaRestApi(this, 'ApiGatewayEndpoint', {
      handler: nestFunction,
      restApiName: 'IncisionAssignmentApi',
    });

    const ddbTable = new DynamoDB.TableV2(this, 'IncisionAssignmentTable', {
      partitionKey: { name: 'pk', type: DynamoDB.AttributeType.STRING },
      sortKey: { name: 'sk', type: DynamoDB.AttributeType.STRING },
      tableName: env.DDB_TABLE_NAME,
    });

    ddbTable.addGlobalSecondaryIndex({
      indexName: 'status-index',
      partitionKey: { name: 'status', type: DynamoDB.AttributeType.STRING },
      sortKey: { name: 'created_at', type: DynamoDB.AttributeType.NUMBER },
    });

    ddbTable.addGlobalSecondaryIndex({
      indexName: 'title-index',
      partitionKey: { name: 'title', type: DynamoDB.AttributeType.STRING },
      sortKey: { name: 'id', type: DynamoDB.AttributeType.STRING },
    });

    ddbTable.addGlobalSecondaryIndex({
      indexName: 'catagory-index',
      partitionKey: { name: 'catagory', type: DynamoDB.AttributeType.STRING },
      sortKey: { name: 'id', type: DynamoDB.AttributeType.STRING },
    });

    ddbTable.grantReadWriteData(nestFunction);
  }
}
