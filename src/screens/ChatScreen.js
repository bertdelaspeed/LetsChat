import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  FlatList,
} from "react-native";
import React, {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  Timestamp,
  updateDoc,
  where,
  onSnapshot,
} from "firebase/firestore";
import { chatsRef, db } from "../../firebase/config";
import { AuthenticatedUserContext } from "../../Context/Authentication";
import "firebase/firestore";
const userAvatar = require("../../assets/man.png");
import axios from "axios";
import MessageItem from "../components/MessageItem";

const ChatScreen = () => {
  const route = useRoute();
  const { friendName, friendAvatar, friendEmail } = route.params;
  const navigation = useNavigation();

  const [message, setMessage] = useState("");
  const { user } = useContext(AuthenticatedUserContext);
  const sender = user.email.split("@")[0];

  const [messages, setMessages] = useState([]);
  const flatListRef = useRef(null);
  const [isListReady, setIsListReady] = useState(false);

  const queryResult = query(
    chatsRef,
    where("chatters", "==", `${sender}xx${friendName}`)
  );
  const queryResult2 = query(
    chatsRef,
    where("chatters", "==", `${friendName}xx${sender}`)
  );

  useEffect(() => {
    const fetchMessages = async () => {
      const querySnapshot = await getDocs(queryResult);
      const querySnapshot2 = await getDocs(queryResult2);
      if (!querySnapshot.empty || !querySnapshot2.empty) {
        let allMessages = querySnapshot.docs.map(
          (doc) => doc.data().conversation
        );
        allMessages = allMessages.concat(
          querySnapshot2.docs.map((doc) => doc.data().conversation)
        );
        allMessages = allMessages.sort(
          (a, b) => a.timestamp?.seconds - b.timestamp?.seconds
        );
        setMessages(allMessages);
      }
    };
    const unsub1 = onSnapshot(queryResult, (snapshot) => {
      const allMessages = snapshot.docs.map((doc) => doc.data().conversation);
      setMessages(allMessages);
    });
    const unsub2 = onSnapshot(queryResult2, (snapshot) => {
      const allMessages = snapshot.docs.map((doc) => doc.data().conversation);
      setMessages(allMessages);
    });
    fetchMessages();
    return () => {
      unsub1();
      unsub2();
    };
  }, []);

  useEffect(() => {
    setIsListReady(true);
  }, [messages]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <View className="flex-row space-x-2 items-center">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back-outline" size={30} color="black" />
          </TouchableOpacity>
          {friendAvatar !== undefined ? (
            <Image
              source={{ uri: friendAvatar }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 25,
                marginRight: 10,
              }}
            />
          ) : (
            <Image
              source={userAvatar}
              style={{
                width: 40,
                height: 40,
                borderRadius: 25,
                marginRight: 10,
              }}
            />
          )}
          <Text className="text-black text-bold tracking-widest text-lg">
            {friendName}
          </Text>
        </View>
      ),
    });
  }, []);

  const handleSubmit = async () => {
    // console.log("submit button pressed");

    const querySnapshot = await getDocs(queryResult);
    const querySnapshot2 = await getDocs(queryResult2);

    if (!querySnapshot.empty || !querySnapshot2.empty) {
      querySnapshot.forEach((document) => {
        updateDoc(doc(db, "Chats", document.id), {
          conversation: [
            ...document.data().conversation,
            {
              message: message,
              timestamp: Timestamp.now(),
              sender: sender,
            },
          ],
        })
          .then(() => {})
          .catch((err) => console.log(err));
      });
      querySnapshot2.forEach((document) => {
        updateDoc(doc(db, "Chats", document.id), {
          conversation: [
            ...document.data().conversation,
            {
              message: message,
              timestamp: Timestamp.now(),
              sender: sender,
            },
          ],
        })
          .then(() => {})
          .catch((err) => console.log(err));
      });
    } else {
      await addDoc(collection(db, "Chats"), {
        chatters: `${sender}xx${friendName}`,
        conversation: [
          {
            message: message,
            timestamp: Timestamp.now(),
            sender: sender,
          },
        ],
      });
    }

    axios
      .post(`https://app.nativenotify.com/api/indie/notification`, {
        subID: `${friendEmail}`,
        appId: 6054,
        appToken: "OLbw8pXPqXXjN0d24TdlsU",
        title: `${sender} - LetsChat`,
        message: `${message}`,
      })
      .catch((err) => console.log("do nothing"));

    setMessage("");
  };

  return (
    <View>
      <View className="h-[90%]">
        {messages[0] !== undefined && (
          <FlatList
            initialNumToRender={10}
            ref={flatListRef}
            onContentSizeChange={() => {
              if (isListReady) {
                flatListRef?.current?.scrollToEnd({ animated: true });
              }
            }}
            data={messages[0]}
            keyExtractor={(item) => item.timestamp}
            renderItem={({ item }) => (
              <MessageItem item={item} sender={sender} />
            )}
          />
        )}
      </View>
      <View className="flex-row items-center mx-3 space-x-3 h-[10%] -mb-3">
        <TextInput
          className="bg-white rounded-xl p-2 flex-1 focus:outline-none focus:shadow-outline-blue text-gray-700 h-12"
          placeholder="Type your message here..."
          multiline={true}
          value={message}
          onChangeText={(text) => setMessage(text)}
        />
        <TouchableOpacity onPress={handleSubmit}>
          <MaterialCommunityIcons
            name="send-circle"
            size={40}
            color="orange"
            className="ml-4"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChatScreen;
