import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator
} from "react-native";
import BASE_URL from "../../API-URL/API";
import Icon from "react-native-vector-icons/MaterialIcons";
import { pick, types, isCancel } from "@react-native-documents/picker";
import { Dropdown } from "react-native-element-dropdown";

const UploadCHR = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);

  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);

  const [loadingSessions, setLoadingSessions] = useState(false);
  const [uploading, setUploading] = useState(false);

  // 🔹 Fetch Sessions
  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const res = await fetch(`${BASE_URL}/OverallPerformance/list`);
      const data = await res.json();

      const formatted = data.map(item => ({
        label: item.name,
        value: item.id
      }));

      setSessions(formatted);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to load sessions");
    } finally {
      setLoadingSessions(false);
    }
  };

  // 🔹 Pick File
  const pickExcelFile = async () => {
    try {
      const result = await pick({
        type: [types.xlsx, types.xls],
        allowMultiSelection: false,
      });

      setSelectedFile(result[0]);

      Alert.alert(
        "File Selected",
        `Name: ${result[0].name}\nSize: ${result[0].size}`
      );
    } catch (error) {
      if (!isCancel(error)) {
        console.error(error);
        Alert.alert("Error", "Failed to pick file");
      }
    }
  };

  // 🔹 Upload File
 const uploadFile = async () => {
  if (!selectedSession) {
    Alert.alert("Error", "Select session first");
    return;
  }

  if (!selectedFile) {
    Alert.alert("Error", "Select file first");
    return;
  }

  try {
    const formData = new FormData();

    // ✅ IMPORTANT: sessionID must be STRING
    formData.append("sessionID", String(selectedSession));

    // ✅ IMPORTANT: file format must be correct
    formData.append("file", {
      uri: selectedFile.uri,
      type:
        selectedFile.type ||
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      name: selectedFile.name || "upload.xlsx",
    });

    console.log("SESSION SENT:", selectedSession);
    console.log("FILE:", selectedFile);

   const response = await fetch(`${BASE_URL}/CHR/upload`, {
  method: "POST",
  body: formData, // ✅ ONLY THIS
});

    const text = await response.text();
    console.log("RAW RESPONSE:", text);

    if (!response.ok) {
      Alert.alert("Error", text);
      return;
    }

    const result = JSON.parse(text);

    Alert.alert(
      "Success",
      `Uploaded ${result.Count} records\nSession: ${result.SessionName}`
    );

  } catch (error) {
    console.error(error);
    Alert.alert("Error", "Upload failed");
  }
};

  return (
    <ScrollView>

      {/* Header */}
      <View style={ss.header}>
        <View>
          <Text style={ss.headerTitle}>Upload CHR</Text>
          <Text style={ss.headerSubtitle}>
            Upload Class Held Report (Excel)
          </Text>
        </View>

        <View style={ss.logoheader}>
          <Image
            source={require("../../Assets/BIIT_logo.png")}
            style={ss.logo}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Session Dropdown */}
      <View style={{ margin: 20 }}>
        <Text style={ss.label}>Select Session</Text>

        {loadingSessions ? (
          <ActivityIndicator size="small" color="#1E7F4D" />
        ) : (
          <Dropdown
            style={ss.dropdown}
            data={sessions}
            labelField="label"
            valueField="value"
            placeholder="Select Session"
            value={selectedSession}
            onChange={(item) => setSelectedSession(item.value)}
          />
        )}
      </View>

      {/* Info Bar */}
      <View style={ss.infoBar}>
        <Text style={ss.infoText}>
          Supported Format: .xlsx / .xls
        </Text>
      </View>

      {/* File Picker */}
      <TouchableOpacity style={ss.file} onPress={pickExcelFile}>
        <View style={ss.inner}>
          <Icon name="description" size={42} color="#1E7F4D" />
          <Text style={ss.fileText}>
            {selectedFile ? selectedFile.name : "Select CHR Excel File"}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Upload Button */}
      <TouchableOpacity style={ss.uploadButton} onPress={uploadFile}>
        {uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Icon name="upload" size={20} color="#fff" />
            <Text style={ss.uploadButtonText}>Upload File</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Uploaded Info */}
      {uploadedFile && (
        <View style={ss.uploadedContainer}>
          <View style={ss.row}>
            <Icon name="check-circle" size={22} color="#1E7F4D" />
            <Text style={ss.uploadedTitle}> Uploaded Successfully</Text>
          </View>

          <View style={ss.row}>
            <Icon name="description" size={18} color="#1E7F4D" />
            <Text style={ss.uploadedText}>
              File: {uploadedFile.name}
            </Text>
          </View>

          <View style={ss.row}>
            <Icon name="storage" size={18} color="#1E7F4D" />
            <Text style={ss.uploadedText}>
              Size: {(uploadedFile.size / 1024).toFixed(2)} KB
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default UploadCHR;

const ss = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#fff",
    borderRadius: 14,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#777",
  },
  logoheader: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#eafaf1",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 40,
    height: 40,
  },
  label: {
    marginBottom: 6,
    fontWeight: "600",
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#1E7F4D",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#fff",
  },
  infoBar: {
    padding: 6,
    backgroundColor: "#1E7F4D",
  },
  infoText: {
    color: "#fff",
    textAlign: "center",
  },
  file: {
    height: 240,
    margin: 30,
    backgroundColor: "#fff",
    borderRadius: 14,
    elevation: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  inner: {
    width: 260,
    height: 200,
    borderWidth: 1,
    borderColor: "#1E7F4D",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#9bd5ac",
  },
  fileText: {
    color: "#fff",
    marginTop: 15,
    fontSize: 15,
  },
  uploadButton: {
    flexDirection: "row",
    backgroundColor: "#1E7F4D",
    width: 160,
    alignSelf: "center",
    padding: 12,
    borderRadius: 14,
    marginTop: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadButtonText: {
    color: "#fff",
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
  },
  uploadedContainer: {
    backgroundColor: "#eafaf1",
    marginHorizontal: 20,
    marginTop: 25,
    padding: 16,
    borderRadius: 14,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: "#1E7F4D",
  },
  uploadedTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E7F4D",
  },
  uploadedText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
});