import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    TouchableOpacity
} from "react-native";
import { BarChart } from "react-native-gifted-charts";
import BASE_URL from "../../API-URL/API";

const CoursePerformanceScreen = ({navigation , route }) => {
    const { teacherId, courseCode, sessionId } = route.params;

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPerformance();
    }, []);

    const fetchPerformance = async () => {
        try {
            const res = await fetch(
                `${BASE_URL}/Performance/GetTeacherResultByCourse?teacherId=${teacherId}&courseCode=${courseCode}&sessionId=${sessionId}`
            );

            const result = await res.json();
            setData(result);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
    }

    // Chart Data
    const chartData = [
        {
            value: data.PeerAverage,
            label: "Peer",
            frontColor: "#8b5cf6",
        },
        {
            value: data.StudentAverage,
            label: "Student",
            frontColor: "#3b82f6",
        },
    ];

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Teacher Performance</Text>

            {/* 🔥 GRAPH */}
            <View style={styles.chartCard}>
                <BarChart
                    data={chartData}
                    height={220}
                    barWidth={40}
                    spacing={40}
                    roundedTop
                    xAxisLabelTextStyle={{ fontWeight: "bold" }}
                />
            </View>

            {/* 🔥 DETAILS CARD */}
            <View style={styles.card}>
                <Text style={styles.name}>{data.Name}</Text>

                <Text>Peer Score</Text>
                <Text style={styles.value}>
                    {data.PeerTotal.toFixed(1)} / {data.PeerMax.toFixed(1)}
                </Text>

                <Text>Student Score</Text>
                <Text style={styles.value}>
                    {data.StudentTotal.toFixed(1)} / {data.StudentMax.toFixed(1)}
                </Text>

                <Text>Total Score</Text>
                <Text style={styles.value}>
                    {data.Total.toFixed(1)} / {data.TotalMax.toFixed(1)}
                </Text>

                <Text>Percentage</Text>
                <Text style={styles.percentage}>
                    {data.Percentage.toFixed(1)}%
                </Text>
            </View>

            <TouchableOpacity
                style={styles.detailBtn}
                onPress={() =>
                    navigation.navigate("DetailPerformance", {
                        teacherId,
                        courseCode,
                    })
                }
            >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                    View Detailed Analysis
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

export default CoursePerformanceScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f3f4f6",
        padding: 15,
    },

    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
    },

    chartCard: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 15,
        marginBottom: 15,
        elevation: 3,
    },

    card: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 15,
        elevation: 3,
    },

    name: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 10,
    },

    value: {
        marginBottom: 10,
        fontWeight: "bold",
    },

    percentage: {
        fontSize: 18,
        color: "#16a34a",
        fontWeight: "bold",
    },
    detailBtn: {
  backgroundColor: "#6d28d9",
  padding: 12,
  borderRadius: 12,
  alignItems: "center",
  marginTop: 15,
},
});