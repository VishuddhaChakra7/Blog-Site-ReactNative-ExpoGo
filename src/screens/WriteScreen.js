import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { auth, db } from "../config/firebase";
import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";

export default function WriteScreen() {
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePost = async () => {
  if (!title.trim() || !content.trim()) {
    Alert.alert("Missing fields", "Please enter both title and content.");
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    Alert.alert("Error", "You must be logged in to post.");
    return;
  }

  setLoading(true);
  try {
    // ✅ Get user data from Firestore
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.exists() ? userSnap.data() : {};

    // ✅ Get emoji + username from profile or fallback
    const emoji = userData.emojiAvatar || "👤";
    const uname =
      userData.username ||
      user.displayName?.split(" ")[0]?.toLowerCase() ||
      "user";

    // ✅ Add post to Firestore
    await addDoc(collection(db, "posts"), {
      title: title.trim(),
      content: content.trim(),
      author: user.email,
      authorId: user.uid,
      username: uname,
      emojiAvatar: emoji,
      createdAt: serverTimestamp(),
    });

    Alert.alert("✅ Success", "Blog post uploaded!");
    setTitle("");
    setContent("");
  } catch (error) {
    console.error("Post error:", error);
    Alert.alert("Error", "Failed to upload post.");
  } finally {
    setLoading(false);
  }
};

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>✍️ Create New Blog</Text>

      <TextInput
        placeholder="Enter Title"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />

      <TextInput
        placeholder="Write your content..."
        value={content}
        onChangeText={setContent}
        style={[styles.input, { height: 120 }]}
        multiline
      />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={handlePost}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Post Blog</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  sectionHeader: {
  width: "100%",
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: 15,
  borderBottomWidth: 1,
  borderColor: "#eee",
  backgroundColor: "#fff",
  elevation: 3, // light Android shadow
  shadowColor: "#000",
  shadowOpacity: 0.05,
  shadowRadius: 2,
},
sectionTitle: {
  fontSize: 22,
  fontWeight: "700",
  color: "#111",
  letterSpacing: 0.5,
},

});
