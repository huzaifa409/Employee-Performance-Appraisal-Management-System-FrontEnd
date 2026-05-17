import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from "react-native";

import { Dropdown } from "react-native-element-dropdown";
import Icon from "react-native-vector-icons/MaterialIcons";
import BASE_URL from "../../../API-URL/API";
import { BarChart } from "react-native-gifted-charts";
import { ExtragetConfidentialAverageForTeacher } from "../../../Database/db";

const KpiBasedComparison = () => {

    const [sessions, setSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);

    const [kpis, setKpis] = useState([]);
    const [selectedKpi, setSelectedKpi] = useState(null);

    const [subKpis, setSubKpis] = useState([]);
    const [selectedSubKpi, setSelectedSubKpi] = useState(null);

    const [teachers, setTeachers] = useState([]);
    const [selectedTeacher1, setSelectedTeacher1] = useState(null);
    const [selectedTeacher2, setSelectedTeacher2] = useState(null);

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const res = await fetch(`${BASE_URL}/PeerEvaluator/Sessions`);
            const data = await res.json();
            setSessions(data.map(x => ({ label: x.name, value: x.id })));
        } catch (e) {
            console.log("fetchSessions error:", e);
        }
    };

    const handleSessionChange = (item) => {
        setSelectedSession(item.value);
        setSelectedKpi(null);
        setSelectedSubKpi(null);
        setSelectedTeacher1(null);
        setSelectedTeacher2(null);
        setKpis([]);
        setSubKpis([]);
        setTeachers([]);
        setResult(null);
        fetchTeachers(item.value);
        fetchKPIs(item.value);
    };

    const fetchTeachers = async (sessionId) => {
        try {
            const res = await fetch(
                `${BASE_URL}/KpiBaseComparision/GetTeachersBySession/${sessionId}`
            );
            const data = await res.json();
            // only show name — no department
            setTeachers(
                data.map(x => ({ label: x.name, value: x.id }))
            );
        } catch (e) {
            console.log("fetchTeachers error:", e);
        }
    };

    const fetchKPIs = async (sessionId) => {
        try {
            const res = await fetch(
                `${BASE_URL}/KpiBasedPerformance/GetKPIsBySession/${sessionId}`
            );
            const data = await res.json();
            setKpis(data.map(x => ({ label: x.name, value: x.id })));
        } catch (e) {
            console.log("fetchKPIs error:", e);
        }
    };

    const fetchSubKPIs = async (kpiId) => {
        if (!selectedSession) return;
        try {
            const res = await fetch(
                `${BASE_URL}/KpiBasedPerformance/GetSubKPIsByKPIAndSession/${kpiId}/${selectedSession}`
            );
            const data = await res.json();
            setSubKpis(data.map(x => ({ label: x.name, value: x.id })));
        } catch (e) {
            console.log("fetchSubKPIs error:", e);
        }
    };

    // Merge confidential score from local SQLite into the teacher breakdown
    const mergeConfidential = async (teacherData, sessionId) => {
        if (!teacherData) return teacherData;

        const localAvg = await ExtragetConfidentialAverageForTeacher(
            teacherData.TeacherID,
            sessionId,
            null
        );

        if (!localAvg || localAvg === 0) return teacherData;

        let confidentialFound = false;

        const updatedBreakdown = (teacherData.Breakdown || []).map((b) => {
            const name = (b.SubKPI || "").toLowerCase().trim();
            if (name.includes("confidential")) {
                confidentialFound = true;
                const totalWeight = Number(b.SubKPITotalWeight || 0);
                const newNormalizedScore = Number(localAvg);
                const newObtainedWeight = Number(
                    ((newNormalizedScore * totalWeight) / 100).toFixed(2)
                );
                return {
                    ...b,
                    NormalizedScore: Number(newNormalizedScore.toFixed(2)),
                    SubKPIObtainedWeight: newObtainedWeight
                };
            }
            return b;
        });

        if (!confidentialFound) return teacherData;

        const totalSessionWeight = updatedBreakdown.reduce(
            (acc, b) => acc + Number(b.SubKPITotalWeight || 0), 0
        );
        const totalObtainedWeight = updatedBreakdown.reduce(
            (acc, b) => acc + Number(b.SubKPIObtainedWeight || 0), 0
        );
        const newOverall =
            totalSessionWeight > 0
                ? Number(((totalObtainedWeight / totalSessionWeight) * 100).toFixed(2))
                : 0;

        return {
            ...teacherData,
            Breakdown: updatedBreakdown,
            TotalSessionWeight: Number(totalSessionWeight.toFixed(2)),
            TotalObtainedWeight: Number(totalObtainedWeight.toFixed(2)),
            OverallPercentage: newOverall
        };
    };

    const runCompare = async () => {
        if (!selectedSession)  { alert("Please select a session");              return; }
        if (!selectedTeacher1) { alert("Please select Teacher 1");              return; }
        if (!selectedTeacher2) { alert("Please select Teacher 2");              return; }
        if (selectedTeacher1 === selectedTeacher2) {
            alert("Please select two different teachers");
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            let url =
                `${BASE_URL}/KpiBaseComparision/GetTeacherComparison` +
                `?sessionId=${selectedSession}` +
                `&teacher1Id=${selectedTeacher1}` +
                `&teacher2Id=${selectedTeacher2}`;

            if (selectedKpi)    url += `&kpiId=${selectedKpi}`;
            if (selectedSubKpi) url += `&subKpiId=${selectedSubKpi}`;

            const res  = await fetch(url);
            const data = await res.json();

            const t1 = await mergeConfidential(data.Teacher1, selectedSession);
            const t2 = await mergeConfidential(data.Teacher2, selectedSession);

            setResult({ Teacher1: t1, Teacher2: t2 });
        } catch (e) {
            console.log("runCompare error:", e);
        } finally {
            setLoading(false);
        }
    };

    // Bar colour based on score tier
    const getBarColor = (value) => {
        if (value >= 75) return "#22c55e";
        if (value >= 50) return "#f97316";
        if (value >= 25) return "#facc15";
        return "#ef4444";
    };

    // Two-bar chart data
    const chartData = result ? [
        {
            value: result.Teacher1?.OverallPercentage || 0,
            label: result.Teacher1?.TeacherName?.split(" ")[0] || "T1",
            frontColor: getBarColor(result.Teacher1?.OverallPercentage || 0),
            topLabelComponent: () => (
                <Text style={{ fontSize: 10, fontWeight: "bold" }}>
                    {result.Teacher1?.OverallPercentage}%
                </Text>
            )
        },
        {
            value: result.Teacher2?.OverallPercentage || 0,
            label: result.Teacher2?.TeacherName?.split(" ")[0] || "T2",
            frontColor: getBarColor(result.Teacher2?.OverallPercentage || 0),
            topLabelComponent: () => (
                <Text style={{ fontSize: 10, fontWeight: "bold" }}>
                    {result.Teacher2?.OverallPercentage}%
                </Text>
            )
        }
    ] : [];

    // ── BREAKDOWN TABLE ──────────────────────────────────────────────────────
    // Renders two columns side by side: Teacher 1 scores | Teacher 2 scores
    // Each row = one Sub-KPI
    const renderBreakdownTable = () => {
        if (!result?.Teacher1 || !result?.Teacher2) return null;

        const b1 = result.Teacher1.Breakdown || [];

        // build lookup map for Teacher 2 rows by SubKPI name
        const b2Map = {};
        (result.Teacher2.Breakdown || []).forEach(b => { b2Map[b.SubKPI] = b; });

        // union of all SubKPI names from both teachers
        const allSubKpis = [...new Set([
            ...b1.map(b => b.SubKPI),
            ...(result.Teacher2.Breakdown || []).map(b => b.SubKPI)
        ])];

        return (
            <View style={styles.tableContainer}>

                {/* Table title */}
                <Text style={styles.tableTitle}>Score Breakdown</Text>

                {/* Header row */}
                <View style={styles.tableHeaderRow}>
                    <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Sub-KPI</Text>
                    <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: "center" }]}>
                        {result.Teacher1?.TeacherName?.split(" ")[1] || "T1"}
                    </Text>
                    <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: "center" }]}>
                        {result.Teacher2?.TeacherName?.split(" ")[1] || "T2"}
                    </Text>
                </View>

                {/* Data rows */}
                {allSubKpis.map((subKpiName, i) => {
                    const row1 = b1.find(b => b.SubKPI === subKpiName);
                    const row2 = b2Map[subKpiName];

                    const t1Score = row1 ? row1.NormalizedScore : 0;
                    const t2Score = row2 ? row2.NormalizedScore : 0;

                    return (
                        <View
                            key={i}
                            style={[styles.tableRow, i % 2 === 0 && { backgroundColor: "#f9fafb" }]}
                        >
                            {/* Sub-KPI name */}
                            <Text style={[styles.tableCell, { flex: 2 }]}>{subKpiName}</Text>

                            {/* Teacher 1 score */}
                            <Text style={[styles.tableCell, { flex: 1, textAlign: "center" }]}>
                                {t1Score}%
                            </Text>

                            {/* Teacher 2 score */}
                            <Text style={[styles.tableCell, { flex: 1, textAlign: "center" }]}>
                                {t2Score}%
                            </Text>
                        </View>
                    );
                })}

            </View>
        );
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

            <Text style={styles.heading}>KPI-Based Teacher Comparison</Text>

            {/* ── FILTER SECTION ── */}
            <View style={styles.section}>

                <Text style={styles.label}>Session</Text>
                <Dropdown
                    style={styles.dropdown}
                    data={sessions}
                    labelField="label"
                    valueField="value"
                    placeholder="Select Session"
                    value={selectedSession}
                    onChange={handleSessionChange}
                />

                <Text style={styles.label}>KPI</Text>
                <Dropdown
                    style={styles.dropdown}
                    data={[
                        { label: "All KPIs", value: null },
                        ...kpis
                    ]}
                    labelField="label"
                    valueField="value"
                    placeholder="All KPIs"
                    value={selectedKpi}
                    onChange={(item) => {
                        setSelectedKpi(item.value);
                        setSelectedSubKpi(null);
                        setSubKpis([]);
                        if (item.value) fetchSubKPIs(item.value);
                    }}
                />

                <Text style={styles.label}>Sub-KPI</Text>
                <Dropdown
                    style={styles.dropdown}
                    data={[
                        { label: "All Sub-KPIs", value: null },
                        ...subKpis
                    ]}
                    labelField="label"
                    valueField="value"
                    placeholder="All Sub-KPIs"
                    value={selectedSubKpi}
                    onChange={(item) => setSelectedSubKpi(item.value)}
                />

                {/* Teacher dropdowns side by side */}
                <View style={styles.row}>
                    <View style={styles.halfCol}>
                        <Text style={styles.label}>Teacher 1</Text>
                        <Dropdown
                            style={styles.dropdown}
                            data={teachers}
                            labelField="label"
                            valueField="value"
                            placeholder="Select"
                            value={selectedTeacher1}
                            onChange={(item) => setSelectedTeacher1(item.value)}
                        />
                    </View>
                    <View style={[styles.halfCol, { marginLeft: 8 }]}>
                        <Text style={styles.label}>Teacher 2</Text>
                        <Dropdown
                            style={styles.dropdown}
                            data={teachers}
                            labelField="label"
                            valueField="value"
                            placeholder="Select"
                            value={selectedTeacher2}
                            onChange={(item) => setSelectedTeacher2(item.value)}
                        />
                    </View>
                </View>

                <TouchableOpacity style={styles.button} onPress={runCompare}>
                    <Icon name="compare-arrows" size={18} color="#fff" />
                    <Text style={styles.buttonText}>Compare</Text>
                </TouchableOpacity>

            </View>

            {/* ── LOADING ── */}
            {loading && (
                <ActivityIndicator size="large" color="#1e3a8a" style={{ marginVertical: 20 }} />
            )}

            {/* ── RESULTS ── */}
            {result && !loading && (
                <>
                    {/* Bar chart */}
                    <View style={styles.section}>
                        <BarChart
                            data={chartData}
                            barWidth={60}
                            spacing={60}
                            height={200}
                            noOfSections={4}
                            maxValue={100}
                            yAxisLabelSuffix="%"
                            isAnimated
                        />
                    </View>

                    {/* Teacher summary cards — two simple views side by side */}
                    <View style={styles.row}>

                        {/* Teacher 1 card */}
                        <View style={[styles.teacherCard, { flex: 1, marginRight: 6 }]}>
                            <Text style={styles.teacherName}>
                                {result.Teacher1?.TeacherName}
                            </Text>
                            <Text style={styles.teacherScore}>
                                {result.Teacher1?.OverallPercentage}%
                            </Text>
                            <Text style={styles.teacherSubLabel}>
                                {result.Teacher1?.TotalObtainedWeight} / {result.Teacher1?.TotalSessionWeight}
                            </Text>
                        </View>

                        {/* Teacher 2 card */}
                        <View style={[styles.teacherCard, { flex: 1, marginLeft: 6 }]}>
                            <Text style={styles.teacherName}>
                                {result.Teacher2?.TeacherName}
                            </Text>
                            <Text style={styles.teacherScore}>
                                {result.Teacher2?.OverallPercentage}%
                            </Text>
                            <Text style={styles.teacherSubLabel}>
                                {result.Teacher2?.TotalObtainedWeight} / {result.Teacher2?.TotalSessionWeight}
                            </Text>
                        </View>

                    </View>

                    {/* Evaluation breakdown: Teacher 1 list + Teacher 2 list side by side */}
                    <View style={styles.row}>

                        {/* Teacher 1 breakdown list */}
                        <View style={[styles.breakdownCol, { marginRight: 6 }]}>
                            <Text style={styles.breakdownColTitle}>
                                {result.Teacher1?.TeacherName?.split(" ")[1]} — Scores
                            </Text>
                            {(result.Teacher1?.Breakdown || []).map((b, i) => (
                                <View key={i} style={styles.breakdownItem}>
                                    <Text style={styles.breakdownSubKpi}>{b.SubKPI}</Text>
                                    <Text style={styles.breakdownValue}>{b.NormalizedScore}%</Text>
                                </View>
                            ))}
                        </View>

                        {/* Teacher 2 breakdown list */}
                        <View style={[styles.breakdownCol, { marginLeft: 6 }]}>
                            <Text style={styles.breakdownColTitle}>
                                {result.Teacher2?.TeacherName?.split(" ")[1]} — Scores
                            </Text>
                            {(result.Teacher2?.Breakdown || []).map((b, i) => (
                                <View key={i} style={styles.breakdownItem}>
                                    <Text style={styles.breakdownSubKpi}>{b.SubKPI}</Text>
                                    <Text style={styles.breakdownValue}>{b.NormalizedScore}%</Text>
                                </View>
                            ))}
                        </View>

                    </View>

                    {/* Combined table for direct row-by-row comparison */}
                    {renderBreakdownTable()}

                </>
            )}

            <View style={{ height: 30 }} />

        </ScrollView>
    );
};

