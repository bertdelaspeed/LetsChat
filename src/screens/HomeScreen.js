import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
} from "react-native";
import React, { useContext, useEffect, useLayoutEffect, useState } from "react";
import { AuthenticatedUserContext } from "../../Context/Authentication";
import { useNavigation } from "@react-navigation/native";
import {
  collection,
  getDocs,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase/config";
const userAvatar = require("../../assets/man.png");
import { Entypo } from "@expo/vector-icons";

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user, setUserAvatarUrl, userAvatarUrl } = useContext(
    AuthenticatedUserContext
  );

  const username = user.email.split("@")[0];

  const [friends, setFriends] = useState([]);
  const [friendAvatar, setFriendAvatar] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastMessage, setLastMessage] = useState([]);

  function goProfile() {
    navigation.navigate("Profile");
  }

  async function DocFinder(queryResult) {
    const querySnapshot = await getDocs(queryResult);
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      const { profilePic } = doc.data();
      setUserAvatarUrl(profilePic);
    });
  }

  useEffect(() => {
    if (!user) return;

    const UserRef = collection(db, "Users");
    const queryResult = query(UserRef, where("userId", "==", user.uid));

    DocFinder(queryResult);
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={goProfile}>
          <View className="w-10 h-10  items-center ">
            {!userAvatarUrl ? (
              <Image source={userAvatar} className="h-10 w-10 rounded-full" />
            ) : (
              <Image
                className="h-10 w-10 rounded-full"
                source={{ uri: userAvatarUrl }}
              />
            )}
          </View>
        </TouchableOpacity>
      ),
    });
  }, [userAvatarUrl, navigation]);

  useEffect(() => {
    if (!user) return;

    setIsLoading(true);
    const FetchMatch = async () => {
      const chatRef = collection(db, "Chats");
      const queryResult = query(
        chatRef,
        where("chatters", ">=", `${username}`),
        where("chatters", "<=", `${username}` + "\uf8ff")
      );

      const queryResult2 = query(
        chatRef,
        where("chatters", "<=", `xx${username}`)
      );

      let friendsArray = [];

      const unsubscribe = onSnapshot(queryResult, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
          // doc.data() is never undefined for query doc snapshots
          if (doc.data().chatters.includes(username)) {
            const chats = doc.data().chatters;

            const friends = chats.replace(username, "").replace("xx", "");
            friendsArray.push({
              friends,
              lastMessage: doc.data().conversation.pop().message,
            });
            friendsArray = [...new Set(friendsArray)];
            // console.log("friends in sub1 = ", friends);
            setFriends(friendsArray);
          }
        });
      });

      const unsubscribe2 = onSnapshot(queryResult2, (querySnapshot2) => {
        querySnapshot2.forEach((doc) => {
          // doc.data() is never undefined for query doc snapshots
          if (doc.data().chatters.includes(username)) {
            const chats = doc.data().chatters;
            const friends = chats.replace(username, "").replace("xx", "");
            friendsArray.push(friends);
            friendsArray = [...new Set(friendsArray)];
            setFriends(friendsArray);
            // console.log("friends in sub2 = ", friends);
          }
        });
      });

      return () => {
        unsubscribe();
        unsubscribe2();
      };
    };

    FetchMatch();
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!user) return;

    let avatarsArray = [];
    let latestMessage = [];
    const FriendRef = collection(db, "Users");
    const ChatsRef = collection(db, "Chats");
    const unsubscribe = friends.map((friend) => {
      const queryResult = query(FriendRef, where("username", "==", friend));
      const unsubFriend = onSnapshot(queryResult, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const { profilePic } = doc.data();
          avatarsArray.push({ name: friend, avatar: profilePic });
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
          let lastMessage = "";
          if (conversation && conversation.length > 0) {
            lastMessage = conversation[conversation.length - 1].message;
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
          let lastMessage = "";
          if (conversation && conversation.length > 0) {
            lastMessage = conversation[conversation.length - 1].message;
          }
          latestMessage.push({
            chatters: doc.data().chatters,
            message: lastMessage,
          });
          setLastMessage([...latestMessage]);
        });
      });

      return () => {
        unsubFriend();
        unsubChat();
        unsubChat2();
      };
    });
    return () => unsubscribe.forEach((unsub) => unsub());
  }, [friends]);

  console.log("lastMessage = ", lastMessage);

  return (
    <>
      {isLoading ? (
        <View className="flex items-center justify-center h-full">
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <FlatList
          data={friendAvatar}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("Chat", {
                  friendName: item.name,
                  friendAvatar: item.avatar,
                })
              }
              className="mx-3"
            >
              <View className="flex-row items-center space-x-4 bg-white my-2 px-2 py-2 rounded-lg">
                {friendAvatar !== null ? (
                  <Image
                    source={{ uri: item.avatar }}
                    className="h-12 w-12 rounded-full"
                  />
                ) : (
                  <Image
                    source={userAvatar}
                    className="h-12 w-12 rounded-full"
                  />
                )}
                <View className="">
                  <Text className="font-bold tracking-widest text-lg">
                    {item.name}
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    {lastMessage.length > 0
                      ? lastMessage.find((chat) =>
                          chat.chatters.includes(item.name)
                        )?.message
                      : ""}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      )}
      <View className="flex flex-row-reverse absolute bottom-14 right-5">
        <View>
          <TouchableOpacity
            onPress={() => navigation.navigate("Search")}
            className="bg-orange-500 h-16 w-16 rounded-full text-center items-center justify-center "
          >
            <Entypo name="chat" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default HomeScreen;
