import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import Icon from "react-native-vector-icons/MaterialIcons";
import BASE_URL from "../../API-URL/API";

const SocietyEvaluationScreen = ({ route, navigation }) => {
  const { userId } = route.params;

  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [mentors, setMentors] = useState([]);
  const [societyName, setSocietyName] = useState("");
  const [isChairperson, setIsChairperson] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submittedMap, setSubmittedMap] = useState({});

  /* ================= FETCH SESSIONS ================= */
  const fetchSessions = async () => {
    try {
      const res = await fetch(`${BASE_URL}/PeerEvaluator/Sessions`);
      const data = await res.json();
      setSessions(data);

      if (data.length > 0) {
        setSelectedSession(data[0].id);
      }
    } catch (err) {
      console.error("Session fetch error:", err);
    }
  };
 

  /* ================= FETCH MENTORS ================= */
  const fetchMentors = async (sessionId) => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${BASE_URL}/SocietyEvaluation/GetChairpersonSocietyWithMentors/${userId}/${sessionId}`
      );
      const data = await res.json();

      if (!data.IsChairperson) {
        setIsChairperson(false);
        setMentors([]);
        setSocietyName("");
      } else {
        setIsChairperson(true);
        setMentors(data.Mentors || []);
        setSocietyName(data.SocietyName);
      }
    } catch (err) {
      console.error("Mentor fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= FETCH EVALUATION STATUS ================= */
  const fetchSubmittedStatus = async (sessionId) => {
    if (!sessionId) return;
    try {
      // "Mentor" matches the evaluation type used in your logic
      const evaluationType = "Mentor"; 
      const res = await fetch(
        `${BASE_URL}/SocietyEvaluation/GetSubmitted/${userId}/${evaluationType}/${sessionId}`
      );
      const data = await res.json();

      // Convert the array of IDs into a lookup map for faster rendering
      let map = {};
      if (Array.isArray(data)) {
        data.forEach((teacherId) => {
          map[teacherId] = true;
        });
      }
      setSubmittedMap(map);
    } catch (err) {
      console.error("Status fetch error:", err);
    }
  };

  /* ================= USE EFFECTS ================= */
  
  // Load sessions once on mount
  useEffect(() => {
    fetchSessions();
  }, []);

  // When selectedSession changes, fetch both Mentors and their "Evaluated" status
  useEffect(() => {
    if (selectedSession) {
      fetchMentors(selectedSession);
      fetchSubmittedStatus(selectedSession);
    }
  }, [selectedSession]);

  /* ================= RENDER MENTOR CARD ================= */
  const renderMentor = ({ item }) => {
    const isDone = submittedMap[item.TeacherId];

    return (
      <View style={styles.card}>
        <View style={styles.left}>
          <View style={styles.avatar}>
            <Icon name="groups" size={24} color="#fff" />
          </View>
          <View>
            <Text style={styles.name}>{item.TeacherName}</Text>
            <Text style={styles.society}>{item.SocietyName}</Text>
          </View>
        </View>
         
        <TouchableOpacity
          disabled={isDone}
          style={[
            styles.btn,
            { backgroundColor: isDone ? "#E0E0E0" : "#16a34a" },
          ]}
        onPress={() =>
  navigation.navigate("MentorEvaluationForm", {
    mentorId: item.TeacherId,
    sessionId: selectedSession,
    societyId: item.SocietyId,
    userId: userId,

    // 🔥 ADD THIS CALLBACK
    onSubmitSuccess: (teacherId) => {
      setSubmittedMap((prev) => ({
        ...prev,
        [teacherId]: true
      }));
    }
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
      {/* HEADER CARD */}
      <View style={styles.topCard}>
        <View style={styles.iconCircle}>
          <Icon name="groups" size={28} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Evaluate Society Mentors</Text>
          <Text style={styles.subtitle}>
            Chairperson evaluates mentor performance in the society.
          </Text>
        </View>
      </View>

      {/* SESSION DROPDOWN */}
      <View style={styles.dropdownCard}>
        <Text style={styles.label}>Select Session</Text>
        <Dropdown
          style={styles.dropdown}
          data={sessions.map((s) => ({
            label: s.name,
            value: s.id,
          }))}
          labelField="label"
          valueField="value"
          placeholder="Select Session"
          value={selectedSession}
          onChange={(item) => setSelectedSession(item.value)}
        />
      </View>

      {/* CONTENT */}
      {loading ? (
        <ActivityIndicator size="large" color="#16a34a" style={{ marginTop: 20 }} />
      ) : !isChairperson ? (
        <Text style={styles.notChair}>
          You are not assigned as a Chairperson for this session.
        </Text>
      ) : (
        <>
          <Text style={styles.heading}>Chairperson of {societyName}</Text>
          
          <View style={styles.infoBox}>
            <Icon name="info" size={20} color="#166534" />
            <Text style={styles.infoText}>
              Mentor evaluations help improve society performance.
            </Text>
          </View>

          <FlatList
            data={mentors}
            keyExtractor={(item) => item.TeacherId.toString()}
            renderItem={renderMentor}
            contentContainerStyle={{ paddingBottom: 30 }}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </View>
  );
};

export default SocietyEvaluationScreen;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F9F4",
    padding: 16,
  },
  topCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    elevation: 2,
    alignItems: "center",
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#388E3C",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 13,
    color: "#777",
    marginTop: 4,
  },
  dropdownCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 16,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    color: "#555",
    fontWeight: "600",
    marginBottom: 8,
  },
  dropdown: {
    height: 50,
    borderColor: "#E0E0E0",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#C8E6C9",
  },
  infoText: {
    color: "#2E7D32",
    fontSize: 13,
    marginLeft: 8,
  },
  heading: {
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    fontSize: 16,
    color: "#444",
  },
  notChair: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: "#999",
  },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 18,
    marginBottom: 12,
    elevation: 3,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#C8E6C9",
  },
  name: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#333",
  },
  society: {
    fontSize: 12,
    color: "#888",
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  btnText: {
    fontWeight: "bold",
    fontSize: 14,
  },
});