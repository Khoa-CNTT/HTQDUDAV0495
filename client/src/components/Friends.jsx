import { useState, useEffect } from "react";
import friendService from "../services/friendService";
import chatService from "../services/chatService";

function Friends({ user }) {
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    // Set up friend request listeners
    friendService.onFriendRequestReceived((data) => {
      setFriendRequests((prev) => [...prev, data]);
    });

    friendService.onFriendRequestResponse((data) => {
      if (data.status === "accepted") {
        setFriends((prev) => [
          ...prev,
          {
            _id: data.userId,
            username: data.username,
          },
        ]);
      }
      // Remove from friend requests if it was our request
      setFriendRequests((prev) =>
        prev.filter((req) => req.userId !== data.userId)
      );
    });

    // Set up chat message listener
    chatService.onNewMessage((data) => {
      if (selectedFriend && data.message.sender === selectedFriend._id) {
        setChatMessages((prev) => [...prev, data.message]);
      }
    });

    // Load initial friends and friend requests
    // This would typically come from an API call
    // For now, we'll just use empty arrays
  }, [selectedFriend]);

  const handleAcceptFriend = (request) => {
    friendService.respondToFriendRequest(request._id, true);
    setFriendRequests((prev) =>
      prev.filter((req) => req.userId !== request.userId)
    );
  };

  const handleRejectFriend = (request) => {
    friendService.respondToFriendRequest(request._id, false);
    setFriendRequests((prev) =>
      prev.filter((req) => req.userId !== request.userId)
    );
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!selectedFriend || !newMessage.trim()) return;

    chatService.sendPrivateMessage(selectedFriend._id, newMessage.trim());
    // Optimistically add message to chat
    setChatMessages((prev) => [
      ...prev,
      {
        sender: user._id,
        content: newMessage.trim(),
        createdAt: new Date(),
      },
    ]);
    setNewMessage("");
  };

  const handleSelectFriend = (friend) => {
    setSelectedFriend(friend);
    setChatMessages([]);
  };

  return (
    <div className="grid h-screen grid-cols-3 gap-4 p-4">
      {/* Friends List */}
      <div className="col-span-1 p-4 bg-white rounded-lg shadow">
        <h2 className="mb-4 text-lg font-semibold">Friends</h2>
        <div className="space-y-2">
          {friends.map((friend) => (
            <button
              key={friend._id}
              onClick={() => handleSelectFriend(friend)}
              className={`w-full p-2 text-left rounded ${
                selectedFriend?._id === friend._id
                  ? "bg-blue-100"
                  : "hover:bg-gray-100"
              }`}
            >
              {friend.username}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="col-span-2 p-4 bg-white rounded-lg shadow">
        {selectedFriend ? (
          <>
            <h2 className="mb-4 text-lg font-semibold">
              Chat with {selectedFriend.username}
            </h2>
            <div className="p-2 mb-4 overflow-y-auto border rounded h-96">
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-2 ${
                    msg.sender === user._id ? "text-right" : "text-left"
                  }`}
                >
                  <div
                    className={`inline-block p-2 rounded-lg ${
                      msg.sender === user._id
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100"
                    }`}
                  >
                    <div>{msg.content}</div>
                    <div className="mt-1 text-xs opacity-75">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 p-2 border rounded"
              />
              <button
                type="submit"
                className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
              >
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a friend to start chatting
          </div>
        )}
      </div>

      {/* Friend Requests */}
      {friendRequests.length > 0 && (
        <div className="col-span-3 p-4 bg-white rounded-lg shadow">
          <h2 className="mb-4 text-lg font-semibold">Friend Requests</h2>
          <div className="space-y-2">
            {friendRequests.map((request) => (
              <div
                key={request.userId}
                className="flex items-center justify-between p-2 border rounded"
              >
                <span>{request.username}</span>
                <div className="space-x-2">
                  <button
                    onClick={() => handleAcceptFriend(request)}
                    className="px-3 py-1 text-white bg-green-500 rounded hover:bg-green-600"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRejectFriend(request)}
                    className="px-3 py-1 text-white bg-red-500 rounded hover:bg-red-600"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="col-span-3 p-3 text-red-700 bg-red-100 rounded">
          {error}
        </div>
      )}
    </div>
  );
}

export default Friends;
