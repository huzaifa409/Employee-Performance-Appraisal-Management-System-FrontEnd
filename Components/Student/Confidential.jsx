import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import BASE_URL from "../../API-URL/API";

const Confidential = ({ route, navigation }) => {
  const { studentId } = route.params;

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/studentDashboard/enrollments/${studentId}`
      );

      if (!response.ok) {
        Alert.alert("Error", "Unable to fetch courses");
        return;
      }

      const data = await response.json();
      setCourses(data);
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const renderCourse = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.code}>{item.CourseCode}</Text>
      <Text style={styles.title}>{item.CourseTitle}</Text>
      <Text style={styles.teacher}>{item.TeacherName}</Text>
      <Text style={styles.session}>{item.SessionName}</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          navigation.navigate("ConfidentialEvaluation", {
            enrollmentID: item.EnrollmentID,
            courseCode: item.CourseCode,
            teacherID: item.TeacherID,
          })
        }
      >
        <Text style={styles.buttonText}>Evaluate</Text>
      </TouchableOpacity>
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
      <Text style={styles.header}>Confidential Evaluation</Text>

      <FlatList
        data={courses}
        keyExtractor={(item) => item.EnrollmentID.toString()}
        renderItem={renderCourse}
      />
    </View>
  );
};

export default Confidential;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#f8f9fa" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
  },

  code: {
    fontWeight: "bold",
    backgroundColor: "#d1ecf1",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 5,
  },

  title: { fontSize: 16, fontWeight: "600", marginTop: 5 },
  teacher: { color: "#6c757d" },
  session: { fontSize: 12, color: "#6c757d", marginBottom: 10 },

  button: {
    backgroundColor: "#28a745",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
