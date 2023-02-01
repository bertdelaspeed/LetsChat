import {
  View,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
} from "react-native";
import React, { useContext, useEffect, useLayoutEffect, useState } from "react";
import { AuthenticatedUserContext } from "../../Context/Authentication";
import { useNavigation } from "@react-navigation/native";
import { getDocs, query, where, onSnapshot } from "firebase/firestore";
import { chatsRef, usersRef } from "../../firebase/config";
const userAvatar = require("../../assets/man.png");
import { Entypo } from "@expo/vector-icons";
import ChatItem from "../components/ChatItem";
import { combineData, sortLastMessage } from "../utils";

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

  useEffect(() => {
    if (!user) return;

    const queryResult = query(usersRef, where("userId", "==", user.uid));

    async function DocFinder(queryResult) {
      const querySnapshot = await getDocs(queryResult);
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        const { profilePic } = doc.data();
        setUserAvatarUrl(profilePic);
      });
    }

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

    const FetchLoggedUserChats = async () => {
      const queryResult = query(
        chatsRef,
        where("chatters", ">=", `${username}`),
        where("chatters", "<=", `${username}` + "\uf8ff")
      );

      const queryResult2 = query(
        chatsRef,
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

    FetchLoggedUserChats();
  }, []);

  useEffect(() => {
    if (!user) return;

    setIsLoading(true);

    let avatarsArray = [];
    let latestMessage = [];
    const unsubscribe = friends.map((friend) => {
      const queryResult = query(usersRef, where("username", "==", friend));
      const unsubFriend = onSnapshot(queryResult, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
          // console.log("doc.data() = ", doc.data());
          const { profilePic, email } = doc.data();
          avatarsArray.push({ name: friend, avatar: profilePic, email: email });
          setFriendAvatar([...avatarsArray]);
        });
      });

      const queryResult2 = query(
        chatsRef,
        where("chatters", "==", `${username}xx${friend}`)
      );

      const queryResult3 = query(
        chatsRef,
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
  }, [friends]);

  const sortedLastMessage = lastMessage.sort(sortLastMessage);

  const combinedData = combineData(friendAvatar, sortedLastMessage);

  return (
    <>
      {isLoading ? (
        <View className="flex items-center justify-center h-full">
          <ActivityIndicator size="large" color="#D44A00" />
        </View>
      ) : (
        <FlatList
          data={combinedData.sort(
            (a, b) =>
              new Date(b.lastMessage[0].timestamp.seconds * 1000) -
              new Date(a.lastMessage[0].timestamp.seconds * 1000)
          )}
          renderItem={({ item }) => (
            <ChatItem navigation={navigation} friend={item} />
          )}
          // keyExtractor={(item, index) => index.toString()}
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
