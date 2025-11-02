import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { auth, db, storage } from "../config/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function WriteScreen() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // 📸 Pick image
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // 🚀 Upload and create post
  const handlePost = async () => {
    if (!title || !content) {
      Alert.alert("Missing fields", "Please enter both title and content");
      return;
    }

    setLoading(true);

    try {
      let imageUrl = null;

      // 🖼️ Upload image if present
      if (image) {
        const response = await fetch(image);
        const blob = await response.blob();
        const storageRef = ref(storage, `posts/${Date.now()}.jpg`);
        await uploadBytes(storageRef, blob);
        imageUrl = await getDownloadURL(storageRef);
      }

      // 📝 Add blog post to Firestore
      await addDoc(collection(db, "posts"), {
        title,
        content,
        imageUrl,
        author: auth.currentUser?.email || "Unknown",
        createdAt: serverTimestamp(),
      });

      Alert.alert("Success", "Blog post uploaded 🎉");
      setTitle("");
      setContent("");
      setImage(null);
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to upload post");
    }

    setLoading(false);
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

      {image && <Image source={{ uri: image }} style={styles.preview} />}

      <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
        <Text style={styles.imageButtonText}>📷 Choose Image</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={handlePost}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Uploading..." : "Post Blog"}
        </Text>
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
  preview: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 15,
  },
  imageButton: {
    backgroundColor: "#ddd",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  imageButtonText: {
    fontWeight: "500",
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
});
