import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import BASE_URL from "../../API-URL/API";

const CHRReport = ({ navigation }) => {

  const [reports, setReports] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);

  // DATE FILTER STATES
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
    fetchReports(null, null);
  }, []);

  // ======================
  // GET SESSIONS
  // ======================
  const fetchSessions = async () => {
    try {

      const res = await fetch(`${BASE_URL}/CHR/GetSessions`);
      const data = await res.json();

      console.log("Sessions:", data);

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
  const fetchReports = async (
    sessionID = null,
    reportDate = null
  ) => {

    try {

      setLoading(true);

      let url = `${BASE_URL}/CHR/GetHODDashboard?`;

      // SESSION FILTER
      if (sessionID) {
        url += `sessionID=${sessionID}`;
      }

      // DATE FILTER
      if (reportDate) {
        url += `&reportDate=${encodeURIComponent(reportDate)}`;
      }

      console.log("API URL:", url);

      const res = await fetch(url);
      const data = await res.json();

      console.log("Reports:", data);

      if (Array.isArray(data)) {

        setReports(data);

        // ======================
        // UNIQUE DATES
        // ======================
        const uniqueDates = [
          ...new Set(
            data.map((x) =>
              new Date(x.ReportDate)
                .toISOString()
                .split("T")[0]
            )
          ),
        ];

        const formattedDates = [
          {
            label: "All Dates",
            value: null,
          },

          ...uniqueDates.map((d) => ({
            label: d,
            value: d,
          })),
        ];

        setDates(formattedDates);

      } else {
        setReports([]);
        setDates([]);
      }

    } catch (error) {

      console.log("Fetch Error:", error);

      setReports([]);
      setDates([]);

    } finally {
      setLoading(false);
    }
  };

  // ======================
  // DELETE REPORT
  // ======================
  const deleteReport = async (reportId) => {

    Alert.alert(
      "Delete Report",
      "Are you sure you want to delete this complete CHR batch report?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },

        {
          text: "Delete",
          style: "destructive",

          onPress: async () => {

            try {

              setLoading(true);

              const res = await fetch(
                `${BASE_URL}/CHR/DeleteBatch/${reportId}`,
                {
                  method: "DELETE",
                }
              );

              const data = await res.json();

              console.log("Delete Response:", data);

              Alert.alert(
                "Success",
                data.Message || "Report Deleted"
              );

              // REFRESH REPORTS
              fetchReports(
                selectedSession,
                selectedDate
              );

            } catch (error) {

              console.log("Delete Error:", error);

              Alert.alert(
                "Error",
                "Failed to delete report"
              );

            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // ======================
  // SESSION FILTER
  // ======================
  const handleSessionChange = (item) => {

    setSelectedSession(item.value);

    // RESET DATE FILTER
    setSelectedDate(null);

    fetchReports(item.value, null);
  };

  // ======================
  // DATE FILTER
  // ======================
  const handleDateChange = (item) => {

    setSelectedDate(item.value);

    fetchReports(
      selectedSession,
      item.value
    );
  };

  // ======================
  // LOADING
  // ======================
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#1E7F4D"
        />
      </View>
    );
  }

  return (

  <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>

    {/* ======================
        HEADER
    ====================== */}
    <View style={styles.header}>

      <View style={styles.headerTop}>

        <View>
          <Text style={styles.headerTitle}>
            CHR Reports
          </Text>

          <Text style={styles.headerSubtitle}>
            Class Holding Report Dashboard
          </Text>
        </View>

        {/* <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>
            {reports.length}
          </Text>
        </View> */}

      </View>

      {/* <View style={styles.headerBottom}>

        <View style={styles.infoCard}>
          <Text style={styles.infoValue}>
            {reports.length}
          </Text>

          <Text style={styles.infoLabel}>
            Total Reports
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoValue}>
            {selectedSession ? "1" : "All"}
          </Text>

          <Text style={styles.infoLabel}>
            Sessions
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoValue}>
            {selectedDate ? "1" : "All"}
          </Text>

          <Text style={styles.infoLabel}>
            Dates
          </Text>
        </View> */}

      {/* </View> */}

    </View>

      {/* ======================
          SESSION DROPDOWN
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
          DATE DROPDOWN
      ====================== */}
      <View style={styles.dropdownBox}>
        <Dropdown
          style={styles.dropdown}
          data={dates}
          labelField="label"
          valueField="value"
          placeholder="Filter By Date"
          value={selectedDate}
          onChange={handleDateChange}
        />
      </View>

      {/* ======================
          REPORTS
      ====================== */}
      <ScrollView
        contentContainerStyle={{ padding: 15 }}
      >

        {reports.length === 0 ? (

          <Text
            style={{
              textAlign: "center",
              marginTop: 20
            }}
          >
            No Reports Found
          </Text>

        ) : (

          reports.map((item, index) => (

            <View
              key={index}
              style={styles.card}
            >

              <Text style={styles.title}>
                CHR REPORT
              </Text>

              <Text style={styles.session}>
                Session: {item.SessionName}
              </Text>

              <Text style={styles.date}>
                {new Date(item.ReportDate)
                  .toLocaleString()}
              </Text>

              <View style={styles.row}>
                <Text>
                  Total: {item.TotalClasses}
                </Text>

                <Text>
                  Cancelled: {item.CancelledClasses}
                </Text>
              </View>

              <View style={styles.row}>
                <Text>
                  Late: {item.LateTeachers}
                </Text>

                <Text>
                  Avg Score: {
                    item.AvgScore
                      ? item.AvgScore.toFixed(2)
                      : "0"
                  }
                </Text>
              </View>

              <View style={styles.buttonRow}>

                {/* DETAILS BUTTON */}
                <TouchableOpacity
                  style={styles.button}
                  onPress={() =>
                    navigation.navigate(
                      "CHRDetail",
                      {
                        reportId: item.ReportId,
                        sessionID: item.SessionID,
                      }
                    )
                  }
                >
                  <Text style={{ color: "#fff" }}>
                    View Details
                  </Text>
                </TouchableOpacity>

                {/* DELETE BUTTON */}
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() =>
                    deleteReport(item.ReportId)
                  }
                >
                  <Text style={{ color: "#fff" }}>
                    Delete
                  </Text>
                </TouchableOpacity>

              </View>

            </View>
          ))
        )}

      </ScrollView>
    </View>
  );
};

export default CHRReport;

const styles = StyleSheet.create({



  header: {
  backgroundColor: "#1E7F4D",
  paddingTop: 25,
  paddingBottom: 20,
  paddingHorizontal: 20,
  borderBottomLeftRadius: 25,
  borderBottomRightRadius: 25,
  elevation: 5,
  alignItems:"center"
},

headerTop: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},

headerTitle: {
  color: "#fff",
  fontSize: 28,
  fontWeight: "bold",
  alignItems:"center"
},

headerSubtitle: {
  color: "#DDF5E5",
  marginTop: 5,
  fontSize: 14,
},

headerBadge: {
  width: 55,
  height: 55,
  borderRadius: 30,
  backgroundColor: "#ffffff25",
  justifyContent: "center",
  alignItems: "center",
},

headerBadgeText: {
  color: "#fff",
  fontSize: 20,
  fontWeight: "bold",
},

headerBottom: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginTop: 20,
},

infoCard: {
  flex: 1,
  backgroundColor: "#ffffff20",
  marginHorizontal: 5,
  borderRadius: 12,
  paddingVertical: 12,
  alignItems: "center",
},

infoValue: {
  color: "#fff",
  fontSize: 18,
  fontWeight: "bold",
},

infoLabel: {
  color: "#DDF5E5",
  fontSize: 12,
  marginTop: 4,
},
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  dropdownBox: {
    paddingHorizontal: 15,
    paddingTop: 10,
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

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  button: {
    flex: 1,
    backgroundColor: "#1E7F4D",
    padding: 10,
    borderRadius: 8,
    alignItems: "center"
  },

  deleteButton: {
    flex: 1,
    marginLeft: 10,
    backgroundColor: "#D32F2F",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
});