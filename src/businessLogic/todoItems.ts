import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodoItemAccess } from '../dataLayer/todoItemsAccess'
import { parseUserId } from '../auth/utils'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'

const todoItemAccess = new TodoItemAccess()
const bucketName = process.env.IMAGES_S3_BUCKET

export async function createTodoItem(
  createTodoItemRequest: CreateTodoRequest,
  jwtToken: string
): Promise<TodoItem> {
  if (!jwtToken)
    throw new Error('No token found')

  const todoId = uuid.v4()
  const userId = parseUserId(jwtToken)

  return await todoItemAccess.createTodoItem({
    userId: userId,
    todoId: todoId,
    createdAt: new Date().toISOString(),
    name: createTodoItemRequest.name,
    dueDate: createTodoItemRequest.dueDate,
    done: false,
    attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${todoId}`
  })
}