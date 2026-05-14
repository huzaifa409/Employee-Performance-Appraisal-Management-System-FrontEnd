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

const CourseManagement = ({ route }) => {
    const { userId } = route.params;

    const [sessions, setSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);
    const [courses, setCourses] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [teacherSubjects, setTeacherSubjects] = useState([]);

    // ✅ NEW: Track which teachers are already evaluated
    const [evaluatedTeachers, setEvaluatedTeachers] = useState([]);

    useEffect(() => {
        getSessions();
    }, []);

    useEffect(() => {
        if (selectedSession) {
            getEnrollmentCourses(selectedSession);
            // Clear evaluated list when session changes
            setEvaluatedTeachers([]);
        } else {
            setCourses([]);
        }
    }, [selectedSession]);

    const getSessions = async () => {
        try {
            const res = await fetch(`${BASE_URL}/PeerEvaluator/Sessions`);
            const data = await res.json();
            setSessions(data.map(s => ({
                label: s.name,
                value: s.id,
            })));
        } catch (err) {
            console.log(err);
        }
    };

    const getEnrollmentCourses = async (sessionId) => {
        try {
            const res = await fetch(
                `${BASE_URL}/CourseManagement/EnrollmentCourses/${sessionId}`
            );
            const data = await res.json();
            setCourses(data);
        } catch (err) {
            console.log(err);
        }
    };

    // Callback passed to Modal
    const onEvaluationSuccess = (teacherId) => {
        setEvaluatedTeachers((prev) => [...prev, teacherId]);
    };

    const groupedByTeacher = Object.values(
        courses.reduce((acc, item) => {
            if (!acc[item.teacher]) {
                acc[item.teacher] = {
                    teacher: item.teacher,
                    teacherID: item.teacherID || item.teacherId,
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

    const renderTeacherCard = ({ item }) => {
        // ✅ Check if this teacher is in the evaluated list
        const isDone = evaluatedTeachers.includes(item.teacherID);

        return (
            <View style={[ss.card, isDone && ss.evaluatedCard]}>
                <View style={ss.teacherRow}>
                    <Icon 
                        name={isDone ? "check-circle" : "person"} 
                        size={20} 
                        color={isDone ? "#888" : "#0F9D58"} 
                    />
                    <Text style={[ss.teacherName, isDone && ss.evaluatedText]}>
                        {item.teacher} {isDone && "(Evaluated)"}
                    </Text>
                </View>

                {item.subjects.map((s, i) => (
                    <View key={i} style={{ marginTop: 6 }}>
                        <Text style={[ss.courseName, isDone && ss.evaluatedTextSmall]}>{s.course}</Text>
                        <Text style={ss.courseCode}>{s.code}</Text>
                    </View>
                ))}

                <TouchableOpacity
                    style={[ss.actionBtn, isDone && ss.disabledBtn]}
                    onPress={() => {
                        setSelectedTeacher(item);
                        setTeacherSubjects(item.subjects);
                        setShowModal(true);
                    }}
                    disabled={isDone} // ✅ Disable button
                >
                    <Icon name={isDone ? "done-all" : "edit"} size={18} color="#fff" />
                    <Text style={ss.actionText}>{isDone ? "Completed" : "Evaluate"}</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <>
            <FlatList
                data={groupedByTeacher}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderTeacherCard}
                ListHeaderComponent={() => (
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
                )}
            />

            <EvaluateTeacherModal
                visible={showModal}
                teacher={selectedTeacher}
                subjects={teacherSubjects}
                sessionId={selectedSession}
                userId={userId}
                onClose={() => setShowModal(false)}
                onSuccess={onEvaluationSuccess} // ✅ Pass the callback
                
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
    // Styles for evaluated state
    evaluatedCard: { backgroundColor: "#f8f9f9", borderColor: "#ddd", opacity: 0.8 },
    evaluatedText: { color: "#888" },
    evaluatedTextSmall: { color: "#aaa" },
    
    teacherRow: { flexDirection: "row", alignItems: "center", },
    teacherName: { fontSize: 16, fontWeight: "600", marginLeft: 6, },
    courseName: { marginTop: 8, fontSize: 14, color: "#333", },
    courseCode: { fontSize: 12, color: "#777", marginTop: 2, },
    actionBtn: { marginTop: 14, backgroundColor: "#0F9D58", borderRadius: 10, paddingVertical: 12, flexDirection: "row", justifyContent: "center", alignItems: "center", },
    disabledBtn: { backgroundColor: "#A5A5A5" }, // Grey color for disabled
    actionText: { color: "#fff", fontWeight: "600", marginLeft: 6, },
});

export default CourseManagement;