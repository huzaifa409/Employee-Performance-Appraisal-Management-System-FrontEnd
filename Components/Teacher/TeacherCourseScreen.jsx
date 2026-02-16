import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import BASE_URL from "../../API-URL/API";

const TeachersCoursesScreen = ({ navigation, route }) => {
  const { evaluatorID } = route.params;
  const [data, setData] = useState([]);
  const [submitted, setSubmitted] = useState({}); // track submitted courses

  const fetchTeachersCourses = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/TeacherDashboard/GetTeachersWithCourses`
      );
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSubmittedEvaluations = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/TeacherDashboard/GetSubmittedEvaluations?evaluatorID=${evaluatorID}`
      );
      const result = await response.json();
      const submittedMap = {};
      result.forEach((item) => {
        submittedMap[`${item.TeacherID}_${item.CourseCode}`] = true;
      });
      setSubmitted(submittedMap);
    } catch (error) {
      console.error(error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchTeachersCourses();
      fetchSubmittedEvaluations();
    }, [])
  );

  const renderCourse = (teacher, course) => {
    const key = `${teacher.TeacherID}_${course}`;
    const isSubmitted = submitted[key];

    return (
      <View style={styles.card} key={course}>
        <Text style={styles.courseCode}>{course}</Text>
        <Text style={styles.teacherName}>Instructor: {teacher.TeacherName}</Text>

        <TouchableOpacity
          style={[
            styles.evaluateBtn,
            isSubmitted && { backgroundColor: "#B0B0B0" },
          ]}
          disabled={isSubmitted}
          onPress={() =>
            navigation.navigate("PeerEvaluationScreen", {
              courseCode: course,
              teacherID: teacher.TeacherID,
              evaluatorID: evaluatorID,
            })
          }
        >
          <Text style={styles.btnText}>
            {isSubmitted ? "Evaluated" : "Evaluate"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcome}>Welcome, Teacher 👋</Text>
        <Text style={styles.sub}>Your Courses & Evaluations</Text>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.TeacherID.toString()}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View>{item.Courses.map((course) => renderCourse(item, course))}</View>
        )}
      />
    </ScrollView>
  );
};

export default TeachersCoursesScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fa" },

  header: { padding: 20 },
  welcome: { fontSize: 22, fontWeight: "800", color: "#0f4c75", marginBottom: 4 },
  sub: { fontSize: 16, color: "#3282b8", fontWeight: "600" },

  card: {
    backgroundColor: "#40991d",
    padding: 18,
    borderRadius: 16,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },

  courseCode: {
    backgroundColor: "#3282b8",
    color: "#fff",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    fontWeight: "700",
    marginBottom: 10,
    fontSize: 14,
    letterSpacing: 0.5,
  },

  teacherName: { color: "#1b262c", fontSize: 16, fontWeight: "600", marginBottom: 14 },

  evaluateBtn: {
    backgroundColor: "#0f4c75",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#0f4c75",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },

  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
