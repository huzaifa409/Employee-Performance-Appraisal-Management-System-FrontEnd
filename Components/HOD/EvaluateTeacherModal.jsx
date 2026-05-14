import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput, // Added TextInput
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import BASE_URL from "../../API-URL/API";

const EvaluateTeacherModal = ({
  visible,
  onClose,
  teacher,
  subjects,
  userId,
  sessionId,
  onSuccess,
}) => {
  const [evaluations, setEvaluations] = useState({});

  const updateEvaluation = (index, field, value) => {
    setEvaluations((prev) => ({
      ...prev,
      [index]: {
        ...prev[index],
        [field]: value,
      },
    }));
  };

  useEffect(() => {
    setEvaluations({});
  }, [visible]);

  const saveEvaluation = async () => {
    try {
      const payload = {
        TeacherID: teacher?.teacherID,
        SessionID: sessionId,
        HODID: userId,
        Evaluations: subjects.map((sub, index) => {
          const evalData = evaluations[index] || {};
          return {
            CourseCode: sub.code,
            PaperStatus: evalData.paper === true ? "On-Time" : "Late",
            FolderStatus: evalData.folder === true ? "On-Time" : "Late",
            Remarks: evalData.remarks || "", 
          };
        }),
      };

      const res = await fetch(`${BASE_URL}/CourseManagement/SaveEvaluation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        Alert.alert("Success", "Evaluation saved!");
        onSuccess(teacher.teacherID); // Notify parent to disable button
        onClose();
      } else {
        Alert.alert("Error", "Save failed");
      }
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Server error");
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={ss.overlay}>
        <View style={ss.modalBox}>
          {/* HEADER */}
          <View style={ss.modalHeader}>
            <Text style={ss.modalTitle}>Evaluate {teacher?.teacher}</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {subjects.map((sub, index) => {
              const data = evaluations[index] || {};

              return (
                <View key={index} style={ss.subjectBox}>
                  <Text style={ss.subjectTitle}>
                    {sub.course} ({sub.code})
                  </Text>

                  {/* PAPER */}
                  <Text style={ss.label}>Paper Submission</Text>
                  <View style={ss.optionRow}>
                    <TouchableOpacity
                      style={[ss.optionBtn, data.paper === true && ss.yesActive]}
                      onPress={() => updateEvaluation(index, "paper", true)}
                    >
                      <Text style={data.paper === true ? ss.activeText : null}>On Time</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[ss.optionBtn, data.paper === false && ss.noActive]}
                      onPress={() => updateEvaluation(index, "paper", false)}
                    >
                      <Text style={data.paper === false ? ss.activeText : null}>Late</Text>
                    </TouchableOpacity>
                  </View>

                  {/* FOLDER */}
                  <Text style={ss.label}>Folder Submission</Text>
                  <View style={ss.optionRow}>
                    <TouchableOpacity
                      style={[ss.optionBtn, data.folder === true && ss.yesActive]}
                      onPress={() => updateEvaluation(index, "folder", true)}
                    >
                      <Text style={data.folder === true ? ss.activeText : null}>On Time</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[ss.optionBtn, data.folder === false && ss.noActive]}
                      onPress={() => updateEvaluation(index, "folder", false)}
                    >
                      <Text style={data.folder === false ? ss.activeText : null}>Late</Text>
                    </TouchableOpacity>
                  </View>

                  {/* ✅ REMARKS INPUT */}
                  <Text style={ss.label}>Remarks / Comments</Text>
                  <TextInput
                    style={ss.remarksInput}
                    placeholder="Enter submission notes..."
                    placeholderTextColor="#999"
                    multiline
                    value={data.remarks || ""}
                    onChangeText={(text) => updateEvaluation(index, "remarks", text)}
                  />
                </View>
              );
            })}
          </ScrollView>

          {/* FOOTER */}
          <View style={ss.footer}>
            <TouchableOpacity style={ss.cancelBtn} onPress={onClose}>
              <Text style={{ color: "#666", fontWeight: "600" }}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={ss.saveBtn} onPress={saveEvaluation}>
              <Text style={{ color: "#fff", fontWeight: "600" }}>Save Evaluation</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const ss = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "92%",
    maxHeight: "85%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0F9D58",
  },
  subjectBox: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    marginBottom: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  subjectTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  label: {
    marginTop: 10,
    fontSize: 13,
    color: "#555",
    fontWeight: "600",
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  optionBtn: {
    width: "48%",
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  yesActive: {
    backgroundColor: "#eafaf1",
    borderColor: "#0F9D58",
  },
  noActive: {
    backgroundColor: "#fdecea",
    borderColor: "#e53935",
  },
  activeText: {
    fontWeight: "bold",
  },
  remarksInput: {
    marginTop: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    minHeight: 60,
    textAlignVertical: "top",
    color: "#333",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  cancelBtn: {
    padding: 12,
  },
  saveBtn: {
    backgroundColor: "#0F9D58",
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 10,
    elevation: 2,
  },
});

export default EvaluateTeacherModal;