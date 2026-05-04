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
  Dimensions,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { BarChart } from "react-native-gifted-charts";

import BASE_URL from "../../API-URL/API";
import { getConfidentialByTeacherSession } from "../../Database/db";

const { width: SCREEN_W } = Dimensions.get("window");

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  bg: "#eef4fb",
  bgCard: "#ffffff",
  bgCardAlt: "#f4f8fd",
  border: "#d0e2f5",
  borderGlow: "#a8c9ef",
  accent: "#2563eb",
  accentBright: "#3b82f6",
  accentGlow: "rgba(37,99,235,0.10)",
  teal: "#0d9488",
  tealGlow: "rgba(13,148,136,0.10)",
  gold: "#d97706",
  goldGlow: "rgba(217,119,6,0.10)",
  red: "#dc2626",
  redGlow: "rgba(220,38,38,0.10)",
  green: "#16a34a",
  greenGlow: "rgba(22,163,74,0.10)",
  textPrimary: "#0f172a",
  textSecondary: "#475569",
  textMuted: "#94a3b8",
  white: "#ffffff",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const barColor = (pct) =>
  pct >= 80 ? C.green : pct >= 55 ? C.gold : C.red;

const scoreColor = (pct) =>
  pct >= 80 ? C.green : pct >= 55 ? C.gold : C.red;

const gradeLabel = (pct) =>
  pct >= 90 ? "A+" : pct >= 80 ? "A" : pct >= 70 ? "B" : pct >= 55 ? "C" : "D";

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionTitle = ({ label }) => (
  <View style={s.sectionTitleRow}>
    <View style={s.sectionDot} />
    <Text style={s.sectionTitleText}>{label}</Text>
  </View>
);

const StatPill = ({ value, label, color }) => (
  <View style={[s.statPill, { borderColor: color + "55", backgroundColor: color + "18" }]}>
    <Text style={[s.statPillValue, { color }]}>{value}</Text>
    <Text style={s.statPillLabel}>{label}</Text>
  </View>
);

