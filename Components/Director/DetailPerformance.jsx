import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BASE_URL from "../../API-URL/API";

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  bg:         "#f0fdf4",
  surface:    "#ffffff",
  surfaceAlt: "#f6fef9",
  border:     "#d1fae5",
  borderMid:  "#a7f3d0",
  green:      "#16a34a",
  greenLight: "#dcfce7",
  greenDeep:  "#166534",
  amber:      "#d97706",
  amberLight: "#fef3c7",
  red:        "#dc2626",
  redLight:   "#fee2e2",
  blue:       "#2563eb",
  blueLight:  "#dbeafe",
  purple:     "#7c3aed",
  purpleLight:"#ede9fe",
  textDark:   "#052e16",
  textMid:    "#166534",
  textLight:  "#4b7c5e",
  textFaint:  "#9ca3af",
  white:      "#ffffff",
};

// ── Score config ──────────────────────────────────────────────────────────────
const SCORE_CONFIG = [
  { key: "Score1", stars: 1, label: "Poor",      color: C.red,    bg: C.redLight    },
  { key: "Score2", stars: 2, label: "Average",   color: C.amber,  bg: C.amberLight  },
  { key: "Score3", stars: 3, label: "Good",       color: C.blue,   bg: C.blueLight   },
  { key: "Score4", stars: 4, label: "Excellent",  color: C.green,  bg: C.greenLight  },
];

const EVAL_OPTIONS = [
  { label: "Student Evaluation",      value: "student",      icon: "school"     },
  { label: "Peer Evaluation",         value: "peer",         icon: "people"     },
  { label: "Confidential Evaluation", value: "Confidential", icon: "lock"       },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const avgColor = (avg) => {
  const pct = (avg / 4) * 100;
  if (pct >= 75) return C.green;
  if (pct >= 50) return C.amber;
  return C.red;
};

const Stars = ({ count }) => (
  <View style={{ flexDirection: "row", gap: 2 }}>
    {[1, 2, 3, 4].map((i) => (
      <Icon
        key={i}
        name="star"
        size={11}
        color={i <= count ? C.amber : "#e5e7eb"}
      />
    ))}
  </View>
);

// ── Score Distribution Bar ────────────────────────────────────────────────────
const ScoreBar = ({ config, count, total }) => {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <View style={s.scoreBarRow}>
      <View style={s.scoreBarLeft}>
        <Stars count={config.stars} />
        <Text style={[s.scoreBarLabel, { color: config.color }]}>
          {config.label}
        </Text>
      </View>
      <View style={s.scoreBarTrack}>
        <View
          style={[
            s.scoreBarFill,
            { width: `${pct}%`, backgroundColor: config.color },
          ]}
        />
      </View>
      <Text style={[s.scoreBarCount, { color: config.color }]}>{count}</Text>
    </View>
  );
};

// ── Question Card ─────────────────────────────────────────────────────────────
const QuestionCard = ({ item, index }) => {
  const total = (item.Score1 ?? 0) + (item.Score2 ?? 0) + (item.Score3 ?? 0) + (item.Score4 ?? 0);
  const avgPct = ((item.AverageScore / 4) * 100).toFixed(0);
  const color = avgColor(item.AverageScore);

  return (
    <View style={s.card}>
      {/* Question number badge */}
      <View style={s.cardHeader}>
        <View style={s.qBadge}>
          <Text style={s.qBadgeText}>Q{index + 1}</Text>
        </View>
        <Text style={s.questionText} numberOfLines={4}>
          {item.QuestionText}
        </Text>
      </View>

      {/* Average score pill */}
      <View style={s.avgRow}>
        <View style={[s.avgPill, { borderColor: color + "55", backgroundColor: color + "15" }]}>
          <Icon name="analytics" size={13} color={color} />
          <Text style={[s.avgPillText, { color }]}>
            Avg {item.AverageScore.toFixed(2)} / 4
          </Text>
        </View>
        <View style={[s.pctPill, { backgroundColor: color }]}>
          <Text style={s.pctPillText}>{avgPct}%</Text>
        </View>
        <Text style={s.totalText}>{total} responses</Text>
      </View>

      <View style={s.cardDivider} />

      {/* Score distribution bars */}
      <View style={s.scoreBarsContainer}>
        {SCORE_CONFIG.map((cfg) => (
          <ScoreBar
            key={cfg.key}
            config={cfg}
            count={item[cfg.key] ?? 0}
            total={total}
          />
        ))}
      </View>
    </View>
  );
};

