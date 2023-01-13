import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { AuthenticatedUserContext } from "../../Context/Authentication";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  addDoc,
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

  const [image, setImage] = useState(null);
  const [userImageUrl, setUserImageUrl] = useState("");
  const [username, setUsername] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { user, setUser, setUserAvatarUrl } = useContext(
    AuthenticatedUserContext
  );
  const navigation = useNavigation();

  console.log("context user = " + JSON.stringify(user));
  console.log("user image url =", userImageUrl);

  async function DocFinder(queryResult) {
    const querySnapshot = await getDocs(queryResult);
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      if (userEmail === "") {
        const { email, profilePic, username } = doc.data();
        // console.log("emmail = ", email, "profile", profilePic);
        setUserEmail(email);
        setUserImageUrl(profilePic);
        setUserAvatarUrl(profilePic);
        setUsername(username);
      }
    });
  }

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    const UserRef = collection(db, "Users");
    const queryResult = query(UserRef, where("email", "==", user.email));

    DocFinder(queryResult);
    setIsLoading(false);
  }, [username, userImageUrl]);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [5, 4],
      quality: 1,
    });

    // console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      if (image) {
        uploadImage();
      }
    }
  };

  const uploadImage = async () => {
    const metadata = {
      contentType: "image/jpeg",
    };
    const response = await fetch(image);
    const blob = await response.blob();
    const filename = image.substring(image.lastIndexOf("/") + 1);
    const imageRef = ref(storage, `ProfilePictures/${filename}`);
    uploadBytes(imageRef, blob, metadata).then(async () => {
      const downloadURL = await getDownloadURL(imageRef);
      console.log("download url in UPLOAD Image = " + downloadURL);
      if (!userImageUrl) {
        console.log("if no user image url");
        setUserImageUrl(downloadURL);

        if (username == "") {
          await addDoc(collection(db, "Users"), {
            userId: user.uid,
            profilePic: downloadURL,
            username: user.displayName,
            email: user.email,
          });
        } else {
          const UserRef = collection(db, "Users");
          const queryResult = query(UserRef, where("email", "==", user.uid));

          const querySnapshot = await getDocs(queryResult);
          querySnapshot.forEach((document) => {
            updateDoc(doc(db, "Users", document.id), {
              profilePic: downloadURL,
            }).then(() => {
              setUserImageUrl(downloadURL);
            });
          });
        }
      } else {
        console.log("if THERE IS user image url");
        const UserRef = collection(db, "Users");
        const queryResult = query(UserRef, where("email", "==", user.uid));

        const querySnapshot = await getDocs(queryResult);
        querySnapshot.forEach((document) => {
          updateDoc(doc(db, "Users", document.id), {
            profilePic: downloadURL,
          }).then(() => {
            setUserImageUrl(downloadURL);
          });
        });
      }
    });
  };

  const HandleUpdate = async () => {
    if (username !== "") {
      setIsLoading(true);
      const UserRef = collection(db, "Users");
      const queryResult = query(UserRef, where("userId", "==", user.uid));

      const querySnapshot = await getDocs(queryResult);
      querySnapshot.forEach((document) => {
        // doc.data() is never undefined for query doc snapshots
        // console.log("UPDATE FUNCTION \n", document.id, " => ", document.data());
        updateDoc(doc(db, "Users", document.id), {
          username: username,
        }).then(() => {
          setUsername;
          setIsLoading(false);
        });
      });
    }

    setImage(null);
  };
  // console.log("username = ", username);

  const HandleSignOut = () => {
    signOut(auth)
      .then(() => {
        setUser(null);
        navigation.navigate("Login");
      })
      .catch((error) => {
        console.log(error);
      });
  };
  return (
    <ScrollView>
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
        className="h-40 w-40 bg-gray-400 rounded-full items-center justify-center mt-5 mx-auto mb-10"
      >
        {userImageUrl === "" ? (
          <Ionicons name="ios-camera-outline" size={50} color="white" />
        ) : (
          <Image
            source={{ uri: userImageUrl }}
            className="h-36 w-36 rounded-full"
          />
        )}
      </TouchableOpacity>
      <View></View>

      <View className="items-center">
        <TextInput
          className="tracking-widest bg-gray-200 rounded-lg w-80 text-base py-2 px-1 mx-3 mb-5"
          placeholder="Enter username"
          autoCapitalize="none"
          keyboardType="default"
          textContentType="username"
          // autoFocus={true}
          value={username}
          onChangeText={(text) => setUsername(text)}
        />
        <Text className="tracking-widest bg-gray-200 rounded-lg w-80 text-base py-2 px-1 mx-3 mb-5 text-slate-900 font-light">
          {userEmail}
        </Text>
      </View>
      {isLoading && (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="gray" />
        </View>
      )}
      <View>
        <TouchableOpacity
          onPress={HandleUpdate}
          className="bg-green-500 py-2 rounded-md mx-10 mt-16 mb-3"
        >
          <Text className="text-center font-semibold text-white text-lg ">
            Update
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={HandleSignOut}
          className="bg-[#fac25a] py-2 rounded-md mx-20 mt-16 mb-3"
        >
          <Text className="text-center font-semibold text-white text-lg ">
            Sign out
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;
