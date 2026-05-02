import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BarChart } from "react-native-gifted-charts";
import { Dropdown } from "react-native-element-dropdown";
import Icon from "react-native-vector-icons/MaterialIcons";
import BASE_URL from "../../API-URL/API";

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  bg:           "#f7f5f0",       // warm cream
  surface:      "#ffffff",
  surfaceWarm:  "#fdf9f3",
  border:       "#e8e2d9",
  borderAccent: "#c8b89a",
  teal:         "#0d9488",       // primary accent
  tealLight:    "#ccfbf1",
  tealDeep:     "#0f766e",
  amber:        "#d97706",
  amberLight:   "#fef3c7",
  red:          "#dc2626",
  redLight:     "#fee2e2",
  textDark:     "#1c1917",
  textMid:      "#57534e",
  textLight:    "#a8a29e",
  white:        "#ffffff",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const scoreColor = (pct) =>
  pct >= 75 ? C.teal : pct >= 50 ? C.amber : C.red;

const scoreBg = (pct) =>
  pct >= 75 ? C.tealLight : pct >= 50 ? C.amberLight : C.redLight;

const scoreLabel = (pct) =>
  pct >= 75 ? "Excellent" : pct >= 50 ? "Average" : "Needs Work";

// ── Sub-components ────────────────────────────────────────────────────────────

const Divider = () => <View style={s.divider} />;

const SectionTitle = ({ icon, children }) => (
  <View style={s.sectionTitleRow}>
    <Icon name={icon} size={16} color={C.teal} style={{ marginRight: 6 }} />
    <Text style={s.sectionTitleText}>{children}</Text>
  </View>
);

const ScoreBadge = ({ pct }) => (
  <View style={[s.badge, { backgroundColor: scoreBg(pct), borderColor: scoreColor(pct) + "44" }]}>
    <Text style={[s.badgeText, { color: scoreColor(pct) }]}>{scoreLabel(pct)}</Text>
  </View>
);

const KPICard = ({ kpi }) => {
  const pct = kpi.KPIWeight ? (kpi.KPIAchieved / kpi.KPIWeight) * 100 : 0;
  const color = scoreColor(pct);

  return (
    <View style={[s.kpiCard, { borderLeftColor: color }]}>
      <Text style={s.kpiCardName} numberOfLines={2}>{kpi.KPIName}</Text>
      <View style={s.kpiCardBottom}>
        <Text style={s.kpiCardWeight}>Wt {kpi.KPIWeight}</Text>
        <View style={[s.kpiPill, { backgroundColor: scoreBg(pct) }]}>
          <Text style={[s.kpiPillText, { color }]}>{pct.toFixed(0)}%</Text>
        </View>
      </View>
    </View>
  );
};

const ProgressRow = ({ sub }) => {
  const pct = (sub.SubAchieved / sub.SubMax) * 100;
  const color = scoreColor(pct);

  return (
    <View style={s.progressRow}>
      <View style={s.progressHeader}>
        <Text style={s.progressLabel} numberOfLines={1}>{sub.SubName}</Text>
        <Text style={[s.progressPct, { color }]}>{pct.toFixed(1)}%</Text>
      </View>
      <View style={s.progressTrack}>
        <View style={[s.progressFill, { width: `${Math.min(pct, 100)}%`, backgroundColor: color }]} />
      </View>
      <Text style={s.progressSub}>{sub.SubAchieved} of {sub.SubMax} pts</Text>
    </View>
  );
};

