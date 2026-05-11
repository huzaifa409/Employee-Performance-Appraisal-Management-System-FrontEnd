import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from "react-native";

import { Dropdown } from "react-native-element-dropdown";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import BASE_URL from "../../API-URL/API";

const ClassHeldReportScreen = ({ navigation, route }) => {
  const { teacherId } = route.params;

  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch(`${BASE_URL}/PeerEvaluator/Sessions`);
      const data = await response.json();
      const formatted = data.map((item) => ({ label: item.name, value: item.id }));
      setSessions(formatted);
      if (formatted.length > 0) {
        const latest = formatted[formatted.length - 1];
        setSelectedSession(latest.value);
        fetchReports(latest.value);
      }
    } catch (error) {
      console.log("SESSION ERROR:", error);
      setLoading(false);
    }
  };

  const fetchReports = async (sessionId) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${BASE_URL}/CHR/GetTeacherReport?teacherId=${teacherId}&sessionID=${sessionId}`
      );
      if (response.status === 404) { setReports([]); return; }
      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.log("REPORT ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColors = (status) => {
    if (status?.toLowerCase() === "held") {
      return { bg: "#ECFDF5", text: "#059669", icon: "#059669", border: "#6EE7B7" };
    }
    return { bg: "#FEF2F2", text: "#DC2626", icon: "#EF4444", border: "#FECACA" };
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#6B4FA1" />
        <Text style={styles.loadingText}>Loading reports…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#F8F9FB" barStyle="dark-content" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 36 }}>

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={22} color="#374151" />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Class Held Report</Text>
            <Text style={styles.headerSubtitle}>Your daily performance record</Text>
          </View>

          <View style={styles.logoContainer}>
            <Icon name="school" size={26} color="#0B7A3D" />
          </View>
        </View>

        {/* SESSION DROPDOWN */}
        <View style={styles.dropdownWrapper}>
          <Text style={styles.dropdownLabel}>Session</Text>
          <Dropdown
            style={styles.dropdown}
            containerStyle={styles.dropdownContainer}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            itemTextStyle={{ fontSize: 14, color: "#374151" }}
            data={sessions}
            labelField="label"
            valueField="value"
            value={selectedSession}
            placeholder="Select Session"
            onChange={(item) => {
              setSelectedSession(item.value);
              fetchReports(item.value);
            }}
          />
        </View>

        {/* SECTION LABEL */}
        {reports.length > 0 && (
          <Text style={styles.sectionLabel}>{reports.length} RECORDS FOUND</Text>
        )}

        {/* NO DATA */}
        {reports.length === 0 ? (
          <View style={styles.noDataContainer}>
            <Icon name="clipboard-alert-outline" size={64} color="#D1D5DB" />
            <Text style={styles.noDataTitle}>No Reports Found</Text>
            <Text style={styles.noDataSub}>Try selecting a different session</Text>
          </View>
        ) : (
          reports.map((item, index) => {
            const colors = getStatusColors(item.Status);
            return (
              <View key={index} style={styles.card}>

                {/* CARD TOP ROW */}
                <View style={styles.cardTop}>
                  <View style={[styles.iconBox, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                    <Icon name="clipboard-text" size={26} color={colors.icon} />
                  </View>

                  <View style={styles.cardTopText}>
                    <Text style={styles.courseCode}>{item.CourseCode}</Text>
                    <Text style={styles.teacherName}>{item.TeacherName}</Text>
                    <Text style={styles.dateText}>
                      <Icon name="calendar-outline" size={12} color="#9CA3AF" />
                      {"  "}{new Date(item.ClassDate).toDateString()}
                    </Text>
                  </View>

                  <View style={[styles.statusBadge, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                    <Text style={[styles.statusBadgeText, { color: colors.text }]}>
                      {item.Status}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                {/* SCORE ROW */}
                <View style={styles.scoreRow}>
                  <View style={styles.scoreItem}>
                    <Text style={styles.scoreItemLabel}>Score</Text>
                    <Text style={styles.scoreItemValue}>{item.Score}</Text>
                  </View>
                  <View style={styles.scoreItem}>
                    <Text style={styles.scoreItemLabel}>Discipline</Text>
                    <Text style={styles.scoreItemValue}>{item.Discipline}</Text>
                  </View>
                  <View style={styles.scoreItem}>
                    <Text style={styles.scoreItemLabel}>Venue</Text>
                    <Text style={styles.scoreItemValue}>{item.Venue}</Text>
                  </View>
                </View>

                {/* DETAILS ROW */}
                <View style={styles.detailsRow}>
                  <View style={styles.detailChip}>
                    <Icon name="clock-in" size={13} color="#6B7280" />
                    <Text style={styles.detailChipText}>Late In: {item.LateIn}</Text>
                  </View>
                  <View style={styles.detailChip}>
                    <Icon name="clock-out" size={13} color="#6B7280" />
                    <Text style={styles.detailChipText}>Left Early: {item.LeftEarly}</Text>
                  </View>
                </View>

                {/* REMARKS */}
                {item.Remarks ? (
                  <View style={styles.remarksBox}>
                    <View style={styles.remarksHeader}>
                      <Icon name="message-text-outline" size={14} color="#EA580C" />
                      <Text style={styles.remarksTitle}>Remarks</Text>
                    </View>
                    <Text style={styles.remarksText}>{item.Remarks}</Text>
                  </View>
                ) : null}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

export default ClassHeldReportScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FB",
  },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FB",
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: "#9CA3AF",
  },

  // HEADER
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  logoContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#ECFDF5",
    justifyContent: "center",
    alignItems: "center",
  },

  // DROPDOWN
  dropdownWrapper: {
    marginHorizontal: 16,
    marginTop: 18,
    marginBottom: 4,
  },
  dropdownLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 1,
    marginBottom: 8,
  },
  dropdown: {
    height: 52,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    elevation: 1,
  },
  dropdownContainer: {
    borderRadius: 12,
    borderColor: "#E5E7EB",
    elevation: 4,
  },
  placeholderStyle: { fontSize: 14, color: "#9CA3AF" },
  selectedTextStyle: { fontSize: 15, fontWeight: "700", color: "#111827" },

  // SECTION LABEL
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 1.2,
    marginHorizontal: 20,
    marginTop: 18,
    marginBottom: 6,
  },

  // NO DATA
  noDataContainer: {
    marginTop: 100,
    alignItems: "center",
    gap: 8,
  },
  noDataTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#6B7280",
  },
  noDataSub: {
    fontSize: 13,
    color: "#9CA3AF",
  },

  // CARD
  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTopText: {
    flex: 1,
    gap: 3,
  },
  courseCode: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  teacherName: {
    fontSize: 13,
    color: "#4B5563",
    fontWeight: "500",
  },
  dateText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },

  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 14,
  },

  // SCORE ROW
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  scoreItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  scoreItemLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 0.5,
  },
  scoreItemValue: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1F2937",
  },

  // DETAILS CHIPS
  detailsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  detailChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  detailChipText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
  },

  // REMARKS
  remarksBox: {
    marginTop: 12,
    backgroundColor: "#FFF7ED",
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#F97316",
  },
  remarksHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  remarksTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#EA580C",
    letterSpacing: 0.5,
  },
  remarksText: {
    fontSize: 13,
    color: "#7C2D12",
    lineHeight: 20,
    fontWeight: "500",
  },
});