<h1>Pattern with Lamda, DynamoDB and EventBridge</h1>

<h3>Example messaging pattern that when an event is raised for `CustomerCreated` the item is stored in DynamoDB.</h3>



---

## Understanding the pattern

1. Event is sent to business event bus, and rules setup for downstream consumers. In this example we have a basic Lambda function listening for the new `CustomerCreated` event.
2. Lambda is triggered via the `CustomerCreated` event to insert data into DynamoDB (new customer in this example).
3. Table to store new information (customer in this example)


## Deploying and testing this pattern
Clone the project an run:

   ```bash
   npm run build
   cdk deploy
   ```

Once deployed send an event to the Event Bus:
<img width="833" alt="Screenshot 2023-12-15 at 22 15 06" src="https://github.com/mattpaulwilliamson/typescript-lambda-dynamo-cdk/assets/1433898/3433df5a-12ef-4922-8640-1478d2e95682">

View the `CustomerTable` in DynamoDB and the item should be added.




