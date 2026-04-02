import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Dimensions,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { BarChart } from "react-native-gifted-charts"; // ✅ changed library
import BASE_URL from "../../API-URL/API";

const screenWidth = Dimensions.get("window").width;

const PerformanceScreen = ({navigation}) => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);

  const [departments] = useState(["CS", "Non CS", "Admin"]);
  const [selectedDept, setSelectedDept] = useState("CS");

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("All");

  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (selectedSession) {
      fetchCourses();
      fetchTeachers();
    }
  }, [selectedSession, selectedCourse, selectedDept]);

  const fetchSessions = async () => {
    const res = await fetch(`${BASE_URL}/Performance/GetSessions`);
    const data = await res.json();
    setSessions(data.map((s) => ({ label: s.name, value: s.id })));
  };

  const fetchCourses = async () => {
    const res = await fetch(
      `${BASE_URL}/Performance/GetCoursesBySession?sessionId=${selectedSession}`
    );
    const data = await res.json();
    setCourses(["All", ...data]);
  };

  const fetchTeachers = async () => {
    const res = await fetch(
      `${BASE_URL}/Performance/GetTeacherPerformance?sessionId=${selectedSession}&courseCode=${selectedCourse}&department=${selectedDept}`
    );
    const data = await res.json();
    setTeachers(data);
  };

  // Prepare data for Gifted Charts
  const chartData = teachers.slice(0, 5).map((t) => ({
    value: t.Percentage,
    label: t.TeacherName.split(" ")[1] || "T",
    frontColor: "#16a34a",
  }));

  return (
    <ScrollView style={styles.container}>
      {/* 🔥 HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Employee Performance</Text>

        <Dropdown
          style={styles.dropdown}
          data={sessions}
          labelField="label"
          valueField="value"
          placeholder="Select Session"
          value={selectedSession}
          onChange={(item) => setSelectedSession(item.value)}
        />
      </View>
      

      {/* 🔥 DEPARTMENT TABS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabWrap}
      >
        {departments.map((dep) => (
          <TouchableOpacity
            key={dep}
            style={[styles.tab, selectedDept === dep && styles.activeTab]}
            onPress={() => setSelectedDept(dep)}
          >
            <Text
              style={[styles.tabText, selectedDept === dep && styles.activeText]}
            >
              {dep}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 🔥 COURSE FILTER */}
      <Text style={styles.filterTitle}>Filter by Course</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {courses.map((course) => (
          <TouchableOpacity
            key={course}
            style={[
              styles.courseChip,
              selectedCourse === course && styles.activeCourse,
            ]}
            onPress={() => setSelectedCourse(course)}
          >
            <Text>{course}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 🔥 GRAPH */}
      {teachers.length > 0 && (
        <View style={styles.chartCard}>
          <TouchableOpacity
  style={styles.compareBtn}
  onPress={() => navigation.navigate("ComparisonScreen")}
>
  <Text style={{ color: "#fff", fontWeight: "bold" }}>
    Detailed Comparison
  </Text>
</TouchableOpacity>
          <Text style={styles.chartTitle}>Teacher Performance Comparison</Text>

          <BarChart
          
            data={chartData}
            width={screenWidth - 30}
            height={220}
            barWidth={30}
            frontColor="#16a34a"
            isAnimated
            spacing={20}
            // showLine
            yAxisThickness={0}
            xAxisLabelTextStyle={{ color: "#333", fontWeight: "bold" }}
            roundedTop
          />

          
        </View>
      )}

      {/* 🔥 TEACHER CARDS */}
      <FlatList
        data={teachers}
        keyExtractor={(item) => item.TeacherID + item.CourseCode}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.name}>{item.TeacherName}</Text>
              <Text style={styles.percent}>{item.Percentage.toFixed(0)}%</Text>
            </View>

            <Text style={styles.course}>{item.CourseCode}</Text>

            <TouchableOpacity style={styles.btn}>
              <Text style={{ color: "#fff" }}>View Performance</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </ScrollView>
  );
};

export default PerformanceScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fa" },

  header: {
    backgroundColor: "#16a34a",
    padding: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },

  dropdown: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
  },

  tabWrap: { marginTop: 10, paddingHorizontal: 10 },

  tab: {
    backgroundColor: "#e5e7eb",
    padding: 10,
    borderRadius: 20,
    marginRight: 10,
  },

  activeTab: { backgroundColor: "#16a34a" },

  tabText: { color: "#333" },

  activeText: { color: "#fff" },

  filterTitle: {
    marginTop: 15,
    marginLeft: 15,
    fontWeight: "bold",
  },

  courseChip: {
    backgroundColor: "#e5e7eb",
    padding: 8,
    borderRadius: 20,
    margin: 8,
  },

  activeCourse: {
    backgroundColor: "#86efac",
  },

  chartCard: {
    alignItems:"flex-end",
    backgroundColor: "#fff",
    margin: 15,
    padding: 10,
    borderRadius: 20,
    elevation: 3,
  },

  chartTitle: {
    fontWeight: "bold",
    marginBottom: 10,
    alignSelf:"center"
  },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginVertical: 8,
    padding: 15,
    borderRadius: 15,
    elevation: 3,
  },

  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  name: { fontSize: 16, fontWeight: "bold" },

  percent: {
    fontSize: 16,
    color: "#16a34a",
    fontWeight: "bold",
  },

  course: { color: "#666", marginVertical: 5 },

  btn: {
    backgroundColor: "#16a34a",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  compareBtn: {
  backgroundColor: "#3c6eb9",
  margin: 8,
  width:150,
  padding: 8,
  borderRadius: 19,
  alignItems: "center",
},
});