import React, { useState, useEffect } from "react";
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
import BASE_URL from "../../API-URL/API";
import Icon from "react-native-vector-icons/MaterialIcons";
import { pick, types, isCancel } from "@react-native-documents/picker";
import { Dropdown } from "react-native-element-dropdown";

const UploadEnrollment = () => {

    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadedFile, setUploadedFile] = useState(null);

    const [sessions, setSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);

    useEffect(() => {
        getSessions();
    }, []);

    // ✅ FIXED — Correct sessions API
    const getSessions = async () => {
        try {
            const res = await fetch(`${BASE_URL}/PeerEvaluator/Sessions`);
            const data = await res.json();

            const formatted = data.map(s => ({
                label: s.name,
                value: s.id,
            }));

            setSessions(formatted);

        } catch (err) {
            console.log("Session error:", err.message);
            Alert.alert("Error", "Failed to load sessions");
        }
    };

    const pickExcelFile = async () => {
        try {
            const result = await pick({
                type: [types.xlsx, types.xls],
                allowMultiSelection: false,
            });

            setSelectedFile(result[0]);

        } catch (error) {
            if (!isCancel(error)) {
                Alert.alert("Error", "Failed to pick file");
            }
        }
    };

    // ✅ FIXED — Correct Enrollment Upload API
    const uploadFile = async () => {

        if (!selectedFile) {
            Alert.alert("No File", "Please select an Excel file first");
            return;
        }

        if (!selectedSession) {
            Alert.alert("Missing Session", "Please select session");
            return;
        }

        try {
            const formData = new FormData();

            formData.append("file", {
                uri: Platform.OS === "android"
                    ? selectedFile.uri
                    : selectedFile.uri.replace("file://", ""),
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                name: selectedFile.name,
            });

            // ✅ OPTIONAL — send sessionId also if backend needs it
            formData.append("sessionId", selectedSession);

            const response = await fetch(`${BASE_URL}/Enrollment/UploadEnrollment`, {
                method: "POST",
                body: formData,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            const text = await response.text();

            Alert.alert("Server Response", text);

            setUploadedFile({
                name: selectedFile.name,
                size: selectedFile.size,
            });

            setSelectedFile(null);

        } catch (error) {
            console.error("Upload error:", error);
            Alert.alert("Error", "Upload failed. Check API or network.");
        }
    };

    return (
        <ScrollView>

            {/* HEADER */}
            <View style={ss.header}>
                <View>
                    <Text style={ss.headerTitle}>Upload Enrollment</Text>
                    <Text style={ss.headerSubtitle}>
                        Upload Enrollment List using Excel
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

            <View style={{ padding: 6, backgroundColor: "#1E7F4D" }}>
                <Text style={{ color: "white", textAlign: "center" }}>
                    Supported Format: .xlsx / .xls
                </Text>
            </View>

            {/* ✅ Sessions Dropdown */}
            <Dropdown
                style={ss.dropdown}
                data={sessions}
                labelField="label"
                valueField="value"
                placeholder="Select Session"
                value={selectedSession}
                onChange={item => setSelectedSession(item.value)}
                renderLeftIcon={() => (
                    <Icon name="calendar-today" size={20} color="#4CAF50" />
                )}
            />

            {/* File Picker */}
            <TouchableOpacity
                style={[ss.file, { marginTop: 40 }]}
                onPress={pickExcelFile}
            >
                <View style={ss.inner}>
                    <Icon name="description" size={42} color="#1E7F4D" />
                    <Text style={{ color: "#fff", marginTop: 15 }}>
                        {selectedFile ? selectedFile.name : "Select Excel File"}
                    </Text>
                </View>
            </TouchableOpacity>

            {/* Upload Button */}
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
        padding: 14,
        backgroundColor: "#fff",
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

    dropdown: {
        margin: 12,
        height: 55,
        borderColor: "#4CAF50",
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 15,
        backgroundColor: "#F9F9F9",
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

export default UploadEnrollment;
