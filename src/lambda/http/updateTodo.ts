import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import "source-map-support/register";
import * as middy from "middy";
import { cors } from "middy/middlewares";

import { UpdateTodoRequest } from "../../requests/UpdateTodoRequest";
import { updateTodoItem } from "../../businessLogic/todoItems";
import { getUserId } from "../../auth/utils";

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId = getUserId(event);
    const todoId = event.pathParameters.todoId;
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body);

    await updateTodoItem(updatedTodo, userId, todoId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Todo item of user ${userId} with id ${todoId} updated`
      })
    };
  }
);

handler.use(
  cors({
    credentials: true
  })
);
