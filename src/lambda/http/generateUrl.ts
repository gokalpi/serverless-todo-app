import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import "source-map-support/register";
import * as middy from "middy";
import { cors } from "middy/middlewares";

import { getUserId } from "../../auth/utils";
import { generateAttachmentUrl } from "../../businessLogic/todoItems";

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log("Generating Upload URL for todo", event);

    const userId = getUserId(event);
    const todoId = event.pathParameters.todoId;

    // Return a presigned URL to upload a file for a TODO item with the provided id
    const uploadUrl = await generateAttachmentUrl(userId, todoId);

    console.log('uploadUrl', uploadUrl)

    return {
      statusCode: 200,
      body: JSON.stringify({
        uploadUrl
      })
    };
  }
);

handler.use(
  cors({
    credentials: true
  })
);
