import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as uuid from 'uuid'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'

const AWSXRay = require('aws-xray-sdk-core');
const XAWS = AWSXRay.captureAWS(require('aws-sdk'));

const docClient = new XAWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log('Creating todo', event)
    const userId = 'auth0|34234234'

    const newTodo = await createTodo(userId, uuid.v4(), event)

    return {
        statusCode: 201,
        body: JSON.stringify({
            newTodo
        })
    }
})

handler.use(
    cors({
      credentials: true
    })
  )
  
async function createTodo(userId: string, todoId: string, event: any) {
    const createdAt = new Date().toISOString()
    const newTodo: CreateTodoRequest = JSON.parse(event.body)

    const newItem = {
        userId,
        todoId,
        createdAt,
        ...newTodo,
        done: false,
        imageUrl: `https://s3.amazonaws.com/${todoId}`
    }

    console.log('Saving new todo: ', newItem)

    await docClient.put({
        TableName: todosTable,
        Item: newItem
    }, function(err, data) {
        if (err) {
            console.log("Unable to add todo item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Added todo item:", JSON.stringify(data, null, 2));
        }
    }).promise()

  return newItem
}