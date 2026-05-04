import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import BASE_URL from "../../API-URL/API";

const CHRReport = ({ navigation }) => {
  const [reports, setReports] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
    fetchReports(null);
  }, []);

  // ======================
  // GET SESSIONS
  // ======================
  const fetchSessions = async () => {
    try {
      const res = await fetch(`${BASE_URL}/CHR/GetSessions`);
      const data = await res.json();

      console.log("Sessions:", data);

      // format for dropdown
      const formatted = (data || []).map((item) => ({
        label: item.name,
        value: item.id
      }));

      setSessions(formatted);

    } catch (error) {
      console.log("Session Error:", error);
    }
  };

  // ======================
  // GET REPORTS
  // ======================
  const fetchReports = async (sessionID) => {
    try {
      setLoading(true);

      let url = `${BASE_URL}/CHR/GetHODDashboard`;
      if (sessionID) {
        url += `?sessionID=${sessionID}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      console.log("Reports:", data);

      if (Array.isArray(data)) {
        setReports(data);
      } else {
        setReports([]);
      }

    } catch (error) {
      console.log("Fetch Error:", error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  // ======================
  // HANDLE SESSION CHANGE
  // ======================
  const handleSessionChange = (item) => {
    setSelectedSession(item.value);
    fetchReports(item.value);
  };

  // ======================
  // LOADING
  // ======================
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1E7F4D" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>

      {/* ======================
          DROPDOWN
      ====================== */}
      <View style={styles.dropdownBox}>
        <Dropdown
          style={styles.dropdown}
          data={sessions}
          labelField="label"
          valueField="value"
          placeholder="Select Session"
          value={selectedSession}
          onChange={handleSessionChange}
        />
      </View>

      {/* ======================
          REPORTS
      ====================== */}
      <ScrollView contentContainerStyle={{ padding: 15 }}>

        {reports.length === 0 ? (
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            No Reports Found
          </Text>
        ) : (
          reports.map((item, index) => (
            <View key={index} style={styles.card}>

              <Text style={styles.title}>CHR REPORT</Text>

              <Text style={styles.session}>
                Session: {item.SessionName}
              </Text>

              <Text style={styles.date}>
                {item.ReportDate}
              </Text>

              <View style={styles.row}>
                <Text>Total: {item.TotalClasses}</Text>
                <Text>Cancelled: {item.CancelledClasses}</Text>
              </View>

              <View style={styles.row}>
                <Text>Late: {item.LateTeachers}</Text>
                <Text>
                  Avg Score: {item.AvgScore ? item.AvgScore.toFixed(2) : "0"}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.button}
                onPress={() =>
                  navigation.navigate("CHRDetail", {
                    reportId: item.ReportId,
                    sessionID: item.SessionID,
                  })
                }
              >
                <Text style={{ color: "#fff" }}>View Details</Text>
              </TouchableOpacity>

            </View>
          ))
        )}

      </ScrollView>
    </View>
  );
};

export default CHRReport;

const styles = StyleSheet.create({

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  dropdownBox: {
    padding: 15,
    backgroundColor: "#f5f5f5"
  },

  dropdown: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: "#fff"
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3
  },

  title: {
    fontSize: 16,
    fontWeight: "bold"
  },

  session: {
    color: "#1E7F4D",
    marginTop: 5,
    fontWeight: "600"
  },

  date: {
    marginVertical: 10,
    color: "gray"
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 5
  },

  button: {
    marginTop: 10,
    backgroundColor: "#1E7F4D",
    padding: 10,
    borderRadius: 8,
    alignItems: "center"
  }
});