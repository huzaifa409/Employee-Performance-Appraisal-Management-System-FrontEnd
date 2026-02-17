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
  const { courseCode } = route.params;

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const type = encodeURIComponent("confidential evaluation");

      const response = await fetch(
        `${BASE_URL}/TeacherDashboard/GetActiveQuestionnaire/${type}`
      );

      const data = await response.json();

      if (!data?.Questions || data.Questions.length === 0) {
        Alert.alert("Info", "No confidential evaluation available");
        setQuestions([]);
        return;
      }

      setQuestions(data.Questions);
    } catch (error) {
      Alert.alert("Error", "Unable to load questions");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const selectOption = (questionID, score) => {
    setAnswers((prev) => ({ ...prev, [questionID]: score }));
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#28a745" />
      </View>
    );
  }

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

      {/* No submit button, since you don’t want to do anything */}
    </ScrollView>
  );
};

export default ConfidentialEvaluation;

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
  loader: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 50 },
});
