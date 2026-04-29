import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useFocusEffect } from "@react-navigation/native"; // To refresh when coming back
import BASE_URL from "../../API-URL/API";

const EvaluateSocietyChairPerson = ({ route, navigation }) => {
  const { userId } = route.params;

  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [chairpersons, setChairpersons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submittedMap, setSubmittedMap] = useState({});

  /* ================= FETCH SESSIONS ================= */
  const fetchSessions = async () => {
    try {
      const res = await fetch(`${BASE_URL}/PeerEvaluator/Sessions`);
      const data = await res.json();
      setSessions(data);
      if (data.length > 0 && !selectedSession) {
        setSelectedSession(data[0].id);
      }
    } catch (err) {
      console.error("Session fetch error:", err);
    }
  };

  /* ================= FETCH CHAIRPERSONS ================= */
  const fetchChairpersons = async (sessionId) => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/SocietyEvaluation/GetChairpersons/${sessionId}`);
      const data = await res.json();
      setChairpersons(data || []);
    } catch (err) {
      console.error("Chairperson fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= FETCH SUBMITTED STATUS ================= */
  // Consumes your API: GetSubmitted/{evaluatorId}/{evaluationType}/{sessionId}
  const fetchSubmittedStatus = async (sessionId) => {
    if (!sessionId || !userId) return;
    try {
      const evaluationType = "Chairperson"; 
      const res = await fetch(
        `${BASE_URL}/SocietyEvaluation/GetSubmitted/${userId}/${evaluationType}/${sessionId}`
      );
      const data = await res.json(); // Returns List of EvaluateeId (TeacherIds)

      let map = {};
      if (Array.isArray(data)) {
        data.forEach((teacherId) => {
          map[teacherId.toString().trim().toLowerCase()] = true;
        });
      }
      setSubmittedMap(map);
    } catch (err) {
      console.error("Status fetch error:", err);
    }
  };

  /* ================= EFFECTS ================= */
  useEffect(() => {
    fetchSessions();
  }, []);

  // useFocusEffect ensures the button disables immediately when you return from the form
  useFocusEffect(
    useCallback(() => {
      if (selectedSession) {
        fetchChairpersons(selectedSession);
        fetchSubmittedStatus(selectedSession);
      }
    }, [selectedSession])
  );

  /* ================= RENDER CARD ================= */
  const renderChairperson = ({ item }) => {
    // Check if the current chairperson's ID exists in the submitted list from your API
    const chairpersonId = item.TeacherId.toString().trim().toLowerCase();
    const isDone = submittedMap[chairpersonId];

    return (
      <View style={styles.card}>
        <View style={styles.left}>
          <View style={styles.avatar}>
            <Icon name="person" size={24} color="#388E3C" />
          </View>
          <View>
            <Text style={styles.name}>{item.TeacherName}</Text>
            <Text style={styles.society}>{item.SocietyName}</Text>
          </View>
        </View>

        <TouchableOpacity
          disabled={isDone} // Disable if API returned this ID
          style={[
            styles.btn,
            { backgroundColor: isDone ? "#E0E0E0" : "#16a34a" }, // Gray if done
          ]}
          onPress={() =>
            navigation.navigate("EvaluateChairPersonForm", {
              mentorId: item.TeacherId,
              sessionId: selectedSession,
              userId: userId,
              societyId: item.SocietyId,
              evaluationType: "Chairperson"
            })
          }
        >
          <Text style={[styles.btnText, { color: isDone ? "#9E9E9E" : "#fff" }]}>
            {isDone ? "Evaluated" : "Evaluate"} 
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topCard}>
        <View style={styles.iconCircle}>
          <Icon name="groups" size={28} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Evaluate Society Chairperson</Text>
          <Text style={styles.subtitle}>
            Chairperson evaluates mentor performance in the society.
          </Text>
        </View>
      </View>

      <View style={styles.dropdownCard}>
        <Text style={styles.label}>Select Session</Text>
        <Dropdown
          style={styles.dropdown}
          data={sessions.map((s) => ({ label: s.name, value: s.id }))}
          labelField="label"
          valueField="value"
          placeholder="Select Session"
          value={selectedSession}
          onChange={(item) => setSelectedSession(item.value)}
        />
      </View>

      <View style={styles.infoBox}>
        <Icon name="info" size={20} color="#166534" />
        <Text style={styles.infoText}>
          Chairperson evaluations help improve society performance.
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#16a34a" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={chairpersons}
          keyExtractor={(item) => item.TeacherId.toString()}
          renderItem={renderChairperson}
          contentContainerStyle={{ paddingBottom: 30 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No chairperson assigned for this session.</Text>
          }
        />
      )}
    </View>
  );
};

export default EvaluateSocietyChairPerson;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F9F4", padding: 16 },
  topCard: { flexDirection: "row", backgroundColor: "#fff", padding: 20, borderRadius: 20, marginBottom: 16, elevation: 2, alignItems: "center" },
  iconCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: "#388E3C", justifyContent: "center", alignItems: "center", marginRight: 15 },
  title: { fontSize: 18, fontWeight: "bold", color: "#333" },
  subtitle: { fontSize: 13, color: "#777", marginTop: 4 },
  dropdownCard: { backgroundColor: "#fff", padding: 15, borderRadius: 15, marginBottom: 16, elevation: 2 },
  label: { fontSize: 14, color: "#555", fontWeight: "600", marginBottom: 8 },
  dropdown: { height: 50, borderColor: "#E0E0E0", borderWidth: 1, borderRadius: 10, paddingHorizontal: 12 },
  infoBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#E8F5E9", padding: 12, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: "#C8E6C9" },
  infoText: { color: "#2E7D32", fontSize: 13, marginLeft: 8 },
  card: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#fff", padding: 16, borderRadius: 18, marginBottom: 12, elevation: 3 },
  left: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#E8F5E9", justifyContent: "center", alignItems: "center", marginRight: 12 },
  name: { fontWeight: "bold", fontSize: 15, color: "#333" },
  society: { fontSize: 12, color: "#888" },
  btn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 25 },
  btnText: { fontWeight: "bold", fontSize: 14 },
  emptyText: { textAlign: "center", color: "#999", marginTop: 20 }
});