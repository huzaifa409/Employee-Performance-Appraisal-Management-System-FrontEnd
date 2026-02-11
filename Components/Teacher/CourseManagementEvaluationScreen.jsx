import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const CourseManagementEvaluationScreen = ({ navigation }) => {

  const courses = [
    {
      id: 1,
      name: "Database Systems",
      code: "CS-301",
      session: "Fall 2025",
      score: 8.7,
      remarks:
        "Excellent course organization and timely submissions. Course material is comprehensive and well-structured.",
      evaluator: "Dr. Munir",
      date: "Nov 20, 2025",
    },
    {
      id: 2,
      name: "Advanced Database Systems",
      code: "CS-401",
      session: "Fall 2025",
      score: 8.2,
      remarks:
        "Good delivery and documentation. Minor improvements suggested in assignment feedback cycle.",
      evaluator: "Dr. Munir",
      date: "Nov 18, 2025",
    },
  ];

  const ScoreBar = ({ value }) => {
    const percent = Math.min(value * 10, 100);
    return (
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${percent}%` }]} />
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#166534" />
        </TouchableOpacity>

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerTitle}>
            Course Management Evaluation
          </Text>
          <Text style={styles.headerSub}>
            View the evaluation given by HOD for each of your courses
          </Text>
        </View>

        <View style={styles.headerBadge}>
          <Icon name="verified" size={20} color="#16a34a" />
        </View>
      </View>

      {/* FILTERS */}
      <View style={styles.filtersWrap}>
        <View style={styles.filterTitleRow}>
          <Icon name="filter-alt" size={18} color="#16a34a" />
          <Text style={styles.filterTitle}>Filters</Text>
        </View>

        <View style={styles.filterRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.filterLabel}>Session</Text>
            <TouchableOpacity style={styles.selectBox}>
              <Text>Fall 2025</Text>
              <Icon name="expand-more" size={22} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.filterLabel}>Course</Text>
            <TouchableOpacity style={styles.selectBox}>
              <Text>All Courses</Text>
              <Icon name="expand-more" size={22} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* COURSE CARDS */}
      {courses.map((c) => (
        <View key={c.id} style={styles.card}>

          {/* Top */}
          <View style={styles.cardHeader}>
            <Icon name="menu-book" size={22} color="#16a34a" />
            <Text style={styles.courseTitle}>{c.name}</Text>
          </View>

          {/* Tags */}
          <View style={styles.tagRow}>
            <View style={styles.tagGreen}>
              <Text style={styles.tagGreenText}>{c.code}</Text>
            </View>

            <View style={styles.tagBlue}>
              <Text style={styles.tagBlueText}>{c.session}</Text>
            </View>
          </View>

          {/* Submission Box */}
          <View style={styles.innerBox}>
            <View style={styles.statusRow}>
              <Text>Paper Submission</Text>
              <View style={styles.statusRight}>
                <Icon name="check-circle" size={18} color="#16a34a" />
                <Text style={styles.okText}>On Time</Text>
              </View>
            </View>

            <View style={styles.statusRow}>
              <Text>Course Folder Submission</Text>
              <View style={styles.statusRight}>
                <Icon name="check-circle" size={18} color="#16a34a" />
                <Text style={styles.okText}>On Time</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.scoreRow}>
              <Text>Course Quality Score</Text>
              <Text style={styles.scoreText}>{c.score} / 10</Text>
            </View>

            <ScoreBar value={c.score} />
          </View>

          {/* Remarks */}
          <View style={styles.remarksBox}>
            <View style={styles.remarkAvatar}>
              <Text style={{ color: "#fff", fontWeight: "700" }}>H</Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.remarkTitle}>HOD Remarks</Text>
              <Text style={styles.remarkText}>{c.remarks}</Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.cardFooter}>
            <Text style={styles.footerText}>
              Evaluated by: {c.evaluator}
            </Text>
            <Text style={styles.footerText}>{c.date}</Text>
          </View>

        </View>
      ))}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

export default CourseManagementEvaluationScreen;

const styles = StyleSheet.create({

  container: { flex: 1, backgroundColor: "#eef3f1" },

  /* HEADER */

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#fff",
    elevation: 6,
  },

  headerTitle: { fontWeight: "700", fontSize: 16 },
  headerSub: { fontSize: 12, color: "#666", marginTop: 2 },

  headerBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ecfdf5",
    justifyContent: "center",
    alignItems: "center",
  },

  /* FILTERS */

  filtersWrap: {
    padding: 14,
    backgroundColor: "#fff",
    marginBottom: 8,
  },

  filterTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },

  filterTitle: { fontWeight: "700", color: "#166534" },
  filterLabel: { fontSize: 12, color: "#666", marginBottom: 4 },

  filterRow: { flexDirection: "row", gap: 12 },

  selectBox: {
    borderWidth: 1.5,
    borderColor: "#bbf7d0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
  },

  /* CARD */

  card: {
    backgroundColor: "#ffffff",
    margin: 14,
    padding: 16,
    borderRadius: 18,
    borderTopWidth: 5,
    borderTopColor: "#16a34a",

    elevation: 6,
    shadowColor: "#16a34a",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  courseTitle: {
    fontSize: 16,
    fontWeight: "700",
  },

  tagRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },

  tagGreen: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },

  tagGreenText: {
    color: "#166534",
    fontWeight: "600",
    fontSize: 12,
  },

  tagBlue: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },

  tagBlueText: {
    color: "#1d4ed8",
    fontWeight: "600",
    fontSize: 12,
  },

  /* INNER BOX */

  innerBox: {
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  statusRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  okText: { color: "#16a34a", fontWeight: "600" },

  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 8,
  },

  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  scoreText: {
    color: "#16a34a",
    fontWeight: "800",
    fontSize: 16,
  },

  progressBg: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 10,
  },

  progressFill: {
    height: 8,
    backgroundColor: "#16a34a",
    borderRadius: 10,
  },

  /* REMARKS */

  remarksBox: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#ecfdf5",
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },

  remarkAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#16a34a",
    justifyContent: "center",
    alignItems: "center",
  },

  remarkTitle: { fontWeight: "700", marginBottom: 4 },
  remarkText: { fontSize: 13, color: "#374151" },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },

  footerText: {
    fontSize: 12,
    color: "#6b7280",
  },

});
