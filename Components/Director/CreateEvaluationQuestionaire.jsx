import React, { useState, useEffect } from "react";
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
        { label: "Teacher Evaluation", value: 1, typeText: "Teacher Evaluation" },
        { label: "Course Evaluation", value: 2, typeText: "Course Evaluation" },
        { label: "Peer Evaluation", value: 3, typeText: "Peer Evaluation" },
        { label: "Lab Evaluation", value: 4, typeText: "Lab Evaluation" },
    ]);


    const [selectedEvalTypeText, setSelectedEvalTypeText] = useState(null);

   
    const [selectedEvalType, setSelectedEvalType] = useState(null);

    
    const [questionText, setQuestionText] = useState("");

   
    const [questions, setQuestions] = useState([]);

   
    const [editIndex, setEditIndex] = useState(null);


  
    const handleAddQuestion = () => {
        if (!questionText.trim()) return;

        if (editIndex !== null) {
            const updated = [...questions];
            updated[editIndex] = questionText;
            setQuestions(updated);
            setEditIndex(null);
        } else {
            setQuestions([...questions, questionText]);
        }

        setQuestionText("");
    };


    
    const handleDelete = (index) => {
        const updated = questions.filter((_, i) => i !== index);
        setQuestions(updated);

        if (editIndex === index) {
            setEditIndex(null);
            setQuestionText("");
        }
    };


    
    const handleEdit = (index) => {
        setQuestionText(questions[index]);
        setEditIndex(index);
    };

    const handleSave = async () => {

    if (!selectedEvalTypeText) {
        alert("Please select evaluation type");
        return;
    }

    if (questions.length === 0) {
        alert("Please add at least one question");
        return;
    }

    const payload = {
        evaluationType: selectedEvalTypeText,
        questions: questions,
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
            alert("Error saving questionnaire ");
            return;
        }

        await response.json();

        alert("Questionnaire saved successfully ");

       
        setQuestions([]);               
        setQuestionText("");            
        setSelectedEvalType(null);
        setSelectedEvalTypeText(null);   
        setEditIndex(null);

    } catch (error) {
        console.log("Network Error:", error);
        alert("Network error ");
    }
};



    return (
        <View style={{ flex: 1, backgroundColor: "#f3f6f4" }}>

           
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>

              
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

              
                <View style={ss.infoBox}>
                    <Text style={ss.infoText}>
                        Create Custom Evaluation Forms For Your Institution
                    </Text>
                </View>

               
                <View style={{ padding: 15 }}>
                    <Text style={ss.sectionTitle}>Select Evaluation Type</Text>

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

                
                <View style={{ paddingHorizontal: 15 }}>
                    <Text style={ss.sectionTitle}>Enter Question</Text>

                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <TextInput
                            value={questionText}
                            onChangeText={setQuestionText}
                            placeholder="Type question..."
                            style={ss.questionInput}
                        />

                        <TouchableOpacity style={ss.addBtn} onPress={handleAddQuestion}>
                            <Text style={{ color: "#fff", fontWeight: "700" }}>
                                {editIndex !== null ? "Update" : "+ Add"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                
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

                            <Text style={ss.questionText}>{q}</Text>

                            <View style={{ flexDirection: "row" }}>
                                <TouchableOpacity onPress={() => handleEdit(index)}>
                                    <Icon name="edit" size={22} color="#2e7d32" />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => handleDelete(index)}
                                    style={{ marginLeft: 12 }}
                                >
                                    <Icon name="delete" size={22} color="red" />
                                </TouchableOpacity>
                            </View>

                        </View>
                    ))}
                </View>

            </ScrollView>


            <View style={ss.bottomBar}>
                <TouchableOpacity style={ss.saveBtn} onPress={handleSave}>
                    <Text style={ss.saveBtnText}>
                        Save / Submit Form
                    </Text>
                </TouchableOpacity>
            </View>

        </View>
    );
}

const ss = StyleSheet.create({
    container: { backgroundColor: "#f3f6f4" },

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

    logo: { width: 34, height: 34, resizeMode: "contain" },

    headerTitle: { fontWeight: "700", fontSize: 16 },

    headerSubtitle: { fontSize: 12, color: "#666", paddingTop: 3 },

    infoBox: {
        backgroundColor: '#c3edd2',
        padding: 15,
        margin: 10,
        borderRadius: 10
    },

    infoText: { color: "#000", fontSize: 13 },

    sectionTitle: { fontSize: 17, fontWeight: "700", marginBottom: 6 },

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
        flex: 1,
        fontSize: 14,
        color: "#333",
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
