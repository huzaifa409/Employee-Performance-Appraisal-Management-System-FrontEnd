import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
} from "react-native";

import { Dropdown } from "react-native-element-dropdown";
import Icon from "react-native-vector-icons/MaterialIcons";
import BASE_URL from "../../../API-URL/API";

import { BarChart } from "react-native-gifted-charts";

// ⭐ LOCAL DB FUNCTION
import { ExtragetConfidentialAverageForTeacher } from "../../../Database/db";

const KpiBasedPerformance = () => {

    const [sessions, setSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);

    const [kpis, setKpis] = useState([]);
    const [subKpis, setSubKpis] = useState([]);

    const [selectedKpi, setSelectedKpi] = useState(null);
    const [selectedSubKpi, setSelectedSubKpi] = useState(null);

    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(false);

    const [expandedTeacherId, setExpandedTeacherId] = useState(null);

    const isSubKpiMode = selectedSubKpi !== null;

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        const res = await fetch(`${BASE_URL}/PeerEvaluator/Sessions`);
        const data = await res.json();

        setSessions(data.map(x => ({
            label: x.name,
            value: x.id
        })));
    };

    const fetchKPIs = async (sessionId) => {
        const res = await fetch(
            `${BASE_URL}/KpiBasedPerformance/GetKPIsBySession/${sessionId}`
        );

        const data = await res.json();

        setKpis(data.map(x => ({
            label: x.name,
            value: x.id
        })));
    };

    const fetchSubKPIs = async (kpiId) => {
        if (!selectedSession) return;

        const res = await fetch(
            `${BASE_URL}/KpiBasedPerformance/GetSubKPIsByKPIAndSession/${kpiId}/${selectedSession}`
        );

        const data = await res.json();

        setSubKpis(data.map(x => ({
            label: x.name,
            value: x.id
        })));
    };

    // =========================
    // ⭐ MERGE API + SQLITE
    // =========================
    const generateRanking = async () => {
        if (!selectedSession) {
            alert("Select Session");
            return;
        }

        setLoading(true);

        try {
            let url =
                `${BASE_URL}/KpiBasedPerformance/GetTeacherRankingV2?sessionId=${selectedSession}`;

            if (selectedKpi) url += `&kpiId=${selectedKpi}`;
            if (selectedSubKpi) url += `&subKpiId=${selectedSubKpi}`;

            const res = await fetch(url);
            const apiData = await res.json();

            // =========================
            // MERGE SQLITE + API
            // =========================
            const enriched = await Promise.all(
                apiData.map(async (t) => {

                    // 1. GET LOCAL CONFIDENTIAL SCORE (returns 0–100 normalized avg)
                    const localAvg =
                        await ExtragetConfidentialAverageForTeacher(
                            t.TeacherID,
                            selectedSession,
                            null
                        );

                    // If no confidential score from local DB, return teacher as-is
                    if (!localAvg || localAvg === 0) {
                        return t;
                    }

                    // 2. UPDATE BREAKDOWN — only patch the confidential SubKPI row
                    //    Backend fields: SubKPI, NormalizedScore, SubKPITotalWeight, SubKPIObtainedWeight
                    let confidentialFound = false;

                    const updatedBreakdown = (t.Breakdown || []).map((b) => {

                        const name = (b.SubKPI || "").toLowerCase().trim();

                        // Strictly match only "confidential" SubKPI name
                        const isConfidential = name.includes("confidential");

                        if (isConfidential) {
                            confidentialFound = true;

                            const totalWeight = Number(b.SubKPITotalWeight || 0);

                            // localAvg is already 0–100 normalized; use it directly
                            const newNormalizedScore = Number(localAvg);

                            // Recalculate obtained weight for this SubKPI
                            const newObtainedWeight = Math.round(
                                (newNormalizedScore * totalWeight) / 100,
                                2
                            );

                            return {
                                ...b,
                                NormalizedScore: Number(newNormalizedScore.toFixed(2)),
                                SubKPIObtainedWeight: Number(newObtainedWeight.toFixed(2))
                            };
                        }

                        return b;
                    });

                    // 3. RECALCULATE OVERALL only if a confidential row was patched
                    if (!confidentialFound) {
                        return t;
                    }

                    const totalSessionWeight = updatedBreakdown.reduce(
                        (acc, b) => acc + Number(b.SubKPITotalWeight || 0),
                        0
                    );

                    const totalObtainedWeight = updatedBreakdown.reduce(
                        (acc, b) => acc + Number(b.SubKPIObtainedWeight || 0),
                        0
                    );

                    const newOverallPercentage =
                        totalSessionWeight > 0
                            ? Number(
                                ((totalObtainedWeight / totalSessionWeight) * 100).toFixed(2)
                              )
                            : 0;

                    return {
                        ...t,
                        Breakdown: updatedBreakdown,
                        TotalSessionWeight: Number(totalSessionWeight.toFixed(2)),
                        TotalObtainedWeight: Number(totalObtainedWeight.toFixed(2)),
                        OverallPercentage: newOverallPercentage
                    };
                })
            );

            setTeachers(enriched);
            setExpandedTeacherId(null);

        } catch (e) {
            console.log("Ranking Error:", e);
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // COLORS
    // =========================
    const getBarColor = (value) => {
        if (value >= 75) return "#22c55e";
        if (value >= 50) return "#3b82f6";
        if (value >= 25) return "#facc15";
        return "#ef4444";
    };

    const chartData = (teachers || [])
        .sort((a, b) => b.OverallPercentage - a.OverallPercentage)
        .slice(0, 10)
        .map(t => ({
            value: t.OverallPercentage,
            label: t.TeacherName?.split(" ")[0],
            frontColor: getBarColor(t.OverallPercentage),
            topLabelComponent: () => (
                <Text style={{ fontSize: 10, fontWeight: "bold" }}>
                    {t.OverallPercentage}%
                </Text>
            )
        }));

    // =========================
    // CARD
    // =========================
    const renderTeacher = ({ item, index }) => {

        const isExpanded = expandedTeacherId === item.TeacherID;

        if (isSubKpiMode) {
            return (
                <View style={styles.cardSimple}>
                    <Text style={styles.rankText}>#{index + 1}</Text>

                    <View style={{ flex: 1 }}>
                        <Text style={styles.teacherName}>
                            {item.TeacherName}
                        </Text>
                        <Text style={styles.department}>
                            {item.Department}
                        </Text>
                    </View>

                    <Text style={styles.scoreText}>
                        {item.OverallPercentage}%
                    </Text>
                </View>
            );
        }

        return (
            <TouchableOpacity
                onPress={() =>
                    setExpandedTeacherId(
                        isExpanded ? null : item.TeacherID
                    )
                }
                style={styles.card}
            >
                <Text style={styles.rankText}>#{index + 1}</Text>

                <View style={{ flex: 1 }}>
                    <Text style={styles.teacherName}>
                        {item.TeacherName}
                    </Text>

                    {isExpanded && (
                        <View style={styles.breakdownBox}>
                            {item.Breakdown.map((b, i) => (
                                <View key={i} style={styles.breakdownRow}>
                                    <Text>{b.SubKPI}</Text>
                                    <Text>{b.NormalizedScore}%</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                <Text style={styles.scoreText}>
                    {item.OverallPercentage}%
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>

            <Text style={styles.heading}>
                KPI Based Performance
            </Text>

            <Dropdown
                style={styles.dropdown}
                data={sessions}
                labelField="label"
                valueField="value"
                placeholder="Session"
                value={selectedSession}
                onChange={(item) => {
                    setSelectedSession(item.value);

                    // 🔥 reload KPIs for selected session
                    fetchKPIs(item.value);
                }}
            />

            <Dropdown
                style={styles.dropdown}
                data={kpis}
                labelField="label"
                valueField="value"
                placeholder="KPI"
                onChange={(i) => {
                    setSelectedKpi(i.value);
                    setSelectedSubKpi(null);
                    fetchSubKPIs(i.value);
                }}
            />

            <Dropdown
                style={styles.dropdown}
                data={subKpis}
                labelField="label"
                valueField="value"
                placeholder="Sub KPI"
                value={selectedSubKpi}
                onChange={(i) => setSelectedSubKpi(i.value)}
            />

            <TouchableOpacity
                style={styles.button}
                onPress={generateRanking}
            >
                <Icon name="leaderboard" size={20} color="#fff" />
                <Text style={styles.buttonText}>Generate</Text>
            </TouchableOpacity>

            {/* CHART */}
            {teachers.length > 0 && (
                <BarChart
                    data={chartData}
                    barWidth={22}
                    spacing={30}
                    height={180}
                    noOfSections={4}
                    isAnimated
                />
            )}

            <FlatList
                data={[...teachers].sort(
                    (a, b) => b.OverallPercentage - a.OverallPercentage
                )}
                renderItem={renderTeacher}
            />

        </View>
    );
};

export default KpiBasedPerformance;

// ======================
const styles = StyleSheet.create({

    container: { flex: 1, padding: 16 },

    heading: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#1e3a8a"
    },

    dropdown: {
        height: 50,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        marginBottom: 10,
        paddingHorizontal: 10,
    },

    button: {
        backgroundColor: "#1e3a8a",
        padding: 12,
        borderRadius: 10,
        flexDirection: "row",
        justifyContent: "center",
        gap: 10,
        marginBottom: 10
    },

    buttonText: {
        color: "#fff",
        fontWeight: "bold"
    },

    card: {
        flexDirection: "row",
        padding: 12,
        backgroundColor: "#fff",
        marginBottom: 10,
        borderRadius: 10,
        alignItems: "center"
    },

    cardSimple: {
        flexDirection: "row",
        padding: 12,
        backgroundColor: "#f9fafb",
        marginBottom: 10,
        borderRadius: 10,
        alignItems: "center"
    },

    rankContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#1e3a8a",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10
    },

    rankText: { color: "#fff", fontWeight: "bold" },

    teacherName: { fontWeight: "bold", fontSize: 16 },

    department: { fontSize: 12, color: "#666" },

    scoreText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "green"
    },

    breakdownBox: {
        marginTop: 8,
        padding: 8,
        backgroundColor: "#f3f4f6",
        borderRadius: 8
    },

    breakdownTitle: {
        fontWeight: "bold",
        marginBottom: 5
    },

    breakdownRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 4
    },

    subName: {
        fontSize: 12,
        color: "#333"
    }
});