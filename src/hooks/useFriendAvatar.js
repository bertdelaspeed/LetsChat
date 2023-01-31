import { useEffect, useState } from "react";

const useFriendAvatar = (db, friends, username) => {
  const [friendAvatar, setFriendAvatar] = useState([]);
  const [lastMessage, setLastMessage] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!username) return;

    setIsLoading(true);

    let avatarsArray = [];
    let latestMessage = [];
    const FriendRef = collection(db, "Users");
    const ChatsRef = collection(db, "Chats");
    const unsubscribe = friends.map((friend) => {
      const queryResult = query(FriendRef, where("username", "==", friend));
      const unsubFriend = onSnapshot(queryResult, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const { profilePic, email } = doc.data();
          avatarsArray.push({ name: friend, avatar: profilePic, email: email });
          setFriendAvatar([...avatarsArray]);
        });
      });

      const queryResult2 = query(
        ChatsRef,
        where("chatters", "==", `${username}xx${friend}`)
      );

      const queryResult3 = query(
        ChatsRef,
        where("chatters", "==", `${friend}xx${username}`)
      );

      const unsubChat = onSnapshot(queryResult2, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const conversation = doc.data().conversation;
          let lastMessage = [];
          if (conversation && conversation.length > 0) {
            lastMessage = [conversation[conversation.length - 1]];
          }
          latestMessage.push({
            chatters: doc.data().chatters,
            message: lastMessage,
          });
          setLastMessage([...latestMessage]);
        });
      });

      const unsubChat2 = onSnapshot(queryResult3, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const conversation = doc.data().conversation;
          let lastMessage = [];
          if (conversation && conversation.length > 0) {
            lastMessage = [conversation[conversation.length - 1]];
          }
          latestMessage.push({
            chatters: doc.data().chatters,
            message: lastMessage,
          });
          setLastMessage([...latestMessage]);
          setIsLoading(false);
        });
      });

      return () => {
        unsubFriend();
        unsubChat();
        unsubChat2();
      };
    });
    return () => unsubscribe.forEach((unsub) => unsub());
  }, [friends, username]);

  return [friendAvatar, lastMessage, isLoading];
};

export default useFriendAvatar;
