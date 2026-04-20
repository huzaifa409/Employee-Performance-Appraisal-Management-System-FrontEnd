import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Alert,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import BASE_URL from "../../API-URL/API";

const SocietyDetails = ({ route, navigation }) => {
  const { sessionId, sessionName } = route.params;

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [societies, setSocieties] = useState([]);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchSocieties();
  }, []);

  // =========================
  // GET ALL SOCIETIES (WITH SUMMARY)
  // =========================
  const fetchSocieties = async () => {
    try {
      const res = await fetch(`${BASE_URL}/CourseManagement/GetAll`);
      const data = await res.json();

      console.log("API RESPONSE:", data);
      setSocieties(data);
    } catch (err) {
      console.log("Fetch Error:", err);
    }
  };

  // =========================
  // ADD / UPDATE SOCIETY
  // =========================
  const handleSave = async () => {
    if (!name) return Alert.alert("Error", "Society Name required");

    try {
      let url = "";
      let method = "";

      if (editId) {
        url = `${BASE_URL}/CourseManagement/UpdateSociety/${editId}`;
        method = "PUT";
      } else {
        url = `${BASE_URL}/CourseManagement/AddSociety`;
        method = "POST";
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          SocietyName: name,
          Description: desc,
        }),
      });

      if (res.ok) {
        Alert.alert("Success", editId ? "Society Updated" : "Society Added");

        setName("");
        setDesc("");
        setEditId(null);

        fetchSocieties();
      } else {
        Alert.alert("Error", "Operation failed");
      }
    } catch (err) {
      console.log("Save Error:", err);
    }
  };

  const handleEdit = (item) => {
    setName(item.SocietyName);
    setDesc(item.Description);
    setEditId(item.SocietyId);
  };

  return (
    <>
      <StatusBar backgroundColor="green" barStyle="light-content" />

      <SafeAreaView style={styles.container} edges={["top"]}>
        <ScrollView>

          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={22} color="green" />
            </TouchableOpacity>

            <View style={styles.headerTitleBox}>
              <Text style={styles.headerTitle}>Societies</Text>
              <Text style={styles.headerSub}>Society Management</Text>
            </View>
          </View>

          {/* SESSION */}
          <View style={styles.sessionBar}>
            <Text style={styles.sessionText}>Session:</Text>
            <View style={styles.sessionBadge}>
              <Text style={styles.sessionBadgeText}>
                {sessionName}
              </Text>
            </View>
          </View>

          {/* FORM */}
          <View style={styles.formBox}>
            <Text style={styles.formTitle}>+ Add / Update Society</Text>

            <Text style={styles.label}>Society Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Programming Society"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Brief description..."
              multiline
              value={desc}
              onChangeText={setDesc}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveText}>
                {editId ? "Update Society" : "Save Society"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* TITLE */}
          <Text style={styles.listTitle}>
            Existing Societies ({societies.length})
          </Text>

          {/* LIST */}
          {societies.length === 0 ? (
            <Text style={{ textAlign: "center", marginTop: 20 }}>
              No societies found
            </Text>
          ) : (
            societies.map((item) => (
              <View key={item.SocietyId} style={styles.card}>

                {/* LEFT SIDE */}
                <View style={{ flex: 1 }}>

                  <Text style={styles.cardTitle}>
                    {item.SocietyName}
                  </Text>

                  <Text style={styles.cardDesc}>
                    {item.Description}
                  </Text>

                  {/* COUNTS */}
                  <Text style={styles.meta}>
                    👤 {item.ChairCount ?? 0} Chairpersons{"   "}
                    👥 {item.MentorCount ?? 0} Mentors
                  </Text>

                  {/* CHAIRPERSON LIST */}
                  {item.Chairpersons?.length > 0 && (
                    <View style={{ marginTop: 8 }}>
                      <Text style={styles.roleTitle}>Chairpersons:</Text>
                      {item.Chairpersons.map((name, i) => (
                        <Text key={i} style={styles.roleItem}>
                          • {name}
                        </Text>
                      ))}
                    </View>
                  )}

                  {/* MENTOR LIST (OPTIONAL) */}
                  {item.Mentors?.length > 0 && (
                    <View style={{ marginTop: 8 }}>
                      <Text style={styles.roleTitle}>Mentors:</Text>
                      {item.Mentors.map((name, i) => (
                        <Text key={i} style={styles.roleItem}>
                          • {name}
                        </Text>
                      ))}
                    </View>
                  )}

                </View>

                {/* ACTIONS */}
                <View style={styles.actions}>
                  <MaterialIcons
                    name="edit"
                    size={22}
                    color="green"
                    onPress={() => handleEdit(item)}
                  />
                </View>

              </View>
            ))
          )}

        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f7f5",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
  },

  headerTitleBox: {
    marginLeft: 10,
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },

  headerSub: {
    fontSize: 12,
    color: "gray",
  },

  sessionBar: {
    backgroundColor: "green",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },

  sessionText: {
    color: "#fff",
    marginRight: 8,
    fontSize: 13,
  },

  sessionBadge: {
    backgroundColor: "#2ecc71",
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 12,
  },

  sessionBadgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },

  formBox: {
    backgroundColor: "#fff",
    margin: 15,
    padding: 15,
    borderRadius: 12,
    elevation: 2,
  },

  formTitle: {
    fontWeight: "700",
    marginBottom: 10,
    fontSize: 14,
    color: "#333",
  },

  label: {
    marginTop: 10,
    fontSize: 13,
    color: "#444",
  },

  input: {
    backgroundColor: "#f1f1f1",
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
  },

  saveBtn: {
    backgroundColor: "green",
    padding: 12,
    borderRadius: 10,
    marginTop: 15,
    alignItems: "center",
  },

  saveText: {
    color: "#fff",
    fontWeight: "600",
  },

  listTitle: {
    marginLeft: 15,
    fontWeight: "700",
    marginTop: 10,
    fontSize: 14,
    color: "#222",
  },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginTop: 10,
    padding: 15,
    borderRadius: 12,
    flexDirection: "row",
    elevation: 2,
  },

  cardTitle: {
    fontWeight: "700",
    fontSize: 15,
    color: "#111",
  },

  cardDesc: {
    color: "gray",
    marginTop: 4,
    fontSize: 12,
  },

  meta: {
    marginTop: 6,
    fontSize: 12,
    color: "#333",
  },

  roleTitle: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 5,
    color: "#111",
  },

  roleItem: {
    fontSize: 12,
    color: "gray",
    marginLeft: 5,
    marginTop: 2,
  },

  actions: {
    justifyContent: "flex-start",
    marginLeft: 10,
  },
});

export default SocietyDetails;