import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import "source-map-support/register";
import * as middy from "middy";
import { cors } from "middy/middlewares";

import { CreateTodoRequest } from "../../requests/CreateTodoRequest";
import { createTodoItem } from "../../businessLogic/todoItems";
import { getUserId } from "../../auth/utils";

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log("Creating todo", event);

    const newTodo: CreateTodoRequest = JSON.parse(event.body);
    const userId = getUserId(event);
    const newItem = await createTodoItem(newTodo, userId);

    return {
      statusCode: 201,
      body: JSON.stringify({
        item: newItem
      })
    };
  }
);

handler.use(
  cors({
    credentials: true
  })
);
