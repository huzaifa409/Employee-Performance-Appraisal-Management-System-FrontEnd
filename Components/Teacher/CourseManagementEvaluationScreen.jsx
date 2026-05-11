import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  TouchableOpacity,
} from "react-native";

import { Dropdown } from "react-native-element-dropdown";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import BASE_URL from "../../API-URL/API";

const CourseManagementEvaluationScreen = ({ route, navigation }) => {
  const { teacherId, teacherName } = route.params;

  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [performanceData, setPerformanceData] = useState([]);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch(`${BASE_URL}/PeerEvaluator/Sessions`);
      const data = await response.json();
      const formattedSessions = data.map((item) => ({ label: item.name, value: item.id }));
      setSessions(formattedSessions);
      if (formattedSessions.length > 0) {
        const latestSession = formattedSessions[formattedSessions.length - 1];
        setSelectedSession(latestSession.value);
        fetchPerformance(latestSession.value);
      }
    } catch (error) {
      console.log("SESSION ERROR:", error);
      setLoading(false);
    }
  };

  const fetchPerformance = async (sessionId) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${BASE_URL}/CourseManagement/my-Courseperformance/${teacherId}/${sessionId}`
      );
      if (response.status === 404) { setPerformanceData([]); return; }
      const data = await response.json();
      setPerformanceData(data);
    } catch (error) {
      console.log("PERFORMANCE ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (score) => {
    if (score === 5) return "#14A44D";
    if (score >= 3) return "#F59E0B";
    return "#DC2626";
  };

  const getStatusStyle = (status) => {
    if (status?.toLowerCase() === "on time") {
      return { bg: "#DCFCE7", text: "#15803D", border: "#86EFAC" };
    }
    return { bg: "#FEE2E2", text: "#B91C1C", border: "#FECACA" };
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0B7A3D" />
        <Text style={styles.loadingText}>Loading performance…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={22} color="#374151" />
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Course Management</Text>
          <Text style={styles.headerSubtitle}>{teacherName}</Text>
        </View>

        <View style={styles.profileCircle}>
          <Icon name="account-circle" size={28} color="#0B7A3D" />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 36 }}>

        {/* TITLE BLOCK */}
        <View style={styles.titleBlock}>
          <Text style={styles.mainTitle}>Performance Details</Text>
          <Text style={styles.subTitle}>HOD remarks and submission status</Text>
        </View>

        {/* DROPDOWN */}
        <View style={styles.dropdownWrapper}>
          <Text style={styles.dropdownLabel}>SESSION</Text>
          <Dropdown
            style={styles.dropdown}
            containerStyle={styles.dropdownContainer}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            itemTextStyle={{ fontSize: 14, color: "#374151" }}
            data={sessions}
            labelField="label"
            valueField="value"
            placeholder="Select Session"
            value={selectedSession}
            onChange={(item) => {
              setSelectedSession(item.value);
              fetchPerformance(item.value);
            }}
          />
        </View>

        {/* SECTION LABEL */}
        {performanceData.length > 0 && (
          <Text style={styles.sectionLabel}>{performanceData.length} ACTIVITIES</Text>
        )}

        {/* NO DATA */}
        {performanceData.length === 0 ? (
          <View style={styles.noDataContainer}>
            <Icon name="clipboard-alert-outline" size={64} color="#D1D5DB" />
            <Text style={styles.noDataTitle}>No Performance Found</Text>
            <Text style={styles.noDataSub}>Try selecting a different session</Text>
          </View>
        ) : (
          performanceData.map((item, index) => {
            const statusStyle = getStatusStyle(item.Status);
            const progressColor = getProgressColor(item.ObtainedScore);
            const progressPct = (item.ObtainedScore / 5) * 100;

            return (
              <View key={index} style={styles.card}>

                {/* TOP ROW */}
                <View style={styles.topRow}>
                  <View style={styles.iconBox}>
                    <Icon name="book-open-page-variant" size={24} color="#0B7A3D" />
                  </View>

                  <View style={styles.topTextBlock}>
                    <Text style={styles.activityText}>{item.Activity}</Text>
                    <Text style={styles.kpiLabel}>KPI EVALUATION</Text>
                  </View>

                  <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg, borderColor: statusStyle.border }]}>
                    <Text style={[styles.statusText, { color: statusStyle.text }]}>
                      {item.Status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                {/* SCORE SECTION */}
                <View style={styles.scoreSection}>
                  <View>
                    <Text style={styles.scoreSectionLabel}>OBTAINED SCORE</Text>
                    <View style={styles.scoreValueRow}>
                      <Text style={[styles.scoreNumber, { color: progressColor }]}>
                        {item.ObtainedScore}
                      </Text>
                      <Text style={styles.scoreOutOf}> / 5</Text>
                    </View>
                  </View>

                  {/* Circular-ish score indicator using pills */}
                  <View style={styles.scoreDotsRow}>
                    {[1, 2, 3, 4, 5].map((dot) => (
                      <View
                        key={dot}
                        style={[
                          styles.scoreDot,
                          {
                            backgroundColor:
                              dot <= item.ObtainedScore ? progressColor : "#E5E7EB",
                          },
                        ]}
                      />
                    ))}
                  </View>
                </View>

                {/* PROGRESS BAR */}
                <View style={styles.progressBg}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${progressPct}%`, backgroundColor: progressColor },
                    ]}
                  />
                </View>

                {/* REMARKS */}
                <View style={styles.remarksBox}>
                  <View style={styles.remarksHeader}>
                    <Icon name="file-document-outline" size={14} color="#9CA3AF" />
                    <Text style={styles.remarksTitle}>HOD REMARKS</Text>
                  </View>
                  <Text style={styles.remarksText}>"{item.Remarks}"</Text>
                </View>

              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

export default CourseManagementEvaluationScreen;

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
    paddingBottom: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    elevation: 2,
    gap: 12,
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
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  profileCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#ECFDF5",
    justifyContent: "center",
    alignItems: "center",
  },

  // TITLE BLOCK
  titleBlock: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 4,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111827",
  },
  subTitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },

  // DROPDOWN
  dropdownWrapper: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  dropdownLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  dropdown: {
    height: 52,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
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
    marginBottom: 4,
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

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#ECFDF5",
    justifyContent: "center",
    alignItems: "center",
  },
  topTextBlock: {
    flex: 1,
    gap: 3,
  },
  activityText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 14,
  },

  // SCORE
  scoreSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  scoreSectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 1,
    marginBottom: 4,
  },
  scoreValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  scoreNumber: {
    fontSize: 28,
    fontWeight: "900",
  },
  scoreOutOf: {
    fontSize: 14,
    color: "#9CA3AF",
    fontWeight: "600",
  },
  scoreDotsRow: {
    flexDirection: "row",
    gap: 6,
  },
  scoreDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  // PROGRESS
  progressBg: {
    height: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 14,
  },
  progressFill: {
    height: "100%",
    borderRadius: 20,
  },

  // REMARKS
  remarksBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#D1D5DB",
  },
  remarksHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  remarksTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#9CA3AF",
    letterSpacing: 1,
  },
  remarksText: {
    fontSize: 14,
    color: "#374151",
    fontStyle: "italic",
    lineHeight: 21,
  },
});