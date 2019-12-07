import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import "source-map-support/register";
import * as middy from "middy";
import { cors } from "middy/middlewares";

import { getUserId } from "../../auth/utils";
import { deleteTodoItem } from "../../businessLogic/todoItems";

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId = getUserId(event);
    const todoId = event.pathParameters.todoId;

    await deleteTodoItem(userId, todoId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Todo item of user ${userId} with id ${todoId} deleted`
      })
    };
  }
);

handler.use(
  cors({
    credentials: true
  })
);
