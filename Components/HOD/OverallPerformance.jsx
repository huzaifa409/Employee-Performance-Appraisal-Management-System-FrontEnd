import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { BarChart } from "react-native-gifted-charts";

import BASE_URL from "../../API-URL/API";
import { getConfidentialByTeacherSession } from "../../Database/db";

// ─── Simple color helpers ─────────────────────────────────────────────────────
function getScoreColor(pct) {
  if (pct >= 80) return "#16a34a"; // green
  if (pct >= 55) return "#d97706"; // amber
  return "#dc2626";                // red
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
const OverallPerformanceScreen = () => {
  const [sessions, setSessions]               = useState([]);
  const [teachers, setTeachers]               = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [data, setData]                       = useState(null);
  const [loading, setLoading]                 = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [confidentialAvgScore, setConfidentialAvgScore] = useState(0);

  useEffect(() => { loadSessions(); }, []);

  // ── Load sessions on mount ────────────────────────────────────────────────
  const loadSessions = async () => {
    try {
      const res  = await fetch(`${BASE_URL}/OverallPerformance/list`);
      const json = await res.json();
      setSessions(json.map((item) => ({ label: item.name, value: item.id })));
    } catch {
      Alert.alert("Error", "Failed to load sessions");
    }
  };

  // ── When session changes, load teachers + KPI options ────────────────────
  const handleSessionChange = async (sessionId) => {
    setSelectedSession(sessionId);
    setSelectedTeacher(null);
    setTeachers([]);
    setData(null);

    // Load teachers
    try {
      setLoadingTeachers(true);
      const res  = await fetch(`${BASE_URL}/OverallPerformance/GetTeachersBySession/${sessionId}`);
      const json = await res.json();
      setTeachers(json.map((item) => ({ label: item.Name, value: item.UserID })));
    } catch {
      Alert.alert("Error", "Failed to load teachers");
    } finally {
      setLoadingTeachers(false);
    }
  };

  // ── Fetch and process performance data ───────────────────────────────────
  const fetchAnalysis = async () => {
    if (!selectedSession || !selectedTeacher) return;

    try {
      setLoading(true);

      const url = `${BASE_URL}/OverallPerformance/GetTeacherPerformanceAnalytics/${selectedTeacher}/${selectedSession}`;

      const res  = await fetch(url);
      const json = await res.json();

      if (json.Status === "Empty") {
        Alert.alert("No Data", json.Message);
        setData(null);
        return;
      }

      // Confidential score from local DB
      const localScores = await getConfidentialByTeacherSession(selectedTeacher);
      const avgScore = localScores.length > 0
        ? localScores.reduce((a, b) => a + b, 0) / localScores.length
        : 0;
      setConfidentialAvgScore(avgScore);

      // Recalculate totals
      let totalEarned = 0;
      let totalMax    = 0;

      json.Breakdown.forEach((kpi) => {
        let kpiTotal = 0;

        kpi.SubDetails.forEach((sub) => {
          if (sub.SubName?.toLowerCase().includes("confidential")) {
            const calculated = sub.MaxScale > 0
              ? (avgScore / sub.MaxScale) * sub.SubMax
              : 0;
            sub.SubAchieved = Number(calculated.toFixed(2));
          }
          sub.SubAchieved = Math.min(sub.SubAchieved, sub.SubMax);
          kpiTotal += sub.SubAchieved;
        });

        kpi.KPIAchieved = Number(Math.min(kpiTotal, kpi.KPIWeight).toFixed(2));
        totalEarned += kpi.KPIAchieved;
        totalMax    += kpi.KPIWeight;
      });

      json.OverallPercentage = totalMax > 0
        ? Number(((totalEarned / totalMax) * 100).toFixed(2))
        : 0;

      setData(json);
    } catch {
      Alert.alert("Error", "Failed to load performance data");
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePress = () => {
    if (!selectedSession || !selectedTeacher) {
      Alert.alert("Missing Fields", "Please select both a session and a teacher.");
      return;
    }
    fetchAnalysis();
  };

  // ── Build bar chart data ──────────────────────────────────────────────────
  const getChartData = () => {
    if (!data) return [];
    return data.Breakdown.flatMap((kpi) =>
      kpi.SubDetails.map((sub) => {
        const pct = sub.SubMax > 0 ? (sub.SubAchieved / sub.SubMax) * 100 : 0;
        return {
          value: Number(pct.toFixed(1)),
          label: sub.SubName.split(" ")[0].substring(0, 6),
          frontColor: getScoreColor(pct),
          topLabelComponent: () => (
            <Text style={styles.barTopLabel}>{pct.toFixed(0)}</Text>
          ),
        };
      })
    );
  };

  const overallPct  = data ? Number(data.OverallPercentage) : 0;
  const scoreColor  = getScoreColor(overallPct);

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f4f8" />

      <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}>

        {/* ── Page Header ── */}
        <Text style={styles.pageTitle}>Overall Performance</Text>
        <Text style={styles.pageSubtitle}>
          Select a session and teacher to generate an evaluation report.
        </Text>

        {/* ── Filters Card ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Filters</Text>

          <Text style={styles.label}>Academic Session</Text>
          <Dropdown
            style={styles.dropdown}
            data={sessions}
            labelField="label"
            valueField="value"
            placeholder="Select Session"
            value={selectedSession}
            onChange={(item) => handleSessionChange(item.value)}
          />

          <Text style={styles.label}>Teacher</Text>
          {loadingTeachers ? (
            <View style={styles.loaderRow}>
              <ActivityIndicator size="small" color="#2563eb" />
              <Text style={styles.loaderText}>Loading teachers…</Text>
            </View>
          ) : (
            <Dropdown
              style={[styles.dropdown, !selectedSession && styles.dropdownDisabled]}
              data={teachers}
              labelField="label"
              valueField="value"
              placeholder={selectedSession ? "Select Teacher" : "Select session first"}
              value={selectedTeacher}
              onChange={(item) => setSelectedTeacher(item.value)}
              disable={!selectedSession}
            />
          )}

          <TouchableOpacity
            style={[
              styles.generateButton,
              (!selectedSession || !selectedTeacher) && styles.generateButtonDisabled,
            ]}
            onPress={handleGeneratePress}
            disabled={!selectedSession || !selectedTeacher}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.generateButtonText}>Generate Analysis</Text>
            }
          </TouchableOpacity>
        </View>

        {/* ── Results Section ── */}
        {data && (
          <>
            {/* Score Summary */}
            <View style={[styles.card, styles.scoreCard]}>
              <View style={styles.scoreCardLeft}>
                <Text style={styles.teacherName}>{data.TeacherName || "Teacher"}</Text>
                <Text style={styles.sessionName}>{data.SessionName || ""}</Text>
                <Text style={styles.scoreCardMeta}>
                  {data.Breakdown.length} KPIs  ·  {data.Breakdown.reduce((s, k) => s + k.SubDetails.length, 0)} Sub-indicators
                </Text>
              </View>
              <Text style={[styles.bigScore, { color: scoreColor }]}>
                {overallPct.toFixed(1)}%
              </Text>
            </View>

            {/* Overall Progress Bar */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Overall Progress</Text>
              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>Achievement Rate</Text>
                <Text style={[styles.progressPercent, { color: scoreColor }]}>
                  {overallPct.toFixed(2)}%
                </Text>
              </View>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.min(overallPct, 100)}%`, backgroundColor: scoreColor },
                  ]}
                />
              </View>
            </View>

            {/* Bar Chart */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Performance Chart</Text>
              <Text style={styles.chartNote}>All sub-indicators as % score</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <BarChart
                  data={getChartData()}
                  barWidth={28}
                  spacing={14}
                  noOfSections={5}
                  maxValue={100}
                  yAxisTextStyle={styles.chartAxisText}
                  xAxisLabelTextStyle={styles.chartAxisText}
                  roundedTop
                  isAnimated
                />
              </ScrollView>
            </View>

            {/* Detailed Breakdown */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Detailed Breakdown</Text>

              {data.Breakdown.map((kpi, i) => {
                const kpiPct   = kpi.KPIWeight > 0 ? (kpi.KPIAchieved / kpi.KPIWeight) * 100 : 0;
                const kpiColor = getScoreColor(kpiPct);
                return (
                  <View key={i} style={styles.kpiBlock}>
                    {/* KPI header */}
                    <View style={styles.kpiHeader}>
                      <View style={[styles.kpiBadge, { backgroundColor: kpiColor + "22" }]}>
                        <Text style={[styles.kpiBadgeText, { color: kpiColor }]}>KPI {i + 1}</Text>
                      </View>
                      <Text style={styles.kpiName}>{kpi.KPIName}</Text>
                    </View>

                    {/* KPI progress bar */}
                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${Math.min(kpiPct, 100)}%`, backgroundColor: kpiColor },
                        ]}
                      />
                    </View>

                    {/* Sub-indicators list */}
                    {kpi.SubDetails.map((sub, j) => {
                      const subPct          = sub.SubMax > 0 ? (sub.SubAchieved / sub.SubMax) * 100 : 0;
                      const isConfidential  = sub.SubName?.toLowerCase().includes("confidential");
                      const subColor        = isConfidential ? "#0d9488" : getScoreColor(subPct);
                      return (
                        <View key={j} style={styles.subRow}>
                          <View style={[styles.subDot, { backgroundColor: subColor }]} />
                          <Text style={styles.subName}>
                            {sub.SubName}{isConfidential && " 🔒"}
                          </Text>
                          <Text style={[styles.subPercent, { color: subColor }]}>
                            {subPct.toFixed(1)}%
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                );
              })}
            </View>

            <View style={{ height: 30 }} />
          </>
        )}
      </ScrollView>
    </>
  );
};

