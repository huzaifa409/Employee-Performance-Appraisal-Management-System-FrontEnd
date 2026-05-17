// import React, { useEffect, useState } from "react";
// import {
//     View,
//     Text,
//     StyleSheet,
//     TouchableOpacity,
//     FlatList,
//     ActivityIndicator,
// } from "react-native";

// import { Dropdown } from "react-native-element-dropdown";
// import Icon from "react-native-vector-icons/MaterialIcons";
// import BASE_URL from "../../../API-URL/API";

// import { BarChart } from "react-native-gifted-charts";

// // ⭐ LOCAL SQLITE FUNCTION
// // This function fetches confidential evaluation average stored locally in SQLite
// import { ExtragetConfidentialAverageForTeacher } from "../../../Database/db";

// /**
// ============================================================
// 📌 SCREEN OVERVIEW (VERY IMPORTANT)
// ============================================================

// This screen does 3 MAIN THINGS:

// 1️⃣ Fetch KPI data from backend API
//    → Teachers, KPIs, SubKPIs, Scores

// 2️⃣ Fetch confidential evaluation from LOCAL SQLITE DB
//    → Stored offline evaluation payloads

// 3️⃣ MERGE both data sources
//    → Replace ONLY "Confidential SubKPI score" in API result

// 4️⃣ Show:
//    - Bar Chart (Overall Performance)
//    - Teacher List (Ranking)
//    - Breakdown (SubKPI scores)

// ============================================================
// 📌 HOW DATA FLOWS
// ============================================================

// API Data:
// Teacher → KPI → SubKPI → Score Breakdown

// Local SQLite:
// Teacher → Confidential Evaluation → Average Score (0–100)

// FINAL OUTPUT:
// API + SQLite merged → Updated performance graph

// ============================================================
// */

// const KpiBasedPerformance = () => {

//     // =========================
//     // SESSION DROPDOWN DATA
//     // =========================
//     const [sessions, setSessions] = useState([]);
//     const [selectedSession, setSelectedSession] = useState(null);

//     // =========================
//     // KPI + SUBKPI DROPDOWNS
//     // =========================
//     const [kpis, setKpis] = useState([]);
//     const [subKpis, setSubKpis] = useState([]);

//     const [selectedKpi, setSelectedKpi] = useState(null);
//     const [selectedSubKpi, setSelectedSubKpi] = useState(null);

//     // =========================
//     // FINAL TEACHER DATA
//     // =========================
//     const [teachers, setTeachers] = useState([]);

//     // LOADING STATE
//     const [loading, setLoading] = useState(false);

//     // UI state → expand teacher card
//     const [expandedTeacherId, setExpandedTeacherId] = useState(null);

//     // if subKPI selected → simple mode UI
//     const isSubKpiMode = selectedSubKpi !== null;

//     // =========================
//     // LOAD SESSIONS ON FIRST LOAD
//     // =========================
//     useEffect(() => {
//         fetchSessions();
//     }, []);

//     /**
//      * STEP 1: GET ALL SESSIONS FROM BACKEND
//      */
//     const fetchSessions = async () => {
//         const res = await fetch(`${BASE_URL}/PeerEvaluator/Sessions`);
//         const data = await res.json();

//         // convert API format → dropdown format
//         setSessions(data.map(x => ({
//             label: x.name,
//             value: x.id
//         })));
//     };

//     /**
//      * STEP 2: GET KPIs BASED ON SESSION
//      */
//     const fetchKPIs = async (sessionId) => {
//         const res = await fetch(
//             `${BASE_URL}/KpiBasedPerformance/GetKPIsBySession/${sessionId}`
//         );

//         const data = await res.json();

//         setKpis(data.map(x => ({
//             label: x.name,
//             value: x.id
//         })));
//     };

//     /**
//      * STEP 3: GET SUBKPIs BASED ON KPI + SESSION
//      */
//     const fetchSubKPIs = async (kpiId) => {
//         if (!selectedSession) return;

//         const res = await fetch(
//             `${BASE_URL}/KpiBasedPerformance/GetSubKPIsByKPIAndSession/${kpiId}/${selectedSession}`
//         );

//         const data = await res.json();

//         setSubKpis(data.map(x => ({
//             label: x.name,
//             value: x.id
//         })));
//     };

//     /**
//      ============================================================
//      ⭐ MAIN LOGIC: GENERATE RANKING
//      ============================================================
     
//      This is the MOST IMPORTANT FUNCTION:

//      STEP A → Get API teacher ranking
//      STEP B → Get LOCAL SQLite confidential score
//      STEP C → Merge both
//      STEP D → Recalculate score
//      STEP E → Update UI

//      ============================================================
//      */
//     const generateRanking = async () => {

//         if (!selectedSession) {
//             alert("Select Session");
//             return;
//         }

