import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator, 
  Alert, 
  Image 
} from "react-native";

import BASE_URL from "../../API-URL/API";

const StudentDashboard = ({ userId, navigation }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [evaluationActive, setEvaluationActive] = useState(false);

  const evaluationType = "Student Evaluation"; // <-- dynamically set type here

  // Replace these with real student info if needed
  const [studentInfo, setStudentInfo] = useState({
    name: "Sarah Ahmed",
    profileId: "22-Arid-3906",
    profilePic: "https://i.pravatar.cc/150?img=47",
  });

  // Fetch courses
  const fetchCourses = async () => {
    try {
      const response = await fetch(`${BASE_URL}/studentDashboard/enrollments/${userId}`);
      if (!response.ok) {
        const text = await response.text();
        console.error("API Error Response:", text);
        Alert.alert("Error", `API returned ${response.status}`);
        setCourses([]);
        return;
      }

      const data = await response.json();
      const mappedData = data.map((item) => ({
        EnrollmentID: item.id,
        CourseCode: item.courseCode,
        CourseTitle: `Course ${item.courseCode}`,
        TeacherName: `Teacher ${item.teacherID}`,
        SessionName: `Session ${item.sessionID}`,
      }));

      setCourses(mappedData);

      // Fetch evaluation flag after courses
      fetchEvaluationFlag();
    } catch (error) {
      console.error("Fetch Courses Error:", error);
      Alert.alert("Error", `Unable to fetch courses: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch evaluation flag
  const fetchEvaluationFlag = async () => {
    try {
      const response = await fetch(`${BASE_URL}/TeacherDashboard/GetActiveQuestionnaire/${evaluationType}`);
      if (!response.ok) {
        console.error("Evaluation API Error:", response.status);
        setEvaluationActive(false);
        return;
      }

      const data = await response.json();
      console.log("Evaluation Flag Data:", data);

      // Check if Flag === "1"
      if (data.Flag === "1") {
        setEvaluationActive(true);
      } else {
        setEvaluationActive(false);
      }
    } catch (error) {
      console.error("Evaluation fetch error:", error);
      setEvaluationActive(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [userId]);

  const renderCourse = ({ item }) => (
    <View style={styles.courseCard}>
      <View style={styles.courseHeader}>
        <Text style={styles.courseCode}>{item.CourseCode}</Text>
        <Text style={styles.session}>{item.SessionName}</Text>
      </View>
      <Text style={styles.courseTitle}>{item.CourseTitle}</Text>
      <Text style={styles.teacherName}>{item.TeacherName}</Text>

      {evaluationActive ? (
        <TouchableOpacity
          style={styles.evaluateButton}
          onPress={() =>
            navigation.navigate("EvaluateCourse", { enrollmentId: item.EnrollmentID })
          }
        >
          <Text style={styles.evaluateButtonText}>Evaluate</Text>
        </TouchableOpacity>
      ) : (
        <View style={[styles.evaluateButton, { backgroundColor: "#6c757d" }]}>
          <Text style={styles.evaluateButtonText}>Evaluation will be on soon</Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#28a745" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Profile Section */}
      <View style={styles.profileContainer}>
        <Image source={{ uri: studentInfo.profilePic }} style={styles.profileImage} />
        <View style={styles.profileText}>
          <Text style={styles.studentName}>{studentInfo.name}</Text>
          <Text style={styles.studentId}>{studentInfo.profileId}</Text>
        </View>
        <TouchableOpacity style={styles.confidentialButton}>
          <Text style={styles.confidentialButtonText}>Confidential Evaluation</Text>
        </TouchableOpacity>
      </View>

      {/* Header */}
      <Text style={styles.headerTitle}>Teacher Evaluation</Text>
      <Text style={styles.headerSubtitle}>
        Review and evaluate your courses for the current semester
      </Text>

      {/* Course List */}
      <FlatList
        data={courses}
        keyExtractor={(item) => item.EnrollmentID.toString()}
        renderItem={renderCourse}
        contentContainerStyle={{ paddingBottom: 20 }}
        style={{ marginTop: 10 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", padding: 15 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 10,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
  },
  profileImage: { width: 50, height: 50, borderRadius: 25 },
  profileText: { flex: 1, marginLeft: 10 },
  studentName: { fontSize: 16, fontWeight: "600", color: "#343a40" },
  studentId: { fontSize: 12, color: "#6c757d" },
  confidentialButton: { backgroundColor: "#28a745", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  confidentialButtonText: { color: "#ffffff", fontSize: 12, fontWeight: "bold" },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#343a40", marginBottom: 5 },
  headerSubtitle: { fontSize: 14, color: "#6c757d", marginBottom: 10 },
  courseCard: { backgroundColor: "#ffffff", borderRadius: 10, padding: 15, marginBottom: 15, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 5, elevation: 3 },
  courseHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  courseCode: { backgroundColor: "#d4edda", color: "#155724", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5, fontWeight: "bold" },
  session: { fontSize: 12, color: "#6c757d" },
  courseTitle: { fontSize: 16, fontWeight: "600", marginBottom: 3, color: "#343a40" },
  teacherName: { fontSize: 14, color: "#6c757d", marginBottom: 10 },
  evaluateButton: { backgroundColor: "#28a745", borderRadius: 8, paddingVertical: 10, alignItems: "center" },
  evaluateButtonText: { color: "#ffffff", fontWeight: "bold", fontSize: 14 },
});

export default StudentDashboard;