export default KpiBasedComparison;

const styles = StyleSheet.create({

    container: {
        flex: 1,
        padding: 14,
        backgroundColor: "#f5f5f5",
    },

    heading: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#1e3a8a",
        marginBottom: 12,
    },

    // white card section
    section: {
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
    },

    label: {
        fontSize: 12,
        color: "#555",
        marginBottom: 4,
        marginTop: 8,
    },

    dropdown: {
        height: 44,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        paddingHorizontal: 10,
        backgroundColor: "#fff",
        marginBottom: 4,
    },

    // side-by-side row helper
    row: {
        flexDirection: "row",
        marginBottom: 12,
    },

    halfCol: {
        flex: 1,
    },

    button: {
        backgroundColor: "#1e3a8a",
        padding: 12,
        borderRadius: 8,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        marginTop: 12,
    },

    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 14,
    },

    // simple teacher summary card — name, overall%, obtained/total
    teacherCard: {
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 12,
        alignItems: "center",
    },

    teacherName: {
        fontSize: 13,
        fontWeight: "bold",
        color: "#1f2937",
        textAlign: "center",
        marginBottom: 6,
    },

    teacherScore: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#1e3a8a",
        marginBottom: 4,
    },

    teacherSubLabel: {
        fontSize: 11,
        color: "#888",
    },

    // individual teacher breakdown column
    breakdownCol: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 10,
    },

    breakdownColTitle: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#1e3a8a",
        marginBottom: 8,
    },

    breakdownItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },

    breakdownSubKpi: {
        fontSize: 11,
        color: "#333",
        flex: 1,
        paddingRight: 4,
    },

    breakdownValue: {
        fontSize: 11,
        fontWeight: "bold",
        color: "#1e3a8a",
    },

    // combined comparison table
    tableContainer: {
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
    },

    tableTitle: {
        fontSize: 13,
        fontWeight: "bold",
        color: "#1f2937",
        marginBottom: 10,
    },

    tableHeaderRow: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
        paddingBottom: 6,
        marginBottom: 4,
    },

    tableHeaderCell: {
        fontSize: 11,
        fontWeight: "bold",
        color: "#555",
    },

    tableRow: {
        flexDirection: "row",
        paddingVertical: 7,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },

    tableCell: {
        fontSize: 11,
        color: "#333",
    },

});