import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  TouchableOpacity,
  FlatList,
} from "react-native";

import { Dropdown } from "react-native-element-dropdown";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import BASE_URL from "../../API-URL/API";

const CourseManagementEvaluationScreen = ({ route, navigation }) => {
  const { teacherId, teacherName } = route.params;

  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [groupedData, setGroupedData] = useState([]);

  useEffect(() => {
    fetchSessions();
  }, []);

  // ---------------- GROUP BY COURSE ----------------
  const groupByCourse = (data) => {
    const grouped = {};

    data.forEach((item) => {
      const key = item.CourseCode;

      if (!grouped[key]) {
        grouped[key] = {
          courseCode: item.CourseCode,
          items: [],
        };
      }

      grouped[key].items.push(item);
    });

    return Object.values(grouped);
  };

  // ---------------- FETCH SESSIONS ----------------
  const fetchSessions = async () => {
    try {
      const response = await fetch(`${BASE_URL}/PeerEvaluator/Sessions`);
      const data = await response.json();

      const formatted = data.map((i) => ({
        label: i.name,
        value: i.id,
      }));

      setSessions(formatted);

      if (formatted.length > 0) {
        const latest = formatted[formatted.length - 1];
        setSelectedSession(latest.value);
        fetchPerformance(latest.value);
      }
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  };

  // ---------------- FETCH PERFORMANCE ----------------
  const fetchPerformance = async (sessionId) => {
    try {
      setLoading(true);

      const res = await fetch(
        `${BASE_URL}/CourseManagement/my-Courseperformance/${teacherId}/${sessionId}`
      );

      const result = await res.json();

      const data = result.Performance || [];

      setGroupedData(groupByCourse(data));
    } catch (e) {
      console.log("ERROR:", e);
      setGroupedData([]);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- STATUS COLOR ----------------
  const getStatusColor = (status) => {
    return status === "On Time"
      ? { bg: "#DCFCE7", text: "#15803D" }
      : { bg: "#FEE2E2", text: "#B91C1C" };
  };

  // ---------------- LOADING ----------------
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0B7A3D" />
      </View>
    );
  }

  // ---------------- COURSE CARD ----------------
  const CourseCard = ({ course }) => {
    const avg =
      course.items.reduce((s, i) => s + i.ObtainedScore, 0) /
      course.items.length;

    return (
      <View style={styles.courseCard}>

        {/* COURSE HEADER */}
        <View style={styles.courseHeader}>
          <Icon name="book-outline" size={22} color="#0B7A3D" />
          <View>
            <Text style={styles.courseTitle}>{course.courseCode}</Text>
            <Text style={styles.courseSub}>Course Evaluation</Text>
          </View>
        </View>

        {/* ITEMS */}
        {course.items.map((item, index) => {
          const status = getStatusColor(item.Status);

          return (
            <View key={index} style={styles.block}>

              {/* TITLE */}
              <View style={styles.blockHeader}>
                <Text style={styles.blockTitle}>{item.Activity}</Text>

                <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                  <Text style={[styles.statusText, { color: status.text }]}>
                    {item.Status}
                  </Text>
                </View>
              </View>

              {/* SCORE */}
              <Text style={styles.scoreText}>
                Score: {item.ObtainedScore} / 5
              </Text>

              {/* PROGRESS BAR */}
              <View style={styles.progressBg}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${(item.ObtainedScore / 5) * 100}%`,
                      backgroundColor:
                        item.ObtainedScore === 5 ? "#16A34A" : "#F59E0B",
                    },
                  ]}
                />
              </View>

              {/* REMARKS */}
              <View style={styles.remarkBox}>
                <Text style={styles.remarkText}>{item.Remarks}</Text>
              </View>

            </View>
          );
        })}

        {/* AVERAGE */}
        <View style={styles.avgRow}>
          <Text style={styles.avgLabel}>AVERAGE SCORE</Text>
          <Text style={styles.avgValue}>{avg.toFixed(1)} / 5</Text>
        </View>

      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={22} color="#111827" />
        </TouchableOpacity>

        <View>
          <Text style={styles.headerTitle}>My Performance</Text>
          <Text style={styles.headerSub}>{teacherName}</Text>
        </View>
      </View>

      {/* SESSION */}
      <View style={styles.dropdownWrapper}>
        <Dropdown
          style={styles.dropdown}
          data={sessions}
          labelField="label"
          valueField="value"
          value={selectedSession}
          placeholder="Select Session"
          onChange={(item) => {
            setSelectedSession(item.value);
            fetchPerformance(item.value);
          }}
        />
      </View>

      {/* LIST */}
      <FlatList
        data={groupedData}
        keyExtractor={(item) => item.courseCode}
        renderItem={({ item }) => <CourseCard course={item} />}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
};

export default CourseManagementEvaluationScreen;


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FB" },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    backgroundColor: "#fff",
    elevation: 2,
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: "900",
  },

  headerSub: {
    fontSize: 12,
    color: "#6B7280",
  },

  dropdownWrapper: {
    margin: 16,
  },

  dropdown: {
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
  },

  courseCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 14,
    elevation: 3,
  },

  courseHeader: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },

  courseTitle: {
    fontSize: 16,
    fontWeight: "900",
  },

  courseSub: {
    fontSize: 12,
    color: "#6B7280",
  },

  block: {
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },

  blockHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  blockTitle: {
    fontSize: 13,
    fontWeight: "800",
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  statusText: {
    fontSize: 10,
    fontWeight: "800",
  },

  scoreText: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
  },

  progressBg: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 20,
    overflow: "hidden",
    marginTop: 8,
  },

  progressFill: {
    height: "100%",
    borderRadius: 20,
  },

  remarkBox: {
    marginTop: 8,
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 8,
  },

  remarkText: {
    fontSize: 12,
    color: "#374151",
    fontStyle: "italic",
  },

  avgRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  avgLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#9CA3AF",
  },

  avgValue: {
    fontSize: 14,
    fontWeight: "900",
    color: "#0B7A3D",
  },
});