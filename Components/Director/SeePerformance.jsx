import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";

import { Dropdown } from "react-native-element-dropdown";
import { BarChart } from "react-native-gifted-charts";
import Icon from "react-native-vector-icons/MaterialIcons";

import BASE_URL from "../../API-URL/API";

import {
  getConfidentialScoresForPerformance,
} from "../../Database/db";

const screenWidth = Dimensions.get("window").width;
const cardWidth = (screenWidth - 15 * 3) / 2;

const C = {
  bg: "#f0f2f5",
  surface: "#ffffff",
  border: "#e8eaed",
  green: "#16a34a",
  greenLight: "#dcfce7",
  greenDark: "#14532d",
  orange: "#ea580c",
  blue: "#2563eb",
  textDark: "#111827",
  textMid: "#374151",
  textLight: "#6b7280",
  textFaint: "#9ca3af",
  white: "#ffffff",
};

const barColor = (val) => {
  if (val >= 75) return C.green;
  if (val >= 50) return C.orange;
  return C.blue;
};

// ─────────────────────────────────────────────
// PROGRESS BAR
// ─────────────────────────────────────────────
const ProgressBar = ({ label, value }) => {
  const pct = Math.min(Math.max(value ?? 0, 0), 100);

  const color = barColor(pct);

  return (
    <View style={s.pbRow}>
      <View style={s.pbHeader}>
        <Text style={s.pbLabel}>{label}</Text>

        <Text style={[s.pbVal, { color }]}>
          {pct.toFixed(0)}%
        </Text>
      </View>

      <View style={s.pbTrack}>
        <View
          style={[
            s.pbFill,
            {
              width: `${pct}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </View>
  );
};

// ─────────────────────────────────────────────
// TEACHER CARD
// ─────────────────────────────────────────────
const TeacherCard = ({ item, onPress }) => {

  // FINAL TOTAL OUT OF 10

const avg =
(
  Number(item.StudentAverage || 0) +
  Number(item.PeerAverage || 0) +
  Number(item.ChrAverage || 0) +
  Number(item.ConfidentialAverage || 0)
) / 4;

console.log(
  "TOTAL PERFORMANCE:",
  item.Name,
  avg
);







  // CONVERT TO %
  const percentage = (avg * 10).toFixed(0);

  const totalColor = barColor(parseFloat(percentage));

  return (
    <View style={s.card}>

      {/* WATERMARK */}
      <Text style={s.totalWatermark}>TOTAL</Text>

      {/* TOP */}
      <View style={s.cardTop}>

        <View style={s.avatar}>
          <Icon
            name="person"
            size={20}
            color={C.textLight}
          />
        </View>

        <View style={s.nameBlock}>
          <Text
            style={s.teacherName}
            numberOfLines={1}
          >
            {item.Name}
          </Text>

          <View style={s.courseTag}>
            <View
              style={[
                s.courseDot,
                { backgroundColor: totalColor },
              ]}
            />

            <Text
              style={[
                s.courseCode,
                { color: totalColor },
              ]}
            >
              {item.CourseCode}
            </Text>
          </View>
        </View>

        <Text
          style={[
            s.bigPercent,
            { color: totalColor },
          ]}
        >
          {percentage}%
        </Text>
      </View>

      {/* DIVIDER */}
      <View style={s.divider} />

      {/* STATUS BARS */}
      <ProgressBar
        label="STUDENT EVAL"
        value={(item.StudentAverage || 0) * 10}
      />

      <ProgressBar
        label="PEER EVAL"
        value={(item.PeerAverage || 0) * 10}
      />

      <ProgressBar
        label="CHR REPORT"
        value={(item.ChrAverage || 0) * 10}
      />

      <ProgressBar
        label="CONFIDENTIAL"
        value={(item.ConfidentialAverage || 0) * 10}
      />

      {/* BUTTON */}
      <TouchableOpacity
        style={[
          s.ctaBtn,
          { backgroundColor: totalColor },
        ]}
        onPress={onPress}
        activeOpacity={0.85}
      >
        <View style={s.ctaBtnInner}>

          <Text
            style={s.ctaBtnText}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            Question Performance
          </Text>

          <View style={s.ctaBtnIcon}>
            <Icon
              name="chevron-right"
              size={16}
              color={C.white}
            />
          </View>

        </View>
      </TouchableOpacity>

    </View>
  );
};

// ─────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────
const PerformanceScreen = ({ navigation }) => {

  const [sessions, setSessions] = useState([]);

  const [selectedSession, setSelectedSession] =
    useState(null);

  const [departments] = useState([
    "CS",
    "Non CS",
    "Admin",
  ]);

  const [selectedDept, setSelectedDept] =
    useState("CS");

  const [courses, setCourses] = useState([]);

  const [selectedCourse, setSelectedCourse] =
    useState("All");

  const [teachers, setTeachers] = useState([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (selectedSession) {
      fetchCourses();
      fetchTeachers();
    }
  }, [
    selectedSession,
    selectedCourse,
    selectedDept,
  ]);

  // ─────────────────────────────────────────
  // FETCH SESSIONS
  // ─────────────────────────────────────────
  const fetchSessions = async () => {
    try {

      const res = await fetch(
        `${BASE_URL}/Performance/GetSessions`
      );

      const data = await res.json();

      setSessions(
        data.map((s) => ({
          label: s.name,
          value: s.id,
        }))
      );

    } catch (e) {

      console.log("Session Error:", e);

    }
  };

  // ─────────────────────────────────────────
  // FETCH COURSES
  // ─────────────────────────────────────────
  const fetchCourses = async () => {
    try {

      const res = await fetch(
        `${BASE_URL}/Performance/GetCoursesBySession?sessionId=${selectedSession}`
      );

      const data = await res.json();

      setCourses(["All", ...(data || [])]);

    } catch (e) {

      console.log("Course Error:", e);

    }
  };

  // ─────────────────────────────────────────
  // FETCH TEACHERS
  // ─────────────────────────────────────────
  const fetchTeachers = async () => {

    try {

      setLoading(true);

      const res = await fetch(
        `${BASE_URL}/Performance/GetTeachersPerformanceList?sessionId=${selectedSession}&courseCode=${selectedCourse}&department=${selectedDept}`
      );

      const data = await res.json();

      // =====================================
      // ADD CONFIDENTIAL SCORES
      // =====================================
      const updatedTeachers = await Promise.all(

        (data || []).map(async (teacher) => {

          try {

            const localScores =
              await getConfidentialScoresForPerformance(
                teacher.TeacherID,
                selectedSession,
                teacher.CourseCode
              );

            let confidentialAvg = 0;

            // ===============================
            // CONVERT CONFIDENTIAL TO OUT OF 10
            // ===============================
            if (
              localScores &&
              localScores.length > 0
            ) {

              // RAW AVG OUT OF 4
              const rawAvg =
                localScores.reduce(
                  (a, b) =>
                    a + Number(b || 0),
                  0
                ) / localScores.length;

              // CONVERT TO OUT OF 10
              confidentialAvg =
                (rawAvg / 4) * 10;

              // DEBUG
              console.log(
                "----------------------"
              );

              console.log(
                "Teacher:",
                teacher.Name
              );

              console.log(
                "Student:",
                teacher.StudentAverage
              );

              console.log(
                "Peer:",
                teacher.PeerAverage
              );

              console.log(
                "CHR:",
                teacher.ChrAverage
              );

              console.log(
                "Conf Raw:",
                rawAvg
              );

              console.log(
                "Conf Out Of 10:",
                confidentialAvg
              );
            }

            return {
              ...teacher,

              ConfidentialAverage:
                Number(
                  confidentialAvg.toFixed(2)
                ),
            };

          } catch (err) {

            console.log(
              "Confidential Error:",
              err
            );

            return {
              ...teacher,
              ConfidentialAverage: 0,
            };
          }
        })
      );

      console.log(
        "UPDATED TEACHERS:",
        updatedTeachers
      );

      setTeachers(updatedTeachers);

    } catch (e) {

      console.log(
        "Teacher API Error:",
        e
      );

      setTeachers([]);

    } finally {

      setLoading(false);

    }
  };

  // ─────────────────────────────────────────
  // CHART DATA
  // ─────────────────────────────────────────
 const chartData = teachers.map(
  (t, index) => {

    const avg =
      (
        Number(t.StudentAverage || 0) +
        Number(t.PeerAverage || 0) +
        Number(t.ChrAverage || 0) +
        Number(t.ConfidentialAverage || 0)
      ) / 4;

    const val = Math.min(
      100,
      Math.max(
        0,
        parseFloat((avg * 10).toFixed(0))
      )
    );

    return {
      value: val,

      label: t.Name
        ? t.Name.split(" ")[0]
        : `T${index + 1}`,

      frontColor: barColor(val),

      topLabelComponent: () => (
        <View
          style={{
            alignItems: "center",
            marginBottom: 6,
          }}
        >
          <Text
            style={{
              color: barColor(val),
              fontSize: 10,
              fontWeight: "800",
            }}
          >
            {val}%
          </Text>

          <Text
            style={{
              color: C.textLight,
              fontSize: 8,
              fontWeight: "700",
              marginTop: 2,
            }}
          >
            {t.CourseCode}
          </Text>
        </View>
      ),
    };
  }
);
      
    
  

  return (
    <ScrollView
      style={s.root}
      showsVerticalScrollIndicator={false}
    >

      {/* HEADER */}
      <View style={s.header}>

        <Text style={s.headerTitle}>
          Employee Performance
        </Text>

        <Text style={s.headerSub}>
          Track and compare teacher metrics
        </Text>

        <Dropdown
          style={s.dropdown}
          containerStyle={s.dropdownContainer}
          selectedTextStyle={{
            color: C.textDark,
            fontSize: 14,
            fontWeight: "600",
          }}
          placeholderStyle={{
            color: C.textFaint,
            fontSize: 14,
          }}
          itemTextStyle={{
            color: C.textDark,
            fontSize: 14,
          }}
          activeColor={C.greenLight}
          data={sessions}
          labelField="label"
          valueField="value"
          placeholder="Select Session"
          value={selectedSession}
          onChange={(item) =>
            setSelectedSession(item.value)
          }
        />

      </View>

      <View style={s.body}>

        {/* DEPARTMENTS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.tabRow}
        >
          {departments.map((dep) => (

            <TouchableOpacity
              key={dep}
              style={[
                s.tab,
                selectedDept === dep &&
                  s.tabActive,
              ]}
              onPress={() =>
                setSelectedDept(dep)
              }
            >
              <Text
                style={[
                  s.tabText,
                  selectedDept === dep &&
                    s.tabTextActive,
                ]}
              >
                {dep}
              </Text>
            </TouchableOpacity>

          ))}
        </ScrollView>

        {/* COURSES */}
        <Text style={s.sectionLabel}>
          Filter by Course
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 16 }}
        >

          {courses.map((course, i) => (

            <TouchableOpacity
              key={i}
              style={[
                s.chip,
                selectedCourse === course &&
                  s.chipActive,
              ]}
              onPress={() =>
                setSelectedCourse(course)
              }
            >
              <Text
                style={[
                  s.chipText,
                  selectedCourse === course &&
                    s.chipTextActive,
                ]}
              >
                {course}
              </Text>
            </TouchableOpacity>

          ))}
        </ScrollView>

       {/* GRAPH */}
{teachers.length > 0 && (

  <View style={s.chartCard}>

    <View style={s.chartTitleRow}>

      <View style={s.chartIconBox}>
        <Icon
          name="bar-chart"
          size={18}
          color={C.white}
        />
      </View>

      <Text style={s.chartTitle}>
        PERFORMANCE RANKING
      </Text>

      <TouchableOpacity
        style={s.compareBtn}
        onPress={() =>
          navigation.navigate(
            "ComparisonScreen"
          )
        }
      >
        <Text style={s.compareBtnText}>
          Compare
        </Text>
      </TouchableOpacity>

    </View>

    {/* IMPORTANT FIX */}
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingRight: 40,
      }}
    >

      <View
        style={{
          minWidth:
            teachers.length * 90,
          paddingTop: 25,
        }}
      >

        <BarChart
          key={`${selectedSession}-${selectedDept}-${selectedCourse}-${teachers.length}`}

          data={chartData}

          height={240}

          width={
            Math.max(
              screenWidth - 80,
              teachers.length * 85
            )
          }

          barWidth={30}

          spacing={35}

          initialSpacing={20}

          endSpacing={20}

          roundedTop

          isAnimated

          animationDuration={700}

          hideRules={false}

          rulesType="solid"

          rulesColor="#d1d5db"

          rulesThickness={1}

          noOfSections={4}

          maxValue={100}

          yAxisThickness={0}

          xAxisThickness={1}

          xAxisColor="#d1d5db"

          yAxisTextStyle={{
            color: "#9ca3af",
            fontSize: 11,
          }}

          xAxisLabelTextStyle={{
            color: C.textMid,
            fontSize: 10,
            fontWeight: "700",
          }}

          showValuesAsTopLabel={false}

          disableScroll

          frontColor={C.green}

          showLine={false}

          hideYAxisText={false}

          stepValue={25}

          yAxisLabelTexts={[
            "0",
            "25",
            "50",
            "75",
            "100",
          ]}

          renderTooltip={(item) => (
            <View
              style={{
                backgroundColor: "#111827",
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 6,
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 11,
                  fontWeight: "700",
                }}
              >
                {item.value}%
              </Text>
            </View>
          )}
        />

      </View>

    </ScrollView>

  </View>
)}
        

        {/* LOADING */}
        {loading ? (

          <View style={s.center}>

            <ActivityIndicator
              size="large"
              color={C.green}
            />

            <Text
              style={{
                color: C.textLight,
                marginTop: 10,
                fontSize: 13,
              }}
            >
              Loading teachers…
            </Text>

          </View>

        ) : teachers.length === 0 ? (

          <View style={s.empty}>

            <Icon
              name="people-outline"
              size={44}
              color={C.border}
            />

            <Text style={s.emptyText}>
              No data found.
            </Text>

          </View>

        ) : (

          <View style={s.grid}>

            {teachers.map((item) => (

              <TeacherCard
                key={
                  item.TeacherID +
                  item.CourseCode
                }
                item={item}
                onPress={() =>
                  navigation.navigate(
                    "DetailPerformance",
                    {
                      teacherId:
                        item.TeacherID,

                      courseCode:
                        item.CourseCode,
                    }
                  )
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

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const s = StyleSheet.create({

  root: {
    flex: 1,
    backgroundColor: C.bg,
  },

  center: {
    alignItems: "center",
    paddingVertical: 50,
  },

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

  body: {
    paddingHorizontal: 15,
    paddingTop: 16,
  },

  tabRow: {
    marginBottom: 14,
  },

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

  tabText: {
    color: C.textMid,
    fontSize: 13,
    fontWeight: "600",
  },

  tabTextActive: {
    color: C.white,
    fontSize: 13,
    fontWeight: "700",
  },

  sectionLabel: {
    color: C.textMid,
    fontSize: 12,
    fontWeight: "700",
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

  chipActive: {
    backgroundColor: C.greenLight,
    borderColor: C.green,
  },

  chipText: {
    color: C.textMid,
    fontSize: 12,
    fontWeight: "600",
  },

  chipTextActive: {
    color: C.green,
    fontSize: 12,
    fontWeight: "700",
  },

  chartCard: {
    backgroundColor: C.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: C.border,
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
  },

  compareBtn: {
    backgroundColor: C.blue,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  compareBtnText: {
    color: C.white,
    fontSize: 11,
    fontWeight: "700",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },

  card: {
    width: cardWidth,
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 12,
  },

  totalWatermark: {
    position: "absolute",
    top: 10,
    right: 12,
    fontSize: 8,
    fontWeight: "900",
    color: "#e5e7eb",
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 13,
    gap: 8,
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
  },

  nameBlock: {
    flex: 1,
  },

  teacherName: {
    color: C.textDark,
    fontSize: 13,
    fontWeight: "800",
  },

  courseTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 3,
  },

  courseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  courseCode: {
    fontSize: 11,
    fontWeight: "700",
  },

  bigPercent: {
    fontSize: 22,
    fontWeight: "900",
  },

  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginBottom: 11,
  },

  pbRow: {
    marginBottom: 9,
  },

  pbHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },

  pbLabel: {
    color: C.textFaint,
    fontSize: 8,
    fontWeight: "700",
  },

  pbVal: {
    fontSize: 9,
    fontWeight: "700",
  },

  pbTrack: {
    height: 6,
    backgroundColor: "#f1f5f9",
    borderRadius: 6,
    overflow: "hidden",
  },

  pbFill: {
    height: 6,
    borderRadius: 6,
  },

  ctaBtn: {
    borderRadius: 11,
    paddingVertical: 11,
    paddingHorizontal: 10,
    marginTop: 13,
  },

  ctaBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },

  ctaBtnText: {
    color: C.white,
    fontSize: 10,
    fontWeight: "800",
  },

  ctaBtnIcon: {
    flexShrink: 0,
  },

  empty: {
    alignItems: "center",
    paddingVertical: 60,
  },

  emptyText: {
    color: C.textLight,
    fontSize: 14,
    marginTop: 12,
    fontWeight: "600",
  },

});