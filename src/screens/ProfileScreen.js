import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Modal,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "../config/firebase";
import {
  updateProfile,
  updateEmail,
  signOut,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

export default function ProfileScreen({ navigation }) {
  const user = auth.currentUser;
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [username, setUsername] = useState(
    user?.displayName?.split(" ")[0]?.toLowerCase() || "user"
  );
  const [email, setEmail] = useState(user?.email || "");
  const [bio, setBio] = useState("");
  const [photoURI, setPhotoURI] = useState(null);
  const [emojiAvatar, setEmojiAvatar] = useState("😀");
  const [useEmoji, setUseEmoji] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showReauthModal, setShowReauthModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [password, setPassword] = useState("");
  const [blogsCount, setBlogsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogCount = async () => {
      try {
        const q = query(collection(db, "posts"), where("author", "==", user?.email));
        const snapshot = await getDocs(q);
        setBlogsCount(snapshot.size);
      } catch (e) {
        console.error("Error fetching blog count:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogCount();
  }, [user]);

  // 🔄 Load user profile from Firestore
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          setDisplayName(data.displayName || user.displayName || "");
          setUsername(data.username || "user");
          setBio(data.bio || "");
          setPhotoURI(data.photoURL || null);
          setEmojiAvatar(data.emojiAvatar || "😀");
          setUseEmoji(!!data.emojiAvatar);
        }
      } catch (error) {
        console.error("Error loading user profile:", error);
      }
    };
    if (user?.uid) loadUserProfile();
  }, [user]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "Please allow photo access.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotoURI(result.assets[0].uri);
      setUseEmoji(false);
    }
  };

  const selectEmoji = (emoji) => {
    setEmojiAvatar(emoji);
    setUseEmoji(true);
    setPhotoURI(null);
    setShowEmojiPicker(false);
  };

  // 💾 Save to Auth + Firestore
  const handleSave = async () => {
    if (!displayName.trim() || !email.trim()) {
      Alert.alert("Missing fields", "Please fill in name and email.");
      return;
    }

    try {
      await updateProfile(user, {
        displayName: displayName.trim(),
        photoURL: photoURI || null,
      });

      if (email.trim() !== user.email) {
        try {
          await updateEmail(user, email.trim());
        } catch (error) {
          if (error.code === "auth/requires-recent-login") {
            setShowReauthModal(true);
            return;
          } else throw error;
        }
      }

      const userRef = doc(db, "users", user.uid);
      await setDoc(
        userRef,
        {
          displayName: displayName.trim(),
          username: username.trim(),
          email: email.trim(),
          bio,
          emojiAvatar: useEmoji ? emojiAvatar : null,
          photoURL: photoURI || null,
          updatedAt: new Date(),
        },
        { merge: true }
      );

      Alert.alert("✅ Profile updated successfully!");
      setEditing(false);
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to update profile.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigation.replace("Login");
  };

  const handleReauth = async () => {
    if (!password) return;
    const credential = EmailAuthProvider.credential(user.email, password);
    try {
      await reauthenticateWithCredential(user, credential);
      setShowReauthModal(false);
      await updateEmail(user, email.trim());
      Alert.alert("✅ Email Updated");
    } catch {
      Alert.alert("Error", "Incorrect password.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={() => setShowSettingsModal(true)}>
          <Ionicons name="settings-outline" size={22} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.avatarSection}>
        {useEmoji ? (
          <View style={[styles.avatar, styles.emojiAvatar]}>
            <Text style={styles.emojiText}>{emojiAvatar}</Text>
          </View>
        ) : photoURI ? (
          <Image source={{ uri: photoURI }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.placeholder]}>
            <Text style={styles.avatarText}>
              {user?.email?.[0]?.toUpperCase() || "👤"}
            </Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.pencilButton}
          onPress={() =>
            Alert.alert("Change Profile Picture", "", [
              { text: "📷 Choose Photo", onPress: pickImage },
              { text: "😀 Choose Emoji", onPress: () => setShowEmojiPicker(true) },
              { text: "Cancel", style: "cancel" },
            ])
          }
        >
          <Ionicons name="pencil" size={16} color="#555" />
        </TouchableOpacity>
      </View>

      <View style={styles.userInfo}>
        {editing ? (
          <>
            <TextInput
              style={styles.input}
              placeholder="Display Name"
              value={displayName}
              onChangeText={setDisplayName}
            />
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
            />
          </>
        ) : (
          <>
            <Text style={styles.name}>{displayName || "Unnamed"}</Text>
            <Text style={styles.username}>@{username}</Text>
          </>
        )}

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => (editing ? handleSave() : setEditing(true))}
        >
          <Ionicons
            name={editing ? "checkmark-outline" : "pencil-outline"}
            size={16}
            color={editing ? "#28A745" : "#007AFF"}
          />
          <Text
            style={[
              styles.editText,
              { color: editing ? "#28A745" : "#007AFF" },
            ]}
          >
            {editing ? "Save" : "Edit"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{loading ? "..." : blogsCount}</Text>
          <Text style={styles.statLabel}>Blogs</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Saved</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Share</Text>
        </View>
      </View>

      <View style={styles.bioCard}>
        {bio ? (
          <>
            <Text style={styles.bioText}>{bio}</Text>
            <TouchableOpacity
              style={styles.bioEditBtn}
              onPress={() =>
                Alert.prompt("Edit Bio", "Update your bio:", (text) => setBio(text))
              }
            >
              <Ionicons name="pencil-outline" size={16} color="#007AFF" />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.placeholderText}>
              👋 Hey {displayName || "there"}, you haven’t added your bio yet.
            </Text>
            <TouchableOpacity
              style={styles.addTopicBtn}
              onPress={() =>
                Alert.prompt("Add Bio", "Enter your bio:", (text) => setBio(text))
              }
            >
              <Text style={styles.addTopicText}>+ Add Bio</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <Modal visible={showSettingsModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.settingsModal}>
            <Text style={styles.modalTitle}>Settings</Text>
            <TouchableOpacity onPress={handleLogout}>
              <Text style={styles.logoutOption}>🚪 Logout</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowSettingsModal(false)}>
              <Text style={styles.cancelOption}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showEmojiPicker} transparent animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.emojiPickerContainer}>
            <Text style={styles.modalTitle}>Select an Emoji</Text>
            <ScrollView contentContainerStyle={styles.emojiGrid}>
              {[
                "😀","😎","🦊","🐼","🐱","🐶","🦄","🐢","🦁","🐻",
                "🐧","🐸","🦋","💫","🌈","🔥","💀","👑","🍀","🎨"
              ].map((emoji, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => selectEmoji(emoji)}
                  style={styles.emojiOption}
                >
                  <Text style={{ fontSize: 30 }}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeEmojiPicker}
              onPress={() => setShowEmojiPicker(false)}
            >
              <Text style={{ color: "#007AFF" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// 🧾 Styles
const styles = StyleSheet.create({
  container: { backgroundColor: "#fff", alignItems: "center", paddingVertical: 40 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    marginBottom: 20,
  },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "#111" },
  avatarSection: { position: "relative", alignItems: "center", marginBottom: 15 },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#007AFF",
  },
  emojiAvatar: { justifyContent: "center", alignItems: "center", backgroundColor: "#FFEBCD" },
  emojiText: { fontSize: 44 },
  placeholder: { justifyContent: "center", alignItems: "center" },
  avatarText: { color: "#fff", fontSize: 36, fontWeight: "bold" },
  pencilButton: {
    position: "absolute",
    right: 10,
    bottom: 10,
    backgroundColor: "#E5E5EA",
    borderRadius: 20,
    padding: 6,
    borderWidth: 1,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  userInfo: { alignItems: "center", marginBottom: 20 },
  name: { fontSize: 20, fontWeight: "bold", color: "#111" },
  username: { fontSize: 14, color: "#777", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    width: 250,
    marginBottom: 10,
    textAlign: "center",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  editText: { fontSize: 14, marginLeft: 4 },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "90%",
    marginVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E5E5EA",
    paddingVertical: 10,
  },
  stat: { alignItems: "center" },
  statValue: { fontWeight: "bold", fontSize: 16, color: "#111" },
  statLabel: { fontSize: 12, color: "gray" },
  bioCard: {
    backgroundColor: "#F9F9F9",
    width: "90%",
    borderRadius: 12,
    padding: 16,
    marginTop: 15,
  },
  bioText: { color: "#333", marginBottom: 10, fontStyle: "italic" },
  placeholderText: { color: "#555", marginBottom: 10 },
  bioEditBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#E5E5EA",
    borderRadius: 20,
    padding: 6,
  },
  screen: {
  flex: 1,
  backgroundColor: "#fff",
},

container: {
  flexGrow: 1,
  alignItems: "center",
  paddingVertical: 40,
  backgroundColor: "#fff",
},
  addTopicBtn: {
    backgroundColor: "#007AFF",
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  addTopicText: { color: "#fff", fontWeight: "bold" },

  // 🆕 Settings Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  settingsModal: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "75%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
  logoutOption: {
    color: "#FF3B30",
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 10,
  },
  cancelOption: {
    color: "#555",
    fontSize: 15,
    marginTop: 5,
  },

  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  emojiPickerContainer: {
    backgroundColor: "#fff",
    width: "85%",
    maxHeight: "65%",
    borderRadius: 12,
    padding: 15,
  },
  emojiGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center" },
  emojiOption: { margin: 8 },
  closeEmojiPicker: { alignItems: "center", marginTop: 10 },
});
