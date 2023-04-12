import { createMessage, getMessages } from "@week11/core/database";

function getUserId(event) {
  if (!event.requestContext.authorizer?.iam) {
    return;
  }
  const authProvider =
    event.requestContext.authorizer.iam.cognitoIdentity.amr.findLast((ref) =>
      ref.includes(":")
    );
  const parts = authProvider.split(":");
  return parts[parts.length - 1];
}

export async function main(event) {
  const sub = getUserId(event);
  const body = JSON.parse(event.body);

  await createMessage(body.chatId, body.content, body.type, sub, body.userName);

  const messages = await getMessages(body.chatId);
  return {
    statusCode: 201,
    body: JSON.stringify({ message: "ok", messages: messages }),
  };
}
