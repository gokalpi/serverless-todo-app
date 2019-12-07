import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const AWSXRay = require('aws-xray-sdk-core');
const XAWS = AWSXRay.captureAWS(require('aws-sdk'));

export class TodoItemAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE) {
  }

  async getTodoItem(userId: string, todoId: string): Promise<TodoItem> {
    console.log(`Getting todo item user ${userId} with id ${todoId}`)
    
    var params = {
      TableName: this.todosTable,
      Key: {
        userId,
        todoId
      }
    }

    const result = await this.docClient.get(params).promise()

    return result.Item as TodoItem
  }

  async getTodoItems(userId: string): Promise<TodoItem[]> {
    console.log(`Getting all todo items of user ${userId}`)
    
    var params = {
      TableName: this.todosTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false
    }

    const result = await this.docClient.query(params).promise()

    return result.Items as TodoItem[]
  }

  async createTodoItem(todoItem: TodoItem) {
    console.log(`Creating a todo with id ${todoItem.todoId}`)

    var params = {
      TableName: this.todosTable,
      Item: todoItem
    }

    await this.docClient.put(params, function(err, data) {
      if (err) {
          console.error("Unable to create item. Error JSON:", JSON.stringify(err, null, 2));
      } else {
          console.log("createTodoItem succeeded:", JSON.stringify(data, null, 2));
      }
    }).promise();
  }

  async updateTodoItem(userId: string, todoId: string, todoItem: TodoUpdate) {
    console.log(`Updating todo of user ${userId} with id ${todoId}`)

    var params = {
      TableName: this.todosTable,
      Key: {
        userId,
        todoId
      },
      UpdateExpression: 'SET #name = :name, dueDate = :dueDate, done = :done',
      ExpressionAttributeValues: {
        ':name': todoItem.name,
        ':dueDate': todoItem.dueDate,
        ':done': todoItem.done
      },
      ExpressionAttributeNames: {
        '#name': 'name'
      }
    }

    await this.docClient.update(params, function(err, data) {
        if (err) {
            console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("updateTodoItem succeeded:", JSON.stringify(data, null, 2));
        }
    }).promise()
  }

  async deleteTodoItem(userId: string, todoId: string) {
    console.log(`Deleting todo of user ${userId} with id ${todoId}`)

    var params = {
      TableName: this.todosTable,
      Key: {
        userId,
        todoId
      }
    }

    await this.docClient.delete(params, function(err, data) {
        if (err) {
            console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("deleteTodoItem succeeded:", JSON.stringify(data, null, 2));
        }
    }).promise()
  }
  
  async updateAttachmentUrl(userId: string, todoId: string, attachmentUrl: string) {
    console.log(`Updating attachment URL of todo of user ${userId} with id ${todoId}`)

    var params = {
      TableName: this.todosTable,
      Key: {
        userId,
        todoId
      },
      UpdateExpression: 'SET attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': attachmentUrl
      }
    }

    await this.docClient.update(params, function(err, data) {
        if (err) {
            console.error("Unable to update attachment Url. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("updateAttachmentUrl succeeded:", JSON.stringify(data, null, 2));
        }
    }).promise()
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