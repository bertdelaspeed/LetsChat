import { Alert } from "react-native";

const sortLastMessage = (a, b) => {
  const aTimestamp = a.message[0]?.timestamp || 0;
  const bTimestamp = b.message[0]?.timestamp || 0;

  return bTimestamp - aTimestamp;
};

const combineData = (friendAvatar, sortedLastMessage) => {
  return friendAvatar.map((friend) => {
    const lastMessageData = sortedLastMessage.find((chat) =>
      chat.chatters.includes(friend.name)
    );
    return {
      ...friend,
      lastMessage: lastMessageData ? lastMessageData.message : "",
    };
  });
};

function processAuthError(authError) {
  if (authError.message.includes("user-not-found")) {
    Alert.alert("User not found", "You probably have to sign up first.");
  } else if (authError.message.includes("wrong-password")) {
    Alert.alert("Wrong password", "Try again.");
  } else if (authError.message.includes("email-already-in-use")) {
    Alert.alert(
      "Please Use Another Email ID",
      "This email ID already exists. Use a different one",
      [
        {
          text: "Ok",
          onPress: () => null,
          style: "cancel",
        },
      ]
    );
  } else if (authError.message.includes("network-request-failed")) {
    Alert.alert(
      "Network error",
      "Try again later or check your internet connection."
    );
  } else if (authError.message.includes("invalid-email")) {
    Alert.alert("Invalid email", "Should be in Email format");
  } else {
    Alert.alert("Unknown Error", "Try again later.");
  }
}

export { sortLastMessage, combineData, processAuthError };