//         setLoading(true);

//         try {

//             // =========================
//             // STEP A: BUILD API URL
//             // =========================
//             let url =
//                 `${BASE_URL}/KpiBasedPerformance/GetTeacherRankingV2?sessionId=${selectedSession}`;

//             if (selectedKpi) url += `&kpiId=${selectedKpi}`;
//             if (selectedSubKpi) url += `&subKpiId=${selectedSubKpi}`;

//             // =========================
//             // STEP B: FETCH API DATA
//             // =========================
//             const res = await fetch(url);
//             const apiData = await res.json();

//             /**
//              ============================================================
//              API DATA STRUCTURE (IMPORTANT)
//              ============================================================

//              apiData = [
//                {
//                  TeacherID,
//                  TeacherName,
//                  OverallPercentage,
//                  Breakdown: [
//                    {
//                      SubKPI,
//                      NormalizedScore,
//                      SubKPITotalWeight,
//                      SubKPIObtainedWeight
//                    }
//                  ]
//                }
//              ]
//             */

//             // =========================
//             // STEP C: MERGE SQLITE + API
//             // =========================
//             const enriched = await Promise.all(
//                 apiData.map(async (t) => {

//                     // ----------------------------------------------------
//                     // STEP 1: GET LOCAL CONFIDENTIAL SCORE FROM SQLITE
//                     // ----------------------------------------------------
//                     const localAvg =
//                         await ExtragetConfidentialAverageForTeacher(
//                             t.TeacherID,
//                             selectedSession,
//                             null
//                         );

//                     // If no local data → return API data as it is
//                     if (!localAvg || localAvg === 0) {
//                         return t;
//                     }

//                     // ----------------------------------------------------
//                     // STEP 2: UPDATE ONLY CONFIDENTIAL SUBKPI
//                     // ----------------------------------------------------

//                     let confidentialFound = false;

//                     const updatedBreakdown = (t.Breakdown || []).map((b) => {

//                         const name = (b.SubKPI || "").toLowerCase().trim();

//                         // ONLY update "confidential" subkpi
//                         const isConfidential = name.includes("confidential");

//                         if (isConfidential) {
//                             confidentialFound = true;

//                             const totalWeight = Number(b.SubKPITotalWeight || 0);

//                             // localAvg already 0–100
//                             const newNormalizedScore = Number(localAvg);

//                             // =========================
//                             // FORMULA USED HERE:
//                             // obtainedWeight = (score × weight) / 100
//                             // =========================
//                             const newObtainedWeight = Math.round(
//                                 (newNormalizedScore * totalWeight) / 100
//                             );

//                             return {
//                                 ...b,
//                                 NormalizedScore: Number(newNormalizedScore.toFixed(2)),
//                                 SubKPIObtainedWeight: Number(newObtainedWeight.toFixed(2))
//                             };
//                         }

//                         return b;
//                     });

//                     // if no confidential subkpi exists → skip merge
//                     if (!confidentialFound) return t;

//                     // ----------------------------------------------------
//                     // STEP 3: RECALCULATE TOTALS
//                     // ----------------------------------------------------

//                     const totalSessionWeight = updatedBreakdown.reduce(
//                         (acc, b) => acc + Number(b.SubKPITotalWeight || 0),
//                         0
//                     );

//                     const totalObtainedWeight = updatedBreakdown.reduce(
//                         (acc, b) => acc + Number(b.SubKPIObtainedWeight || 0),
//                         0
//                     );

//                     /**
//                      ============================================================
//                      FINAL PERFORMANCE FORMULA:
                     
//                      Overall % =
//                      (Total Obtained Weight / Total Session Weight) × 100
//                      ============================================================
//                      */

//                     const newOverallPercentage =
//                         totalSessionWeight > 0
//                             ? Number(
//                                 ((totalObtainedWeight / totalSessionWeight) * 100).toFixed(2)
//                               )
//                             : 0;

//                     // =========================
//                     // STEP 4: RETURN UPDATED OBJECT
//                     // =========================
//                     return {
//                         ...t,
//                         Breakdown: updatedBreakdown,
//                         TotalSessionWeight: totalSessionWeight,
//                         TotalObtainedWeight: totalObtainedWeight,
//                         OverallPercentage: newOverallPercentage
//                     };
//                 })
//             );

//             // =========================
//             // STEP D: UPDATE STATE
//             // =========================
//             setTeachers(enriched);
//             setExpandedTeacherId(null);

//         } catch (e) {
//             console.log("Ranking Error:", e);
//         } finally {
//             setLoading(false);
//         }
//     };

//     /**
//      ============================================================
//      📊 BAR COLOR LOGIC
//      ============================================================
//      */
//     const getBarColor = (value) => {
//         if (value >= 75) return "#22c55e";
//         if (value >= 50) return "#3b82f6";
//         if (value >= 25) return "#facc15";
//         return "#ef4444";
//     };

