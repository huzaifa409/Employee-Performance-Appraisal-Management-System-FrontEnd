import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const DirectorDashboard = ({ navigation, route}) => {
  // Always ensure onLogout is a valid function
const { onLogout } = route.params;

  const handleLogout = () => {
    onLogout();
  };

  return (
    <ScrollView style={ss.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* HEADER */}
      <View style={ss.header}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={ss.logoCircle}>
            <Image
              source={require("../../Assets/BIIT_logo.png")}
              style={ss.logo}
            />
          </View>
          <View style={{ marginLeft: 10 }}>
            <Text style={ss.headerTitle}>Dr. Jamil Sawar</Text>
            <Text style={ss.headerSubtitle}>Director of University</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <Icon name="logout" size={26} color="#16a34a" />
        </TouchableOpacity>
      </View>

      {/* SESSION BAR */}
      <View style={ss.sessionBar}>
        <Text style={{ color: "#fff" }}>Current Session:</Text>
        <View style={ss.sessionBadge}>
          <Text style={{ color: "#fff" }}>Fall 2025</Text>
        </View>
      </View>

      <Text style={ss.title}>Director Dashboard</Text>
      <Text style={ss.subtitle}>Manage and monitor university performance</Text>

      {/* DASHBOARD ROWS */}
      <TouchableOpacity
        style={[ss.row, { borderColor: "#b7e4c7" }]}
        onPress={() => navigation.navigate("MakeQuestionaire")}
      >
        <View style={[ss.iconBox, { backgroundColor: "#16a34a" }]}>
          <Icon name="assignment" size={24} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={ss.rowTitle}>Make Questionnaire</Text>
          <Text style={ss.rowDesc}>
            Create evaluation forms for all departments
          </Text>
        </View>
        <Icon name="chevron-right" size={26} color="#16a34a" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[ss.row, { borderColor: "#fde68a" }]}
        onPress={() => navigation.navigate("SeePerformance")}
      >
        <View style={[ss.iconBox, { backgroundColor: "#d97706" }]}>
          <Icon name="bar-chart" size={24} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={ss.rowTitle}>See Performance</Text>
          <Text style={ss.rowDesc}>
            View employee performance analytics and reports
          </Text>
        </View>
        <Icon name="chevron-right" size={26} color="#d97706" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[ss.row, { borderColor: "#bbf7d0" }]}
        onPress={() => navigation.navigate("Addkpi")}
      >
        <View style={[ss.iconBox, { backgroundColor: "#16a34a" }]}>
          <Icon name="track-changes" size={24} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={ss.rowTitle}>Add KPI</Text>
          <Text style={ss.rowDesc}>
            Manage Key Performance Indicators for employees
          </Text>
        </View>
        <Icon name="chevron-right" size={26} color="#16a34a" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[ss.row, { borderColor: "#e9d5ff" }]}
        onPress={() => navigation.navigate("ConfidentialEvaluation")}
      >
        <View style={[ss.iconBox, { backgroundColor: "#7c3aed" }]}>
          <Icon name="verified-user" size={24} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={ss.rowTitle}>Confidential Evaluations</Text>
          <Text style={ss.rowDesc}>
            Access and review confidential evaluation results
          </Text>
        </View>
        <Icon name="chevron-right" size={26} color="#7c3aed" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[ss.row, { borderColor: "#bfdbfe" }]}
        onPress={() => navigation.navigate("PeerEvaluator")}
      >
        <View style={[ss.iconBox, { backgroundColor: "#2563eb" }]}>
          <Icon name="groups" size={24} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={ss.rowTitle}>Peer Evaluators</Text>
          <Text style={ss.rowDesc}>Assign and manage peer evaluators for teachers</Text>
        </View>
        <Icon name="chevron-right" size={26} color="#2563eb" />
      </TouchableOpacity>

      <Text style={ss.quote}>
        "Leadership is not about being in charge. It is about taking care of
        those in your charge." — Simon Sinek
      </Text>

      <TouchableOpacity style={ss.logoutBtn} onPress={handleLogout}>
        <Text style={ss.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default DirectorDashboard;

const ss = StyleSheet.create({
  container: { backgroundColor: "#f3f6f4" },
  header: {
    backgroundColor: "#fff",
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  logoCircle: { width: 46, height: 46, borderRadius: 23, backgroundColor: "#e8f5e9", justifyContent: "center", alignItems: "center" },
  logo: { width: 34, height: 34, resizeMode: "contain" },
  headerTitle: { fontWeight: "700", fontSize: 16 },
  headerSubtitle: { fontSize: 12, color: "#666" },
  sessionBar: { backgroundColor: "#15803d", flexDirection: "row", justifyContent: "center", alignItems: "center", paddingVertical: 10, gap: 8 },
  sessionBadge: { backgroundColor: "#22c55e", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  title: { textAlign: "center", fontSize: 20, fontWeight: "700", marginTop: 16 },
  subtitle: { textAlign: "center", color: "#666", marginBottom: 16 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 14,
    marginBottom: 14,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  iconBox: { width: 52, height: 52, borderRadius: 14, justifyContent: "center", alignItems: "center", marginRight: 14 },
  rowTitle: { fontSize: 15, fontWeight: "700" },
  rowDesc: { fontSize: 12, color: "#666", marginTop: 4 },
  quote: { textAlign: "center", fontStyle: "italic", color: "#666", marginTop: 10, paddingHorizontal: 20 },
  logoutBtn: { backgroundColor: "#D64545", margin: 16, paddingVertical: 14, borderRadius: 22, alignItems: "center" },
  logoutText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
