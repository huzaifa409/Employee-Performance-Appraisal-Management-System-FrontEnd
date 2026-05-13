import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Button
} from "react-native";
import BASE_URL from "../../API-URL/API";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initDB, saveEvaluationLocal } from "../../Database/db";




// Clear Asyn Storage


// const clearAllStorage = async () => {
//   try {
//     await AsyncStorage.clear();
//     console.log('AsyncStorage cleared');
//   } catch (error) {
//     console.log('Clear Error:', error);
//   }
// };

const options = [
  { label: "Excellent", score: 4 },
  { label: "Good", score: 3 },
  { label: "Average", score: 2 },
  { label: "Poor", score: 1 },
];

const ConfidentialEvaluation = ({ route, navigation }) => {
  const { enrollmentID, courseCode, teacherID, studentId ,session } = route.params;
  console.log(session);

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    initDB();
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

  teacherId: teacherID,
  sessionId: session,
  courseCode: courseCode,

  Answers: questions.map((q) => ({
    questionID: q.QuestionID,
    questionText: q.QuestionText,
    score: answers[q.QuestionID],
  })),
};

    try {
      setSubmitting(true);

      // =========================
      // SAVE LOCALLY SQLITE
      // =========================
      await saveEvaluationLocal(
        enrollmentID,
        studentId,
        payload
      );

      // =========================
      // SEND TO SERVER
      // =========================
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

      if (!response.ok) {
        console.log("SERVER RESPONSE:", text);
        Alert.alert("Server Error", text);
        return;
      }

      // =========================
      // SAVE EVALUATED STATUS
      // =========================
      const key = `confidential_${studentId}_${enrollmentID}`;

      await AsyncStorage.setItem(key, "true");

      Alert.alert(
        "Success",
        "Evaluation submitted successfully",
        [
          {
            text: "OK",
            onPress: () => {
              // GO BACK
              navigation.goBack();
            },
          },
        ]
      );

    } catch (error) {
      console.log("Submit Error:", error);

      Alert.alert(
        "Error",
        "Submission failed"
      );
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

      {/* <View>
        <Button onPress={clearAllStorage} title="Clear"/> 
      </View> */}

      
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