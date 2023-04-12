import { Auth, API, Storage } from "aws-amplify";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { useState, useEffect } from "react";

import Message from "./Message";
import Chat from "./Chat";

export default function Home() {
  // AUTH STUFF
  const { user, signOut } = useAuthenticator((context) => [context.user]);

  // can get the username with this method:::
  // 
  //    const tokens = await Auth.currentSession();
  //    const userName = tokens.getIdToken().payload['cognito:username'];

  const publicRequest = async () => {
    const response = await API.get("api", "/chats");
    alert(JSON.stringify(response));
  };

  const privateRequest = async () => {
    try {
      const response = await API.get("api", "/messages/5afec214-6bbc-47fe-9b0a-dcc18f88bbec");
      alert(JSON.stringify(response));
    } catch (error) {
      alert(error);
    }
  };

  // CHATS N MESSAGES STUFF
  const [currentChat, setCurrentChat] = useState("");

  const [chats, setChats] = useState([]);
  const [newChat, setNewChat] = useState("");

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const [file, setFile] = useState(null);

  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const getChatRooms = async () => {
      await API.get("api", "/chats").then((res) => setChats(res.chats));
    };
    getChatRooms();
  }, []);

  const getChatMessages = async (id) => {
    setCurrentChat(id);

    const res = await API.get("api", `/messages/${id}`);
    const messages = res.messages;
    for (const message of messages) {
      if(message.content_type === "image") {
        await Storage.get(message.content).then((url) => {
          message.url = url;
        })
      }
    }
    setMessages(messages);
  };

  const handleCreateChat = async (e) => {
    e.preventDefault();

    const tokens = await Auth.currentSession();
    const userName = tokens.getIdToken().payload['cognito:username'];

    if (!!!newChat) {
      setErrorMsg("You need to enter a name");
      return;
    }

    const res = await API.post("api", "/chats", {
      body: {
        name: newChat,
        userName: userName
      },
    });
    setChats(res.chats)
    setErrorMsg(null);
    setNewChat("");
  };

  const handleCreateMessage = async (e) => {
    e.preventDefault();

    const tokens = await Auth.currentSession();
    const userName = tokens.getIdToken().payload['cognito:username'];

    const res = await API.post("api", "/messages", {
      body: {
        chatId: currentChat,
        content: newMessage,
        userName: userName,
        type: "text",
      },
    });
    const messages = res.messages;
    for (const message of messages) {
      if(message.content_type === "image") {
        await Storage.get(message.content).then((url) => {
          message.url = url;
        })
      }
    }
    setMessages(messages);

    setNewMessage("");
  };

  const handleExitRoom = () => {
    setCurrentChat("");
    setMessages([]);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  }
  
  const handleSend = async (event) => {
    event.preventDefault();
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

      // grab username
      const tokens = await Auth.currentSession();
      const userName = tokens.getIdToken().payload['cognito:username'];

      const response = await API.post("api", "/messages", {
        body: {
          chatId: currentChat,
          content: result.key,
          userName: userName,
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
      setFile(null);
    } catch (error) {
      console.log('Error uploading file:', error);
    }
  }

  return (
    <div className="text-white">
      <header className="h-[75px] flex flex-row justify-between px-6 py-3 items-center">
        <div>
          <p>
            {user?.username} || {user?.attributes.email}
          </p>
        </div>
        <div className="">
          <button
            className="border-2 border-black bg-red-800 hover:bg-red-500 hover:text-black transition-all rounded-lg py-1 px-2"
            onClick={signOut}
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="min-h-screen flex flex-row p-4 font-mono">
        <div className="w-[20%]">
          <form
            className="flex flex-col justify-evenly text-xl text-center mb-7 h-32"
            onSubmit={handleCreateChat}
          >
            <input
              className="text-black p-1"
              type="text"
              onChange={(e) => {
                setNewChat(e.target.value);
              }}
              value={newChat}
            />
            <button
              className="border-2 border-black bg-green-800 text-white hover:bg-green-500 hover:text-black transition-all rounded-xl py-1 px-2"
              type="submit"
            >
              create new room
            </button>
            {!!errorMsg ? <h2 className="text-red-500">{errorMsg}</h2> : <></>}
          </form>

          <div>
            <h1 className="text-3xl font-bold">rooms</h1>
            <div className="my-2">
              <hr />
            </div>
            {!!chats &&
              chats.map((room) => (
                <div key={room.id}>
                  <Chat
                    room={room}
                    getChatMessages={getChatMessages}
                    setChats={setChats}
                  />
                </div>
              ))}
          </div>
        </div>

        <div className="w-[80%]">
          <div className="flex justify-end items-end mb-7">
            {!!currentChat ? (
                <>
                  <button
                    className="px-6 py-1 rounded-xl border-2 border-black bg-red-800 hover:bg-red-500 hover:text-black transition-all "
                    onClick={() => {
                      handleExitRoom();
                    }}
                  >
                    Exit Room
                  </button>
                </>
              ) : (<></>)
            }
          </div>
          
          <div className="min-h-screen flex flex-col justify-between p-5 pb-0">
              <div className="overflow-scroll">
                {!!messages &&
                  messages.map((msg) => (
                    <div key={msg.id}>
                      <Message
                        msg={msg}
                        currentChat={currentChat}
                        setMessages={setMessages}
                      />
                    </div>
                  ))}
                </div>
              {currentChat ? (
                <div className="flex flex-col justify-center items-center">
                  <form className="flex flex-row w-full" onSubmit={handleCreateMessage}>
                    <input
                      className="text-black text-base px-3 py-1 flex-grow rounded-xl"
                      type="text"
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                      }}
                      value={newMessage}
                    />
                    <button
                      className="py-2 px-6 ml-6 rounded-xl border-2 border-black bg-green-800 hover:bg-green-500 hover:text-black transition-all"
                      type="submit"
                    >
                      Enter
                    </button>
                  </form>
                  <form className="mt-5" onSubmit={handleSend}>
                    <input type="file" onChange={handleFileChange} />
                    <button className="py-2 px-6 rounded-xl border-2 border-black bg-green-800 hover:bg-green-500 hover:text-black transition-all" type="submit">Upload</button>
                  </form>
                </div>
              ) : (
                <></>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
