import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { BarChart } from "react-native-gifted-charts";
import Icon from "react-native-vector-icons/MaterialIcons";
import BASE_URL from "../../API-URL/API";

const TeacherDashboard = ({ navigation, userId, onLogout }) => {
  const [flag, setFlag] = useState(0);
  const [evaluationType, setEvaluationType] = useState("");
  const [isAllowed, setIsAllowed] = useState(false);
  const [teacherName, setTeacherName] = useState("");

  console.log("Teacher UserID:", userId);

  const kpiData = [
    { value: 80, label: "Peer" },
    { value: 90, label: "Students" },
    { value: 95, label: "Conf." },
    { value: 98, label: "CHR" },
    { value: 78, label: "Society" },
    { value: 88, label: "Admin" },
  ];

  /* ================= FETCH TEACHER NAME ================= */


  const checkIsAllowed = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/TeacherDashboard/GetPeerEvaluatorID?userId=${userId}`
      );

      const data = await response.json();

      setIsAllowed(data?.isAllowed === true);

    } catch (error) {
      console.error(error);
      setIsAllowed(false);
    }
  };
  const fetchTeacherName = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/TeacherDashboard/GetTeacherName/${userId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch teacher name");
      }

      const name = await response.json();
      setTeacherName(name);
    } catch (error) {
      console.error("Teacher name fetch error:", error);
      setTeacherName("Teacher");
    }
  };

  /* ================= CHECK EVALUATOR ================= */
  /* ================= CHECK EVALUATOR AND FETCH PEEREVALUATOR ID ================= */
  /* ================= CHECK EVALUATOR AND FETCH PEEREVALUATOR ID ================= */
  const checkEvaluatorAndProceed = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/TeacherDashboard/GetPeerEvaluatorID?userId=${userId}`
      );

      const data = await response.json();

      // 1. Not allowed case
      if (!data?.isAllowed) {
        Alert.alert(
          "Access Denied",
          "You are not allowed to perform peer evaluation"
        );
        return;
      }

      // 2. Allowed but no evaluator ID (edge case)
      if (!data?.peerEvaluatorID) {
        Alert.alert(
          "Info",
          "You are allowed but not assigned as a session evaluator"
        );
        return;
      }

      // 3. Success → navigate
      navigation.navigate("TeachersCoursesScreen", {
        evaluatorID: data.peerEvaluatorID,
        source: data.source, // optional but useful
        userId: userId
      });

    } catch (error) {
      console.error("Evaluator check error:", error);
      Alert.alert("Error", "Unable to verify evaluator status");
    }
  };


  /* ================= FETCH ACTIVE QUESTIONNAIRE ================= */
  const fetchActiveQuestionnaire = async () => {
    try {
      const type = "peer evaluation";

      const response = await fetch(
        `${BASE_URL}/TeacherDashboard/GetActiveQuestionnaire/${encodeURIComponent(
          type
        )}`
      );

      const data = await response.json();

      if (
        String(data?.Flag) === "1" &&
        data?.Type?.trim().toLowerCase() === type.toLowerCase()
      ) {
        setFlag(1);
        setEvaluationType(data.Type);
      } else {
        setFlag(0);
        setEvaluationType("");
      }
    } catch (error) {
      console.error("API ERROR:", error);
      setFlag(0);
    }
  };

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    fetchTeacherName();
    fetchActiveQuestionnaire();
    checkIsAllowed();
  }, []);

  return (
    <ScrollView style={styles.container}>
      {/* ================= HEADER ================= */}
      <View style={styles.header}>
        <Text style={styles.welcome}>Welcome back 👋</Text>
        <Text style={styles.teacherName}>{teacherName}</Text>
        <Text style={styles.sub}>
          Your Performance Overview — Fall 2025
        </Text>
      </View>

      {/* ================= BANNER ================= */}
      <View style={styles.banner}>
        <Icon name="insights" size={18} color="white" />
        <Text style={styles.bannerText}>
          Monitor your teaching performance and manage course materials.
        </Text>
      </View>

      {/* ================= PEER EVALUATION BUTTON ================= */}
      <View>
        <TouchableOpacity
          disabled={!(flag === 1 && isAllowed)}
          style={{
            padding: 10,
            margin: 10,
            backgroundColor: (flag === 1 && isAllowed) ? "#249551" : "#B0B0B0",
            opacity: (flag === 1 && isAllowed) ? 1 : 0.6,
            borderRadius: 7,

          }}
          onPress={() => {
            if (flag === 1) {
              checkEvaluatorAndProceed();
            }
          }}
        >
          <Text
            style={{ textAlign: "center", color: "#fff", fontWeight: "bold" }}
          >
            Start Peer Evaluation
          </Text>
        </TouchableOpacity>

        {flag === 0 && (
          <Text style={{ textAlign: "center", fontSize: 12, color: "#777" }}>
            Peer Evaluation is currently not active
          </Text>
        )}
      </View>

      {/* ================= KPI SECTION ================= */}
      <Text style={styles.sectionTitle}>KPI Metrics Overview</Text>
      <Text style={styles.sectionSub}>
        Your performance across KPI categories
      </Text>

      <View style={styles.chartWrap}>
        <BarChart
          data={kpiData}
          barWidth={22}
          spacing={20}
          roundedTop
          frontColor="#2e7d32"
          yAxisThickness={0}
          xAxisThickness={0}
          hideRules
          maxValue={100}
        />
      </View>

      <Text style={styles.score}>89%</Text>
      <Text style={styles.scoreLabel}>Overall Performance Score</Text>


      <Text style={styles.sectionTitle}>Performance Sections</Text>

      <TouchableOpacity
        style={[styles.block, styles.blockGreen]}
        onPress={() => navigation.navigate("ClassHeldReportScreen")}
      >
        <View style={[styles.iconBox, { backgroundColor: "#7c3aed" }]}>
          <Icon name="event-available" size={24} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.blockTitle}>Class Held Report</Text>
          <Text style={styles.blockDesc}>View your CHR performance</Text>
        </View>
        <Icon name="chevron-right" size={26} color="#7c3aed" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.block, styles.blockPurple]}
        onPress={() => navigation.navigate("CourseManagementEvaluationScreen")}
      >
        <View style={[styles.iconBox, { backgroundColor: "#16a34a" }]}>
          <Icon name="menu-book" size={24} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.blockTitle}>Course Management</Text>
          <Text style={styles.blockDesc}>Check course evaluation</Text>
        </View>
        <Icon name="chevron-right" size={26} color="#16a34a" />
      </TouchableOpacity>

     

      <TouchableOpacity style={[styles.block, styles.blockOrange]}

        onPress={() => navigation.navigate("SeeOwnPerformance", { username: teacherName, userId: userId })}>
        <View style={[styles.iconBox, { backgroundColor: "#ea580c" }]}>
          <Icon name="analytics" size={24} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.blockTitle}>See Performance</Text>
          <Text style={styles.blockDesc}>View performance analytics</Text>
        </View>
        <Icon name="chevron-right" size={26} color="#ea580c" />
      </TouchableOpacity>


      <TouchableOpacity
  style={[styles.block, styles.blockPink]}
  onPress={() => navigation.navigate("SocietyEvaluationScreen", {userId: userId })}
