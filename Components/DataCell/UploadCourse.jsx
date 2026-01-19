import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform
} from "react-native";

import Icon from "react-native-vector-icons/MaterialIcons";
import { pick, types, isCancel } from "@react-native-documents/picker";

const UploadCourses = () => {
  const [selectedFile, setSelectedFile] = useState(null);

  // PICK EXCEL FILE
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
      if (isCancel(error)) {
        console.log("User cancelled picker");
      } else {
        console.error("Picker error:", error);
        Alert.alert("Error", "Failed to pick file");
      }
    }
  };

  // UPLOAD FILE TO API
  const uploadFile = async () => {
    if (!selectedFile) {
      Alert.alert("No File", "Please select an Excel file first");
      return;
    }

    try {
      const formData = new FormData();

      formData.append("file", {
        uri:
          Platform.OS === "android"
            ? selectedFile.uri
            : selectedFile.uri.replace("file://", ""),
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        name: selectedFile.name,
      });

      // Replace with your published API IP or localhost if testing on PC
      const response = await fetch(
        "http://192.168.0.103/FYP/api/course/upload",
        {
          method: "POST",
          body: formData,
          // ❌ Do NOT set content-type manually; fetch sets it for multipart/form-data
        }
      );

      const result = await response.text(); // or response.json() if API returns JSON
      Alert.alert("Server Response", result);

      // Clear selected file after upload
      setSelectedFile(null);
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Error", "Upload failed. Check your network or API URL.");
    }
  };

  return (
    <ScrollView>
      <View style={ss.header}>
        <View>
          <Text style={ss.headerTitle}>Upload Courses</Text>
          <Text style={ss.headerSubtitle}>
            Upload Courses List using Excel
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

      <View style={{ margin: 0, padding: 5, backgroundColor: "#1E7F4D" }}>
        <Text style={{ color: "white", fontSize: 15, textAlign: "center" }}>
          Supported Format: .xlsx / .xls
        </Text>
      </View>

      {/* FILE PICKER */}
      <TouchableOpacity
        style={[ss.file, { marginTop: 40 }]}
        onPress={pickExcelFile}
      >
        <View style={ss.inner}>
          <Icon name="description" size={42} color="#1E7F4D" />
          <Text style={{ color: "#fff", marginTop: 15, fontSize: 15 }}>
            {selectedFile ? selectedFile.name : "Select Excel File"}
          </Text>
        </View>
      </TouchableOpacity>

      {/* UPLOAD BUTTON */}
      <TouchableOpacity style={ss.uploadButton} onPress={uploadFile}>
        <Icon name="upload" size={20} color="#fff" />
        <Text style={ss.uploadButtonText}>Upload File</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

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
  headerTitle: { fontSize: 26, fontWeight: "700" },
  headerSubtitle: { fontSize: 12, color: "#777" },
  logoheader: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#eafaf1",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: { width: 40, height: 40 },
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
  uploadButton: {
    flexDirection: "row",
    backgroundColor: "#1E7F4D",
    width: 160,
    alignSelf: "center",
    padding: 12,
    borderRadius: 14,
    marginTop: 20,
    justifyContent: "center",
  },
  uploadButtonText: {
    color: "#fff",
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default UploadCourses;
