// src/screens/HomeScreen.js
import React from "react";
import { View, Text, Button } from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase";

export default function HomeScreen() {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("👋 User logged out");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 24, marginBottom: 10 }}>
        Welcome to Bloggle 📝
      </Text>
      <Text style={{ marginBottom: 20 }}>
        Logged in as: {auth.currentUser?.email}
      </Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}
