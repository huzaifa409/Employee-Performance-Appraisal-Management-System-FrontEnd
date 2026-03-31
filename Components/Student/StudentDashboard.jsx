import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // for storing token
import BASE_URL from "../../API-URL/API";

const StudentDashboard = ({ userId, navigation,onLogout  }) => {
  
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [evaluationActive, setEvaluationActive] = useState(false);
  const [confidentialActive, setConfidentialActive] = useState(false);
  const [submittedEnrollments, setSubmittedEnrollments] = useState([]);
  const [studentName, setStudentName] = useState("");

  // ================= FETCH SUBMITTED =================
  const fetchSubmittedEvaluations = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/studentDashboard/GetSubmittedStudentEvaluations/${userId}`
      );
      const data = await response.json();
      setSubmittedEnrollments(data);
    } catch (error) {
      console.log("Submitted eval error:", error);
      setSubmittedEnrollments([]);
    }
  };

  // ================= STUDENT NAME =================
  const fetchStudentName = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/studentDashboard/GetStudentName/${userId}`
      );
      const name = await response.json();
      setStudentName(name);
    } catch {
      setStudentName("Student");
    }
  };

  // ================= COURSES =================
  const fetchCourses = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/studentDashboard/enrollments/${userId}`
      );

      if (!response.ok) {
        Alert.alert("Error", "Unable to fetch courses");
        setCourses([]);
        return;
      }

      const data = await response.json();

      const mappedData = data.map((item) => ({
        EnrollmentID: item.EnrollmentID,
        CourseCode: item.CourseCode,
        CourseTitle: item.CourseTitle,
        TeacherName: item.TeacherName,
        SessionName: item.SessionName,
        SessionID: item.SessionID,
      }));

      setCourses(mappedData);
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  // ================= EVALUATION FLAGS =================
  const fetchEvaluationFlags = async () => {
    try {
      const studentEvalType = encodeURIComponent("student evaluation");
      const confidentialEvalType = encodeURIComponent("confidential evaluation");

      // Student Evaluation
      const studentResp = await fetch(
        `${BASE_URL}/TeacherDashboard/GetActiveQuestionnaire/${studentEvalType}`
      );
      const studentData = await studentResp.json();
      setEvaluationActive(studentData?.Flag === "1");

      // Confidential Evaluation
      const confResp = await fetch(
        `${BASE_URL}/TeacherDashboard/GetActiveQuestionnaire/${confidentialEvalType}`
      );
      const confData = await confResp.json();
      setConfidentialActive(confData?.Flag === "1");
    } catch (error) {
      setEvaluationActive(false);
      setConfidentialActive(false);
    }
  };

  // ================= LOGOUT =================
// ================= LOGOUT =================
const handleLogout = () => {
  Alert.alert(
    "Logout",
    "Are you sure you want to log out?",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          if (onLogout) {
            onLogout(); // call parent logout function
          }
        },
      },
    ]
  );
};

  // ================= EFFECT =================
  useEffect(() => {
    fetchStudentName();
    fetchCourses();
    fetchSubmittedEvaluations();
    fetchEvaluationFlags();
  }, [userId]);

  // ================= RENDER COURSE =================
  const renderCourse = ({ item }) => {
    const alreadyEvaluated = submittedEnrollments.includes(item.EnrollmentID);

    return (
      <View style={styles.courseCard}>
        <View style={styles.courseHeader}>
          <Text style={styles.courseCode}>{item.CourseCode}</Text>
          <Text style={styles.session}>{item.SessionName}</Text>
        </View>

        <Text style={styles.courseTitle}>{item.CourseTitle}</Text>
        <Text style={styles.teacherName}>{item.TeacherName}</Text>

        {evaluationActive && !alreadyEvaluated ? (
          <TouchableOpacity
            style={styles.evaluateButton}
            onPress={() =>
              navigation.navigate("StudentEvaluation", {
                enrollmentID: item.EnrollmentID,
                studentId: userId,
                courseCode: item.CourseCode,
                sessionID: item.SessionID,
              })
            }
          >
            <Text style={styles.evaluateButtonText}>Evaluate</Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.evaluateButton, { backgroundColor: "#6c757d" }]}>
            <Text style={styles.evaluateButtonText}>
              {alreadyEvaluated ? "Already Evaluated" : "Evaluation Closed"}
            </Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#28a745" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ========== PROFILE & LOGOUT ========== */}
      <View style={styles.profileContainer}>
        <View style={styles.profileText}>
          <Text style={styles.studentName}>{studentName}</Text>
          <Text style={styles.studentId}>{userId}</Text>
        </View>

        <View style={{ flexDirection: "column", alignItems: "flex-end" }}>
          <TouchableOpacity
            disabled={!confidentialActive}
            style={[
              styles.confidentialButton,
              { opacity: confidentialActive ? 1 : 0.5, marginBottom: 5 },
            ]}
            onPress={() =>
              confidentialActive &&
              navigation.navigate("Confidential", {
                studentId: userId,
              })
            }
          >
            <Text style={styles.confidentialButtonText}>
              Confidential Evaluation
            </Text>
          </TouchableOpacity>

          
        </View>
      </View>

      <Text style={styles.headerTitle}>Teacher Evaluation</Text>

    <FlatList
  data={courses}
  keyExtractor={(item) => item.EnrollmentID.toString()}
  renderItem={renderCourse}
/>



{/* Bottom logout button */}
<TouchableOpacity
  style={[styles.logoutButton]}
  onPress={handleLogout}
>
  <Text style={styles.logoutButtonText}>Logout</Text>
</TouchableOpacity>
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
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
  },
  profileText: { flex: 1 },
  studentName: { fontSize: 16, fontWeight: "600", color: "#343a40" },
  studentId: { fontSize: 12, color: "#6c757d" },
  confidentialButton: {
    backgroundColor: "#28a745",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  confidentialButtonText: { color: "#ffffff", fontSize: 12, fontWeight: "bold" },
  headerTitle: { fontSize: 18, fontWeight: "700", marginBottom: 5 },
  courseCard: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
  },
  courseHeader: { flexDirection: "row", justifyContent: "space-between" },
  courseCode: {
    backgroundColor: "#d4edda",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    fontWeight: "bold",
  },
  session: { fontSize: 12, color: "#6c757d" },
  courseTitle: { fontSize: 16, fontWeight: "600" },
  teacherName: { fontSize: 14, color: "#6c757d", marginBottom: 10 },
  evaluateButton: {
    backgroundColor: "#28a745",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  evaluateButtonText: { color: "#ffffff", fontWeight: "bold" },

  logoutButton: {
  backgroundColor: "#dc3545",
  paddingVertical: 12,
  alignItems: "center",
  borderRadius: 8,
  marginTop: 20,
  marginBottom: 30,
},

logoutButtonText: {
  color: "#fff",
  fontWeight: "bold",
  fontSize: 16,
},
});

export default StudentDashboard;