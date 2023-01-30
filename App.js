import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./src/screens/LoginScreen";
import SignupScreen from "./src/screens/SignupScreen";
import AuthenticatedUserProvider, {
  AuthenticatedUserContext,
} from "./Context/Authentication";
import HomeScreen from "./src/screens/HomeScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import React, { useContext, useEffect, useState } from "react";
import { Image } from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/config";
import SearchToChatScreen from "./src/screens/SearchToChatScreen";
import ChatScreen from "./src/screens/ChatScreen";
const loadingGif = require("./assets/loading.gif");

import registerNNPushToken from "native-notify";

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { user, setUser } = useContext(AuthenticatedUserContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        // console.log("out !");
      }
      setIsLoading(false);
    });
  }, [user]);

  return (
    <NavigationContainer>
      {!user && isLoading === true ? (
        <Image source={loadingGif} className="h-full w-full" />
      ) : !user && isLoading === false ? (
        <AuthStack />
      ) : (
        <MainStack />
      )}
    </NavigationContainer>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator defaultScreenOptions={HomeScreen}>
      <Stack.Screen name="LetsChat" component={HomeScreen} />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Search"
        component={SearchToChatScreen}
        options={{ title: "Avec Qui Chatter" }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{ headerTitle: "" }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  registerNNPushToken(6054, "OLbw8pXPqXXjN0d24TdlsU");
  return (
    <AuthenticatedUserProvider>
      <RootNavigator />
    </AuthenticatedUserProvider>
  );
}
