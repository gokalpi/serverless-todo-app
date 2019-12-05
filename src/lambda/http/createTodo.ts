import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createTodoItem } from '../../businessLogic/todoItems'

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log('Creating todo', event)

    const newTodo: CreateTodoRequest = JSON.parse(event.body)

    const authorization = event.headers.Authorization
    if (!authorization)
        throw new Error('Not authorized')

    const split = authorization.split(' ')
    const jwtToken = split[1]

    const newItem = await createTodoItem(newTodo, jwtToken)

    return {
        statusCode: 201,
        body: JSON.stringify({
            newItem
        })
    }
})

handler.use(
    cors({
      credentials: true
    })
  )