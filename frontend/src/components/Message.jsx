import { useAuthenticator } from "@aws-amplify/ui-react";
import { Auth, API, Storage } from "aws-amplify";
import { useState } from "react";

export default function Message({ msg, currentChat, setMessages }) {
  const { user } = useAuthenticator((context) => [context.user]);
  const [updateMessage, setUpdateMessage] = useState("");
  const [file, setFile] = useState(null);
  const [form, setForm] = useState(false);

  const handleDeleteMessage = async (id) => {
    const res = await API.del("api", `/messages/${currentChat}/${id}`);
    const messages = res.messages;
      for (const message of messages) {
        if(message.content_type === "image") {
          await Storage.get(message.content).then((url) => {
          message.url = url;
          })
        }
      }
    setMessages(messages);
    setForm(false);
  };

  const handleUpdateMessageText = async (e) => {
    e.preventDefault();

    const res = await API.put("api", `/messages/${currentChat}/${msg.id}`, {
      body: {
        content: updateMessage,
        type: "text",
      },
    });

    const messages = res.messages;
    for (const message of messages) {
      if(message.content_type === "image") {
        await Storage.get(message.content).then((url) => {
          message.content = url;
        })
      }
    }

    setMessages(messages);
    setUpdateMessage("");
    setForm(false);
  };

  const handleUpdateMessageFile = async (e) => {
    e.preventDefault();
    try {
      const s3Options = {
        contentType: file.type,
        progressCallback(progress) {
          console.log(`Uploaded: ${progress.loaded/progress.total}`);
        },
      }

      const uniqueName = `${Date.now()}-${file.name}`
      const result = await Storage.put(uniqueName, file, s3Options);
      console.log('File uploaded successfully!');

      const response = await API.put("api", `/messages/${currentChat}/${msg.id}`, {
        body: {
          content: result.key,
          type: "image"
        },
      });

      const messages = response.messages;
      for (const message of messages) {
        if(message.content_type === "image") {
          await Storage.get(message.content).then((url) => {
          message.url = url;
          })
        }
      }
      setMessages(messages);
      setForm(false);
      setFile(null);
    } catch (error) {
      console.log('Error uploading file:', error);
    }
  }

  return (
    <div
      className={
        user.attributes?.sub === msg.user_id
          ? "text-right flex flex-col justify-end items-end"
          : "text-left"
      }
    >
      {/* text-3xl border-2 border-transparent px-3 py-2 rounded-lg bg-stone-500 */}
      <div className="w-[40%]">
        <p className="text-sm">{msg.username}</p>
        <p
          className={
            msg.user_id === user.attributes?.sub
              ? "text-3xl border-2 border-transparent px-3 py-2 rounded-lg bg-blue-800"
              : "text-3xl border-2 border-transparent px-3 py-2 rounded-lg bg-stone-500"
          }
        >
          {msg.content_type === "image" ? 
            <><img src={msg.url} alt={`picture from ${msg.username}`}/></>
          :
            <>{msg.content}</>
          }
        </p>
        {msg.user_id === user.attributes?.sub ? (
          <>
            <span
              className="text-green-500 text-xl mr-3 hover:cursor-pointer"
              onClick={() => setForm(!form)}
            >
              <i className="fa-regular fa-pen-to-square"></i>
            </span>
            <span
              className="text-red-500 text-xl hover:cursor-pointer"
              onClick={() => {
                handleDeleteMessage(msg.id);
              }}
            >
              <i className="fa-solid fa-trash"></i>
            </span>
          </>
        ) : (
          <></>
        )}
      </div>
      {form ? (
        <div className="mb-4 mt-1">
          <form
            className="flex flex-row"
            onSubmit={(e) => handleUpdateMessageText(e, msg.id)}
          >
            <input
              className="text-black p-1 mb-1 flex-grow"
              type="text"
              onChange={(e) => {
                setUpdateMessage(e.target.value);
              }}
              value={updateMessage}
            />
            <button
              className="border-2 border-black bg-green-800 text-white hover:bg-green-500 hover:text-black transition-all rounded-xl py-1 px-2 w-20 ml-auto"
              type="submit"
            >
              Enter
            </button>
          </form>
          <form onSubmit={handleUpdateMessageFile}>
            <input type="file" onChange={(e) => setFile(e.target.files[0])}/>
            <button className="py-1 px-2 rounded-xl border-2 border-black bg-green-800 hover:bg-green-500 hover:text-black transition-all" type="submit">Upload</button>
          </form>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
