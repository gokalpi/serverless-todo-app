import * as uuid from "uuid";

import { TodoItem } from "../models/TodoItem";
import { TodoItemAccess } from "../dataLayer/todoItemsAccess";
import { CreateTodoRequest } from "../requests/CreateTodoRequest";
import { UpdateTodoRequest } from "../requests/UpdateTodoRequest";
import { getSignedUrl, getAttachmentUrl } from "../utils/s3Utils";

const todoItemAccess = new TodoItemAccess();

export async function getTodoItem(
  userId: string,
  todoId: string
): Promise<TodoItem> {
  if (!userId) throw new Error("No userId found");
  if (!todoId) throw new Error("No todoId found");

  return await todoItemAccess.getTodoItem(userId, todoId);
}

export async function getTodoItems(userId: string) {
  if (!userId) throw new Error("No userId found");

  return await todoItemAccess.getTodoItems(userId);
}

export async function createTodoItem(
  createTodoItemRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {
  if (!userId) throw new Error("No userId found");

  const newTodo = {
    userId: userId,
    todoId: uuid.v4(),
    createdAt: new Date().toISOString(),
    ...createTodoItemRequest,
    done: false
  };

  await todoItemAccess.createTodoItem(newTodo);

  return newTodo;
}

export async function updateTodoItem(
  updateTodoItemRequest: UpdateTodoRequest,
  userId: string,
  todoId: string
) {
  if (!userId) throw new Error("No userId found");
  if (!todoId) throw new Error("No todoId found");

  await todoItemAccess.updateTodoItem(userId, todoId, updateTodoItemRequest);
}

export async function deleteTodoItem(userId: string, todoId: string) {
  if (!userId) throw new Error("No userId found");
  if (!todoId) throw new Error("No todoId found");

  await todoItemAccess.deleteTodoItem(userId, todoId);
}

export async function generateAttachmentUrl(userId: string, todoId: string) {
  if (!userId) throw new Error("No userId found");
  if (!todoId) throw new Error("No todoId found");

  const signedUrl = await getSignedUrl(todoId);
  console.log('Signed URL', signedUrl)
  const downloadUrl = await getAttachmentUrl(todoId);
  console.log('Download URL', downloadUrl)

  await todoItemAccess.updateAttachmentUrl(
    userId,
    todoId,
    downloadUrl
  );

  return signedUrl;
}
