import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambdaDestinations from 'aws-cdk-lib/aws-lambda-destinations';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export class TypescriptLambdaCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // set up dynamo db table with customer data
    const table = new dynamodb.TableV2(this, 'Table', {
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
      tableName: 'CustomerTable',
      dynamoStream: dynamodb.StreamViewType.OLD_IMAGE,
    });

    const eventBus = new events.EventBus(this, 'EventBus', {
      eventBusName: 'EventBus'
    });

    const deadLetterQueue = new sqs.Queue(this, 'DeadLetterQueue');

    const testFn = new NodejsFunction(this, 'MyFunction', {
      entry: './src/index.ts',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'main',
      bundling: {
        externalModules: ['aws-sdk'],
        minify: true,
      },
      environment: {
        TABLE_NAME: table.tableName,
      },
      // sqs queue for unsuccessful invocations
      onFailure: new lambdaDestinations.SqsDestination(deadLetterQueue),
    });

    // add permisions to lambda to write to dynamo db table
    table.grantReadWriteData(testFn);

    new events.Rule(this, 'rule', {
      eventBus,
      eventPattern: {
        detailType: ["CustomerCreated"],
      },
      targets: [new targets.LambdaFunction(testFn)],
    });

  }
}
