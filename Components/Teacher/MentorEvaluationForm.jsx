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

const MentorEvaluationForm = ({ route, navigation }) => {
  // Destructure params passed from the previous screen
  const { mentorId, sessionId, societyId, userId } = route.params;
  console.log("ROUTE PARAMS:", route.params);

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // Stores { questionId: scoreValue }

  // Rating mapping (adjust values based on your scoring system)
  const options = [
    { label: "Excellent", value: 4 },
    { label: "Good", value: 3 },
    { label: "Average", value: 2 },
    { label: "Poor", value: 1 },
  ];

  /* ================= FETCH QUESTIONS ================= */
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const type = "Society Mentor Evaluation";
        const res = await fetch(`${BASE_URL}/TeacherDashboard/GetActiveQuestionnaire/${type}`);
        const data = await res.json();

        if (data && data.Questions) {
          setQuestions(data.Questions);
        } else {
          Alert.alert("Notice", "No active questionnaire found.");
        }
      } catch (err) {
        console.error("Fetch Questions Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);


//   handleSubmit

const handleSubmit = async () => {
  if (questions.length === 0) {
    Alert.alert("Error", "No questions found");
    return;
  }

  if (Object.keys(answers).length !== questions.length) {
    Alert.alert("Incomplete", "Please answer all questions");
    return;
  }

  // 🔥 CLEAN + SAFE VALUES
  const cleanId = (val) => {
    return val ? String(val).replace(/\s+/g, "").trim() : "";
  };

  const evaluationPayload = questions.map((q) => ({
    EvaluatorId: cleanId(userId),
    EvaluateeId: cleanId(mentorId),
    SocietyId: Number(societyId),
    QuestionId: q.QuestionID,
    Score: answers[q.QuestionID],
    SessionId: Number(sessionId),
    EvaluationType: "Mentor"
  }));

  // 🔥 DEBUG (IMPORTANT)
  console.log("PAYLOAD SENT:", JSON.stringify(evaluationPayload, null, 2));

  try {
    setLoading(true);

    const res = await fetch(`${BASE_URL}/SocietyEvaluation/Submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(evaluationPayload)
    });

    const result = await res.json();

    console.log("API RESPONSE:", result);

   if (result.success) {
  // 🔥 CALL CALLBACK BEFORE GOING BACK
  if (route.params?.onSubmitSuccess) {
    route.params.onSubmitSuccess(mentorId);
  }

  Alert.alert("Success", "Evaluation submitted successfully", [
    { text: "OK", onPress: () => navigation.goBack() }
  ]);

    } else {
      Alert.alert("Error", result.error || "Submission failed");

      // 🔥 IMPORTANT DEBUG INFO FROM BACKEND
      if (result.debug) {
        console.log("DEBUG FROM SERVER:", result.debug);
      }

      if (result.inner) {
        console.log("INNER ERROR:", result.inner);
      }
    }

  } catch (error) {
    console.log("NETWORK ERROR:", error);
    Alert.alert("Error", "Network or server issue");
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
      {/* HEADER */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={20} color="#166534" />
        <Text style={styles.backText}>Back to mentors list</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.headerTitle}>Mentor Evaluation Form</Text>
        <Text style={styles.headerSubtitle}>Rate mentor Experience</Text>

        {questions.map((item, index) => (
          <View key={item.QuestionID} style={styles.questionContainer}>
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
                    activeOpacity={0.8}
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

        {/* SUBMIT */}
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitBtnText}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default MentorEvaluationForm;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f8f4", padding: 16 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  backBtn: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  backText: { color: "#166534", marginLeft: 5, fontWeight: "600" },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "#333" },
  headerSubtitle: { fontSize: 14, color: "#666", marginBottom: 20 },
  
  questionContainer: {
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