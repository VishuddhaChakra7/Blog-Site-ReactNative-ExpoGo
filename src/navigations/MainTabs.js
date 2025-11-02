import React from "react";
import { View, Image } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons, Feather } from "@expo/vector-icons";

// Import your screens
import HomeScreen from "../screens/HomeScreen";
import WriteScreen from "../screens/WriteScreen";
import MyPostsScreen from "../screens/MyPostsScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 0.3,
          borderTopColor: "#ccc",
          height: 60,
        },
        tabBarIcon: ({ focused }) => {
          let icon;

          switch (route.name) {
            case "Home":
              icon = (
                <Ionicons
                  name={focused ? "home" : "home-outline"}
                  size={26}
                  color="#000"
                />
              );
              break;

            case "Write":
              icon = (
                <Feather
                  name="edit"
                  size={focused ? 26 : 24}
                  color="#000"
                />
              );
              break;

            case "MyPosts":
              icon = (
                <Ionicons
                  name={focused ? "book" : "book-outline"}
                  size={26}
                  color="#000"
                />
              );
              break;

            case "Profile":
              icon = (
                <Ionicons
                  name={focused ? "person" : "person-outline"}
                  size={26}
                  color="#000"
                />
              );
              break;
          }

          return icon;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Write" component={WriteScreen} />
      <Tab.Screen name="MyPosts" component={MyPostsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
