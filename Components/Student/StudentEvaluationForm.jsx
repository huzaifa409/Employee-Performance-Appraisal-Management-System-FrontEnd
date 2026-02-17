import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import BASE_URL from "../../API-URL/API";

const options = [
  { label: "Excellent", score: 4 },
  { label: "Good", score: 3 },
  { label: "Average", score: 2 },
  { label: "Poor", score: 1 },
];

const StudentEvaluation = ({ route, navigation }) => {
  const { enrollmentID, studentId, courseCode } = route.params;

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    fetchQuestions();
  }, []);

  // ================= FETCH QUESTIONS =================
  const fetchQuestions = async () => {
    try {
      const type = encodeURIComponent("student evaluation");

      const response = await fetch(
        `${BASE_URL}/TeacherDashboard/GetActiveQuestionnaire/${type}`
      );

      const data = await response.json();

      if (!data?.Questions || data.Questions.length === 0) {
        Alert.alert("Info", "No evaluation available");
        return;
      }

      setQuestions(data.Questions);
    } catch (error) {
      Alert.alert("Error", "Unable to load questions");
    }
  };

  // ================= SELECT ANSWER =================
  const selectOption = (questionID, score) => {
    setAnswers((prev) => ({ ...prev, [questionID]: score }));
  };

  // ================= SUBMIT =================
  const submitEvaluation = async () => {
    if (questions.length !== Object.keys(answers).length) {
      Alert.alert("Error", "Please answer all questions");
      return;
    }

    const payload = Object.keys(answers).map((qid) => ({
      EnrollmentID: enrollmentID,
      QuestionID: parseInt(qid),
      Score: answers[qid],
      StudentId: studentId,
    }));

    try {
      const response = await fetch(
        `${BASE_URL}/StudentDashboard/SubmitStudentEvaluation`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (result.success) {
        Alert.alert("Success", "Evaluation submitted", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert("Error", "Submission failed");
      }
    } catch (error) {
      Alert.alert("Error", "Unable to submit evaluation");
    }
  };

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={styles.heading}>Student Evaluation</Text>
      <Text style={styles.sub}>Course: {courseCode}</Text>

      {questions.map((q, index) => (
        <View key={q.QuestionID} style={styles.card}>
          <Text style={styles.qNo}>{index + 1}</Text>
          <Text style={styles.qText}>{q.QuestionText}</Text>

          <View style={styles.optionsWrap}>
            {options.map((opt) => (
              <TouchableOpacity
                key={opt.label}
                style={[
                  styles.option,
                  answers[q.QuestionID] === opt.score && styles.selected,
                ]}
                onPress={() => selectOption(q.QuestionID, opt.score)}
              >
                <Text>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.submitBtn} onPress={submitEvaluation}>
        <Text style={{ color: "#fff", fontWeight: "700" }}>
          Submit Evaluation
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default StudentEvaluation;

const styles = StyleSheet.create({
  heading: { fontSize: 18, fontWeight: "700", marginBottom: 6 },
  sub: { color: "#666", marginBottom: 16 },
  card: {
    backgroundColor: "#f0fdf4",
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
  },
  qNo: {
    backgroundColor: "#dcfce7",
    width: 30,
    height: 30,
    borderRadius: 15,
    textAlign: "center",
    textAlignVertical: "center",
    marginBottom: 8,
    fontWeight: "700",
  },
  qText: { fontSize: 14, marginBottom: 12 },
  optionsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  option: {
    borderWidth: 1,
    borderColor: "#86efac",
    padding: 10,
    borderRadius: 10,
    width: "48%",
    alignItems: "center",
  },
  selected: { backgroundColor: "#bbf7d0" },
  submitBtn: {
    backgroundColor: "#166534",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 20,
  },
});
