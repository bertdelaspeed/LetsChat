import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  StatusBar,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { AuthenticatedUserContext } from "../../Context/Authentication";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  collection,
  getDocs,
  query,
  doc,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../../firebase/config";
import { signOut } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";

const ProfileScreen = () => {
  const storage = getStorage();

  const [userImageUrl, setUserImageUrl] = useState(null);
  const [username, setUsername] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { user, setUser, setUserAvatarUrl } = useContext(
    AuthenticatedUserContext
  );
  const navigation = useNavigation();

  const UserRef = collection(db, "Users");
  const queryResult = query(UserRef, where("userId", "==", user.uid));

  async function DocFinder(queryResult) {
    const querySnapshot = await getDocs(queryResult);
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      if (userEmail === "") {
        const { email, profilePic, username } = doc.data();
        setUserEmail(email);
        setUserImageUrl(profilePic);
        setUserAvatarUrl(profilePic);
        setUsername(username);
      }
    });
  }

  useEffect(() => {
    if (!user) return;
    const UserRef = collection(db, "Users");
    const queryResult = query(UserRef, where("email", "==", user.email));

    DocFinder(queryResult);
  }, [username, userImageUrl]);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [5, 4],
      quality: 1,
    });

    if (!result.canceled) {
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (image) => {
    try {
      setIsLoading(true);
      const response = await fetch(image);
      const blob = await response.blob();
      const filename = image.substring(image.lastIndexOf("/"));
      // console.log("filename = " + filename);
      const imageRef = ref(storage, `ProfilePictures/${filename}`);
      uploadBytes(imageRef, blob).then(async () => {
        const downloadURL = await getDownloadURL(imageRef);
        // console.log("download url in UPLOAD Image = " + downloadURL);

        const querySnapshot = await getDocs(queryResult);
        querySnapshot.forEach(async (document) => {
          await updateDoc(doc(db, "Users", document.id), {
            profilePic: downloadURL,
          }).then(() => {
            setUserImageUrl(downloadURL);
            setUserAvatarUrl(downloadURL);
            setIsLoading(false);
          });
        });
      });
    } catch (error) {
      Alert.alert(error.message);
      setIsLoading(false);
    }
  };

  const HandleSignOut = () => {
    signOut(auth)
      .then(() => {
        setUser(null);
        navigation.navigate("Login");
      })
      .catch((error) => {
        Alert.alert(error.message);
      });
  };

  // console.log("is loading = " + isLoading);

  return (
    <View>
      <View className="justify-center items-center my-10">
        <Text className="text-2xl font-medium tracking-widest">
          Bienvenue,{" "}
          <Text className="text-[#d60e45]">
            {username !== null ? username : "Boss"}{" "}
          </Text>
        </Text>
      </View>
      <TouchableOpacity
        onPress={pickImage}
        className="rounded-md bg-gray-400 items-center justify-center mx-10 mb-10"
      >
        {userImageUrl === undefined ? (
          <Ionicons name="ios-camera-outline" size={50} color="white" />
        ) : isLoading ? (
          <ActivityIndicator size="large" color="white" />
        ) : (
          <Image
            source={{ uri: userImageUrl }}
            className="h-40 w-full rounded-md"
          />
        )}
      </TouchableOpacity>

      <View className="items-center">
        <Text className="tracking-widest bg-gray-200 rounded-lg w-80 text-base py-2 px-1 mx-3 mb-5 text-slate-900 font-light">
          {username}
        </Text>
        <Text className="tracking-widest bg-gray-200 rounded-lg w-80 text-base py-2 px-1 mx-3 mb-5 text-slate-900 font-light">
          {userEmail}
        </Text>
      </View>

      {isLoading && (
        <View>
          <Text className="text-lg text-center tracking-widest">
            Patienter ...
          </Text>
        </View>
      )}

      <View>
        <TouchableOpacity
          onPress={HandleSignOut}
          className="bg-[#fac25a] py-2 rounded-md mx-20 mt-16 mb-3"
        >
          <Text className="text-center font-semibold text-white text-lg ">
            Sign out
          </Text>
        </TouchableOpacity>
      </View>
      <StatusBar barStyle="dark-content" />
    </View>
  );
};

export default ProfileScreen;