export default OverallPerformanceScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Screen
  screen:        { flex: 1, backgroundColor: "#f0f4f8" },
  screenContent: { padding: 16, paddingBottom: 32 },

  // Page header
  pageTitle:    { fontSize: 28, fontWeight: "800", color: "#0f172a", marginBottom: 6, marginTop: 8 },
  pageSubtitle: { fontSize: 13, color: "#64748b", marginBottom: 20, lineHeight: 19 },

  // Card
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
    marginBottom: 14,
  },
  cardTitle: { fontSize: 13, fontWeight: "700", color: "#64748b", marginBottom: 14, letterSpacing: 0.5 },

  // Form labels & dropdowns
  label:            { fontSize: 13, fontWeight: "600", color: "#475569", marginBottom: 6 },
  labelDisabled:    { opacity: 0.4 },
  dropdown: {
    height: 48,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  dropdownDisabled: { opacity: 0.4 },
  dropdownActive:   { borderColor: "#2563eb" },

  // Loading row
  loaderRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, marginBottom: 14 },
  loaderText: { color: "#64748b", fontSize: 13, marginLeft: 10 },

  // Generate button
  generateButton: {
    backgroundColor: "#2563eb",
    borderRadius: 10,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  generateButtonDisabled: { backgroundColor: "#e2e8f0" },
  generateButtonText:     { color: "#ffffff", fontSize: 15, fontWeight: "700" },

  // Score card
  scoreCard:       { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  scoreCardLeft:   { flex: 1, paddingRight: 12 },
  teacherName:     { fontSize: 17, fontWeight: "800", color: "#0f172a" },
  sessionName:     { fontSize: 12, color: "#64748b", marginTop: 2 },
  scoreCardMeta:   { fontSize: 12, color: "#94a3b8", marginTop: 10 },
  bigScore:        { fontSize: 52, fontWeight: "900", letterSpacing: -2 },

  // Progress bar
  progressRow:    { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 },
  progressLabel:  { fontSize: 13, fontWeight: "600", color: "#475569" },
  progressPercent:{ fontSize: 20, fontWeight: "800" },
  progressTrack:  { height: 7, backgroundColor: "#e2e8f0", borderRadius: 7, overflow: "hidden", marginBottom: 4, marginTop: 4 },
  progressFill:   { height: 7, borderRadius: 7 },

  // Chart
  chartNote:     { fontSize: 12, color: "#94a3b8", marginBottom: 12 },
  chartAxisText: { color: "#94a3b8", fontSize: 10 },
  barTopLabel:   { color: "#64748b", fontSize: 9, marginBottom: 2 },

  // KPI block
  kpiBlock:  { backgroundColor: "#f8fafc", borderRadius: 10, borderWidth: 1, borderColor: "#e2e8f0", padding: 12, marginBottom: 10 },
  kpiHeader: { flexDirection: "row", alignItems: "flex-start", marginBottom: 8, gap: 8 },
  kpiBadge:  { borderRadius: 5, paddingHorizontal: 7, paddingVertical: 3 },
  kpiBadgeText: { fontSize: 10, fontWeight: "800" },
  kpiName:   { fontSize: 13, fontWeight: "700", color: "#0f172a", flex: 1 },

  // Sub-indicator row
  subRow:    { flexDirection: "row", alignItems: "center", marginTop: 8, gap: 8 },
  subDot:    { width: 6, height: 6, borderRadius: 3, flexShrink: 0 },
  subName:   { fontSize: 12, color: "#475569", flex: 1 },
  subPercent:{ fontSize: 13, fontWeight: "800" },

});
