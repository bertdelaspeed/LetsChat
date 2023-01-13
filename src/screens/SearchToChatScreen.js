import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import React, { useState } from "react";
import { SimpleLineIcons } from "@expo/vector-icons";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useNavigation } from "@react-navigation/native";

const SearchToChatScreen = () => {
  const navigation = useNavigation();

  const [searchFriend, setSearchFriend] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchedFriendAvatar, setSearchedFriendAvatar] = useState(null);
  const [searchedFriendName, setSearchedFriendName] = useState(null);

  const HandleSearch = async () => {
    if (searchFriend !== "") {
      setSearchedFriendAvatar(null);
      setSearchedFriendName(null);
      setIsLoading(true);
      console.log(searchFriend);
      const UserRef = collection(db, "Users");
      const queryResult = query(
        UserRef,
        where("username", "==", searchFriend.trim())
      );
      const querySnapshot = await getDocs(queryResult);

      querySnapshot.forEach((document) => {
        const { profilePic, username } = document.data();
        setSearchedFriendAvatar(profilePic);

        setSearchedFriendName(username);
      });
      setIsLoading(false);
    }
  };

  return (
    <View className="bg-gray-200 flex-1">
      <View className="flex-row items-center  content-center my-3 mx-3 mb-10">
        <TextInput
          onSubmitEditing={HandleSearch}
          className="tracking-widest bg-gray-100 rounded-lg w-80 text-base py-2 px-1 mx-3 "
          placeholder="Rechercher "
          autoCapitalize="none"
          keyboardType="default"
          autoFocus={true}
          value={searchFriend}
          onChangeText={(text) => setSearchFriend(text)}
        />
        <TouchableOpacity
          onPress={HandleSearch}
          className="bg-orange-400 w-10 h-12 rounded-lg items-center justify-center"
        >
          <SimpleLineIcons name="magnifier" size={24} color="white" />
        </TouchableOpacity>
      </View>
      {isLoading && <ActivityIndicator size={"large"} color="gray" />}
      {searchedFriendAvatar && searchedFriendName ? (
        <TouchableOpacity
          onPress={() => navigation.navigate("Chat")}
          className="mx-6"
        >
          <View className="flex-row items-center space-x-4 bg-gray-100 px-2 py-2 rounded-lg">
            <Image
              source={{ uri: searchedFriendAvatar }}
              className="h-14 w-14 rounded-full"
            />
            <Text className="font-bold tracking-widest text-lg">
              {searchedFriendName}
            </Text>
          </View>
        </TouchableOpacity>
      ) : (
        <View className="mx-6 text-center">
          <Text>Not found</Text>
        </View>
      )}
    </View>
  );
};

export default SearchToChatScreen;
