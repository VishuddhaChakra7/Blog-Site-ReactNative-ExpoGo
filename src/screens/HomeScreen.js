import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db, auth } from "../config/firebase";

export default function HomeScreen() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
      setPosts(list);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // 🕒 Relative Time Helper
  const getRelativeTime = (timestamp) => {
    if (!timestamp?.toDate) return "Just now";
    const diffMs = Date.now() - timestamp.toDate().getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    return `${diffDays}d ago`;
  };

  // ❤️ Toggle Like
  const handleLike = async (postId, likes = []) => {
    if (!user) return;
    const postRef = doc(db, "posts", postId);
    const hasLiked = likes.includes(user.uid);

    await updateDoc(postRef, {
      likes: hasLiked ? arrayRemove(user.uid) : arrayUnion(user.uid),
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading posts...</Text>
      </View>
    );
  }
  

  // ✅ Render Item
    const renderItem = ({ item }) => {
    const time = getRelativeTime(item.createdAt);
    const likesCount = item.likes?.length || 0;
    const hasLiked = item.likes?.includes(user?.uid);

    return (
      <View style={styles.card}>
        {/* 👤 User Info Row */}
        <View style={styles.userRow}>
          <View style={styles.emojiCircle}>
            <Text style={styles.emoji}>{item.emojiAvatar || "👤"}</Text>
          </View>
          <View>
            <Text style={styles.username}>@{item.username || "user"}</Text>
            <Text style={styles.time}>{time}</Text>
          </View>
        </View>

        {/* 📝 Blog Content */}
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.content}>{item.content}</Text>

        {/* ❤️ 💬 Actions Row */}
        <View style={styles.actionsRow}>
          {/* ❤️ Like */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => handleLike(item.id, item.likes)}
          >
            <Ionicons
              name={hasLiked ? "heart" : "heart-outline"}
              size={22}
              color={hasLiked ? "#FF3B30" : "#666"}
            />
            <Text style={styles.iconText}>{likesCount}</Text>
          </TouchableOpacity>

          {/* 💬 Comment */}
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="chatbubble-outline" size={20} color="#666" />
            <Text style={styles.iconText}>0</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

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
    paddingTop: 20,
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
    borderColor: "#eee",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  emojiCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f2f2f2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  emoji: {
    fontSize: 22,
  },
  username: {
    fontWeight: "600",
    color: "#111",
  },
  time: {
    fontSize: 12,
    color: "gray",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 5,
  },
  content: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 10,
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

  // ❤️ 💬 Actions
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 25,
    borderTopWidth: 1,
    borderColor: "#f0f0f0",
    paddingTop: 10,
    marginTop: 10,
  },
  iconButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconText: {
    marginLeft: 5,
    fontSize: 14,
    color: "#444",
  },
});
