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
const squirrel = require("../../assets/squirrel-no-bg.png");
const userAvatar = require("../../assets/man.png");

const SearchToChatScreen = () => {
  const navigation = useNavigation();

  const [searchFriend, setSearchFriend] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchedFriendAvatar, setSearchedFriendAvatar] = useState(null);
  const [searchedFriendName, setSearchedFriendName] = useState(null);
  const [found, setFound] = useState(false);

  const HandleSearch = async () => {
    if (searchFriend !== "") {
      setSearchedFriendAvatar(null);
      setSearchedFriendName(null);

      setIsLoading(true);
      // console.log(searchFriend);
      const UserRef = collection(db, "Users");
      const queryResult = query(
        UserRef,
        where("username", ">=", searchFriend.trim()),
        where("username", "<=", searchFriend.trim() + "\uf8ff")
      );
      const querySnapshot = await getDocs(queryResult);

      // console.log("result = " + querySnapshot.empty);
      if (!querySnapshot.empty) {
        querySnapshot.forEach((document) => {
          const { profilePic, username } = document.data();

          setSearchedFriendAvatar(profilePic);
          setSearchedFriendName(username);
          setFound(true);
        });
      } else {
        setFound(false);
      }

      setIsLoading(false);
    }
  };

  return (
    <View className="bg-gray-200 flex-1">
      <View className={`flex-row items-center content-center my-3 mx-3 mb-10`}>
        <TextInput
          onSubmitEditing={HandleSearch}
          className={`tracking-widest bg-gray-100 rounded-lg text-base py-2 px-1 mx-2 w-[85%]`}
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
      {found ? (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("Chat", {
              friendName: searchedFriendName,
              friendAvatar: searchedFriendAvatar,
            })
          }
          className="mx-6"
        >
          <View className="flex-row items-center space-x-4 bg-gray-100 px-2 py-2 rounded-lg">
            {searchedFriendAvatar !== undefined ? (
              <Image
                source={{ uri: searchedFriendAvatar }}
                className="h-12 w-12 rounded-full"
              />
            ) : (
              <Image source={userAvatar} className="h-12 w-12 rounded-full" />
            )}
            <Text className="font-bold tracking-widest text-lg">
              {searchedFriendName}
            </Text>
          </View>
        </TouchableOpacity>
      ) : (
        <View className="mx-6 items-center">
          {!found && (
            <>
              <Image source={squirrel} className="h-auto w-auto " />
              <Text className="text-3xl">Not found</Text>
            </>
          )}
        </View>
      )}
    </View>
  );
};

export default SearchToChatScreen;