//     /**
//      ============================================================
//      📊 CHART DATA FORMAT (Gifted Charts)
//      ============================================================
     
//      REQUIRED FORMAT:
//      {
//        value,
//        label,
//        frontColor,
//        topLabelComponent
//      }
//      */
//     const chartData = (teachers || [])
//         .sort((a, b) => b.OverallPercentage - a.OverallPercentage)
//         .slice(0, 10)
//         .map(t => ({
//             value: t.OverallPercentage,
//             label: t.TeacherName?.split(" ")[0],
//             frontColor: getBarColor(t.OverallPercentage),

//             // label above bar
//             topLabelComponent: () => (
//                 <Text style={{ fontSize: 10, fontWeight: "bold" }}>
//                     {t.OverallPercentage}%
//                 </Text>
//             )
//         }));

//     /**
//      ============================================================
//      📌 TEACHER CARD RENDERING
//      ============================================================
//      */
//     const renderTeacher = ({ item, index }) => {

//         const isExpanded = expandedTeacherId === item.TeacherID;

//         return (
//             <TouchableOpacity
//                 onPress={() =>
//                     setExpandedTeacherId(isExpanded ? null : item.TeacherID)
//                 }
//                 style={styles.card}
//             >
//                 {/* Rank */}
//                 <Text style={styles.rankText}>#{index + 1}</Text>

//                 {/* Teacher Info */}
//                 <View style={{ flex: 1 }}>
//                     <Text style={styles.teacherName}>
//                         {item.TeacherName}
//                     </Text>

//                     {/* Expand breakdown */}
//                     {isExpanded && (
//                         <View style={styles.breakdownBox}>
//                             {item.Breakdown.map((b, i) => (
//                                 <View key={i} style={styles.breakdownRow}>
//                                     <Text>{b.SubKPI}</Text>
//                                     <Text>{b.NormalizedScore}%</Text>
//                                 </View>
//                             ))}
//                         </View>
//                     )}
//                 </View>

//                 {/* Final Score */}
//                 <Text style={styles.scoreText}>
//                     {item.OverallPercentage}%
//                 </Text>
//             </TouchableOpacity>
//         );
//     };

//     /**
//      ============================================================
//      📌 UI RENDER
//      ============================================================
//      */
//     return (
//         <View style={styles.container}>

//             <Text style={styles.heading}>
//                 KPI Based Performance
//             </Text>

//             {/* SESSION DROPDOWN */}
//             <Dropdown
//                 style={styles.dropdown}
//                 data={sessions}
//                 labelField="label"
//                 valueField="value"
//                 placeholder="Session"
//                 onChange={(item) => {
//                     setSelectedSession(item.value);
//                     fetchKPIs(item.value);
//                 }}
//             />

//             {/* KPI DROPDOWN */}
//             <Dropdown
//                 style={styles.dropdown}
//                 data={kpis}
//                 labelField="label"
//                 valueField="value"
//                 placeholder="KPI"
//                 onChange={(i) => {
//                     setSelectedKpi(i.value);
//                     setSelectedSubKpi(null);
//                     fetchSubKPIs(i.value);
//                 }}
//             />

//             {/* SUBKPI DROPDOWN */}
//             <Dropdown
//                 style={styles.dropdown}
//                 data={subKpis}
//                 labelField="label"
//                 valueField="value"
//                 placeholder="Sub KPI"
//                 onChange={(i) => setSelectedSubKpi(i.value)}
//             />

//             {/* GENERATE BUTTON */}
//             <TouchableOpacity
//                 style={styles.button}
//                 onPress={generateRanking}
//             >
//                 <Text style={styles.buttonText}>Generate</Text>
//             </TouchableOpacity>

//             {/* BAR CHART */}
//             {teachers.length > 0 && (
//                 <BarChart
//                     data={chartData}
//                     barWidth={22}
//                     spacing={30}
//                     height={180}
//                     noOfSections={4}
//                     isAnimated
//                 />
//             )}

//             {/* LIST */}
//             <FlatList
//                 data={[...teachers].sort(
//                     (a, b) => b.OverallPercentage - a.OverallPercentage
//                 )}
//                 renderItem={renderTeacher}
//             />

//         </View>
//     );
// };

// export default KpiBasedPerformance;








// FINAL CALCULATION SUMMARY (IMPORTANT)
// 1️⃣ Confidential Score Replacement
// obtainedWeight = (localScore × totalWeight) / 100
// 2️⃣ Overall KPI Score
// Overall% =
// (total obtained weight / total session weight) × 100
// 3️⃣ Ranking
// teachers.sort((a,b) => b.OverallPercentage - a.OverallPercentage)