import React, { useState } from "react";
import {
  Text,
  View,
  TextInput,
  Image,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/config";
const backImage = require("../../assets/background_signin.jpg");
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useNavigation } from "@react-navigation/native";

export default function Login() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="gray" />
      </View>
    );
  }

  const onHandleLogin = () => {
    if (email !== "" && password !== "") {
      setIsLoading(true);
      signInWithEmailAndPassword(auth, email, password)
        .then(() => {
          // console.log("Login success");
        })
        .catch(
          (err) => Alert.alert("Login error", err.message),
          setIsLoading(false)
        );
    }
  };

  return (
    <KeyboardAwareScrollView className="bg-black">
      <View>
        <Image source={backImage} className={`object-cover h-80 w-full`} />
      </View>
      <View className="bg-white flex-1 h-screen rounded-t-3xl ">
        <Text className="text-[#d60e45] text-3xl font-semibold text-center py-3 mt-3">
          Se connecter
        </Text>
        <View className="mt-10 items-center">
          <TextInput
            onSubmitEditing={onHandleLogin}
            className="tracking-widest bg-gray-100 rounded-lg w-80 text-base py-2 px-1 mx-3 mb-5"
            placeholder="Enter email"
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
            // autoFocus={true}
            value={email}
            onChangeText={(text) => setEmail(text)}
          />
          <TextInput
            className="tracking-widest bg-gray-100 rounded-lg w-80 text-base py-2 px-1 mx-3 mb-1"
            placeholder="Enter password"
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry={true}
            textContentType="password"
            value={password}
            onChangeText={(text) => setPassword(text)}
          />
        </View>
        <TouchableOpacity
          className="bg-[#fac25a] py-2 rounded-md mx-10 mt-16 mb-3"
          onPress={onHandleLogin}
        >
          <Text className="text-center font-semibold text-white text-lg ">
            Login
          </Text>
        </TouchableOpacity>
        <View className="flex-row space-x-2 justify-center">
          <Text className="font-light tracking-wider">
            Don't have an account?
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
            <Text className="font-medium text-[#d60e45]">Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>

      <StatusBar barStyle="light-content" />
    </KeyboardAwareScrollView>
  );
}
