// App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigations/AppNavigator"; // adjust if folder name is 'navigation'

export default function App() {
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}
