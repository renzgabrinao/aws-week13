import pg from "pg";
const { Pool } = pg;

let pool;
function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    pool = new Pool({
      connectionString,
      application_name: "",
      max: 1,
    });
  }
  return pool;
}

// CHATS
export async function getChats() {
  const res = await getPool().query(`
  SELECT * FROM chats
  ORDER BY timestamp DESC
  `);
  return res.rows;
}

export async function createChat(name, user_id, username) {
  const res = await getPool().query(
    `
  INSERT INTO chats (name, user_id, username)
  VALUES ($1, $2, $3)
  RETURNING *
  `,
    [name, user_id, username]
  );
  return res.rows[0];
}

export async function deleteChat(id, user_id) {
  const res = await getPool().query(
    `
  DELETE FROM chats
  WHERE id = $1 AND
  user_id = $2
  RETURNING *
  `,
    [id, user_id]
  );
  return res.rows[0];
}

export async function updateChat(newName, id, user_id) {
  const res = await getPool().query(
    `
  UPDATE chats
  SET name = ($1)
  WHERE id = ($2) AND
  user_id = ($3)
  RETURNING *
  `,
    [newName, id, user_id]
  );
  return res.rows[0];
}

// MESSAGES
export async function getMessages(id) {
  const res = await getPool().query(
    `
  SELECT * FROM messages
  WHERE chat_id = ($1)
  ORDER BY timestamp ASC
  `,
    [id]
  );
  return res.rows;
}

export async function createMessage(
  chatId,
  content,
  contentType,
  user_id,
  username
) {
  const res = await getPool().query(
    `
  INSERT INTO messages (chat_id, content, content_type, user_id, username)
  VALUES ($1, $2, $3, $4, $5)
  RETURNING *
  `,
    [chatId, content, contentType, user_id, username]
  );
  return res.rows[0];
}

export async function deleteMessage(id, user_id) {
  const res = await getPool().query(
    `
  DELETE FROM messages
  WHERE id = $1 AND
  user_id = $2
  RETURNING *
  `,
    [id, user_id]
  );
  return res.rows[0];
}

export async function updateMessage(content, contentType, messageId, user_id) {
  const res = await getPool().query(
    `
    UPDATE messages 
    SET content = ($1),
    content_type = ($2)
    WHERE id = ($3) AND
    user_id = ($4)
    `,
    [content, contentType, messageId, user_id]
  );
  return res.rows[0];
}
