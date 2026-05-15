/*
====================================================================
📊 TEACHER PERFORMANCE ANALYTICS SCREEN (FYP LEVEL)
====================================================================

🎯 PURPOSE OF THIS SCREEN:

This screen is responsible for:

1. Fetching evaluation data (from SQLite or API)
2. Filtering data by TeacherId
3. Calculating:
   - Average Score
   - Percentage Performance
4. Displaying:
   - Bar Chart (question-wise scores)
   - Pie Chart (overall performance)
5. Helping admin understand teacher performance visually

====================================================================

📌 DATA FLOW:

SQLite / API
    ↓
Filter by TeacherId
    ↓
Calculate:
   - Average
   - Percentage
    ↓
Convert data for charts
    ↓
Render Graphs

====================================================================
*/

import React, { useEffect, useState } from "react";

import {
    View,
    Text,
    ActivityIndicator,
    StyleSheet,
    ScrollView
} from "react-native";

import { BarChart, PieChart } from "react-native-gifted-charts";

// OPTIONAL: SQLite function (you already created this)
import { getEvaluationByTeacher } from "../../Database/db";

const TeacherAnalyticsScreen = ({ route }) => {

    // =========================================================
    // GET TEACHER ID FROM NAVIGATION
    // =========================================================
    const { teacherId } = route.params;

    // =========================================================
    // STATE VARIABLES
    // =========================================================

    // Stores raw evaluation data
    const [data, setData] = useState([]);

    // Loading state
    const [loading, setLoading] = useState(true);

    // =========================================================
    // FETCH DATA FROM SQLITE (OR API)
    // =========================================================

    const loadTeacherEvaluations = async () => {

        try {

            /*
            -----------------------------------------------------
            STEP 1: FETCH DATA FROM SQLITE
            -----------------------------------------------------

            This function returns all evaluations for teacherId
            */

            const result = await getEvaluationByTeacher(teacherId);

            setData(result);

        } catch (error) {

            console.log("DATA FETCH ERROR:", error);

        } finally {

            setLoading(false);
        }
    };

    // Run on screen load
    useEffect(() => {
        loadTeacherEvaluations();
    }, []);

    // =========================================================
    // CALCULATE AVERAGE SCORE
    // =========================================================

    /*
    Formula:
    Average = Total Score / Number of Questions
    */

    const calculateAverage = () => {

        if (data.length === 0) return 0;

        const total = data.reduce(
            (sum, item) => sum + item.score,
            0
        );

        return total / data.length;
    };

    // =========================================================
    // CALCULATE PERCENTAGE
    // =========================================================

    /*
    Each question max score = 4

    Percentage = (Total Score / Max Score) * 100
    */

    const calculatePercentage = () => {

        if (data.length === 0) return 0;

        const total = data.reduce(
            (sum, item) => sum + item.score,
            0
        );

        const max = data.length * 4;

        return (total / max) * 100;
    };

    // =========================================================
    // BAR CHART DATA (QUESTION WISE)
    // =========================================================

    const barData = data.map((item) => ({
        value: item.score,
        label: `Q${item.questionID}`
    }));

    // =========================================================
    // PIE CHART DATA (PERFORMANCE SPLIT)
    // =========================================================

    const percentage = calculatePercentage();

    const pieData = [
        {
            value: percentage,
            color: "green",
            text: "Performance"
        },
        {
            value: 100 - percentage,
            color: "red",
            text: "Remaining"
        }
    ];

    // =========================================================
    // LOADING SCREEN
    // =========================================================

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="green" />
            </View>
        );
    }

    // =========================================================
    // MAIN UI
    // =========================================================

    return (

        <ScrollView style={styles.container}>

            {/* ================= TITLE ================= */}
            <Text style={styles.title}>
                Teacher Performance Analytics
            </Text>

            {/* ================= STATS SECTION ================= */}

            <View style={styles.card}>

                <Text style={styles.text}>
                    📊 Average Score: {calculateAverage().toFixed(2)}
                </Text>

                <Text style={styles.text}>
                    📈 Percentage: {percentage.toFixed(2)}%
                </Text>

            </View>

            {/* ================= BAR CHART ================= */}

            <Text style={styles.sectionTitle}>
                Question Wise Performance
            </Text>

            <BarChart
                data={barData}
                barWidth={20}
                spacing={30}
                height={220}
                maxValue={4}
                isAnimated
            />

            {/* ================= PIE CHART ================= */}

            <Text style={styles.sectionTitle}>
                Overall Performance
            </Text>

            <PieChart
                data={pieData}
                radius={100}
            />

        </ScrollView>
    );
};

export default TeacherAnalyticsScreen;

// =========================================================
// STYLES
// =========================================================

const styles = StyleSheet.create({

    container: {
        flex: 1,
        padding: 15,
        backgroundColor: "#fff"
    },

    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },

    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 15
    },

    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginTop: 20,
        marginBottom: 10
    },

    card: {
        padding: 15,
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: 15
    },

    text: {
        fontSize: 14,
        marginVertical: 5
    }
});