const ProgressBar = ({ pct, color }) => (
  <View style={s.progressTrack}>
    <View
      style={[
        s.progressFill,
        { width: `${Math.min(pct, 100)}%`, backgroundColor: color },
      ]}
    />
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
const OverallPerformanceScreen = () => {
  const [sessions, setSessions] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [confidentialAvgScore, setConfidentialAvgScore] = useState(0);

  useEffect(() => { loadSessions(); }, []);

  const loadSessions = async () => {
    try {
      const res = await fetch(`${BASE_URL}/OverallPerformance/list`);
      const json = await res.json();
      setSessions(json.map((item) => ({ label: item.name, value: item.id })));
    } catch {
      Alert.alert("Error", "Failed to load sessions");
    }
  };

  const handleSessionChange = async (sessionId) => {
    try {
      setSelectedSession(sessionId);
      setSelectedTeacher(null);
      setTeachers([]);
      setData(null);
      setLoadingTeachers(true);
      const res = await fetch(`${BASE_URL}/OverallPerformance/GetTeachersBySession/${sessionId}`);
      const json = await res.json();
      setTeachers(json.map((item) => ({ label: item.Name, value: item.UserID })));
      setLoadingTeachers(false);
    } catch {
      setLoadingTeachers(false);
      Alert.alert("Error", "Failed to load teachers");
    }
  };

  const generateAnalysis = async () => {
    if (!selectedSession || !selectedTeacher) {
      Alert.alert("Select Required Fields", "Please select both session and teacher.");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(
        `${BASE_URL}/OverallPerformance/GetTeacherPerformanceAnalytics/${selectedTeacher}/${selectedSession}`
      );
      const json = await res.json();
      if (json.Status === "Empty") {
        Alert.alert("No Data", json.Message);
        setData(null);
        setLoading(false);
        return;
      }

      const localScores = await getConfidentialByTeacherSession(selectedTeacher);
      let avgScore = 0;
      if (localScores.length > 0) {
        avgScore = localScores.reduce((a, b) => a + b, 0) / localScores.length;
      }
      setConfidentialAvgScore(avgScore);

      let totalEarned = 0, totalMax = 0;
      json.Breakdown.forEach((kpi) => {
        let kpiTotal = 0;
        kpi.SubDetails.forEach((sub) => {
          if (sub.SubName?.toLowerCase().includes("confidential")) {
            const calculated = sub.MaxScale > 0 ? (avgScore / sub.MaxScale) * sub.SubMax : 0;
            sub.SubAchieved = Number(calculated.toFixed(2));
          }
          sub.SubAchieved = Math.min(sub.SubAchieved, sub.SubMax);
          kpiTotal += sub.SubAchieved;
        });
        kpi.KPIAchieved = Number(Math.min(kpiTotal, kpi.KPIWeight).toFixed(2));
        totalEarned += kpi.KPIAchieved;
        totalMax += kpi.KPIWeight;
      });

      json.OverallPercentage = totalMax > 0
        ? Number(((totalEarned / totalMax) * 100).toFixed(2)) : 0;

      setData(json);
      setLoading(false);
    } catch {
      setLoading(false);
      Alert.alert("Error", "Failed to load performance data");
    }
  };

  const getChartData = () => {
    if (!data) return [];
    return data.Breakdown.flatMap((kpi) =>
      kpi.SubDetails.map((sub) => {
        const pct = sub.SubMax > 0 ? (sub.SubAchieved / sub.SubMax) * 100 : 0;
        return {
          value: Number(pct.toFixed(1)),
          label: sub.SubName.split(" ")[0].substring(0, 6),
          frontColor: barColor(pct),
          topLabelComponent: () => (
            <Text style={{ color: C.textSecondary, fontSize: 9, marginBottom: 2 }}>
              {pct.toFixed(0)}
            </Text>
          ),
        };
      })
    );
  };

  const overallPct = data ? Number(data.OverallPercentage) : 0;
  const mainColor = scoreColor(overallPct);

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} translucent={false} />

      <ScrollView style={s.root} contentContainerStyle={s.rootContent} showsVerticalScrollIndicator={false}>
        <View style={s.pageHeader}>
          <View style={s.pageBadge}>
            <Text style={s.pageBadgeText}>◈  ANALYTICS</Text>
          </View>
          <Text style={s.pageTitle}>Overall{"\n"}Performance</Text>
          <Text style={s.pageSub}>Select session & teacher to generate a full evaluation report.</Text>
        </View>

        <View style={s.card}>
          <SectionTitle label="FILTERS" />
          <Text style={s.dropLabel}>Academic Session</Text>
          <Dropdown
            style={s.dropdown}
            data={sessions}
            labelField="label"
            valueField="value"
            placeholder="Select Session"
            value={selectedSession}
            onChange={(item) => handleSessionChange(item.value)}
          />

          <Text style={s.dropLabel}>Teacher</Text>
          {loadingTeachers ? (
            <View style={s.miniLoader}>
              <ActivityIndicator size="small" color={C.accent} />
              <Text style={s.miniLoaderText}>Loading teachers…</Text>
            </View>
          ) : (
            <Dropdown
              style={[s.dropdown, !selectedSession && s.dropdownDisabled]}
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
            onPress={generateAnalysis}
            style={[s.btn, (!selectedSession || !selectedTeacher) && s.btnDisabled]}
            disabled={!selectedSession || !selectedTeacher}
          >
            {loading ? <ActivityIndicator color={C.white} /> : <Text style={s.btnText}>⚡  Generate Analysis</Text>}
          </TouchableOpacity>
        </View>

        {data && (
          <>
            {/* ── HERO SCORE CARD (Grade removed as requested) ── */}
            <View style={[s.heroCard, { borderColor: mainColor + "55" }]}>
              <View style={[s.heroGlow, { backgroundColor: mainColor }]} />
              <View style={s.heroLeft}>
                <View style={s.heroBadge}>
                  <Text style={s.heroBadgeText}>FINAL SCORE</Text>
                </View>
                <Text style={s.heroName}>{data.TeacherName || "Teacher"}</Text>
                <Text style={s.heroSession}>{data.SessionName || ""}</Text>

                <View style={{ flexDirection: "row", gap: 8, marginTop: 14 }}>
                  <StatPill value={`${data.Breakdown.length}`} label="KPIs" color={C.accent} />
                  <StatPill
                    value={data.Breakdown.reduce((s, k) => s + k.SubDetails.length, 0).toString()}
                    label="Subs"
                    color={C.teal}
                  />
                </View>
              </View>

              <View style={s.heroRight}>
                <Text style={[s.heroScore, { color: mainColor }]}>
                  {overallPct.toFixed(1)}
                  <Text style={s.heroScorePct}>%</Text>
                </Text>
              </View>
            </View>

            <View style={s.card}>
              <SectionTitle label="OVERALL PROGRESS" />
              <View style={s.overallProgressRow}>
                <Text style={s.overallProgressLabel}>Achievement Rate</Text>
                <Text style={[s.overallProgressPct, { color: mainColor }]}>{overallPct.toFixed(2)}%</Text>
              </View>
              <ProgressBar pct={overallPct} color={mainColor} />
            </View>

            <View style={s.card}>
              <SectionTitle label="PERFORMANCE CHART" />
              <Text style={s.chartSubtitle}>All sub-indicators (% score)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <BarChart
                  data={getChartData()}
                  barWidth={28}
                  spacing={14}
                  noOfSections={5}
                  maxValue={100}
                  yAxisTextStyle={{ color: C.textMuted, fontSize: 10 }}
                  xAxisLabelTextStyle={{ color: C.textSecondary, fontSize: 9 }}
                  roundedTop
                  isAnimated
                />
              </ScrollView>
            </View>

            {/* ── DETAILED BREAKDOWN (Including Confidential rows) ── */}
            <View style={s.card}>
              <SectionTitle label="DETAILED BREAKDOWN" />
              {data.Breakdown.map((kpi, i) => {
                const kpiPct = kpi.KPIWeight > 0 ? (kpi.KPIAchieved / kpi.KPIWeight) * 100 : 0;
                const kpiColor = barColor(kpiPct);
                return (
                  <View key={i} style={[s.kpiBlock, { borderColor: kpiColor + "33" }]}>
                    <View style={s.kpiBlockHeader}>
                      <View style={[s.kpiBlockBadge, { backgroundColor: kpiColor + "22", borderColor: kpiColor + "55" }]}>
                        <Text style={[s.kpiBlockBadgeText, { color: kpiColor }]}>KPI {i + 1}</Text>
                      </View>
                      <Text style={s.kpiBlockTitle}>{kpi.KPIName}</Text>
                    </View>
                    <ProgressBar pct={kpiPct} color={kpiColor} />
                    <View style={s.subList}>
                      {kpi.SubDetails.map((sub, j) => {
                        const subPct = sub.SubMax > 0 ? (sub.SubAchieved / sub.SubMax) * 100 : 0;
                        const isConfidential = sub.SubName?.toLowerCase().includes("confidential");
                        const subColor = isConfidential ? C.teal : barColor(subPct);
                        return (
                          <View key={j} style={s.subRow}>
                            <View style={s.subRowLeft}>
                              <View style={[s.subDot, { backgroundColor: subColor }]} />
                              <Text style={s.subName}>{sub.SubName}{isConfidential && " 🔒"}</Text>
                            </View>
                            <Text style={[s.subPct, { color: subColor }]}>{subPct.toFixed(1)}%</Text>
                          </View>
                        );
                      })}
                    </View>
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

// Styles remain the same as your original snippet...
const s = StyleSheet.create({
  // ... (keeping your existing styles here)
  root: { flex: 1, backgroundColor: C.bg },
  rootContent: { padding: 16, paddingBottom: 32 },
  pageHeader: { marginBottom: 20, paddingTop: 8 },
  pageBadge: { alignSelf: "flex-start", backgroundColor: C.accentGlow, borderWidth: 1, borderColor: C.accent + "55", borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 12 },
  pageBadgeText: { color: C.accentBright, fontSize: 10, fontWeight: "800", letterSpacing: 2 },
  pageTitle: { color: C.textPrimary, fontSize: 34, fontWeight: "900", letterSpacing: -1, lineHeight: 40 },
  pageSub: { color: C.textSecondary, fontSize: 13, marginTop: 8, lineHeight: 19 },
  card: { backgroundColor: C.bgCard, borderRadius: 18, borderWidth: 1, borderColor: C.border, padding: 18, marginBottom: 14 },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  sectionDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: C.accent, marginRight: 8 },
  sectionTitleText: { color: C.textSecondary, fontSize: 11, fontWeight: "700", letterSpacing: 2 },
  dropLabel: { color: C.textSecondary, fontSize: 12, fontWeight: "600", marginBottom: 7 },
  dropdown: { height: 50, backgroundColor: C.bgCardAlt, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 14, marginBottom: 14 },
  dropdownDisabled: { opacity: 0.4 },
  btn: { backgroundColor: C.accent, borderRadius: 12, height: 52, alignItems: "center", justifyContent: "center", marginTop: 4 },
  btnDisabled: { backgroundColor: C.bgCardAlt, borderWidth: 1, borderColor: C.border },
  btnText: { color: C.white, fontSize: 15, fontWeight: "800" },
  miniLoader: { flexDirection: "row", alignItems: "center", paddingVertical: 12, marginBottom: 14 },
  miniLoaderText: { color: C.textSecondary, fontSize: 13, marginLeft: 10 },
  heroCard: { backgroundColor: C.bgCard, borderRadius: 20, borderWidth: 1.5, padding: 22, marginBottom: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", overflow: "hidden" },
  heroGlow: { position: "absolute", top: -60, right: -60, width: 180, height: 180, borderRadius: 90, opacity: 0.07 },
  heroLeft: { flex: 1, paddingRight: 12 },
  heroBadge: { alignSelf: "flex-start", backgroundColor: C.accentGlow, borderRadius: 5, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 10 },
  heroBadgeText: { color: C.accentBright, fontSize: 9, fontWeight: "800", letterSpacing: 2 },
  heroName: { color: C.textPrimary, fontSize: 18, fontWeight: "800" },
  heroSession: { color: C.textSecondary, fontSize: 12, marginTop: 3 },
  heroRight: { alignItems: "flex-end" },
  heroScore: { fontSize: 56, fontWeight: "900", letterSpacing: -3, lineHeight: 60 },
  heroScorePct: { fontSize: 24, fontWeight: "700" },
  statPill: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, alignItems: "center" },
  statPillValue: { fontSize: 15, fontWeight: "900" },
  statPillLabel: { color: C.textMuted, fontSize: 10, marginTop: 1 },
  overallProgressRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 },
  overallProgressLabel: { color: C.textSecondary, fontSize: 14, fontWeight: "600" },
  overallProgressPct: { fontSize: 22, fontWeight: "900" },
  progressTrack: { height: 7, backgroundColor: C.border, borderRadius: 7, overflow: "hidden", marginBottom: 4 },
  progressFill: { height: 7, borderRadius: 7 },
  chartSubtitle: { color: C.textMuted, fontSize: 12, marginBottom: 12 },
  kpiBlock: { backgroundColor: C.bgCardAlt, borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 12 },
  kpiBlockHeader: { flexDirection: "row", alignItems: "flex-start", marginBottom: 10, gap: 10 },
  kpiBlockBadge: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  kpiBlockBadgeText: { fontSize: 10, fontWeight: "800" },
  kpiBlockTitle: { color: C.textPrimary, fontSize: 13, fontWeight: "700", flex: 1 },
  subList: { marginTop: 10, gap: 10 },
  subRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  subRowLeft: { flexDirection: "row", alignItems: "center", flex: 1, gap: 8 },
  subDot: { width: 6, height: 6, borderRadius: 3 },
  subName: { color: C.textSecondary, fontSize: 12, flex: 1 },
  subPct: { fontSize: 14, fontWeight: "800" },
});