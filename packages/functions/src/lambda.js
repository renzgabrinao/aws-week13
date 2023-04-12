import { Time } from "@week11/core/time";

export async function handler(event, context) {
  return {
    statusCode: 200,
    body: JSON.stringify({
      time: "Ur mom",
    }),
  };
}
