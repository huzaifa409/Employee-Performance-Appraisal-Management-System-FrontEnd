import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  Switch,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import BASE_URL from "../../API-URL/API";

const EmailSettings = ({ navigation }) => {

  const [emails, setEmails] = useState([]);
  const [activeEmail, setActiveEmail] = useState(null);
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState(""); // ✅ NEW

  useEffect(() => {
    fetchEmails();
    fetchActiveEmail();
  }, []);

  // =============================
  // GET ALL EMAILS
  // =============================
  const fetchEmails = async () => {
    try {
      const res = await fetch(`${BASE_URL}/email/getall`);
      const data = await res.json();
      setEmails(data);
    } catch (err) {
      console.log(err);
    }
  };

  // =============================
  // GET ACTIVE EMAIL
  // =============================
  const fetchActiveEmail = async () => {
    try {
      const res = await fetch(`${BASE_URL}/email/active`);
      const data = await res.json();
      setActiveEmail(data);
    } catch (err) {
      setActiveEmail(null);
    }
  };

  // =============================
  // ADD EMAIL + PASSWORD
  // =============================
  const addEmail = async () => {

    if (newEmail.trim() === "" || password.trim() === "") {
      Alert.alert("Error", "Please enter email and app password");
      return;
    }

    if (password.length !== 16) {
      Alert.alert("Error", "App password must be 16 characters");
      return;
    }

    try {
      await fetch(`${BASE_URL}/email/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mail: newEmail,
          password: password,
        }),
      });

      setNewEmail("");
      setPassword("");
      fetchEmails();

    } catch (err) {
      console.log(err);
    }
  };

  // =============================
  // ACTIVATE EMAIL
  // =============================
  const activateEmail = async (id) => {
    try {
      await fetch(`${BASE_URL}/email/activate/${id}`, {
        method: "PUT",
      });

      fetchEmails();
      fetchActiveEmail();

    } catch (err) {
      Alert.alert("Error", "Another email is already active");
    }
  };

  // =============================
  // DEACTIVATE EMAIL
  // =============================
  const deactivateEmail = async (id) => {
    try {
      await fetch(`${BASE_URL}/email/deactivate/${id}`, {
        method: "PUT",
      });

      fetchEmails();
      fetchActiveEmail();

    } catch (err) {
      console.log(err);
    }
  };

  // =============================
  // DELETE EMAIL
  // =============================
  const deleteEmail = async (id) => {
    Alert.alert(
      "Delete Email",
      "Are you sure you want to delete?",
      [
        { text: "Cancel" },
        {
          text: "Delete",
          onPress: async () => {
            await fetch(`${BASE_URL}/email/delete/${id}`, {
              method: "DELETE",
            });

            fetchEmails();
            fetchActiveEmail();
          },
        },
      ]
    );
  };

  // =============================
  // TOGGLE SWITCH
  // =============================
  const toggleEmail = (item) => {
    if (item.isActive) {
      deactivateEmail(item.id);
    } else {
      activateEmail(item.id);
    }
  };

  return (
    <ScrollView style={ss.container}>

      {/* HEADER */}
      <View style={ss.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={26} />
        </TouchableOpacity>
        <Text style={ss.title}>Email Settings</Text>
      </View>

      {/* ACTIVE EMAIL */}
      {activeEmail && (
        <View style={ss.activeBox}>
          <View style={ss.checkIcon}>
            <Icon name="check" size={28} color="#fff" />
          </View>

          <View>
            <Text style={ss.activeText}>Current Active Recipient</Text>
            <Text style={ss.activeEmail}>{activeEmail.mail}</Text>
          </View>
        </View>
      )}

      {/* ADD EMAIL */}
      <View style={ss.addBox}>
        <Text style={ss.sectionTitle}>Add New Recipient</Text>

        <TextInput
          placeholder="example@gmail.com"
          style={ss.input}
          value={newEmail}
          onChangeText={setNewEmail}
           placeholderTextColor={'black'}
        />

        <TextInput
          placeholder="Enter App Password (16 characters)"
          style={ss.input}
          value={password}
          onChangeText={setPassword}
          // secureTextEntry={true}
          placeholderTextColor={'black'}
        />

        {/* Helper Text */}
        <Text style={ss.helperText}>
          Use Gmail App Password (not your Gmail login password)
        </Text>

        <TouchableOpacity style={ss.addBtn} onPress={addEmail}>
          <Text style={ss.addBtnText}>Add Email</Text>
        </TouchableOpacity>
      </View>

      {/* EMAIL LIST */}
      <Text style={ss.sectionTitle}>Saved Recipient Emails</Text>

      <FlatList
        data={emails}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={ss.emailRow}>

            <Text style={ss.emailText}>{item.mail}</Text>

            <View style={ss.rowRight}>

              <Switch
                value={item.isActive}
                onValueChange={() => toggleEmail(item)}
                trackColor={{ true: "#9ae6b4", false: "#ccc" }}
                thumbColor={item.isActive ? "#22c55e" : "#777"}
              />

              <TouchableOpacity onPress={() => deleteEmail(item.id)}>
                <Icon name="delete" size={26} color="red" />
              </TouchableOpacity>

            </View>
          </View>
        )}
      />

    </ScrollView>
  );
};

export default EmailSettings;

const ss = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#f3f6f4",
    padding: 16,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 10,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
  },

  activeBox: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#86efac",
  },

  checkIcon: {
    width: 50,
    height: 50,
    backgroundColor: "#22c55e",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  activeText: {
    fontWeight: "700",
    fontSize: 16,
  },

  activeEmail: {
    color: "#22c55e",
    marginTop: 4,
  },

  addBox: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 16,
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },

  input: {
    backgroundColor: "#f1f5f9",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },

  helperText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 12,
  },

  addBtn: {
    backgroundColor: "#4CAF50",
    padding: 14,
    borderRadius: 25,
    alignItems: "center",
  },

  addBtnText: {
    color: "#fff",
    fontWeight: "700",
  },

  emailRow: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  emailText: {
    fontSize: 15,
  },

  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

});