import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { BarChart } from "react-native-gifted-charts";
import Icon from "react-native-vector-icons/MaterialIcons";
import BASE_URL from "../../API-URL/API";

const screenWidth = Dimensions.get("window").width;
const cardWidth   = (screenWidth - 15 * 3) / 2; // 2 columns with gaps

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  bg:          "#f0f2f5",
  surface:     "#ffffff",
  border:      "#e8eaed",
  green:       "#16a34a",
  greenLight:  "#dcfce7",
  greenDark:   "#14532d",
  orange:      "#ea580c",
  blue:        "#2563eb",
  textDark:    "#111827",
  textMid:     "#374151",
  textLight:   "#6b7280",
  textFaint:   "#9ca3af",
  white:       "#ffffff",
};

// ── Bar color by value ────────────────────────────────────────────────────────
const barColor = (val) => {
  if (val >= 75) return C.green;
  if (val >= 50) return C.orange;
  return C.blue;
};

// ── Progress bar row ──────────────────────────────────────────────────────────
const ProgressBar = ({ label, value }) => {
  const pct   = Math.min(Math.max(value ?? 0, 0), 100);
  const color = barColor(pct);

  return (
    <View style={s.pbRow}>
      <Text style={s.pbLabel}>{label}</Text>
      <View style={s.pbTrack}>
        <View style={[s.pbFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <Text style={[s.pbVal, { color }]}>{pct.toFixed(0)}%</Text>
    </View>
  );
};

// ── Teacher Card ──────────────────────────────────────────────────────────────
const TeacherCard = ({ item, onPress }) => {
  const avg = ((item.StudentAverage + item.PeerAverage + item.ChrAverage) / 3);
  const percentage = (avg * 10).toFixed(0);
  const totalColor = barColor(parseFloat(percentage));

  return (
    <View style={s.card}>

      {/* ── TOTAL watermark label */}
      <Text style={s.totalWatermark}>TOTAL</Text>

      {/* ── Top row: avatar + name + percentage */}
      <View style={s.cardTop}>
        <View style={s.avatar}>
          <Icon name="person" size={22} color={C.textLight} />
        </View>

        <View style={s.nameBlock}>
          <Text style={s.teacherName} numberOfLines={1}>{item.Name}</Text>
          <View style={s.courseTag}>
            <Icon name="menu-book" size={10} color={C.green} />
            <Text style={s.courseCode}>{item.CourseCode}</Text>
          </View>
        </View>

        <Text style={[s.bigPercent, { color: totalColor }]}>
          {percentage}%
        </Text>
      </View>

      {/* ── Divider */}
      <View style={s.divider} />

      {/* ── Progress bars */}
      <ProgressBar label="STUDENT EVALUATION" value={(item.StudentAverage ?? 0) * 10} />
      <ProgressBar label="PEER EVALUATION"    value={(item.PeerAverage    ?? 0) * 10} />
      <ProgressBar label="CHR REPORT"         value={(item.ChrAverage     ?? 0) * 10} />

      {/* ── CTA button */}
      <TouchableOpacity style={s.ctaBtn} onPress={onPress} activeOpacity={0.85}>
        <Text style={s.ctaBtnText}>SEE QUESTION PERFORMANCE</Text>
        <Icon name="chevron-right" size={16} color={C.white} />
      </TouchableOpacity>

    </View>
  );
};

// ── Main Screen ───────────────────────────────────────────────────────────────
const PerformanceScreen = ({ navigation }) => {
  const [sessions,         setSessions]         = useState([]);
  const [selectedSession,  setSelectedSession]  = useState(null);
  const [departments]                            = useState(["CS", "Non CS", "Admin"]);
  const [selectedDept,     setSelectedDept]     = useState("CS");
  const [courses,          setCourses]          = useState([]);
  const [selectedCourse,   setSelectedCourse]   = useState("All");
  const [teachers,         setTeachers]         = useState([]);
  const [loading,          setLoading]          = useState(false);

  useEffect(() => { fetchSessions(); }, []);

  useEffect(() => {
    if (selectedSession) {
      fetchCourses();
      fetchTeachers();
    }
  }, [selectedSession, selectedCourse, selectedDept]);

  const fetchSessions = async () => {
    try {
      const res  = await fetch(`${BASE_URL}/Performance/GetSessions`);
      const data = await res.json();
      setSessions(data.map((s) => ({ label: s.name, value: s.id })));
    } catch (e) { console.log("Session Error:", e); }
  };

  const fetchCourses = async () => {
    try {
      const res  = await fetch(`${BASE_URL}/Performance/GetCoursesBySession?sessionId=${selectedSession}`);
      const data = await res.json();
      setCourses(["All", ...(data || [])]);
    } catch (e) { console.log("Course Error:", e); }
  };

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res  = await fetch(
        `${BASE_URL}/Performance/GetTeachersPerformanceList?sessionId=${selectedSession}&courseCode=${selectedCourse}&department=${selectedDept}`
      );
      const data = await res.json();
      setTeachers(data || []);
    } catch (e) {
      console.log("Teacher API Error:", e);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  // chart data
  const chartData = teachers.slice(0, 8).map((t) => {
    const avg = (t.StudentAverage + t.PeerAverage + t.ChrAverage) / 3;
    const val = parseFloat((avg * 10).toFixed(0));
    return {
      value: val,
      label: t.Name?.split(" ")[0] || "T",
      frontColor: barColor(val),
      topLabelComponent: () => (
        <Text style={{ color: barColor(val), fontSize: 9, fontWeight: "700", marginBottom: 2 }}>
          {val}%
        </Text>
      ),
    };
  });

  return (
    <ScrollView style={s.root} showsVerticalScrollIndicator={false}>

      {/* ── HEADER */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Employee Performance</Text>
        <Text style={s.headerSub}>Track and compare teacher metrics</Text>

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

      <View style={s.body}>

        {/* ── DEPARTMENT TABS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabRow}>
          {departments.map((dep) => (
            <TouchableOpacity
              key={dep}
              style={[s.tab, selectedDept === dep && s.tabActive]}
              onPress={() => setSelectedDept(dep)}
            >
              <Text style={[s.tabText, selectedDept === dep && s.tabTextActive]}>
                {dep}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── COURSE CHIPS */}
        <Text style={s.sectionLabel}>Filter by Course</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          {courses.map((course, i) => (
            <TouchableOpacity
              key={i}
              style={[s.chip, selectedCourse === course && s.chipActive]}
              onPress={() => setSelectedCourse(course)}
            >
              <Text style={[s.chipText, selectedCourse === course && s.chipTextActive]}>
                {course}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── CHART */}
        {teachers.length > 0 && (
          <View style={s.chartCard}>
            <View style={s.chartTitleRow}>
              <View style={s.chartIconBox}>
                <Icon name="bar-chart" size={18} color={C.white} />
              </View>
              <Text style={s.chartTitle}>PERFORMANCE RANKING</Text>
              <TouchableOpacity
                style={s.compareBtn}
                onPress={() => navigation.navigate("ComparisonScreen")}
              >
                <Text style={s.compareBtnText}>Compare</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <BarChart
                data={chartData}
                height={200}
                barWidth={28}
                spacing={16}
                isAnimated
                yAxisThickness={0}
                xAxisThickness={1}
                xAxisColor={C.border}
                rulesColor={C.border}
                rulesType="dashed"
                noOfSections={4}
                maxValue={100}
                yAxisTextStyle={{ color: C.textFaint, fontSize: 10 }}
                xAxisLabelTextStyle={{ color: C.textMid, fontSize: 10, fontWeight: "600" }}
                roundedTop
              />
            </ScrollView>
          </View>
        )}

        {/* ── TEACHER CARDS */}
        {loading ? (
          <View style={s.center}>
            <ActivityIndicator size="large" color={C.green} />
            <Text style={{ color: C.textLight, marginTop: 10, fontSize: 13 }}>
              Loading teachers…
            </Text>
          </View>
        ) : teachers.length === 0 ? (
          <View style={s.empty}>
            <Icon name="people-outline" size={44} color={C.border} />
            <Text style={s.emptyText}>No data found. Select a session.</Text>
          </View>
        ) : (
          <View style={s.grid}>
            {teachers.map((item) => (
              <TeacherCard
                key={item.TeacherID + item.CourseCode}
                item={item}
                onPress={() =>
                  navigation.navigate("DetailPerformance", {
                    teacherId:  item.TeacherID,
                    courseCode: item.CourseCode,
                  })
                }
              />
            ))}
          </View>
        )}

      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

export default PerformanceScreen;

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  center: { alignItems: "center", paddingVertical: 50 },

  // HEADER
  header: {
    backgroundColor: C.green,
    paddingTop: 50,
    paddingBottom: 28,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTitle: {
    color: C.white,
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  headerSub: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    marginTop: 3,
    marginBottom: 16,
  },
  dropdown: {
    backgroundColor: C.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
  },
  dropdownContainer: {
    backgroundColor: C.white,
    borderRadius: 12,
    borderColor: C.border,
    borderWidth: 1,
  },

  body: { paddingHorizontal: 15, paddingTop: 16 },

  // TABS
  tabRow: { marginBottom: 14 },
  tab: {
    backgroundColor: C.surface,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  tabActive: {
    backgroundColor: C.green,
    borderColor: C.green,
  },
  tabText:       { color: C.textMid, fontSize: 13, fontWeight: "600" },
  tabTextActive: { color: C.white,   fontSize: 13, fontWeight: "700" },

  // COURSE CHIPS
  sectionLabel: {
    color: C.textMid,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  chip: {
    backgroundColor: C.surface,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  chipActive:     { backgroundColor: C.greenLight, borderColor: C.green },
  chipText:       { color: C.textMid, fontSize: 12, fontWeight: "600" },
  chipTextActive: { color: C.green,   fontSize: 12, fontWeight: "700" },

  // CHART CARD
  chartCard: {
    backgroundColor: C.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  chartTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  chartIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: C.textDark,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  chartTitle: {
    flex: 1,
    color: C.textDark,
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  compareBtn: {
    backgroundColor: C.blue,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  compareBtnText: { color: C.white, fontSize: 11, fontWeight: "700" },

  // GRID
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },

  // ── TEACHER CARD
  card: {
    width: cardWidth,
    backgroundColor: C.surface,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    overflow: "hidden",
    position: "relative",
  },

  // Watermark "TOTAL" in top-right corner
  totalWatermark: {
    position: "absolute",
    top: 10,
    right: 12,
    fontSize: 8,
    fontWeight: "900",
    color: C.textFaint,
    letterSpacing: 1.5,
  },

  // Card top row
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  nameBlock: { flex: 1 },
  teacherName: {
    color: C.textDark,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  courseTag: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
    gap: 3,
  },
  courseCode: {
    color: C.green,
    fontSize: 11,
    fontWeight: "600",
    marginLeft: 2,
  },
  bigPercent: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -1,
  },

  divider: {
    height: 1,
    backgroundColor: C.border,
    marginBottom: 10,
  },

  // Progress bar
  pbRow: {
    marginBottom: 8,
  },
  pbLabel: {
    color: C.textFaint,
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  pbTrack: {
    height: 5,
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 2,
  },
  pbFill: {
    height: 5,
    borderRadius: 10,
  },
  pbVal: {
    fontSize: 9,
    fontWeight: "700",
    textAlign: "right",
  },

  // CTA button
  ctaBtn: {
    backgroundColor: C.green,
    borderRadius: 10,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    gap: 4,
    shadowColor: C.green,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  ctaBtnText: {
    color: C.white,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  // Empty state
  empty: { alignItems: "center", paddingVertical: 60 },
  emptyText: { color: C.textLight, fontSize: 14, marginTop: 12, fontWeight: "600" },
});
