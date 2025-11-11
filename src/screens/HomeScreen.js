import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../config/firebase";

export default function HomeScreen() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🔥 Real-time listener for posts
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
      setPosts(list);
      setLoading(false);
    });

    return unsubscribe; // cleanup listener on unmount
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading posts...</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.author}>by {item.author}</Text>
      <Text style={styles.content}>{item.content}</Text>
      <Text style={styles.time}>
        {item.createdAt?.toDate?.().toLocaleString() || "Just now"}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {posts.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>
            No posts yet. Create your first blog! 📝
          </Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  listContent: {
    paddingHorizontal: 15,
    paddingTop: 20, // ✅ fix: adds space from top so first post isn’t hidden
    paddingBottom: 10,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "gray",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 5,
  },
  author: {
    fontSize: 13,
    color: "gray",
    marginBottom: 8,
  },
  content: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 10,
  },
  time: {
    fontSize: 12,
    color: "gray",
    textAlign: "right",
  },
});
