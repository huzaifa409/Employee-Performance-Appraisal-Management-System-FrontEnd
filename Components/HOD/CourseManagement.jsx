import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    FlatList,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import Icon from "react-native-vector-icons/MaterialIcons";
import BASE_URL from "../../API-URL/API";
import EvaluateTeacherModal from "./EvaluateTeacherModal";

const CourseManagement = () => {

    const [sessions, setSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);

    // raw API courses
    const [courses, setCourses] = useState([]);

    // modal state
    const [showModal, setShowModal] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState("");
    const [teacherSubjects, setTeacherSubjects] = useState([]);

    /* ---------------- LOAD SESSIONS ---------------- */

    useEffect(() => {
        getSessions();
    }, []);

    useEffect(() => {
        if (selectedSession) {
            getEnrollmentCourses(selectedSession);
        } else {
            setCourses([]);
        }
    }, [selectedSession]);

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
            console.log("Session error:", err);
        }
    };

    /* ---------------- LOAD COURSES ---------------- */

    const getEnrollmentCourses = async (sessionId) => {
        try {
            const res = await fetch(
                `${BASE_URL}/CourseManagement/EnrollmentCourses/sessionId?sessionId=${sessionId}`
            );

            const data = await res.json();
            setCourses(data);

        } catch (err) {
            console.log("Enrollment fetch error:", err);
        }
    };

    /* ---------------- GROUP COURSES BY TEACHER ---------------- */

    const groupedByTeacher = Object.values(
        courses.reduce((acc, item) => {
            if (!acc[item.teacher]) {
                acc[item.teacher] = {
                    teacher: item.teacher,
                    subjects: [],
                };
            }

            acc[item.teacher].subjects.push({
                course: item.course,
                code: item.code,
            });

            return acc;
        }, {})
    );

    /* ---------------- COURSE CARD ---------------- */

    const renderTeacherCard = ({ item }) => (
        <View style={ss.card}>

            <View style={ss.teacherRow}>
                <Icon name="person" size={20} color="#0F9D58" />
                <Text style={ss.teacherName}>{item.teacher}</Text>
            </View>

            {item.subjects.map((s, i) => (
                <View key={i} style={{ marginTop: 6 }}>
                    <Text style={ss.courseName}>{s.course}</Text>
                    <Text style={ss.courseCode}>{s.code}</Text>
                </View>
            ))}

            <TouchableOpacity
                style={ss.actionBtn}
                onPress={() => {
                    setSelectedTeacher(item.teacher);
                    setTeacherSubjects(item.subjects);
                    setShowModal(true);
                }}
            >
                <Icon name="edit" size={18} color="#fff" />
                <Text style={ss.actionText}>Evaluate</Text>
            </TouchableOpacity>

        </View>
    );

    /* ---------------- HEADER ---------------- */

    const ListHeader = () => (
        <>
            <View style={ss.header}>
                <View>
                    <Text style={ss.headerTitle}>Course Management</Text>
                    <Text style={ss.headerSubtitle}>
                        Evaluate Course Submission and Academic Responsibilities
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
        </>
    );

    return (
        <>
            <FlatList
                data={groupedByTeacher}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderTeacherCard}
                ListHeaderComponent={ListHeader}
                ListEmptyComponent={
                    <Text style={ss.emptyText}>
                        Select a session to load courses
                    </Text>
                }
                contentContainerStyle={{ paddingBottom: 40 }}
                style={{ backgroundColor: "#EDF4EE" }}
            />

            {/* ---------- EVALUATION MODAL ---------- */}
            <EvaluateTeacherModal
                visible={showModal}
                teacher={selectedTeacher}
                subjects={teacherSubjects}
                onClose={() => setShowModal(false)}
            />
        </>
    );
};

const ss = StyleSheet.create({
    header: { flexDirection: "row", justifyContent: "space-between", padding: 14, backgroundColor: "#fff", elevation: 3, },
    headerTitle: { fontSize: 24, fontWeight: "700", },
    headerSubtitle: { fontSize: 12, color: "#777", marginTop: 2, },
    logoheader: {
        backgroundColor: "#eafaf1", width: 44, height: 44,
        borderRadius: 22, justifyContent: "center", alignItems: "center",
    },
    logo: { width: 40, height: 40, },
    dropdown: { margin: 12, height: 55, borderColor: "#4CAF50", borderWidth: 1, borderRadius: 10, paddingHorizontal: 15, backgroundColor: "#F9F9F9", },
    card: { backgroundColor: "#fff", marginHorizontal: 12, marginBottom: 12, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#cceedd", },
    teacherRow: { flexDirection: "row", alignItems: "center", },
    teacherName: { fontSize: 16, fontWeight: "600", marginLeft: 6, },
    courseName: { marginTop: 8, fontSize: 14, color: "#333", },
    courseCode: { fontSize: 12, color: "#777", marginTop: 2, },
    actionBtn: { marginTop: 14, backgroundColor: "#0F9D58", borderRadius: 10, paddingVertical: 12, flexDirection: "row", justifyContent: "center", alignItems: "center", }
    , actionText: { color: "#fff", fontWeight: "600", marginLeft: 6, },
    emptyText:
        { textAlign: "center", marginTop: 40, color: "#777", fontSize: 14, },
});
export default CourseManagement;
