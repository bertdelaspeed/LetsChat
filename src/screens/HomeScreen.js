import { View, Text, TouchableOpacity, Image } from "react-native";
import React, { useContext, useEffect, useLayoutEffect, useState } from "react";
import { AuthenticatedUserContext } from "../../Context/Authentication";
import { useNavigation } from "@react-navigation/native";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase/config";
const userAvatar = require("../../assets/man.png");
import { Entypo } from "@expo/vector-icons";

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user, setUserAvatarUrl, userAvatarUrl } = useContext(
    AuthenticatedUserContext
  );

  const [isLoading, setIsLoading] = useState(false);

  // console.log("user = " + JSON.stringify(user));

  function goProfile() {
    navigation.navigate("Profile");
  }

  async function DocFinder(queryResult) {
    const querySnapshot = await getDocs(queryResult);
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      const { profilePic, username } = doc.data();
      setUserAvatarUrl(profilePic);
    });
  }

  console.log("user avatar url = ", userAvatarUrl);

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
  }, [userAvatarUrl]);

  return (
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
  );
};

export default HomeScreen;
