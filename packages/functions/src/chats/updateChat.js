import { updateChat, getChats } from "@week11/core/database";

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
  const { chatId } = event.pathParameters;
  const body = JSON.parse(event.body);

  await updateChat(body.newName, chatId, sub);

  const newChats = await getChats();

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Updated chat", chats: newChats }),
  };
}
