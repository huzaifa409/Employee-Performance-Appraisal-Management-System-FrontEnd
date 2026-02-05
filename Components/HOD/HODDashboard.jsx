import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native'
import Icon from "react-native-vector-icons/MaterialIcons";

const HodDashboard = ({ navigation, route }) => {

  const { onLogout } = route.params;

  const handleLogout = () => {
    onLogout();
  };

  return (

    <ScrollView style={ss.container} contentContainerStyle={{ paddingBottom: 40 }}>

      {/* HEADER */}
      <View style={ss.header}>
        <View>
          <Text style={ss.headerTitle}>HOD : DR. Munir</Text>
          <Text style={ss.headerSubtitle}>Head Of Department</Text>
        </View>

        <View style={ss.logoheader}>
          <Image
            source={require("../../Assets/BIIT_logo.png")}
            style={ss.logo}
            resizeMode="contain"
          />
        </View>
      </View>

      <View style={ss.infoBar}>
        <Text style={ss.infoText}>
          Monitor Teacher Performance, Manage KPIs and assign Peer Evaluator
        </Text>
      </View>

      

      <View style={ss.statRow}>

        <View style={ss.statBox}>
          <Text style={ss.statTitle}>Total Teachers</Text>
          <Icon name="groups" size={46} color="#1565C0" />
          <Text style={ss.statNumber}>6</Text>
          <Text style={ss.statSub}>Active Faculty</Text>
        </View>

        <View style={ss.statBox}>
          <Text style={ss.statTitle}>Top Performer</Text>
          <Icon name="workspace-premium" size={46} color="#FFC107" />
          <Text style={ss.statNumber}>Mr. Zahid</Text>
          <Text style={ss.statSub}>93% Rating</Text>
        </View>

      </View>

      {/* ===== ROWS ===== */}

      <TouchableOpacity
        style={[ss.row, { backgroundColor: '#e8faf0', borderColor: '#b7e4c7' }]}
        onPress={() => navigation.navigate("AddKPI")}
      >
        <View style={[ss.iconBox, { backgroundColor: '#1E7F4D' }]}>
          <Icon name="add" size={24} color="#fff" />
        </View>

        <View style={ss.textBlock}>
          <Text style={ss.rowTitle}>Add KPI</Text>
          <Text style={ss.rowDesc}>Define New Performance Indicators</Text>
        </View>

        <Icon name="chevron-right" size={26} color="#1E7F4D" />
      </TouchableOpacity>


      <TouchableOpacity
        style={[ss.row, { backgroundColor: '#e0e7ff', borderColor: '#c7d2fe' }]}
        onPress={() => navigation.navigate("AddPeerEvaluator")}
      >
        <View style={[ss.iconBox, { backgroundColor: "#476efc" }]}>
          <Icon name="person-add-alt-1" size={24} color="#fff" />
        </View>

        <View style={ss.textBlock}>
          <Text style={ss.rowTitle}>Add Peer Evaluators</Text>
          <Text style={ss.rowDesc}>Assign new Evaluators</Text>
        </View>

        <Icon name="chevron-right" size={26} color="#476efc" />
      </TouchableOpacity>


      <TouchableOpacity
        style={[ss.row, { backgroundColor: '#f6e4fa', borderColor: '#e9d5ff' }]}
        onPress={() => navigation.navigate("CourseManagement")}
      >
        <View style={[ss.iconBox, { backgroundColor: '#c40bf7' }]}>
          <Icon name="checklist" size={24} color="#fff" />
        </View>

        <View style={ss.textBlock}>
          <Text style={ss.rowTitle}>Course Management</Text>
          <Text style={ss.rowDesc}>Evaluate Course Submission</Text>
        </View>

        <Icon name="chevron-right" size={26} color="#c40bf7" />
      </TouchableOpacity>


      <TouchableOpacity
        style={[ss.row, { backgroundColor: '#fdebd3', borderColor: '#fde68a' }]}
      >
        <View style={[ss.iconBox, { backgroundColor: '#ea8501' }]}>
          <Icon name="bar-chart" size={24} color="#fff" />
        </View>

        <View style={ss.textBlock}>
          <Text style={ss.rowTitle}>See Performance</Text>
          <Text style={ss.rowDesc}>View Detail Analytics</Text>
        </View>

        <Icon name="chevron-right" size={26} color="#ea8501" />
      </TouchableOpacity>


      <TouchableOpacity
        style={[ss.row, { backgroundColor: '#dbeafe', borderColor: '#bfdbfe' }]}
        onPress={() => navigation.navigate("CHRPointSetting")}
      >
        <View style={[ss.iconBox, { backgroundColor: "blue" }]}>
          <Icon name="settings" size={24} color="#fff" />
        </View>

        <View style={ss.textBlock}>
          <Text style={ss.rowTitle}>CHR Point Setting</Text>
          <Text style={ss.rowDesc}>Configure CHR scoring rules</Text>
        </View>

        <Icon name="chevron-right" size={26} color="blue" />
      </TouchableOpacity>


      {/* LOGOUT */}

      <TouchableOpacity style={ss.logoutBtn} onPress={handleLogout}>
        <Icon name="logout" size={22} color="#fff" />
        <Text style={ss.logoutText}>Logout</Text>
      </TouchableOpacity>

    </ScrollView>
  );
};

export default HodDashboard;



/* ================= STYLES ================= */

const ss = StyleSheet.create({

  container: {
    backgroundColor: "#f3f6f4",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",

    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },

  headerSubtitle: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
  },

  logoheader: {
    backgroundColor: "#eafaf1",
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
  },

  logo: {
    width: 36,
    height: 36,
  },

  infoBar: {
    backgroundColor: "#1E7F4D",
    padding: 12,
    alignItems: "center",
  },

  infoText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 13,
  },

  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    marginTop: 14,
  },

  statBox: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    alignItems: "center",

    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },

  statTitle: {
    fontWeight: "600",
    marginBottom: 8,
  },

  statNumber: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 10,
  },

  statSub: {
    fontSize: 12,
    color: "#666",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 18,
    borderWidth: 1.5,

    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },

  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  textBlock: {
    flex: 1,
  },

  rowTitle: {
    fontSize: 16,
    fontWeight: "700",
  },

  rowDesc: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },

  logoutBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#D64545",
    margin: 16,
    paddingVertical: 14,
    borderRadius: 22,
    elevation: 5,
  },

  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },

});
