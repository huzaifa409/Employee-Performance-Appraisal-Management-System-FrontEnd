import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { BarChart } from "react-native-gifted-charts";

import BASE_URL from "../../API-URL/API";

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
  bg: "#f0fdf4",
  surface: "#ffffff",
  surfaceAlt: "#f6fef9",
  border: "#d1fae5",
  borderLight: "#a7f3d0",
  accent: "#16a34a",
  accentDim: "#15803d",
  accentDeep: "#166534",
  gold: "#d97706",
  red: "#dc2626",
  textPrimary: "#052e16",
  textSecondary: "#166534",
  textMuted: "#15803d",
  textFaint: "#bbf7d0",
  white: "#ffffff",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const barColor = (pct) =>
  pct > 75 ? C.accent : pct > 50 ? C.gold : C.red;

// ── Sub-components ────────────────────────────────────────────────────────────

const SectionLabel = ({ children }) => (
  <View style={s.sectionLabelRow}>
    <View style={s.sectionLabelDot} />
    <Text style={s.sectionLabelText}>{children}</Text>
  </View>
);

const StatPill = ({ value, color }) => (
  <View style={[s.statPill, { borderColor: color + "44", backgroundColor: color + "18" }]}>
    <Text style={[s.statPillText, { color }]}>{value}</Text>
  </View>
);

const KPICard = ({ kpi, index }) => {
  const percent = (kpi.KPIAchieved / kpi.KPIWeight) * 100;
  const color = barColor(percent);
  const labels = ["①", "②", "③", "④", "⑤"];

  return (
    <View style={s.kpiCard}>
      <View style={[s.kpiCardAccent, { backgroundColor: color }]} />
      <Text style={s.kpiIndex}>{labels[index] ?? `#${index + 1}`}</Text>
      <Text style={s.kpiCardTitle} numberOfLines={2}>
        {kpi.KPIName}
      </Text>
      <View style={s.kpiCardFooter}>
        <Text style={s.kpiCardWeight}>Wt: {kpi.KPIWeight}</Text>
        <Text style={[s.kpiCardPercent, { color }]}>{percent.toFixed(0)}%</Text>
      </View>
    </View>
  );
};

const ProgressRow = ({ sub }) => {
  const percent = (sub.SubAchieved / sub.SubMax) * 100;
  const color = barColor(percent);

  return (
    <View style={s.progressRow}>
      <View style={s.progressMeta}>
        <Text style={s.progressLabel}>{sub.SubName}</Text>
        <Text style={[s.progressPct, { color }]}>{percent.toFixed(1)}%</Text>
      </View>
      <View style={s.progressTrack}>
        <View
          style={[
            s.progressFill,
            { width: `${Math.min(percent, 100)}%`, backgroundColor: color },
          ]}
        />
      </View>
      <View style={s.progressLegend}>
        <Text style={s.progressSub}>
          {sub.SubAchieved} / {sub.SubMax}
        </Text>
      </View>
    </View>
  );
};

