import React, { useState } from "react";
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
      const response = await fetch(`${BASE_URL}/TeacherDashboard/GetTeachersWithCourses`);
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
      <View style={[styles.card, isSubmitted && { opacity: 0.7 }]} key={course}>
        <View style={styles.cardHeader}>
          <Text style={styles.courseCode}>{course}</Text>
          <Text style={styles.teacherName}>{teacher.TeacherName}</Text>
        </View>

        <TouchableOpacity
          style={[styles.evaluateBtn, isSubmitted && styles.evaluateBtnDisabled]}
          disabled={isSubmitted}
          onPress={() =>
            navigation.navigate("PeerEvaluationScreen", {
              courseCode: course,
              teacherID: teacher.TeacherID,
              evaluatorID: evaluatorID,
            })
          }
        >
          <Text style={styles.btnText}>{isSubmitted ? "Evaluated" : "Evaluate"}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcome}>Hello, Teacher 👋</Text>
        <Text style={styles.sub}>Check your courses & evaluations</Text>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.TeacherID.toString()}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        renderItem={({ item }) => <View>{item.Courses.map((course) => renderCourse(item, course))}</View>}
      />
    </ScrollView>
  );
};

export default TeachersCoursesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f6ff",
  },
  header: {
    padding: 20,
    backgroundColor: "#019c0c",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  welcome: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 6,
  },
  sub: {
    fontSize: 16,
    fontWeight: "600",
    color: "#dbe4ff",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6, // Android shadow
  },
  cardHeader: {
    marginBottom: 16,
  },
  courseCode: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4c6ef5",
    marginBottom: 6,
  },
  teacherName: {
    fontSize: 15,
    color: "#495057",
    fontWeight: "600",
  },
  evaluateBtn: {
    backgroundColor: "#4c6ef5",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#4c6ef5",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  evaluateBtnDisabled: {
    backgroundColor: "#adb5bd",
  },
  btnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});