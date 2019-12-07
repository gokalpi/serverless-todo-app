import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import "source-map-support/register";
import * as middy from "middy";
import { cors } from "middy/middlewares";

import { getUserId } from "../../auth/utils";
import { getTodoItems } from "../../businessLogic/todoItems";

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log("Getting todos of user id", event);

    const userId = getUserId(event);
    const todoItems = await getTodoItems(userId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: todoItems
      })
    };
  }
);

handler.use(
  cors({
    credentials: true
  })
);
