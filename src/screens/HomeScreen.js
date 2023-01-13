import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
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

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    const UserRef = collection(db, "Users");
    const queryResult = query(UserRef, where("userId", "==", user.uid));

    DocFinder(queryResult);
    setIsLoading(false);
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={goProfile}>
          <View className="w-10 h-10  items-center ">
            {userAvatarUrl === null ? (
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
  }, []);

  return (
    <View className="bg-black">
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Profile")}
          style={styles.chatButton}
        >
          <Entypo name="chat" size={24} color="#FAFAFA" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    backgroundColor: "#fff",
  },
  chatButton: {
    backgroundColor: "#f57c00",
    height: 50,
    width: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#f57c00",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    marginRight: 20,
    marginBottom: 50,
  },
});
