import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { BarChart } from "react-native-gifted-charts";
import BASE_URL from "../../../API-URL/API";

const QuestionAnalysis = ({ route }) => {
  const { teacherId, sessionId, evalType } = route.params;

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const [evaluationType, setEvaluationType] = useState(evalType || "both");
  const [questionStatus, setQuestionStatus] = useState("all");

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const evalOptions = [
    { label: "Both", value: "both" },
    { label: "Student", value: "student" },
    { label: "Peer", value: "peer" },
  ];

  const questionOptions = [
    { label: "All Questions", value: "all" },
    { label: "Critical Questions", value: "critical" },
  ];

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch(
        `${BASE_URL}/ExtraFeatures/GetMyCourses/${teacherId}/${sessionId}`
      );
      const data = await res.json();

      const formatted = data.map((c) => ({
        label: c,
        value: c,
      }));

      setCourses(formatted);
      if (formatted.length > 0) setSelectedCourse(formatted[0].value);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (selectedCourse) fetchQuestions();
  }, [selectedCourse, evaluationType, questionStatus]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);

      const url =
        `${BASE_URL}/ExtraFeatures/GetCourseQuestionDetail/` +
        `${teacherId}/${sessionId}/${selectedCourse}` +
        `?evaluationType=${evaluationType}` +
        `&questionStatus=${questionStatus}`;

      const res = await fetch(url);
      const data = await res.json();

      setQuestions(data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // 📊 QUESTION AVERAGE GRAPH DATA
  // ================================
  const graphData = questions.map((q, index) => {
    const val = Number(q.AverageScore.toFixed(2));

    return {
      value: val,
      label: `Q${index + 1}`,
      frontColor: val >= 3 ? "#1D9E75" : val >= 2 ? "#F59E0B" : "#EF4444",

      topLabelComponent: () => (
        <Text style={{ fontSize: 10, color: "#333", fontWeight: "700" }}>
          {val}
        </Text>
      ),
    };
  });

  // Helper to derive score band
  const getScoreBand = (score) => {
    if (score >= 3) return { color: "#1D9E75", bg: "#EDFAF4", label: "Good" };
    if (score >= 2) return { color: "#F59E0B", bg: "#FFFBEB", label: "Average" };
    return { color: "#EF4444", bg: "#FEF2F2", label: "Critical" };
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>

      {/* ================= GRAPH ================= */}
      {questions.length > 0 && (
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View style={styles.chartTitleRow}>
              <View style={styles.chartAccent} />
              <Text style={styles.chartTitle}>Performance Overview</Text>
            </View>
            <Text style={styles.chartSubtitle}>{questions.length} questions</Text>
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#1D9E75" }]} />
              <Text style={styles.legendText}>Good (≥3)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#F59E0B" }]} />
              <Text style={styles.legendText}>Avg (≥2)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#EF4444" }]} />
              <Text style={styles.legendText}>Critical (&lt;2)</Text>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BarChart
              data={graphData}
              height={220}
              barWidth={26}
              spacing={18}
              maxValue={4}
              noOfSections={4}
              yAxisThickness={0}
              xAxisThickness={1}
              isAnimated
            />
          </ScrollView>
        </View>
      )}

      {/* ================= FILTERS ================= */}
      <View style={styles.filtersCard}>
        <Text style={styles.sectionLabel}>FILTERS</Text>

        <Dropdown
          style={styles.dropdownFull}
          containerStyle={styles.dropdownContainer}
          itemTextStyle={styles.dropdownItemText}
          selectedTextStyle={styles.dropdownSelectedText}
          placeholderStyle={styles.dropdownPlaceholder}
          data={courses}
          labelField="label"
          valueField="value"
          value={selectedCourse}
          placeholder="Select Course"
          onChange={(item) => setSelectedCourse(item.value)}
        />

        <View style={styles.row}>
          <Dropdown
            style={styles.dropdown}
            containerStyle={styles.dropdownContainer}
            itemTextStyle={styles.dropdownItemText}
            selectedTextStyle={styles.dropdownSelectedText}
            data={evalOptions}
            labelField="label"
            valueField="value"
            value={evaluationType}
            onChange={(item) => setEvaluationType(item.value)}
          />

          <Dropdown
            style={styles.dropdown}
            containerStyle={styles.dropdownContainer}
            itemTextStyle={styles.dropdownItemText}
            selectedTextStyle={styles.dropdownSelectedText}
            data={questionOptions}
            labelField="label"
            valueField="value"
            value={questionStatus}
            onChange={(item) => setQuestionStatus(item.value)}
          />
        </View>
      </View>

      {/* ================= SECTION HEADER ================= */}
      {!loading && questions.length > 0 && (
        <View style={styles.listHeader}>
          <Text style={styles.sectionLabel}>QUESTION BREAKDOWN</Text>
        </View>
      )}

      {/* ================= LOADING ================= */}
      {loading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color="#1D9E75" />
          <Text style={styles.loadingText}>Loading questions…</Text>
        </View>
      ) : (
        questions.map((q, index) => {
          const score = Number(q.AverageScore.toFixed(2));
          const band = getScoreBand(score);

          return (
            <View key={index} style={styles.card}>
              {/* Left accent bar */}
              <View style={[styles.cardAccent, { backgroundColor: band.color }]} />

              <View style={styles.cardBody}>
                <View style={styles.cardTop}>
                  <View style={styles.qBadge}>
                    <Text style={styles.qBadgeText}>Q{index + 1}</Text>
                  </View>
                  <View style={[styles.scorePill, { backgroundColor: band.bg }]}>
                    <Text style={[styles.scoreValue, { color: band.color }]}>
                      {score}
                    </Text>
                    <Text style={[styles.scoreOutOf, { color: band.color }]}>/4</Text>
                  </View>
                </View>

                <Text style={styles.qTitle}>{q.QuestionText}</Text>

                <View style={styles.cardFooter}>
                  <View style={styles.evalTagsRow}>
                    {q.Type === "Student" && (
                      <View style={[styles.evalTag, { backgroundColor: "#EEF2FF" }]}>
                        <Text style={[styles.evalTagText, { color: "#4F46E5" }]}>Student</Text>
                      </View>
                    )}
                    {q.Type === "Peer" && (
                      <View style={[styles.evalTag, { backgroundColor: "#FFF7ED" }]}>
                        <Text style={[styles.evalTagText, { color: "#EA580C" }]}>Peer</Text>
                      </View>
                    )}
                  </View>
                  {/* <Text style={styles.avgLabel}>Avg Score</Text> */}
                </View>
              </View>
            </View>
          );
        })
      )}

      {/* ================= EMPTY STATE ================= */}
      {!loading && questions.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>No Questions Found</Text>
          <Text style={styles.emptySubtitle}>
            Try changing the filters above
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

export default QuestionAnalysis;

// ================= STYLES =================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6FA",
    padding: 14,
  },

  // ── Chart Card ──
  chartCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  chartTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chartAccent: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: "#1D9E75",
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  chartSubtitle: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
  },

  // ── Legend ──
  legend: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: "#6B7280",
  },

  // ── Filters Card ──
  filtersCard: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  dropdownFull: {
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  dropdown: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dropdownContainer: {
    borderRadius: 10,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  dropdownItemText: {
    fontSize: 13,
    color: "#374151",
  },
  dropdownSelectedText: {
    fontSize: 13,
    color: "#111827",
    fontWeight: "600",
  },
  dropdownPlaceholder: {
    fontSize: 13,
    color: "#9CA3AF",
  },

  // ── List Header ──
  listHeader: {
    marginBottom: 8,
    paddingHorizontal: 2,
  },

  // ── Question Card ──
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 10,
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardAccent: {
    width: 4,
  },
  cardBody: {
    flex: 1,
    padding: 14,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  qBadge: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  qBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
  },
  scorePill: {
    flexDirection: "row",
    alignItems: "baseline",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 1,
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: "800",
  },
  scoreOutOf: {
    fontSize: 11,
    fontWeight: "600",
    opacity: 0.7,
  },
  qTitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#1F2937",
    lineHeight: 19,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  evalTagsRow: {
    flexDirection: "row",
    gap: 6,
  },
  evalTag: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 6,
  },
  evalTagText: {
    fontSize: 11,
    fontWeight: "700",
  },
  avgLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "500",
  },

  // ── Loading ──
  loadingWrapper: {
    paddingVertical: 48,
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    color: "#9CA3AF",
    fontSize: 13,
  },

  // ── Empty State ──
  emptyState: {
    paddingVertical: 60,
    alignItems: "center",
    gap: 6,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#374151",
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#9CA3AF",
  },
});