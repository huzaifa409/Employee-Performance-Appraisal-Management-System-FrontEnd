import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import BASE_URL from "../../API-URL/API";

const options = [
  { label: "Excellent", score: 4 },
  { label: "Good", score: 3 },
  { label: "Average", score: 2 },
  { label: "Poor", score: 1 },
];

const ConfidentialEvaluation = ({ route }) => {
  const { enrollmentID, courseCode, teacherID, studentId } = route.params;

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  // Fetch Questions
  const fetchQuestions = async () => {
    try {
      const type = encodeURIComponent("confidential evaluation");

      const response = await fetch(
        `${BASE_URL}/TeacherDashboard/GetActiveQuestionnaire/${type}`
      );

      if (!response.ok) {
        throw new Error("Server error while fetching questions");
      }

      const data = await response.json();

      if (!data?.Questions?.length) {
        Alert.alert("Info", "No confidential evaluation available");
        setQuestions([]);
        return;
      }

      setQuestions(data.Questions);
    } catch (error) {
      console.log("Fetch Question Error:", error);
      Alert.alert("Error", "Unable to load questions");
    } finally {
      setLoading(false);
    }
  };

  // Select option
  const selectOption = (questionID, score) => {
    setAnswers((prev) => ({
      ...prev,
      [questionID]: score,
    }));
  };

  // Submit evaluation
  const handleSubmit = async () => {
    if (Object.keys(answers).length !== questions.length) {
      Alert.alert("Error", "Please answer all questions");
      return;
    }

    const payload = {
      EnrollmentId: enrollmentID,
      StudentId: studentId,
      Answers: questions.map((q) => ({
        questionId: q.QuestionID,
        score: answers[q.QuestionID],
      })),
    };

    console.log("Submitting Payload:", payload);

    try {
      setSubmitting(true);

      const response = await fetch(
        `${BASE_URL}/studentDashboard/SubmitConfidentialEvaluation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
        
      );

      const text = await response.text();
      console.log("Server Response:", text);

      if (!response.ok) {
        Alert.alert("Server Error", text);
        return;
      }

      Alert.alert("Success", "Evaluation submitted successfully");

    } catch (error) {
      console.log("Submit Error:", error);
      Alert.alert("Error", "Failed to submit evaluation");
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#28a745" />
      </View>
    );
  }

  // No questions
  if (!questions.length) {
    return (
      <View style={styles.loader}>
        <Text>No confidential evaluation available.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={styles.heading}>Confidential Evaluation</Text>
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

      <TouchableOpacity
        style={styles.submitBtn}
        onPress={handleSubmit}
        disabled={submitting}
      >
        <Text style={styles.submitText}>
          {submitting ? "Submitting..." : "Submit Evaluation"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ConfidentialEvaluation;

const styles = StyleSheet.create({
  heading: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },

  sub: {
    color: "#666",
    marginBottom: 16,
  },

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

  qText: {
    fontSize: 14,
    marginBottom: 12,
  },

  optionsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  option: {
    borderWidth: 1,
    borderColor: "#86efac",
    padding: 10,
    borderRadius: 10,
    width: "48%",
    alignItems: "center",
  },

  selected: {
    backgroundColor: "#bbf7d0",
  },

  submitBtn: {
    backgroundColor: "#16a34a",
    padding: 15,
    borderRadius: 14,
    alignItems: "center",
    marginVertical: 20,
  },

  submitText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
});