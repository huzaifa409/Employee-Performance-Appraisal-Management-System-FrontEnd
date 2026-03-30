import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions, Alert } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import BASE_URL from "../../API-URL/API";

const { width } = Dimensions.get("window");

const SeeOwnPerformance = ({ route }) => {
    const { userId } = route.params; 
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchPerformance();
    }, [userId]);

    const fetchPerformance = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${BASE_URL}/Performance/GetMyPerformance/${userId}`);
            
            // 1. Safety check: Ensure the server sent JSON and not an HTML error page
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const textError = await response.text();
                console.error("Server returned non-JSON. It might be a crash page:", textError);
                throw new Error("Internal Server Error (Check Backend)");
            }

            const result = await response.json();

            // 2. Handle the "NotEnrolled" status specifically for users like T001
            if (result.Status === "NotEnrolled") {
                Alert.alert("Enrollment Required", result.Message);
                setData(result); 
            } else if (result.Status === "Success" || result.Status === "NoData") {
                setData(result);
            } else {
                Alert.alert("Error", result.Message || "Failed to fetch performance data.");
            }
        } catch (error) {
            console.error("Fetch Error:", error.message);
            Alert.alert("Network Error", "Could not connect to the server.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}><ActivityIndicator size="large" color="#1E7F4D" /></View>
        );
    }

    // If no data was found at all
    if (!data) {
        return (
            <View style={styles.center}>
                <Text>No performance records available for {userId}.</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* Top Info Section */}
            <View style={styles.topInfo}>
                <View>
                    <Text style={styles.nameText}>{data?.TeacherName || "N/A"}</Text>
                    <Text style={styles.idText}>ID: {data?.TeacherID} | Session: {data?.SessionName}</Text>
                </View>
            </View>

            {/* Aggregate Score Card */}
            <View style={styles.scoreCard}>
                <View>
                    <Text style={styles.analyticsLabel}>ACADEMIC ANALYTICS</Text>
                    <Text style={styles.performanceHeading}>YOUR PERFORMANCE</Text>
                    <Text style={styles.sessionLabel}>SESSION: {data?.SessionName?.toUpperCase()}</Text>
                </View>
                <View style={styles.aggregateCircle}>
                    <Text style={styles.aggregateSub}>AGGREGATE SCORE</Text>
                    <Text style={styles.aggregateValue}>{data?.OverallPercentage ?? 0}%</Text>
                </View>
            </View>

            {/* Chart Section - Only show if there is chart data */}
            {data?.ChartData?.length > 0 ? (
                <View style={styles.chartContainer}>
                    <Text style={styles.sectionTitle}>METRIC BREAKDOWN</Text>
                    <Text style={styles.sectionSub}>Detailed KPI Analysis</Text>
                    
                    <View style={{ marginTop: 20, alignItems: 'center' }}>
                        <BarChart
                            data={data.ChartData}
                            barWidth={35}
                            noOfSections={4}
                            maxValue={100}
                            isAnimated
                            roundedTop
                            capColor={'rgba(30, 127, 77, 0.5)'}
                            yAxisThickness={0}
                            xAxisThickness={1}
                            xAxisColor={'#E0E0E0'}
                            yAxisTextStyle={{ color: '#999', fontSize: 10 }}
                            labelTextStyle={{ color: '#444', fontSize: 10, fontWeight: 'bold' }}
                        />
                    </View>
                </View>
            ) : (
                <View style={styles.emptyNotice}>
                    <Text style={styles.emptyText}>No chart data to display for this session.</Text>
                </View>
            )}

            {/* KPI Cards Grid */}
            <View style={styles.grid}>
                {data?.Blocks?.map((item, index) => (
                    <View key={index} style={styles.kpiCard}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.maxWeight}>MAX WEIGHT: {item.MaxWeight}</Text>
                        </View>
                        <Text style={styles.kpiTitle}>{item.Title?.toUpperCase()}</Text>
                        <Text style={[styles.kpiValue, { color: item.Value > 50 ? '#1E7F4D' : '#D9534F' }]}>
                            {item.Value}%
                        </Text>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: `${item.Value}%` }]} />
                        </View>
                    </View>
                ))}
            </View>

            <View style={{ height: 50 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F9FBFA" },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    topInfo: { padding: 20, backgroundColor: '#FFF' },
    nameText: { fontSize: 20, fontWeight: 'bold', color: '#000' },
    idText: { fontSize: 13, color: '#666', marginTop: 4 },
    
    scoreCard: {
        backgroundColor: '#166534', 
        margin: 15,
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    analyticsLabel: { color: '#A7F3D0', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
    performanceHeading: { color: '#FFF', fontSize: 22, fontWeight: '900', marginTop: 5 },
    sessionLabel: { color: '#FFF', fontSize: 11, marginTop: 5, opacity: 0.8 },
    
    aggregateCircle: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        padding: 15,
        borderRadius: 15,
        alignItems: 'center',
        minWidth: 100
    },
    aggregateSub: { color: '#FFF', fontSize: 8, fontWeight: 'bold' },
    aggregateValue: { color: '#FFF', fontSize: 28, fontWeight: 'bold' },

    chartContainer: {
        backgroundColor: '#FFF',
        marginHorizontal: 15,
        padding: 20,
        borderRadius: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10
    },
    sectionTitle: { fontSize: 16, fontWeight: '900', color: '#001A09' },
    sectionSub: { fontSize: 10, color: '#999', letterSpacing: 1 },

    emptyNotice: { margin: 20, alignItems: 'center' },
    emptyText: { color: '#999', fontStyle: 'italic' },

    grid: { 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        padding: 10, 
        justifyContent: 'space-between' 
    },
    kpiCard: {
        backgroundColor: '#FFF',
        width: (width / 2) - 20,
        padding: 15,
        borderRadius: 15,
        marginBottom: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.05
    },
    cardHeader: { alignItems: 'flex-end' },
    maxWeight: { fontSize: 9, color: '#999', fontWeight: 'bold' },
    kpiTitle: { fontSize: 12, fontWeight: '800', color: '#666', marginTop: 10 },
    kpiValue: { fontSize: 24, fontWeight: '900', marginVertical: 5 },
    progressBarBg: { height: 6, backgroundColor: '#E8F5E9', borderRadius: 3, overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: '#1E7F4D' }
});

export default SeeOwnPerformance;