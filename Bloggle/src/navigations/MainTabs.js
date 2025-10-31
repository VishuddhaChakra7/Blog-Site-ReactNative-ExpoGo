import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/HomeScreen";
import { View, Text } from "react-native";

const Tab = createBottomTabNavigator();

function ProfileScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Profile Screen</Text>
    </View>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Feed" component={HomeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
