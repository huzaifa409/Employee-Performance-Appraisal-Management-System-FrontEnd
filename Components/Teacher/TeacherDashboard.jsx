import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import Icon from "react-native-vector-icons/MaterialIcons";

const TeacherDashboard = ({navigation}) => {

  const kpiData = [
    { value: 80, label: "Peer" },
    { value: 90, label: "Students" },
    { value: 95, label: "Conf." },
    { value: 98, label: "CHR" },
    { value: 78, label: "Society" },
    { value: 88, label: "Admin" },
  ];

  return (
    <ScrollView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcome}>Welcome, Teacher 👋</Text>
        <Text style={styles.sub}>Your Performance Overview — Fall 2025</Text>
      </View>

      {/* Banner */}
      <View style={styles.banner}>
        <Icon name="insights" size={18} color="white" />
        <Text style={styles.bannerText}>
          Monitor your teaching performance and manage course materials.
        </Text>
      </View>

      {/* KPI */}
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

      {/* ================== PERFORMANCE VIEWS ================== */}

      <Text style={styles.sectionTitle}>Performance Sections</Text>

      {/* CHR */}
      <TouchableOpacity style={[styles.block, styles.blockGreen]} onPress={()=>{navigation.navigate("ClassHeldReportScreen")}}>
        <View style={[styles.iconBox, { backgroundColor: "#7c3aed" }]}>
          <Icon name="event-available" size={24} color="#fff" />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.blockTitle}>Class Held Report</Text>
          <Text style={styles.blockDesc}>View your CHR performance</Text>
        </View>

        <Icon name="chevron-right" size={26} color="#7c3aed" />
      </TouchableOpacity>

      {/* Course */}
      <TouchableOpacity style={[styles.block, styles.blockPurple]} onPress={()=>{navigation.navigate("CourseManagementEvaluationScreen")}}>
        <View style={[styles.iconBox, { backgroundColor: "#16a34a" }]}>
          <Icon name="menu-book" size={24} color="#fff" />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.blockTitle}>Course Management</Text>
          <Text style={styles.blockDesc}>Check course evaluation</Text>
        </View>

        <Icon name="chevron-right" size={26} color="#16a34a" />
      </TouchableOpacity>

      {/* Society */}
      <TouchableOpacity style={[styles.block, styles.blockBlue]}>
        <View style={[styles.iconBox, { backgroundColor: "#2563eb" }]}>
          <Icon name="groups" size={24} color="#fff" />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.blockTitle}>Society Mentors</Text>
          <Text style={styles.blockDesc}>Evaluate society mentors</Text>
        </View>

        <Icon name="chevron-right" size={26} color="#2563eb" />
      </TouchableOpacity>

      {/* Performance */}
      <TouchableOpacity style={[styles.block, styles.blockOrange]}>
        <View style={[styles.iconBox, { backgroundColor: "#ea580c" }]}>
          <Icon name="analytics" size={24} color="#fff" />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.blockTitle}>See Performance</Text>
          <Text style={styles.blockDesc}>View performance analytics</Text>
        </View>

        <Icon name="chevron-right" size={26} color="#ea580c" />
      </TouchableOpacity>

      {/* Logout */}
      <TouchableOpacity style={styles.logout}>
        <Icon name="logout" size={18} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />

    </ScrollView>
  );
};

export default TeacherDashboard;

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#f3f6f4",
  },

  header: { padding: 18 },

  welcome: {
    fontSize: 18,
    fontWeight: "700",
    color: "#14532d",
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

  /* ========= ATTRACTIVE BLOCKS ========= */

  block: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 14,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1.5,

    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },

  blockGreen: {
    backgroundColor: "#faf5ff",
    borderColor: "#e9d5ff",
  },

  blockPurple: {
    backgroundColor: "#f0fdf4",
    borderColor: "#bbf7d0",
  },

  blockBlue: {
    backgroundColor: "#eff6ff",
    borderColor: "#bfdbfe",
  },

  blockOrange: {
    backgroundColor: "#fff7ed",
    borderColor: "#fed7aa",
  },

  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  blockTitle: {
    fontSize: 15,
    fontWeight: "700",
  },

  blockDesc: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },

  logout: {
    marginHorizontal: 16,
    marginTop: 24,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "#166534",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  logoutText: {
    color: "#fff",
    fontWeight: "700",
  },
});
