import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const ClassHeldReportScreen = ({ navigation }) => {

  const reports = [
    { id: 1, date: "25 Nov 2025", records: 2 },
    { id: 2, date: "24 Nov 2025", records: 2 },
    { id: 3, date: "23 Nov 2025", records: 1 },
  ];

  return (
    <ScrollView style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerTitle}>Class Held Report (CHR)</Text>
          <Text style={styles.headerSub}>
            View your daily performance record
          </Text>
        </View>

        <View style={styles.logoCircle}>
          <Icon name="school" size={22} color="#16a34a" />
        </View>
      </View>

      {/* PURPLE STRIP */}
      <View style={styles.purpleStrip}>
        <Text style={styles.purpleText}>
          Your class attendance and schedule report.
        </Text>
      </View>

      {/* LIST */}
      {reports.map((item) => (
        <View key={item.id} style={styles.card}>

          {/* Left Icon */}
          <View style={styles.calBox}>
            <Icon name="calendar-month" size={22} color="#7c3aed" />
          </View>

          {/* Text Area */}
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>
              CHR report of {item.date}
            </Text>

            <Text style={styles.cardDate}>
              📅 {item.date}
            </Text>

            <Text style={styles.cardRecords}>
              {item.records} {item.records > 1 ? "records" : "record"}
            </Text>
          </View>

          {/* Button */}
          <TouchableOpacity style={styles.btn} onPress={()=>{navigation.navigate("ViewCHRDetails")}}>
            <Text style={styles.btnText}>View Details </Text>
            <Icon name="chevron-right" size={18} color="#fff" />
          </TouchableOpacity>

        </View>
      ))}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

export default ClassHeldReportScreen;

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#eef2f1",
  },

  /* HEADER */

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#ffffff",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
  },

  headerSub: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },

  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ecfdf5",
    justifyContent: "center",
    alignItems: "center",
  },

  /* PURPLE STRIP */

  purpleStrip: {
    backgroundColor: "#7c3aed",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },

  purpleText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },

  /* CARD */

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    marginHorizontal: 14,
    marginTop: 16,
    padding: 16,
    borderRadius: 18,

    borderWidth: 1.5,
    borderColor: "#e9d5ff",

    elevation: 6,
    shadowColor: "#7c3aed",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },

  calBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#f3e8ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
  },

  cardDate: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },

  cardRecords: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },

  /* BUTTON */

  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#7c3aed",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },

  btnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },

});