// ── Main Screen ───────────────────────────────────────────────────────────────
const OverallPerformanceScreen = () => {
  const [sessions, setSessions] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

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
      const res = await fetch(
        `${BASE_URL}/OverallPerformance/GetTeachersBySession/${sessionId}`
      );
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
      Alert.alert("Select Required Fields");
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
      } else {
        setData(json);
      }
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
        const percent = (sub.SubAchieved / sub.SubMax) * 100;
        return {
          value: percent,
          label: sub.SubName.split(" ")[0],
          frontColor: barColor(percent),
          topLabelComponent: () => (
            <Text style={{ color: C.textSecondary, fontSize: 9, marginBottom: 2 }}>
              {Math.round(percent)}
            </Text>
          ),
        };
      })
    );
  };

  const ready = !loading && !loadingTeachers;

  return (
    <ScrollView
      style={s.root}
      contentContainerStyle={s.rootContent}
      showsVerticalScrollIndicator={false}
    >
      {/* ── HEADER ── */}
      <View style={s.header}>
        <View style={s.headerBadge}>
          <Text style={s.headerBadgeText}>ANALYTICS</Text>
        </View>
        <Text style={s.headerTitle}>Performance{"\n"}Dashboard</Text>
        <Text style={s.headerSub}>Teacher evaluation overview</Text>
      </View>

      {/* ── FILTERS ── */}
      <View style={s.card}>
        <SectionLabel>Configure Report</SectionLabel>

        <Dropdown
          style={s.dropdown}
          containerStyle={s.dropdownContainer}
          itemTextStyle={s.dropdownItemText}
          selectedTextStyle={s.dropdownSelectedText}
          placeholderStyle={s.dropdownPlaceholder}
          activeColor={C.accentDeep}
          data={sessions}
          labelField="label"
          valueField="value"
          placeholder="Select Academic Session"
          value={selectedSession}
          onChange={(item) => handleSessionChange(item.value)}
        />

        {loadingTeachers ? (
          <View style={s.loaderRow}>
            <ActivityIndicator size="small" color={C.accent} />
            <Text style={s.loaderText}>Loading teachers…</Text>
          </View>
        ) : (
          <Dropdown
            style={[s.dropdown, !selectedSession && s.dropdownDisabled]}
            containerStyle={s.dropdownContainer}
            itemTextStyle={s.dropdownItemText}
            selectedTextStyle={s.dropdownSelectedText}
            placeholderStyle={s.dropdownPlaceholder}
            activeColor={C.accentDeep}
            data={teachers}
            labelField="label"
            valueField="value"
            placeholder="Select Teacher"
            value={selectedTeacher}
            onChange={(item) => setSelectedTeacher(item.value)}
            disable={!selectedSession}
          />
        )}

        <TouchableOpacity
          style={[
            s.btn,
            (!selectedSession || !selectedTeacher) && s.btnDisabled,
          ]}
          onPress={generateAnalysis}
          disabled={!selectedSession || !selectedTeacher}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator size="small" color={C.bg} />
          ) : (
            <Text style={s.btnText}>Generate Analysis →</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* ── LOADING STATE ── */}
      {loading && (
        <View style={s.loadingBlock}>
          <ActivityIndicator size="large" color={C.accent} />
          <Text style={s.loadingText}>Crunching numbers…</Text>
        </View>
      )}

      {/* ── DATA ── */}
      {data && (
        <>
          {/* HERO SUMMARY */}
          <View style={s.heroCard}>
            <View style={s.heroGlow} />
            <View style={s.heroLeft}>
              <View style={s.heroBadge}>
                <Text style={s.heroBadgeText}>TEACHER</Text>
              </View>
              <Text style={s.heroName}>{data.TeacherName}</Text>
              <Text style={s.heroSession}>{data.SessionName}</Text>
            </View>
            <View style={s.heroRight}>
              <Text style={s.heroScoreLabel}>Overall</Text>
              <Text
                style={[
                  s.heroScore,
                  { color: barColor(data.OverallPercentage) },
                ]}
              >
                {data.OverallPercentage}
                <Text style={s.heroScoreSuffix}>%</Text>
              </Text>
            </View>
          </View>

          {/* CHART */}
          <View style={s.card}>
            <SectionLabel>Metric Analytics</SectionLabel>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <BarChart
                barWidth={30}
                noOfSections={5}
                barBorderRadius={6}
                data={getChartData()}
                yAxisThickness={0}
                xAxisThickness={1}
                xAxisColor={C.border}
                yAxisTextStyle={{ color: C.textMuted, fontSize: 10 }}
                xAxisLabelTextStyle={{ color: C.textMuted, fontSize: 9 }}
                backgroundColor="transparent"
                isAnimated
                rulesColor={C.border}
                rulesType="dashed"
                spacing={18}
              />
            </ScrollView>
          </View>

          {/* KPI CARDS */}
          <View style={s.card}>
            <SectionLabel>KPI Overview</SectionLabel>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={s.kpiRow}>
                {data.Breakdown.map((kpi, i) => (
                  <KPICard key={i} kpi={kpi} index={i} />
                ))}
              </View>
            </ScrollView>
          </View>

          {/* SUB-KPI BREAKDOWN */}
          <View style={s.card}>
            <SectionLabel>Sub-KPI Breakdown</SectionLabel>
            {data.Breakdown.map((kpi, i) =>
              kpi.SubDetails.map((sub, j) => (
                <ProgressRow key={`${i}-${j}`} sub={sub} />
              ))
            )}
          </View>

          {/* LEGEND */}
          <View style={s.legend}>
            {[
              { color: C.accent, label: "Excellent  > 75%" },
              { color: C.gold, label: "Average  51–75%" },
              { color: C.red, label: "Poor  ≤ 50%" },
            ].map(({ color, label }) => (
              <View key={label} style={s.legendItem}>
                <View style={[s.legendDot, { backgroundColor: color }]} />
                <Text style={s.legendText}>{label}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

export default OverallPerformanceScreen;

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  rootContent: {
    padding: 16,
  },

  // ── HEADER
  header: {
    marginBottom: 20,
    paddingTop: 10,
  },
  headerBadge: {
    alignSelf: "flex-start",
    backgroundColor: C.accentDeep,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 10,
  },
  headerBadgeText: {
    color: C.accent,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
  },
  headerTitle: {
    color: C.textPrimary,
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  headerSub: {
    color: C.textMuted,
    fontSize: 13,
    marginTop: 6,
    letterSpacing: 0.3,
  },

  // ── CARD
  card: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  // ── SECTION LABEL
  sectionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionLabelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.accent,
    marginRight: 8,
  },
  sectionLabelText: {
    color: C.textSecondary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },

  // ── DROPDOWN
  dropdown: {
    height: 52,
    borderWidth: 1,
    borderColor: C.borderLight,
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: C.surfaceAlt,
    marginBottom: 12,
  },
  dropdownDisabled: {
    opacity: 0.4,
  },
  dropdownContainer: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.borderLight,
    borderRadius: 10,
  },
  dropdownItemText: {
    color: C.textPrimary,
    fontSize: 14,
  },
  dropdownSelectedText: {
    color: C.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
  dropdownPlaceholder: {
    color: "#9ca3af",
    fontSize: 14,
  },

  // ── BUTTON
  btn: {
    backgroundColor: C.accent,
    borderRadius: 10,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    shadowColor: C.accent,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  btnDisabled: {
    backgroundColor: "#d1d5db",
    shadowOpacity: 0,
    elevation: 0,
  },
  btnText: {
    color: C.white,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  // ── LOADER
  loaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  loaderText: {
    color: C.textMuted,
    marginLeft: 10,
    fontSize: 13,
  },
  loadingBlock: {
    alignItems: "center",
    paddingVertical: 30,
  },
  loadingText: {
    color: C.textMuted,
    marginTop: 10,
    fontSize: 13,
  },

  // ── HERO
  heroCard: {
    backgroundColor: C.accentDeep,
    borderRadius: 20,
    padding: 22,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#14532d",
    shadowColor: "#16a34a",
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  heroGlow: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#4ade80",
    opacity: 0.15,
  },
  heroLeft: {
    flex: 1,
  },
  heroBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginBottom: 8,
  },
  heroBadgeText: {
    color: "#86efac",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 2,
  },
  heroName: {
    color: C.white,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  heroSession: {
    color: "#86efac",
    fontSize: 12,
    marginTop: 4,
    opacity: 0.8,
  },
  heroRight: {
    alignItems: "flex-end",
  },
  heroScoreLabel: {
    color: "#86efac",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
    opacity: 0.7,
    marginBottom: 2,
  },
  heroScore: {
    fontSize: 52,
    fontWeight: "900",
    lineHeight: 56,
    letterSpacing: -2,
  },
  heroScoreSuffix: {
    fontSize: 22,
    fontWeight: "700",
  },

  // ── KPI CARDS
  kpiRow: {
    flexDirection: "row",
    gap: 10,
  },
  kpiCard: {
    backgroundColor: C.surfaceAlt,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    width: 130,
    padding: 14,
    overflow: "hidden",
  },
  kpiCardAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  kpiIndex: {
    color: C.borderLight,
    fontSize: 18,
    marginBottom: 6,
    marginTop: 6,
  },
  kpiCardTitle: {
    color: C.textSecondary,
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 15,
    flex: 1,
    marginBottom: 10,
  },
  kpiCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  kpiCardWeight: {
    color: "#86efac",
    fontSize: 10,
  },
  kpiCardPercent: {
    fontSize: 20,
    fontWeight: "900",
  },

  // ── PROGRESS
  progressRow: {
    marginBottom: 18,
  },
  progressMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  progressLabel: {
    color: C.textPrimary,
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
  },
  progressPct: {
    fontSize: 13,
    fontWeight: "800",
  },
  progressTrack: {
    height: 6,
    backgroundColor: C.border,
    borderRadius: 6,
    overflow: "hidden",
  },
  progressFill: {
    height: 6,
    borderRadius: 6,
  },
  progressLegend: {
    marginTop: 4,
    alignItems: "flex-end",
  },
  progressSub: {
    color: "#6b7280",
    fontSize: 10,
  },

  // ── LEGEND
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 14,
    marginBottom: 10,
    opacity: 0.7,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  legendText: {
    color: C.textMuted,
    fontSize: 11,
  },

  // ── STAT PILL (unused in render, kept for reuse)
  statPill: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statPillText: {
    fontSize: 12,
    fontWeight: "700",
  },
});
