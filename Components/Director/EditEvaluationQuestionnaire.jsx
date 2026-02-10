import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import BASE_URL from "../../API-URL/API";

const EditEvaluationQuestionnaire = ({ route, navigation }) => {
  const { questionnaireId } = route.params;

  const [title, setTitle] = useState("");
  const [evaluationType, setEvaluationType] = useState("");
  const [questions, setQuestions] = useState([]);
  const [deletedIds, setDeletedIds] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestionnaire();
  }, []);

  // ================= FETCH QUESTIONNAIRE =================
  const fetchQuestionnaire = async () => {
    try {
      const res = await fetch(`${BASE_URL}/Questionnaire/GetById/${questionnaireId}`);

      if (!res.ok) {
        const text = await res.text();
        console.log("Server returned error:", text);
        Alert.alert("Error", "Failed to fetch questionnaire");
        setLoading(false);
        return;
      }

      const data = await res.json();

      setTitle(data.title || "");
      setEvaluationType(data.evaluationType || "");
      setQuestions(data.questions || []);
      setLoading(false);
    } catch (err) {
      console.log("Fetch failed:", err);
      Alert.alert("Error", "Unable to load questionnaire");
      setLoading(false);
    }
  };

  // ================= ADD QUESTION (LOCAL) =================
  const addQuestion = () => {
    if (!newQuestion.trim()) return;

    setQuestions((prev) => [
      ...prev,
      { id: 0, questionText: newQuestion }, // id = 0 => new
    ]);
    setNewQuestion("");
  };

  // ================= UPDATE QUESTION =================
  const updateQuestion = (index, text) => {
    const updated = [...questions];
    updated[index].questionText = text;
    setQuestions(updated);
  };

  // ================= DELETE QUESTION =================
  const deleteQuestion = (index) => {
    const q = questions[index];

    if (q.id !== 0) {
      setDeletedIds((prev) => [...prev, q.id]);
    }

    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
  };

  // ================= SAVE ALL CHANGES =================
  const saveChanges = async () => {
    try {
      const res = await fetch(`${BASE_URL}/Questionnaire/SaveAllChanges`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionnaireId,
          questions,
          deletedIds,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        Alert.alert("Error", text || "Failed to save changes");
        return;
      }

      Alert.alert("Success", "Questionnaire updated successfully");
      navigation.goBack();
    } catch (err) {
      console.log("Save failed:", err);
      Alert.alert("Error", "Failed to save changes");
    }
  };

  // ================= RENDER =================
  if (loading) {
    return (
      <View style={ss.loaderContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  return (
    <ScrollView style={ss.container}>
      <Text style={ss.heading}>Edit Evaluation Questionnaire</Text>

      <View style={ss.infoBox}>
        <Icon name="info" size={18} color="#2e7d32" />
        <Text style={ss.infoText}>Make changes and click Save when done</Text>
      </View>

      <Text style={ss.label}>Questionnaire Title</Text>
      <TextInput value={title} editable={false} style={ss.input} />

      <Text style={ss.label}>Evaluation Type</Text>
      <TextInput value={evaluationType} editable={false} style={ss.input} />

      <Text style={ss.label}>Add Question</Text>
      <View style={ss.row}>
        <TextInput
          style={[ss.input, { flex: 1 }]}
          placeholder="Type question..."
          value={newQuestion}
          onChangeText={setNewQuestion}
        />
        <TouchableOpacity style={ss.addBtn} onPress={addQuestion}>
          <Icon name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <Text style={ss.sectionTitle}>Questions ({questions.length})</Text>

      {questions.map((q, index) => (
        <View key={q.id || index} style={ss.questionCard}>
          <View style={ss.circle}>
            <Text style={ss.circleText}>{index + 1}</Text>
          </View>

          <TextInput
            value={q.questionText}
            style={ss.questionInput}
            onChangeText={(text) => updateQuestion(index, text)}
          />

          <TouchableOpacity onPress={() => deleteQuestion(index)}>
            <Icon name="delete" size={22} color="red" />
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity style={ss.saveBtn} onPress={saveChanges}>
        <Text style={ss.saveText}>Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const ss = StyleSheet.create({
  container: {
    backgroundColor: "#f1f8f4",
    padding: 14,
  },
  heading: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 14,
  },
  infoBox: {
    backgroundColor: "#e8f5e9",
    padding: 12,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  infoText: {
    marginLeft: 8,
    color: "#2e7d32",
    fontWeight: "500",
  },
  label: {
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  addBtn: {
    backgroundColor: "#2e7d32",
    padding: 12,
    borderRadius: 10,
  },
  sectionTitle: {
    marginTop: 20,
    fontWeight: "700",
    fontSize: 16,
  },
  questionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fff6",
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
    elevation: 2,
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#2e7d32",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  circleText: {
    color: "#fff",
    fontWeight: "700",
  },
  questionInput: {
    flex: 1,
    marginRight: 10,
  },
  saveBtn: {
    backgroundColor: "#2e7d32",
    padding: 14,
    borderRadius: 14,
    marginTop: 30,
    marginBottom: 40,
    alignItems: "center",
    elevation: 4,
  },
  saveText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default EditEvaluationQuestionnaire;
