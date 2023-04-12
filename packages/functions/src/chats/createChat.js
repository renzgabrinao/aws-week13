import { createChat, getChats } from "@week11/core/database";

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

  await createChat(body.name, sub, body.userName);

  const newChats = await getChats();

  return {
    statusCode: 201,
    body: JSON.stringify({
      message: "Created new chat",
      chats: newChats,
    }),
  };
}