// ── Main Screen ───────────────────────────────────────────────────────────────
const SeeOwnPerformance = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { userId, username } = route.params;

  const [loading, setLoading] = useState(true);
  const [fetchingData, setFetchingData] = useState(false);
  const [performanceData, setPerformanceData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedSessionValue, setSelectedSessionValue] = useState(null);

  useEffect(() => {
    initialFetch();
  }, []);

  const initialFetch = async () => {
    setLoading(true);
    await fetchSessions();
    setLoading(false);
  };

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${BASE_URL}/PeerEvaluator/Sessions`);
      const data = await res.json();
      const formatted = data.map((s) => ({ label: s.name, value: s.id }));
      setSessions(formatted);
      if (formatted.length > 0) {
        setSelectedSessionValue(formatted[0].value);
        fetchPerformance(formatted[0].value);
      }
    } catch {
      Alert.alert("Error", "Failed to load sessions");
    }
  };

  const fetchPerformance = async (sessionId) => {
    setFetchingData(true);
    try {
      const res = await fetch(
        `${BASE_URL}/OverallPerformance/GetTeacherPerformanceAnalytics/${userId}/${sessionId}`
      );
      const result = await res.json();

      if (result.Status === "Empty") {
        setPerformanceData(null);
        return;
      }

      setPerformanceData(result);

      const chart = result.Breakdown.map((kpi) => {
        const percent = (kpi.KPIAchieved / kpi.KPIWeight) * 100;
        return {
          value: percent,
          label: kpi.KPIName.split(" ")[0],
          frontColor: scoreColor(percent),
          topLabelComponent: () => (
            <Text style={{ color: C.textMid, fontSize: 9, marginBottom: 2 }}>
              {Math.round(percent)}
            </Text>
          ),
        };
      });

      setChartData(chart);
    } catch {
      Alert.alert("Error", "Failed to load performance");
    } finally {
      setFetchingData(false);
    }
  };

  const getKpiPercentage = (achieved, weight) =>
    weight ? (achieved / weight) * 100 : 0;

  // ── FULL LOADING ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={[s.center, { paddingTop: insets.top, backgroundColor: C.bg }]}>
        <ActivityIndicator size="large" color={C.teal} />
        <Text style={s.loadingLabel}>Loading…</Text>
      </View>
    );
  }

  const overall = performanceData?.OverallPercentage ?? 0;

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Icon name="arrow-back" size={20} color={C.teal} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>My Performance</Text>
          <Text style={s.headerSub}>{username}</Text>
        </View>
        <View style={s.avatarCircle}>
          <Text style={s.avatarText}>{username?.[0]?.toUpperCase() ?? "T"}</Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── SESSION SELECTOR ───────────────────────────────────────────── */}
        <View style={s.sessionRow}>
          <Icon name="event" size={15} color={C.textLight} style={{ marginRight: 6 }} />
          <Dropdown
            style={s.dropdown}
            containerStyle={s.dropdownContainer}
            itemTextStyle={{ color: C.textDark, fontSize: 14 }}
            selectedTextStyle={{ color: C.textDark, fontSize: 14, fontWeight: "600" }}
            placeholderStyle={{ color: C.textLight, fontSize: 14 }}
            activeColor={C.tealLight}
            data={sessions}
            labelField="label"
            valueField="value"
            value={selectedSessionValue}
            onChange={(item) => {
              setSelectedSessionValue(item.value);
              fetchPerformance(item.value);
            }}
          />
        </View>

        {/* ── FETCHING INDICATOR ─────────────────────────────────────────── */}
        {fetchingData ? (
          <View style={s.fetchingBlock}>
            <ActivityIndicator size="large" color={C.teal} />
            <Text style={s.loadingLabel}>Fetching results…</Text>
          </View>
        ) : performanceData ? (
          <>
            {/* ── HERO SCORE ─────────────────────────────────────────────── */}
            <View style={s.heroCard}>
              <View style={s.heroLeft}>
                <Text style={s.heroLabel}>Overall Score</Text>
                <Text style={[s.heroScore, { color: scoreColor(overall) }]}>
                  {overall}
                  <Text style={s.heroScoreUnit}>%</Text>
                </Text>
                <ScoreBadge pct={overall} />
              </View>

              <View style={s.heroRight}>
                {/* Mini stat pills */}
                {performanceData.Breakdown.slice(0, 3).map((kpi, i) => {
                  const p = getKpiPercentage(kpi.KPIAchieved, kpi.KPIWeight);
                  return (
                    <View key={i} style={s.miniStatRow}>
                      <View style={[s.miniDot, { backgroundColor: scoreColor(p) }]} />
                      <Text style={s.miniStatLabel} numberOfLines={1}>
                        {kpi.KPIName.split(" ")[0]}
                      </Text>
                      <Text style={[s.miniStatVal, { color: scoreColor(p) }]}>
                        {p.toFixed(0)}%
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* ── CHART ──────────────────────────────────────────────────── */}
            <View style={s.card}>
              <SectionTitle icon="bar-chart">KPI Chart</SectionTitle>
              <Divider />
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <BarChart
                  data={chartData}
                  barWidth={32}
                  maxValue={100}
                  noOfSections={4}
                  barBorderRadius={6}
                  yAxisThickness={0}
                  xAxisThickness={1}
                  xAxisColor={C.border}
                  rulesColor={C.border}
                  rulesType="dashed"
                  yAxisTextStyle={{ color: C.textLight, fontSize: 10 }}
                  xAxisLabelTextStyle={{ color: C.textMid, fontSize: 10 }}
                  backgroundColor="transparent"
                  isAnimated
                  spacing={20}
                />
              </ScrollView>
            </View>

            {/* ── KPI GRID ───────────────────────────────────────────────── */}
            <View style={s.card}>
              <SectionTitle icon="layers">KPI Breakdown</SectionTitle>
              <Divider />
              <View style={s.kpiGrid}>
                {performanceData.Breakdown.map((kpi, i) => (
                  <KPICard key={i} kpi={kpi} />
                ))}
              </View>
            </View>

            {/* ── SUB-KPI ────────────────────────────────────────────────── */}
            <View style={s.card}>
              <SectionTitle icon="tune">Sub-KPI Details</SectionTitle>
              <Divider />
              {performanceData.Breakdown.map((kpi, i) =>
                kpi.SubDetails.map((sub, j) => (
                  <ProgressRow key={`${i}-${j}`} sub={sub} />
                ))
              )}
            </View>

            {/* ── LEGEND ─────────────────────────────────────────────────── */}
            <View style={s.legendRow}>
              {[
                { color: C.teal,  label: "Excellent ≥75%" },
                { color: C.amber, label: "Average 50–74%" },
                { color: C.red,   label: "Poor <50%" },
              ].map(({ color, label }) => (
                <View key={label} style={s.legendItem}>
                  <View style={[s.legendDot, { backgroundColor: color }]} />
                  <Text style={s.legendText}>{label}</Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <View style={s.emptyState}>
            <Icon name="inbox" size={48} color={C.border} />
            <Text style={s.emptyTitle}>No Data Available</Text>
            <Text style={s.emptySub}>Try selecting a different session.</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

export default SeeOwnPerformance;

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingLabel: {
    color: C.textLight,
    marginTop: 10,
    fontSize: 13,
  },
  scrollContent: {
    padding: 16,
  },

  // ── HEADER
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.tealLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerTitle: {
    color: C.textDark,
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  headerSub: {
    color: C.textLight,
    fontSize: 12,
    marginTop: 1,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: C.teal,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: C.white,
    fontSize: 16,
    fontWeight: "800",
  },

  // ── SESSION ROW
  sessionRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 12,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  dropdown: {
    flex: 1,
    height: 48,
  },
  dropdownContainer: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
  },

  fetchingBlock: {
    alignItems: "center",
    paddingVertical: 50,
  },

  // ── CARD
  card: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  // ── SECTION TITLE
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitleText: {
    color: C.textDark,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  divider: {
    height: 1,
    backgroundColor: C.border,
    marginBottom: 14,
  },

  // ── HERO CARD
  heroCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 20,
    marginBottom: 14,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  heroLeft: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: C.border,
    paddingRight: 16,
    marginRight: 16,
  },
  heroLabel: {
    color: C.textLight,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  heroScore: {
    fontSize: 56,
    fontWeight: "900",
    letterSpacing: -2,
    lineHeight: 60,
    marginBottom: 10,
  },
  heroScoreUnit: {
    fontSize: 24,
    fontWeight: "700",
  },

  // ── BADGE
  badge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // ── HERO RIGHT MINI STATS
  heroRight: {
    justifyContent: "center",
    flex: 1,
    gap: 10,
  },
  miniStatRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  miniDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  miniStatLabel: {
    flex: 1,
    color: C.textMid,
    fontSize: 12,
  },
  miniStatVal: {
    fontSize: 12,
    fontWeight: "700",
  },

  // ── KPI GRID
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  kpiCard: {
    width: "47%",
    backgroundColor: C.surfaceWarm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    borderLeftWidth: 4,
    padding: 14,
  },
  kpiCardName: {
    color: C.textDark,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17,
    marginBottom: 10,
  },
  kpiCardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  kpiCardWeight: {
    color: C.textLight,
    fontSize: 10,
    fontWeight: "600",
  },
  kpiPill: {
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  kpiPillText: {
    fontSize: 12,
    fontWeight: "800",
  },

  // ── PROGRESS
  progressRow: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  progressLabel: {
    color: C.textDark,
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
    height: 7,
    backgroundColor: C.border,
    borderRadius: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: 7,
    borderRadius: 8,
  },
  progressSub: {
    color: C.textLight,
    fontSize: 10,
    marginTop: 4,
    textAlign: "right",
  },

  // ── LEGEND
  legendRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 6,
    opacity: 0.75,
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
    color: C.textMid,
    fontSize: 11,
  },

  // ── EMPTY STATE
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    color: C.textMid,
    fontSize: 16,
    fontWeight: "700",
    marginTop: 14,
  },
  emptySub: {
    color: C.textLight,
    fontSize: 13,
    marginTop: 4,
  },
});
