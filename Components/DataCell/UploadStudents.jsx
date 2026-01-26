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
import BASE_URL from "../../API-URL/API";

const UploadStudents = () => {
  const [selectedFile, setSelectedFile] = useState(null);

  const [uploadedFile, setUploadedFile] = useState(null);



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

      const response = await fetch(
        `${BASE_URL}/student/upload`,
        {
          method: "POST",
          body: formData,

        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Upload failed");
      }

      const text = await response.text();
      Alert.alert("Server Response", text);

      setUploadedFile({
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
      });


      setSelectedFile(null);
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Error", error.message || "Upload failed");
    }
  };

  return (
    <ScrollView>
      <View style={ss.header}>
        <View>
          <Text style={ss.headerTitle}>Upload Students</Text>
          <Text style={ss.headerSubtitle}>
            Upload Student List using Excel
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
          Supported Format: .xlsx
        </Text>
      </View>


      <TouchableOpacity
        style={[ss.file, { marginTop: 40 }]}
        onPress={pickExcelFile}
      >
        <View style={ss.inner}>
          <Icon name="description" size={42} color="#1E7F4D" />
          <Text style={{ color: "#fff", marginTop: 15, fontSize: 15 }}>
            {selectedFile ? selectedFile.name : "Excel File only..."}
          </Text>
        </View>
      </TouchableOpacity>


      <TouchableOpacity style={ss.uploadButton} onPress={uploadFile}>
        <Icon name="upload" size={20} color="#fff" />
        <Text style={ss.uploadButtonText}>Upload File</Text>
      </TouchableOpacity>

   
      {uploadedFile && (
        <View style={ss.uploadedContainer}>

          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
            <Icon name="check-circle" size={22} color="#1E7F4D" />
            <Text style={ss.uploadedTitle}> Uploaded Successfully</Text>
          </View>

          <View style={ss.infoRow}>
            <Icon name="description" size={18} color="#1E7F4D" />
            <Text style={ss.uploadedText}>
              File: {uploadedFile.name}
            </Text>
          </View>

          <View style={ss.infoRow}>
            <Icon name="storage" size={18} color="#1E7F4D" />
            <Text style={ss.uploadedText}>
              Size: {(uploadedFile.size / 1024).toFixed(2)} KB
            </Text>
          </View>

          <View style={ss.infoRow}>
            <Icon name="insert-drive-file" size={18} color="#1E7F4D" />
            <Text style={ss.uploadedText}>
              Type: Excel File
            </Text>
          </View>

        </View>
      )}

    </ScrollView>
  );
};

const ss = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingTop: 10,
    paddingHorizontal: 14,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    elevation: 3,
  },

  file: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    elevation: 3,
    height: 240,
    margin: 30,
  },

  inner: {
    borderWidth: 1,
    height: 200,
    width: 260,
    borderRadius: 10,
    borderColor: "#1E7F4D",
    backgroundColor: "#9bd5ac",
    elevation: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: { fontSize: 26, fontWeight: "700", color: "#000" },
  headerSubtitle: { fontSize: 12, color: "#777", marginTop: 4, maxWidth: 250 },

  logoheader: {
    backgroundColor: "#eafaf1",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },

  logo: { width: 58, height: 58 },

  uploadButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1E7F4D",
    paddingVertical: 10,
    borderRadius: 14,
    marginLeft: 130,
    width: 150,
  },

  uploadButtonText: { color: "#fff", fontSize: 16, fontWeight: "600", marginLeft: 8, padding: 5 },

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
    marginBottom: 8,
  },

  uploadedText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

});

export default UploadStudents;