// ── Eval Type Selector ────────────────────────────────────────────────────────
const EvalSelector = ({ selected, onChange }) => (
  <View style={s.evalRow}>
    {EVAL_OPTIONS.map((opt) => {
      const active = selected === opt.value;
      return (
        <TouchableOpacity
          key={opt.value}
          style={[s.evalChip, active && s.evalChipActive]}
          onPress={() => onChange(opt.value)}
          activeOpacity={0.8}
        >
          <Icon
            name={opt.icon}
            size={13}
            color={active ? C.white : C.textLight}
          />
          <Text style={[s.evalChipText, active && s.evalChipTextActive]}>
            {opt.label.split(" ")[0]}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

// ── Summary Strip ─────────────────────────────────────────────────────────────
const SummaryStrip = ({ data }) => {
  if (!data.length) return null;

  const overallAvg = data.reduce((s, d) => s + (d.AverageScore ?? 0), 0) / data.length;
  const totalResp  = data.reduce((s, d) =>
    s + (d.Score1 ?? 0) + (d.Score2 ?? 0) + (d.Score3 ?? 0) + (d.Score4 ?? 0), 0);
  const color = avgColor(overallAvg);

  return (
    <View style={s.summaryStrip}>
      <View style={s.summaryItem}>
        <Text style={[s.summaryVal, { color }]}>{overallAvg.toFixed(2)}</Text>
        <Text style={s.summaryLabel}>Avg Score</Text>
      </View>
      <View style={s.summarySep} />
      <View style={s.summaryItem}>
        <Text style={[s.summaryVal, { color: C.green }]}>{data.length}</Text>
        <Text style={s.summaryLabel}>Questions</Text>
      </View>
      <View style={s.summarySep} />
      <View style={s.summaryItem}>
        <Text style={[s.summaryVal, { color: C.blue }]}>{totalResp}</Text>
        <Text style={s.summaryLabel}>Responses</Text>
      </View>
    </View>
  );
};

// ── Main Screen ───────────────────────────────────────────────────────────────
const DetailPerformance = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { teacherId, courseCode } = route.params;

  const [sessions,         setSessions]         = useState([]);
  const [selectedSession,  setSelectedSession]  = useState(null);
  const [evaluationType,   setEvaluationType]   = useState("student");
  const [data,             setData]             = useState([]);
  const [loading,          setLoading]          = useState(false);

  useEffect(() => { fetchSessions(); }, []);

  useEffect(() => {
    if (selectedSession) fetchDetails();
  }, [selectedSession, evaluationType]);

  const fetchSessions = async () => {
    try {
      const res    = await fetch(`${BASE_URL}/Performance/GetSessions`);
      const result = await res.json();
      setSessions(result.map((s) => ({ label: s.name, value: s.id })));
    } catch {
      Alert.alert("Error", "Failed to load sessions");
    }
  };

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${BASE_URL}/Performance/GetTeacherQuestionStatsFull?teacherId=${teacherId}&sessionId=${selectedSession}&evaluationType=${evaluationType}&courseCode=${courseCode}`
      );
      const result = await res.json();
      setData(Array.isArray(result) ? result : []);
    } catch (err) {
      console.log(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const currentEvalLabel = EVAL_OPTIONS.find((o) => o.value === evaluationType)?.label ?? "";

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Icon name="arrow-back" size={20} color={C.green} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Question Analysis</Text>
          <Text style={s.headerSub}>{courseCode} · {currentEvalLabel}</Text>
        </View>
        <View style={s.courseChip}>
          <Icon name="menu-book" size={12} color={C.green} />
          <Text style={s.courseChipText}>{courseCode}</Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ── FILTER CARD ───────────────────────────────────────────────── */}
        <View style={s.filterCard}>
          {/* Session dropdown */}
          <View style={s.filterRow}>
            <Icon name="event" size={15} color={C.textFaint} style={{ marginRight: 8 }} />
            <Dropdown
              style={s.dropdown}
              containerStyle={s.dropdownContainer}
              selectedTextStyle={{ color: C.textDark, fontSize: 14, fontWeight: "600" }}
              placeholderStyle={{ color: C.textFaint, fontSize: 14 }}
              itemTextStyle={{ color: C.textDark, fontSize: 14 }}
              activeColor={C.greenLight}
              data={sessions}
              labelField="label"
              valueField="value"
              placeholder="Select Session"
              value={selectedSession}
              onChange={(item) => setSelectedSession(item.value)}
            />
          </View>

          {/* Evaluation type chips */}
          <Text style={s.filterLabel}>Evaluation Type</Text>
          <EvalSelector selected={evaluationType} onChange={setEvaluationType} />
        </View>

        {/* ── SUMMARY ───────────────────────────────────────────────────── */}
        {data.length > 0 && <SummaryStrip data={data} />}

        {/* ── CONTENT ───────────────────────────────────────────────────── */}
        {loading ? (
          <View style={s.center}>
            <ActivityIndicator size="large" color={C.green} />
            <Text style={s.loadingText}>Loading questions…</Text>
          </View>
        ) : !selectedSession ? (
          <View style={s.emptyState}>
            <View style={s.emptyIconBox}>
              <Icon name="event-note" size={36} color={C.borderMid} />
            </View>
            <Text style={s.emptyTitle}>Select a Session</Text>
            <Text style={s.emptySub}>Choose a session above to view question analytics.</Text>
          </View>
        ) : data.length === 0 ? (
          <View style={s.emptyState}>
            <View style={s.emptyIconBox}>
              <Icon name="inbox" size={36} color={C.borderMid} />
            </View>
            <Text style={s.emptyTitle}>No Data Found</Text>
            <Text style={s.emptySub}>No question stats available for this selection.</Text>
          </View>
        ) : (
          <>
            <View style={s.listHeader}>
              <View style={s.listHeaderDot} />
              <Text style={s.listHeaderText}>
                {data.length} QUESTIONS
              </Text>
            </View>
            {data.map((item, index) => (
              <QuestionCard key={index} item={item} index={index} />
            ))}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

export default DetailPerformance;

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  scrollContent: { padding: 14 },
  center: { alignItems: "center", paddingVertical: 60 },
  loadingText: { color: C.textLight, marginTop: 12, fontSize: 13 },

  // HEADER
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: C.white,
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
    backgroundColor: C.greenLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerTitle: {
    color: C.textDark,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  headerSub: {
    color: C.textFaint,
    fontSize: 11,
    marginTop: 1,
  },
  courseChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.greenLight,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 4,
    borderWidth: 1,
    borderColor: C.borderMid,
  },
  courseChipText: {
    color: C.green,
    fontSize: 11,
    fontWeight: "800",
    marginLeft: 3,
  },

  // FILTER CARD
  filterCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surfaceAlt,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 10,
    marginBottom: 14,
  },
  dropdown: { flex: 1, height: 48 },
  dropdownContainer: {
    backgroundColor: C.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  filterLabel: {
    color: C.textLight,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 8,
  },

  // EVAL TYPE CHIPS
  evalRow: {
    flexDirection: "row",
    gap: 8,
  },
  evalChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
  evalChipActive: {
    backgroundColor: C.green,
    borderColor: C.green,
    shadowColor: C.green,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  evalChipText: {
    color: C.textLight,
    fontSize: 11,
    fontWeight: "700",
  },
  evalChipTextActive: {
    color: C.white,
  },

  // SUMMARY STRIP
  summaryStrip: {
    flexDirection: "row",
    backgroundColor: C.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 14,
    overflow: "hidden",
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
  },
  summaryVal: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  summaryLabel: {
    color: C.textFaint,
    fontSize: 10,
    fontWeight: "600",
    marginTop: 2,
    letterSpacing: 0.3,
  },
  summarySep: {
    width: 1,
    backgroundColor: C.border,
    marginVertical: 12,
  },

  // LIST HEADER
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  listHeaderDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.green,
    marginRight: 8,
  },
  listHeaderText: {
    color: C.textLight,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
  },

  // QUESTION CARD
  card: {
    backgroundColor: C.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 10,
  },
  qBadge: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: C.greenLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.borderMid,
    flexShrink: 0,
  },
  qBadgeText: {
    color: C.greenDeep,
    fontSize: 11,
    fontWeight: "900",
  },
  questionText: {
    flex: 1,
    color: C.textDark,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
  },

  // AVG ROW
  avgRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  avgPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  avgPillText: {
    fontSize: 12,
    fontWeight: "700",
  },
  pctPill: {
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  pctPillText: {
    color: C.white,
    fontSize: 11,
    fontWeight: "800",
  },
  totalText: {
    color: C.textFaint,
    fontSize: 11,
    marginLeft: "auto",
  },

  cardDivider: {
    height: 1,
    backgroundColor: C.border,
    marginBottom: 12,
  },

  // SCORE BARS
  scoreBarsContainer: { gap: 8 },
  scoreBarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  scoreBarLeft: {
    width: 76,
    flexDirection: "column",
    gap: 2,
  },
  scoreBarLabel: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  scoreBarTrack: {
    flex: 1,
    height: 7,
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
    overflow: "hidden",
  },
  scoreBarFill: {
    height: 7,
    borderRadius: 10,
  },
  scoreBarCount: {
    width: 22,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "right",
  },

  // EMPTY STATE
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyIconBox: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: C.greenLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  emptyTitle: {
    color: C.textDark,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 6,
  },
  emptySub: {
    color: C.textFaint,
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: 30,
  },
});
