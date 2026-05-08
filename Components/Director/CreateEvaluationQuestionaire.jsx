import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    TextInput,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import Icon from "react-native-vector-icons/MaterialIcons";
import BASE_URL from "../../API-URL/API";

const CreateEvaluationQuestionaire = () => {

    // ✅ dropdown data
    const [EvalTypes, setEvalTypes] = useState([
        { label: "Confidential Evaluation", value: 1, typeText: "Confidential Evaluation" },
        { label: "Course Evaluation", value: 2, typeText: "Course Evaluation" },
        { label: "Peer Evaluation", value: 3, typeText: "Peer Evaluation" },
        { label: "Student Evaluation", value: 4, typeText: "Student Evaluation" },
        { label: "Society Mentor Evaluation", value: 5, typeText: "Society Mentor Evaluation" },
        { label: "Society ChairPerson Evaluation", value: 6, typeText: "Society ChairPerson Evaluation" },
    ]);

    const [selectedEvalTypeText, setSelectedEvalTypeText] = useState(null);
    const [selectedEvalType, setSelectedEvalType] = useState(null);

    // ✅ Question Text
    const [questionText, setQuestionText] = useState("");

    // ✅ Critical Checkbox State
    const [isCritical, setIsCritical] = useState(false);

    // ✅ Questions List
    const [questions, setQuestions] = useState([]);

    // ✅ Edit Index
    const [editIndex, setEditIndex] = useState(null);

    // ✅ ADD / UPDATE QUESTION
    const handleAddQuestion = () => {

        if (!questionText.trim()) return;

        const questionObj = {
            questionText: questionText,
            isCritical: isCritical,
        };

        if (editIndex !== null) {

            const updated = [...questions];

            updated[editIndex] = questionObj;

            setQuestions(updated);

            setEditIndex(null);

        } else {

            setQuestions([...questions, questionObj]);
        }

        // RESET
        setQuestionText("");
        setIsCritical(false);
    };

    // ✅ DELETE QUESTION
    const handleDelete = (index) => {

        const updated = questions.filter((_, i) => i !== index);

        setQuestions(updated);

        if (editIndex === index) {

            setEditIndex(null);
            setQuestionText("");
            setIsCritical(false);
        }
    };

    // ✅ EDIT QUESTION
    const handleEdit = (index) => {

        setQuestionText(questions[index].questionText);

        setIsCritical(questions[index].isCritical);

        setEditIndex(index);
    };

    // ✅ SAVE TO API
    const handleSave = async () => {

        if (!selectedEvalTypeText) {
            alert("Please select evaluation type");
            return;
        }

        if (questions.length === 0) {
            alert("Please add at least one question");
            return;
        }

        // ✅ API PAYLOAD
        const payload = {
            evaluationType: selectedEvalTypeText,

            questions: questions.map((q) => ({
                questionText: q.questionText,
                isCritical: q.isCritical, // TRUE/FALSE → backend bool
            })),
        };

        console.log("Saving payload:", payload);

        try {

            const response = await fetch(
                `${BASE_URL}/Questionnaire/Create`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (!response.ok) {

                const errorText = await response.text();

                console.log("API Error:", errorText);

                alert("Error saving questionnaire");

                return;
            }

            await response.json();

            alert("Questionnaire saved successfully");

            // RESET
            setQuestions([]);
            setQuestionText("");
            setSelectedEvalType(null);
            setSelectedEvalTypeText(null);
            setEditIndex(null);
            setIsCritical(false);

        } catch (error) {

            console.log("Network Error:", error);

            alert("Network error");
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#f3f6f4" }}>

            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>

                {/* HEADER */}
                <View style={ss.header}>

                    <View style={{ flexDirection: "row", alignItems: "center" }}>

                        <View style={ss.logoCircle}>
                            <Image
                                source={require("../../Assets/BIIT_logo.png")}
                                style={ss.logo}
                            />
                        </View>

                        <View style={{ marginLeft: 10 }}>
                            <Text style={ss.headerTitle}>
                                Create Evaluation Questionnaire
                            </Text>

                            <Text style={ss.headerSubtitle}>
                                Manage and Create Evaluation forms
                            </Text>
                        </View>

                    </View>

                </View>

                {/* INFO */}
                <View style={ss.infoBox}>
                    <Text style={ss.infoText}>
                        Create Custom Evaluation Forms For Your Institution
                    </Text>
                </View>

                {/* DROPDOWN */}
                <View style={{ padding: 15 }}>

                    <Text style={ss.sectionTitle}>
                        Select Evaluation Type
                    </Text>

                    <Dropdown
                        style={ss.dropdown}
                        data={EvalTypes}
                        labelField="label"
                        valueField="value"
                        placeholder="Select Type"
                        value={selectedEvalType}
                        onChange={(item) => {
                            setSelectedEvalType(item.value);
                            setSelectedEvalTypeText(item.typeText);
                        }}
                    />

                </View>

                {/* QUESTION INPUT */}
                <View style={{ paddingHorizontal: 15 }}>

                    <Text style={ss.sectionTitle}>
                        Enter Question
                    </Text>

                    <View style={{ flexDirection: "row", alignItems: "center" }}>

                        <TextInput
                            value={questionText}
                            onChangeText={setQuestionText}
                            placeholder="Type question..."
                            style={ss.questionInput}
                        />

                        <TouchableOpacity
                            style={ss.addBtn}
                            onPress={handleAddQuestion}
                        >
                            <Text style={{ color: "#fff", fontWeight: "700" }}>
                                {editIndex !== null ? "Update" : "+ Add"}
                            </Text>
                        </TouchableOpacity>

                    </View>

                    {/* ✅ CRITICAL CHECKBOX */}
                    <TouchableOpacity
                        style={ss.checkboxContainer}
                        onPress={() => setIsCritical(!isCritical)}
                    >

                        <Icon
                            name={
                                isCritical
                                    ? "check-box"
                                    : "check-box-outline-blank"
                            }
                            size={24}
                            color="#2e7d32"
                        />

                        <Text style={ss.checkboxText}>
                            Mark as Critical Question
                        </Text>

                    </TouchableOpacity>

                </View>

                {/* QUESTIONS LIST */}
                <View style={{ paddingHorizontal: 15, marginTop: 15 }}>

                    <Text style={ss.sectionTitle}>
                        Questions Added ({questions.length})
                    </Text>

                    {questions.map((q, index) => (

                        <View key={index} style={ss.questionCard}>

                            <View style={ss.numberCircle}>
                                <Text style={{ color: "#fff", fontWeight: "700" }}>
                                    {index + 1}
                                </Text>
                            </View>

                            <View style={{ flex: 1 }}>

                                <Text style={ss.questionText}>
                                    {q.questionText}
                                </Text>

                                {/* ✅ CRITICAL BADGE */}
                                {q.isCritical && (
                                    <View style={ss.criticalBadge}>
                                        <Text style={ss.criticalText}>
                                            Critical
                                        </Text>
                                    </View>
                                )}

                            </View>

                            <View style={{ flexDirection: "row" }}>

                                <TouchableOpacity
                                    onPress={() => handleEdit(index)}
                                >
                                    <Icon
                                        name="edit"
                                        size={22}
                                        color="#2e7d32"
                                    />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => handleDelete(index)}
                                    style={{ marginLeft: 12 }}
                                >
                                    <Icon
                                        name="delete"
                                        size={22}
                                        color="red"
                                    />
                                </TouchableOpacity>

                            </View>

                        </View>
                    ))}

                </View>

            </ScrollView>

            {/* BOTTOM BUTTON */}
            <View style={ss.bottomBar}>

                <TouchableOpacity
                    style={ss.saveBtn}
                    onPress={handleSave}
                >
                    <Text style={ss.saveBtnText}>
                        Save / Submit Form
                    </Text>
                </TouchableOpacity>

            </View>

        </View>
    );
};

const ss = StyleSheet.create({

    container: {
        backgroundColor: "#f3f6f4"
    },

    header: {
        backgroundColor: "#fff",
        padding: 14,
        elevation: 6,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
    },

    logoCircle: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: "#e8f5e9",
        justifyContent: "center",
        alignItems: "center"
    },

    logo: {
        width: 34,
        height: 34,
        resizeMode: "contain"
    },

    headerTitle: {
        fontWeight: "700",
        fontSize: 16
    },

    headerSubtitle: {
        fontSize: 12,
        color: "#666",
        paddingTop: 3
    },

    infoBox: {
        backgroundColor: '#c3edd2',
        padding: 15,
        margin: 10,
        borderRadius: 10
    },

    infoText: {
        color: "#000",
        fontSize: 13
    },

    sectionTitle: {
        fontSize: 17,
        fontWeight: "700",
        marginBottom: 6
    },

    dropdown: {
        height: 40,
        borderRadius: 12,
        paddingHorizontal: 16,
        backgroundColor: '#fff',
        marginBottom: 16,
        elevation: 3,
    },

    questionInput: {
        flex: 1,
        height: 40,
        borderRadius: 12,
        paddingHorizontal: 16,
        backgroundColor: '#fff',
        elevation: 3,
    },

    addBtn: {
        marginLeft: 10,
        height: 40,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: "#2e7d32",
        justifyContent: "center",
        alignItems: "center",
    },

    checkboxContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 12,
    },

    checkboxText: {
        marginLeft: 8,
        fontSize: 14,
        color: "#333",
        fontWeight: "600",
    },

    questionCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#e7f4ec",
        padding: 12,
        borderRadius: 14,
        marginBottom: 10,
    },

    numberCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#2e7d32",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },

    questionText: {
        fontSize: 14,
        color: "#333",
    },

    criticalBadge: {
        marginTop: 6,
        backgroundColor: "#ffebee",
        alignSelf: "flex-start",
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 10,
    },

    criticalText: {
        color: "#d32f2f",
        fontSize: 12,
        fontWeight: "700",
    },

    bottomBar: {
        backgroundColor: "#fff",
        padding: 12,
        borderTopWidth: 1,
        borderColor: "#eee",
    },

    saveBtn: {
        backgroundColor: "#0a9c3a",
        height: 48,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },

    saveBtnText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },

});

export default CreateEvaluationQuestionaire;