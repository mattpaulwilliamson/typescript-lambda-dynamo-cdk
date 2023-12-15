import { main } from '../index';
import cloneDeep from 'lodash/cloneDeep';
import { EventBridgeEvent, APIGatewayProxyResultV2 } from 'aws-lambda';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import exp from 'constants';
import { error } from 'console';

const mockDynamoClient = mockClient(DynamoDBClient);

jest.mock('@aws-sdk/lib-dynamodb', () => {
  return {
    PutCommand: jest.fn().mockImplementation(() => {
      return {};
    }),
  };
});

describe('CustomerCreated', () => {
  let event: EventBridgeEvent<'CustomerCreated', { customerEmail: string }>;
  beforeEach(() => {
   event = cloneDeep(require('../fixtures/AWS/APIGatewayEvents/EventCall.json'));
   mockDynamoClient.reset();
  });

  describe('event', () => {
    it('checks if the correct event is passed to main', async () => {
      const mainMock = jest.fn(main);

      await mainMock(event);

      expect(mainMock).toHaveBeenCalledWith({"account": "764738370862", "detail": {"customerEmail": "test@test.com"}, "detail-type": "CustomerCreated", "id": "390475c2-1391-092b-7f6f-8c845748cc1d", "region": "eu-west-1", "resources": [], "source": "eventsomething", "time": "2022-08-09T10:43:12Z", "version": "0"});
    });

    it('throws an error when the event has no customer email', async () => {
      delete (event as Partial<EventBridgeEvent<'CustomerCreated', { customerEmail: string }>>).detail;

      await expect(main(event)).rejects.toThrow("CustomerCreated failed");
    });
  });

  describe('dynamo', () => {
    it('adds a customer to the table', async () => {
      process.env.TABLE_NAME = 'testTable';

      mockDynamoClient.on(PutCommand).resolves({});

      await main(event);

      expect(PutCommand).toHaveBeenCalledWith({
        TableName: 'testTable',
        Item: {
          pk: 'test@test.com',
        },
      });
    });
  });
});
