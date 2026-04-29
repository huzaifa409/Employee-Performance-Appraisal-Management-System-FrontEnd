import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import BASE_URL from "../../API-URL/API";

const EvaluateChairPersonForm = ({ route, navigation }) => {
  // Received from the previous Chairperson list screen
  const { mentorId, sessionId, societyId, userId } = route.params;

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // Stores { questionId: score }

  const options = [
    { label: "Excellent", value: 4 },
    { label: "Good", value: 3 },
    { label: "Average", value: 2 },
    { label: "Poor", value: 1 },
  ];

  /* ================= FETCH QUESTIONNAIRE ================= */
  useEffect(() => {
    const fetchQuestionnaire = async () => {
      try {
        // Specifically requesting Chairperson evaluation questions
        const type = "Society Chairperson Evaluation";
        const res = await fetch(`${BASE_URL}/TeacherDashboard/GetActiveQuestionnaire/${type}`);
        const data = await res.json();

        if (data && data.Questions) {
          setQuestions(data.Questions);
        } else {
          Alert.alert("Notice", "No active Chairperson questionnaire found.");
        }
      } catch (err) {
        console.error("Fetch Error:", err);
        Alert.alert("Error", "Failed to load evaluation form.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionnaire();
  }, []);

  /* ================= HANDLE SUBMIT ================= */
  const handleSubmit = async () => {
    // Check if all questions are answered
    if (Object.keys(answers).length < questions.length) {
      Alert.alert("Incomplete", "Please answer all questions before submitting.");
      return;
    }

    // Map answers to the List<SocietyEvaluationDTO> format
    const evaluationPayload = questions.map((q) => ({
      EvaluatorId: userId,
      EvaluateeId: mentorId, // The Chairperson ID
      SocietyId: societyId,
      QuestionId: q.QuestionID,
      Score: answers[q.QuestionID],
      SessionId: sessionId,  // Sent from the selected dropdown in previous screen
      EvaluationType: "Chairperson", // Matches your backend logic
    }));

    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/SocietyEvaluation/Submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(evaluationPayload),
      });

      const result = await res.json();

      if (result.success) {
        Alert.alert("Success", "Chairperson evaluation submitted!", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      } else {
        // This will catch your custom DB Constraint messages
        Alert.alert("Error", result.error || "Submission failed.");
      }
    } catch (err) {
      console.error("Submit Error:", err);
      Alert.alert("Error", "Connection error. Check your API.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER BREADCRUMB */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={20} color="#166534" />
        <Text style={styles.backText}>Back to chairpersons list</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.headerTitle}>Chairperson Evaluation Form</Text>
        <Text style={styles.headerSubtitle}>Rate chairperson leadership and performance</Text>

        {/* QUESTIONS LIST */}
        {questions.map((item, index) => (
          <View key={item.QuestionID} style={styles.questionCard}>
            <View style={styles.indexCircle}>
              <Text style={styles.indexText}>{index + 1}</Text>
            </View>
            
            <Text style={styles.questionText}>{item.QuestionText}</Text>

            {/* OPTIONS GRID (2x2) */}
            <View style={styles.optionsGrid}>
              {options.map((opt) => {
                const isSelected = answers[item.QuestionID] === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    activeOpacity={0.7}
                    style={[
                      styles.optionButton,
                      isSelected && styles.optionButtonSelected
                    ]}
                    onPress={() => setAnswers({ ...answers, [item.QuestionID]: opt.value })}
                  >
                    <Text style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected
                    ]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        {/* SUBMIT BUTTON */}
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitBtnText}>Submit Evaluation</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default EvaluateChairPersonForm;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f8f4", padding: 16 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  backBtn: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  backText: { color: "#166534", marginLeft: 5, fontWeight: "600" },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "#333" },
  headerSubtitle: { fontSize: 14, color: "#666", marginBottom: 20 },
  
  questionCard: {
    backgroundColor: "#ecfdf5",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#d1fae5",
  },
  indexCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#d1fae5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  indexText: { fontWeight: "bold", color: "#065f46" },
  questionText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 20,
    lineHeight: 22,
    fontWeight: "600"
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  optionButton: {
    width: "48%",
    backgroundColor: "#fff",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  optionButtonSelected: {
    backgroundColor: "#bbf7d0",
    borderColor: "#16a34a",
  },
  optionText: {
    color: "#444",
    fontSize: 14,
    fontWeight: "500",
  },
  optionTextSelected: {
    color: "#166534",
    fontWeight: "bold",
  },
  submitBtn: {
    backgroundColor: "#16a34a",
    paddingVertical: 18,
    borderRadius: 35,
    alignItems: "center",
    marginTop: 10,
    elevation: 4,
  },
  submitBtnText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});