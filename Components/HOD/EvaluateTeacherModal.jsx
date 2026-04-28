import React, { useState,useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
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
}) => {

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

  useEffect(() => {
  setEvaluations({});
  console.log("USER ID:", userId);
}, [visible]);

  // ✅ SAVE FUNCTION (IMPORTANT)
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

          // IMPORTANT FIX:
          PaperStatus: evalData.paper === true ? "OnTime"
                       : evalData.paper === false ? "Late"
                       : "Late",

          FolderStatus: evalData.folder === true ? "OnTime"
                        : evalData.folder === false ? "Late"
                        : "Late",
        };
      })
    };

    console.log("PAYLOAD SENT:", JSON.stringify(payload, null, 2));

    const res = await fetch(`${BASE_URL}/CourseManagement/SaveEvaluation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    console.log("RESPONSE:", data);

    if (res.ok) {
      alert("Saved Successfully");
      onClose();
    } else {
      alert(data.message || "Save failed");
    }

  } catch (err) {
    console.log(err);
    alert("Server error");
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
              <Icon name="close" size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView>

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
                      style={[
                        ss.optionBtn,
                        data.paper === true && ss.yesActive
                      ]}
                      onPress={() => updateEvaluation(index, "paper", true)}
                    >
                      <Text>On Time</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        ss.optionBtn,
                        data.paper === false && ss.noActive
                      ]}
                      onPress={() => updateEvaluation(index, "paper", false)}
                    >
                      <Text>Late</Text>
                    </TouchableOpacity>

                  </View>

                  {/* FOLDER */}
                  <Text style={ss.label}>Folder Submission</Text>
                  <View style={ss.optionRow}>

                    <TouchableOpacity
                      style={[
                        ss.optionBtn,
                        data.folder === true && ss.yesActive
                      ]}
                      onPress={() => updateEvaluation(index, "folder", true)}
                    >
                      <Text>On Time</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        ss.optionBtn,
                        data.folder === false && ss.noActive
                      ]}
                      onPress={() => updateEvaluation(index, "folder", false)}
                    >
                      <Text>Late</Text>
                    </TouchableOpacity>

                  </View>

                </View>
              );
            })}

          </ScrollView>

          {/* FOOTER */}
          <View style={ss.footer}>

            <TouchableOpacity onPress={onClose}>
              <Text>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={ss.saveBtn} onPress={saveEvaluation}>
              <Text style={{ color: "#fff" }}>Save</Text>
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
    padding: 12,
    marginBottom: 14,
    borderRadius: 12,
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
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    alignItems: "center",
  },
  yesActive: {
    backgroundColor: "#eafaf1",
    borderColor: "#0F9D58",
  },
  noActive: {
    backgroundColor: "#fdecea",
    borderColor: "#e53935",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  saveBtn: {
    backgroundColor: "#0F9D58",
    padding: 12,
    borderRadius: 10,
  }
});

export default EvaluateTeacherModal;