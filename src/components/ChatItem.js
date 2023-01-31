import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";

const ChatItem = ({ navigation, friend }) => {
  //   console.log("navigation: ", navigation);
  //   console.log("friend: ", friend);
  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("Chat", {
          friendName: friend.name,
          friendAvatar: friend.avatar,
          friendEmail: friend.email,
        })
      }
      className="mx-3"
    >
      <View className="flex-row items-center space-x-4 bg-white my-2 px-2 py-2 rounded-lg">
        {friend.avatar !== null ? (
          <Image
            source={{ uri: friend.avatar }}
            className="h-12 w-12 rounded-full"
          />
        ) : (
          <Image source={userAvatar} className="h-12 w-12 rounded-full" />
        )}
        <View className="">
          <Text className="font-bold tracking-widest text-lg">
            {friend.name}
          </Text>
          <Text className="text-gray-500 text-sm max-h-7">
            {friend.lastMessage[0]?.message}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ChatItem;
