import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import BASE_URL from "../../API-URL/API";

const ComparisonScreen = ({ navigation }) => {
  const [mode, setMode] = useState("course");

  const [courses, setCourses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [session1, setSession1] = useState(null);
  const [session2, setSession2] = useState(null);

  const [teacherA, setTeacherA] = useState(null);
  const [teacherB, setTeacherB] = useState(null);

  // Fetch courses and sessions on mount
  useEffect(() => {
    fetchCourses();
    fetchSessions();
  }, []);

  // Fetch teachers when mode or selectedCourse changes
  useEffect(() => {
    if (mode === "course" && selectedCourse) {
      fetchTeachersByCourse(selectedCourse);
    } else if (mode === "session") {
      fetchAllTeachers();
    } else {
      setTeachers([]);
      setTeacherA(null);
      setTeacherB(null);
    }
  }, [mode, selectedCourse]);

  // Fetch all courses
  const fetchCourses = async () => {
    try {
      const res = await fetch(`${BASE_URL}/Performance/GetAllCourses`);
      const data = await res.json();
      setCourses(data.map((c) => ({ label: c, value: c })));
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };

  // Fetch all sessions
  const fetchSessions = async () => {
    try {
      const res = await fetch(`${BASE_URL}/Performance/GetSessions`);
      const data = await res.json();
      setSessions(data.map((s) => ({ label: s.name, value: s.id })));
    } catch (err) {
      console.error("Error fetching sessions:", err);
    }
  };

  // Fetch teachers for a specific course (latest session only)
  const fetchTeachersByCourse = async (course) => {
    try {
      const res = await fetch(
        `${BASE_URL}/Performance/GetTeachersByCourse?courseCode=${encodeURIComponent(course)}`
      );
      const data = await res.json();
      console.log("Teachers by course:", data);
      setTeachers(data.map((t) => ({ label: t.name, value: t.id })));
    } catch (err) {
      console.error("Error fetching teachers by course:", err);
    }
  };

  // Fetch all teachers (for session mode)
  const fetchAllTeachers = async () => {
    try {
      const res = await fetch(`${BASE_URL}/Performance/GetAllTeachers`);
      const data = await res.json();
      console.log("All teachers:", data);
      setTeachers(data.map((t) => ({ label: t.name, value: t.id })));
    } catch (err) {
      console.error("Error fetching all teachers:", err);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Detailed Comparison</Text>
        <Text style={styles.subtitle}>
          Compare teacher performance by course or session
        </Text>
      </View>

      {/* MODE SWITCH CARD */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Comparison Type</Text>
        <View style={styles.toggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, mode === "course" && styles.activeBtn]}
            onPress={() => setMode("course")}
          >
            <Text
              style={[styles.toggleText, mode === "course" && styles.activeText]}
            >
              Compare Teachers
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleBtn, mode === "session" && styles.activeBtn]}
            onPress={() => setMode("session")}
          >
            <Text
              style={[styles.toggleText, mode === "session" && styles.activeText]}
            >
              Compare Sessions
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ================= COURSE MODE ================= */}
      {mode === "course" && (
        <>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Step 1: Select Course</Text>
            <Dropdown
              style={styles.dropdown}
              data={courses}
              labelField="label"
              valueField="value"
              placeholder="Select Course"
              value={selectedCourse}
              onChange={(item) => {
                setSelectedCourse(item.value);
                setTeacherA(null);
                setTeacherB(null);
                setTeachers([]);
              }}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Step 2: Select Teachers</Text>

            <Text style={styles.label}>Teacher A</Text>
            <Dropdown
              style={styles.dropdown}
              data={teachers}
              labelField="label"
              valueField="value"
              placeholder="Select Teacher A"
              value={teacherA}
              onChange={(item) => setTeacherA(item.value)}
            />

            <Text style={styles.label}>Teacher B</Text>
            <Dropdown
              style={styles.dropdown}
              data={teachers.filter((t) => t.value !== teacherA)}
              labelField="label"
              valueField="value"
              placeholder="Select Teacher B"
              value={teacherB}
              onChange={(item) => setTeacherB(item.value)}
            />
          </View>
        </>
      )}

      {/* ================= SESSION MODE ================= */}
      {mode === "session" && (
        <>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Step 1: Select Teacher</Text>
            <Dropdown
              style={styles.dropdown}
              data={teachers}
              labelField="label"
              valueField="value"
              placeholder="Select Teacher"
              value={teacherA}
              onChange={(item) => setTeacherA(item.value)}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Step 2: Select Sessions</Text>

            <Text style={styles.label}>Session 1</Text>
            <Dropdown
              style={styles.dropdown}
              data={sessions}
              labelField="label"
              valueField="value"
              placeholder="Select Session 1"
              value={session1}
              onChange={(item) => setSession1(item.value)}
            />

            <Text style={styles.label}>Session 2</Text>
            <Dropdown
              style={styles.dropdown}
              data={sessions}
              labelField="label"
              valueField="value"
              placeholder="Select Session 2"
              value={session2}
              onChange={(item) => setSession2(item.value)}
            />
          </View>
        </>
      )}

      {/* BUTTON */}
      <TouchableOpacity
        style={styles.compareBtn}
        onPress={() =>
          navigation.navigate("ComparisonResult", {
            mode,
            teacherA,
            teacherB,
            courseCode: selectedCourse,
            session1,
            session2,
          })
        }
      >
        <Text style={styles.compareText}>Compare</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ComparisonScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f6f4",
  },
  header: {
    backgroundColor: "#166534",
    padding: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#d1fae5",
    fontSize: 12,
    marginTop: 4,
  },
  card: {
    backgroundColor: "#fff",
    margin: 15,
    padding: 15,
    borderRadius: 15,
    elevation: 4,
  },
  cardTitle: {
    fontWeight: "bold",
    marginBottom: 10,
    fontSize: 14,
  },
  toggle: {
    flexDirection: "row",
    gap: 10,
  },
  toggleBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
  },
  activeBtn: {
    backgroundColor: "#16a34a",
  },
  toggleText: {
    fontSize: 12,
    fontWeight: "600",
  },
  activeText: {
    color: "#fff",
  },
  dropdown: {
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    marginTop: 8,
    marginBottom: 4,
    color: "#555",
  },
  compareBtn: {
    backgroundColor: "#16a34a",
    marginHorizontal: 20,
    marginBottom: 30,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  compareText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
});