import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { QueryCommand, DynamoDBDocumentClient, PutCommand, UpdateCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { omit } from 'es-toolkit';
import { v4 as uuid } from 'uuid';
import { Item } from 'src/items/entities/item.entity';
import { CreateItemParams, Status, UpdateItemParams } from './types';
import { cleanEnv, str } from 'envalid';

if (process.env.NODE_ENV === 'local') {
  process.loadEnvFile('../.env');
}
const { DDB_ENDPOINT_URL, DDB_TABLE_NAME, REGION } = cleanEnv(process.env, {
  DDB_ENDPOINT_URL: str(),
  DDB_TABLE_NAME: str(),
  REGION: str(),
});

export default class CatalogDDBClient {
  private docClient: DynamoDBDocumentClient;

  constructor() {
    const client = new DynamoDBClient({
      region: REGION,
      endpoint: DDB_ENDPOINT_URL,
    });
    this.docClient = DynamoDBDocumentClient.from(client);
  }

  // TODO: implement pagination
  public async getItems(status?: Status): Promise<Item[]> {
    let command: QueryCommand | ScanCommand;
    if (status) {
      command = new QueryCommand({
        TableName: DDB_TABLE_NAME,
        IndexName: 'status-index',
        KeyConditionExpression: '#status = :status',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: { ':status': status },
      });
    } else {
      command = new ScanCommand({
        TableName: DDB_TABLE_NAME,
        FilterExpression: 'pk begins_with("ITEM#")',
      });
    }

    const response = await this.docClient.send(command);
    const items = response.Items?.map((item) => omit(item, ['pk', 'sk']));
    return items as Item[];
  }

  public async checkTitleExists(title: string): Promise<boolean> {
    const command = new QueryCommand({
      TableName: DDB_TABLE_NAME,
      IndexName: 'title-index',
      KeyConditionExpression: 'title = :title',
      ExpressionAttributeValues: { ':title': title },
      Limit: 1,
    });

    const response = await this.docClient.send(command);
    return (response.Items || []).length > 0;
  }

  public async createItem(params: CreateItemParams): Promise<Item> {
    const id = uuid();
    const command = new PutCommand({
      TableName: DDB_TABLE_NAME,
      Item: {
        ...params,
        pk: `ITEM#${id}`,
        sk: 'METADATA',
        id,
        created_at: new Date().getTime(),
      },
      ReturnValues: 'ALL_OLD'
    });

    const response = await this.docClient.send(command);
    const item = omit(response.Attributes || {}, ['pk', 'sk']);
    return item as Item;
  }

  public async updateItem(params: UpdateItemParams): Promise<Item> {
    const time = new Date().getTime();
    const command = new UpdateCommand({
      TableName: DDB_TABLE_NAME,
      Key: { pk: `ITEM#${params.id}`, sk: 'METADATA' },
      UpdateExpression: 'SET #status = :status, approved_by = :approver, updated_at = :time',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': params.status,
        ':approver': params.approved_by,
        ':time': time,
      },
      ReturnValues: 'ALL_NEW',
    });

    const response = await this.docClient.send(command);
    const item = omit(response.Attributes || {}, ['pk', 'sk']);
    return item as Item;
  }
}
