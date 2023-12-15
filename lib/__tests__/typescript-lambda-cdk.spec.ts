import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';

import { TypescriptLambdaCdkStack } from '../typescript-lambda-cdk-stack';

const buildTemplate = () => {
  const app = new cdk.App();
  const typescriptLambdaCdkStack = new TypescriptLambdaCdkStack(
    app,
    'TypescriptLambdaCdkStack',
    {},
  );
  return Template.fromStack(typescriptLambdaCdkStack);
};

describe('TypescriptLambdaCdkStack', () => {
  let template: Template;

  beforeAll(() => {
    template = buildTemplate();
  });

  it('should set up the event bus', () => {
    template.hasResourceProperties('AWS::Events::Rule', {
      EventBusName: {
        "Ref": "EventBus7B8748AA"
      },
    });
  });

  it('should construct an event rule for the customer created', () => {
    template.hasResourceProperties('AWS::Events::Rule', {
      EventPattern: { 'detail-type': ['CustomerCreated'] },
    });
  });

  it('should construct a Lambda function to handle customer created', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      Handler: 'index.main',
      Runtime: 'nodejs18.x',
      Environment: {
        Variables: {
          TABLE_NAME: {
            Ref: Match.anyValue(),
          },
        },
      },
    });
  });

  it('function has the corrct access granted', () => {
    template.hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: [
          {
            Action: ['sqs:SendMessage', 'sqs:GetQueueAttributes', 'sqs:GetQueueUrl'],
            Effect: 'Allow',
            Resource: {
              "Fn::GetAtt":
              ["DeadLetterQueue9F481546", "Arn"]
            },
          },
          {
            Action: [
              'dynamodb:BatchGetItem',
              'dynamodb:GetRecords',
              'dynamodb:GetShardIterator',
              'dynamodb:Query',
              'dynamodb:GetItem',
              'dynamodb:Scan',
              'dynamodb:ConditionCheckItem',
              'dynamodb:BatchWriteItem',
              'dynamodb:PutItem',
              'dynamodb:UpdateItem',
              'dynamodb:DeleteItem',
              'dynamodb:DescribeTable'
            ],
            Effect: 'Allow',
            Resource: {
              "Fn::GetAtt":
              ["TableCD117FA1", "Arn"]
            },
          },
        ],
        Version: '2012-10-17',
      },
    });
  });

});

