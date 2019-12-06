import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'

const AWSXRay = require('aws-xray-sdk-core');
const XAWS = AWSXRay.captureAWS(require('aws-sdk'));

export class TodoItemAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE) {
  }

  async createTodoItem(todoItem: TodoItem): Promise<TodoItem> {
    console.log(`Creating a todo with id ${todoItem.todoId}`)

    await this.docClient.put({
      TableName: this.todosTable,
      Item: todoItem
    }, function(err, data) {
      if (err) {
          console.log("Unable to add todo item. Error JSON:", JSON.stringify(err, null, 2));
      } else {
          console.log("Added todo item:", JSON.stringify(data, null, 2));
      }
    }).promise()

    return todoItem
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}