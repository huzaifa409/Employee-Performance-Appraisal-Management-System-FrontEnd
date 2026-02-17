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

import BASE_URL from "../../API-URL/API";


const StudentDashboard = ({ userId, navigation }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [evaluationActive, setEvaluationActive] = useState(false);
  const [confidentialActive, setConfidentialActive] = useState(false);
  const [submittedEnrollments, setSubmittedEnrollments] = useState([]);



  const [studentName, setStudentName] = useState("");


 const fetchSubmittedEvaluations = async () => {
  try {
    const response = await fetch(
      `${BASE_URL}/studentDashboard/GetSubmittedStudentEvaluations/${userId}`
    );

    const data = await response.json();

    // ✅ API already returns enrollmentID array
    setSubmittedEnrollments(data);
  } catch (error) {
    console.log("Submitted eval error:", error);
    setSubmittedEnrollments([]);
  }
};



  const Eval = encodeURIComponent("confidential evaluation".trim().toLowerCase());
  const fetchConfidentialFlag = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/TeacherDashboard/GetActiveQuestionnaire/${Eval}`
      );

      if (!response.ok) {
        setConfidentialActive(false);
        return;
      }

      const data = await response.json();
      setConfidentialActive(data?.Flag === "1");
    } catch {
      setConfidentialActive(false);
    }
  };






  // ================= FETCH STUDENT NAME =================
  const evaluationType = encodeURI("Student Evaluation".trim().toLowerCase());
  const fetchStudentName = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/studentDashboard/GetStudentName/${userId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch student name");
      }

      const name = await response.json();
      setStudentName(name);
    } catch (error) {
      console.error("Student name error:", error);
      setStudentName("Student");
    }
  };

  // ================= FETCH COURSES =================
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

      const mappedData = data.map(item => ({
        EnrollmentID: item.EnrollmentID,
        CourseCode: item.CourseCode,
        CourseTitle: item.CourseTitle,
        TeacherName: item.TeacherName,
        SessionName: item.SessionName,
      }));

      setCourses(mappedData);
      fetchEvaluationFlag();
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  // ================= FETCH EVALUATION FLAG =================
  const fetchEvaluationFlag = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/TeacherDashboard/GetActiveQuestionnaire/${evaluationType}`
      );

      if (!response.ok) {
        setEvaluationActive(false);
        return;
      }

      const data = await response.json();
      setEvaluationActive(data.Flag === "1");
    } catch {
      setEvaluationActive(false);
    }
  };

  useEffect(() => {
    fetchStudentName();
    fetchCourses();
    fetchConfidentialFlag();
      fetchSubmittedEvaluations();
  }, [userId]);

  // ================= RENDER COURSE =================
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
            })
          }
        >
          <Text style={styles.evaluateButtonText}>Evaluate</Text>
        </TouchableOpacity>
      ) : (
        <View
          style={[
            styles.evaluateButton,
            { backgroundColor: "#6c757d" },
          ]}
        >
          <Text style={styles.evaluateButtonText}>
            {alreadyEvaluated ? "Already Evaluated" : "Evaluation will be on soon"}
          </Text>
        </View>
      )}
    </View>
  );
};


  // ================= LOADER =================
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#28a745" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* STUDENT HEADER */}
      <View style={styles.profileContainer}>
        <View style={styles.profileText}>
          <Text style={styles.studentName}>{studentName}</Text>
          <Text style={styles.studentId}>{userId}</Text>
        </View>

        <TouchableOpacity
          disabled={!confidentialActive}
          style={[
            styles.confidentialButton,
            { opacity: confidentialActive ? 1 : 0.5 },
          ]}
          onPress={() => {
            if (!confidentialActive) return;

            navigation.navigate("Confidential", {
              confidential: true,
              studentId: userId,
            });
          }}
        >
          <Text style={styles.confidentialButtonText}>
            Confidential Evaluation
          </Text>
        </TouchableOpacity>

      </View>

      {/* PAGE HEADER */}
      <Text style={styles.headerTitle}>Teacher Evaluation</Text>
      <Text style={styles.headerSubtitle}>
        Review and evaluate your courses for the current semester
      </Text>

      {/* COURSE LIST */}
      <FlatList
        data={courses}
        keyExtractor={item => item.EnrollmentID.toString()}
        renderItem={renderCourse}
        contentContainerStyle={{ paddingBottom: 20 }}
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
  confidentialButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },

  headerTitle: { fontSize: 18, fontWeight: "700", marginBottom: 5 },
  headerSubtitle: { fontSize: 14, color: "#6c757d", marginBottom: 10 },

  courseCard: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
  },
  courseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
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
});

export default StudentDashboard;
