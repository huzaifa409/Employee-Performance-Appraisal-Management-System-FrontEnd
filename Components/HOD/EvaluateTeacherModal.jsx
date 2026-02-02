import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const EvaluateTeacherModal = ({ visible, onClose, teacher, subjects }) => {

  // ✅ Hooks MUST be here (top-level of component)
  const [evaluations, setEvaluations] = useState({});

  const updateEvaluation = (index, field, value) => {
    setEvaluations(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        [field]: value,
      },
    }));
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={ss.overlay}>

        <View style={ss.modalBox}>

          {/* HEADER */}
          <View style={ss.modalHeader}>
            <Text style={ss.modalTitle}>Evaluate {teacher}</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} />
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

                  {/* Paper Submission */}
                  <Text style={ss.label}>Paper Submission on Time</Text>
                  <View style={ss.optionRow}>
                    <TouchableOpacity
                      style={[
                        ss.optionBtn,
                        data.paper === true && ss.yesActive
                      ]}
                      onPress={() => updateEvaluation(index, "paper", true)}
                    >
                      <Text>Yes (On Time)</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        ss.optionBtn,
                        data.paper === false && ss.noActive
                      ]}
                      onPress={() => updateEvaluation(index, "paper", false)}
                    >
                      <Text>No (Late)</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Folder Submission */}
                  <Text style={ss.label}>Folder Submission on Time</Text>
                  <View style={ss.optionRow}>
                    <TouchableOpacity
                      style={[
                        ss.optionBtn,
                        data.folder === true && ss.yesActive
                      ]}
                      onPress={() => updateEvaluation(index, "folder", true)}
                    >
                      <Text>Yes (On Time)</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        ss.optionBtn,
                        data.folder === false && ss.noActive
                      ]}
                      onPress={() => updateEvaluation(index, "folder", false)}
                    >
                      <Text>No (Late)</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Remarks */}
                  {(data.paper === false || data.folder === false) && (
                    <TextInput
                      placeholder="Enter remarks about late submission..."
                      style={ss.remarks}
                      multiline
                      onChangeText={t =>
                        updateEvaluation(index, "remarks", t)
                      }
                    />
                  )}

                </View>
              );
            })}

          </ScrollView>

          {/* FOOTER */}
          <View style={ss.footer}>
            <TouchableOpacity style={ss.cancelBtn} onPress={onClose}>
              <Text>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={ss.saveBtn}
              onPress={() => {
                console.log("Final Evaluation:", evaluations);
                onClose();
              }}
            >
              <Text style={{ color: "#fff" }}>Save Evaluation</Text>
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
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    width: "92%",
    maxHeight: "90%",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F9D58",
  },

  subjectBox: {
    borderWidth: 1,
    borderColor: "#cceedd",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },

  subjectTitle: {
    fontWeight: "600",
    marginBottom: 8,
  },

  label: {
    marginTop: 6,
    fontSize: 13,
  },

  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },

  optionBtn: {
    width: "48%",
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
  },

  yesActive: {
    borderColor: "#0F9D58",
    backgroundColor: "#eafaf1",
  },

  noActive: {
    borderColor: "#e53935",
    backgroundColor: "#fdecea",
  },

  remarks: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginTop: 8,
    padding: 10,
    minHeight: 60,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  cancelBtn: {
    padding: 12,
  },

  saveBtn: {
    backgroundColor: "#0F9D58",
    padding: 12,
    borderRadius: 10,
  },
});

export default EvaluateTeacherModal;