>
  <View style={[styles.iconBox, { backgroundColor: "#db2777" }]}>
    <Icon name="diversity-3" size={24} color="#fff" />
  </View>

  <View style={{ flex: 1 }} >
    <Text style={styles.blockTitle}>Evaluate Society Members</Text>
    <Text style={styles.blockDesc}>
      Evaluate members based on performance
    </Text>
  </View>

  <Icon name="chevron-right" size={26} color="#db2777" />
</TouchableOpacity>

      {/* ================= LOGOUT ================= */}
      <TouchableOpacity
        style={styles.logout}
        onPress={() => {
          Alert.alert(
            "Logout",
            "Are you sure you want to log out?",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Logout",
                style: "destructive",
                onPress: () => onLogout() // Calls the function passed from App.js/Navigation
              }
            ]
          );
        }}
      >
        <Icon name="logout" size={18} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

export default TeacherDashboard;

/* ===================== STYLES ===================== */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f6f4" },

  header: { padding: 18 },

  welcome: {
    fontSize: 14,
    fontWeight: "600",
    color: "#166534",
  },

  teacherName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#14532d",
    letterSpacing: 0.4,
    marginTop: 2,
  },

  sub: { marginTop: 4, color: "#666" },

  banner: {
    backgroundColor: "#166534",
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  bannerText: { color: "white", fontSize: 13, flex: 1 },

  sectionTitle: {
    marginTop: 18,
    marginHorizontal: 16,
    fontWeight: "700",
    fontSize: 15,
  },

  sectionSub: {
    marginHorizontal: 16,
    fontSize: 12,
    color: "#666",
  },

  chartWrap: {
    marginTop: 10,
    marginHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    elevation: 5,
  },

  score: {
    textAlign: "center",
    fontSize: 26,
    fontWeight: "800",
    color: "#166534",
    marginTop: 10,
  },

  scoreLabel: {
    textAlign: "center",
    fontSize: 12,
    color: "#666",
  },

  block: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 14,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    elevation: 6,
  },

  blockGreen: { backgroundColor: "#faf5ff", borderColor: "#e9d5ff" },
  blockPurple: { backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" },
  blockBlue: { backgroundColor: "#eff6ff", borderColor: "#bfdbfe" },
  blockOrange: { backgroundColor: "#fff7ed", borderColor: "#fed7aa" },

  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  blockTitle: { fontSize: 15, fontWeight: "700" },
  blockDesc: { fontSize: 12, color: "#666", marginTop: 4 },

  logout: {
    marginHorizontal: 16,
    marginTop: 24,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#166534",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  logoutText: { color: "#fff", fontWeight: "700" },
  blockPink: {
  backgroundColor: "#fdf2f8",
  borderColor: "#fbcfe8",
},
});
