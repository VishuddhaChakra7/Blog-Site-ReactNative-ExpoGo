import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db, auth } from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MyPostsScreen() {
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // 🧠 Set up Auth listener + Firestore real-time listener
  useEffect(() => {
    let unsubscribePosts = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);

        const q = query(
          collection(db, "posts"),
          where("author", "==", user.email),
          orderBy("createdAt", "desc")
        );

        unsubscribePosts = onSnapshot(
          q,
          (snapshot) => {
            const posts = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setMyPosts(posts);
            setLoading(false);
          },
          (error) => {
            console.error("Snapshot error:", error);
            setLoading(false);
          }
        );
      } else {
        setUserEmail(null);
        setMyPosts([]);
        setLoading(false);
      }
    });

    return () => {
      if (unsubscribePosts) unsubscribePosts();
      unsubscribeAuth();
    };
  }, []);

  // 🔄 Pull-to-refresh logic
  const onRefresh = useCallback(async () => {
    if (!userEmail) return;
    setRefreshing(true);

    try {
      const q = query(
        collection(db, "posts"),
        where("author", "==", userEmail),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);
      const posts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMyPosts(posts);
    } catch (error) {
      console.error("Refresh error:", error);
      Alert.alert("Error", "Failed to refresh posts.");
    } finally {
      setRefreshing(false);
    }
  }, [userEmail]);

  // 🗑️ Delete post handler
  const handleDelete = (postId) => {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "posts", postId));
            Alert.alert("Deleted ✅", "Your post has been removed.");
          } catch (error) {
            console.error("❌ Delete error:", error);
            Alert.alert("Error", "Failed to delete post.");
          }
        },
      },
    ]);
  };

  // 🧭 Conditional render states
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading your posts...</Text>
      </View>
    );
  }

  if (!userEmail) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Please log in to see your posts 🔑</Text>
      </View>
    );
  }

  if (myPosts.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.emptyText}>
            You haven't written any posts yet 📝
          </Text>
          <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
            <Text style={styles.refreshText}>🔄 Refresh</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // 📋 Post card renderer
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.content}>{item.content}</Text>
      <Text style={styles.time}>
        {item.createdAt?.toDate?.().toLocaleString() || "Just now"}
      </Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(item.id)}
        >
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ✅ Main render
  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={myPosts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
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
    paddingTop: 20, // 🧩 Fix: ensures posts aren't hidden under top edge
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
    marginBottom: 10,
  },
  refreshBtn: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  refreshText: { color: "#fff", fontWeight: "bold" },
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
  title: { fontSize: 18, fontWeight: "600", marginBottom: 5 },
  content: { fontSize: 15, color: "#444", marginBottom: 10 },
  time: { fontSize: 12, color: "gray", textAlign: "right" },
  actions: { flexDirection: "row", justifyContent: "flex-end", marginTop: 10 },
  deleteBtn: {
    backgroundColor: "#FF3B30",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  deleteText: { color: "#fff", fontWeight: "bold" },
});
