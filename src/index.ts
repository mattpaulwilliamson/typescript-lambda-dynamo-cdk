import { EventBridgeEvent } from 'aws-lambda';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

const dbClient = new DynamoDBClient({});

interface CustomerCreatedEvent {
  customerEmail: string;
}

export async function main(
  event: EventBridgeEvent<'CustomerCreated', CustomerCreatedEvent>
): Promise<void> {
  try {
    await dbClient.send(new PutCommand({
      TableName: process.env.TABLE_NAME,
      Item: {
        pk: event.detail.customerEmail,
      },
    }));
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`CustomerCreated failed: ${error.message}`);
    } else {
      throw error;
    }
  }
}
