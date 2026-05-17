// ============================================================
// 📊 CONFIDENTIAL EVALUATION DASHBOARD (FULL LEARNING FILE)
// ============================================================
//
// 🧠 PURPOSE:
// This screen shows how to:
//
// 1. Read MULTIPLE records from SQLite
// 2. Run MULTIPLE FILTER queries
// 3. Convert JSON payload → usable data
// 4. Extract scores
// 5. Build graph (react-native-gifted-charts)
// 6. Compare students / teachers / courses
//
// ============================================================

// import React, { useEffect, useState } from "react";
// import { View, Text, FlatList, ActivityIndicator, ScrollView } from "react-native";
// import { BarChart } from "react-native-gifted-charts";

// import db from "../Database/db";


// // ============================================================
// // MAIN COMPONENT
// // ============================================================

// const ConfidentialEvaluationDashboard = () => {

//   // =========================
//   // RAW SQLITE DATA
//   // =========================
//   const [localData, setLocalData] = useState([]);

//   // =========================
//   // GRAPH DATA
//   // =========================
//   const [graphData, setGraphData] = useState([]);

//   // =========================
//   // LOADING
//   // =========================
//   const [loading, setLoading] = useState(false);


//   // ============================================================
//   // 🔵 1. QUERY TYPE #1: GET ALL DATA FROM SQLITE
//   // ============================================================
//   const fetchAllEvaluations = async () => {

//     try {
//       setLoading(true);

//       const conn = await db;

//       const results = await conn.executeSql(
//         `SELECT * FROM ConfidentialEvaluation`
//       );

//       // SQLite returns nested array
//       const rows = results[0].rows;
//       let temp = [];

//       for (let i = 0; i < rows.length; i++) {
//         temp.push(rows.item(i));
//       }

//       setLocalData(temp);

//       // convert for graph
//       buildGraph(temp);

//     } catch (err) {
//       console.log("Fetch Error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };


//   // ============================================================
//   // 🔵 2. QUERY TYPE #2: FILTER BY STUDENT ID
//   // ============================================================
//   const fetchByStudent = async (studentID) => {

//     const conn = await db;

//     const res = await conn.executeSql(
//       `SELECT * FROM ConfidentialEvaluation WHERE studentID = ?`,
//       [studentID]
//     );

//     const rows = res[0].rows;
//     let temp = [];

//     for (let i = 0; i < rows.length; i++) {
//       temp.push(rows.item(i));
//     }

//     setLocalData(temp);
//     buildGraph(temp);
//   };


  // ============================================================
  // 🔵 3. QUERY TYPE #3: FILTER BY ENROLLMENT ID
  // ============================================================
//   const fetchByEnrollment = async (enrollmentID) => {

//     const conn = await db;

//     const res = await conn.executeSql(
//       `SELECT * FROM ConfidentialEvaluation WHERE enrollmentID = ?`,
//       [enrollmentID]
//     );

//     const rows = res[0].rows;
//     let temp = [];

//     for (let i = 0; i < rows.length; i++) {
//       temp.push(rows.item(i));
//     }

//     setLocalData(temp);
//     buildGraph(temp);
//   };


  // ============================================================
  // 🔵 4. QUERY TYPE #4: FILTER BY BOTH (MULTI FILTER)
  // ============================================================
//   const fetchByStudentAndEnrollment = async (studentID, enrollmentID) => {

//     const conn = await db;

//     const res = await conn.executeSql(
//       `SELECT * FROM ConfidentialEvaluation 
//        WHERE studentID = ? AND enrollmentID = ?`,
//       [studentID, enrollmentID]
//     );

//     const rows = res[0].rows;
//     let temp = [];

//     for (let i = 0; i < rows.length; i++) {
//       temp.push(rows.item(i));
//     }

//     setLocalData(temp);
//     buildGraph(temp);
//   };


//   // ============================================================
//   // 🔵 5. JSON PARSE + GRAPH BUILDER
//   // ============================================================
//   //
//   // ⚠️ VERY IMPORTANT:
//   // payload is STRING → must convert using JSON.parse
//   //
//   const buildGraph = (data) => {

//     let graph = [];

//     data.forEach((row) => {

//       // convert string → object
//       const parsed = JSON.parse(row.payload);

//       // each question becomes graph bar
//       parsed.Answers.forEach((ans) => {

//         graph.push({
//           value: ans.score,          // bar height
//           label: parsed.courseCode,   // course on top

//           topLabelComponent: () => (
//             <Text style={{ fontSize: 10, color: "green" }}>
//               {parsed.teacherId}
//             </Text>
//           ),

//           raw: {
//             student: parsed.StudentId,
//             teacher: parsed.teacherId,
//             question: ans.questionText,
//             score: ans.score
//           }
//         });

//       });
//     });

//     setGraphData(graph);
//   };


//   // ============================================================
//   // 🔵 RUN ON SCREEN LOAD
//   // ============================================================
//   useEffect(() => {
//     fetchAllEvaluations();
//   }, []);


//   // ============================================================
//   // 🔵 LOADING UI
//   // ============================================================
//   if (loading) {
//     return <ActivityIndicator size="large" color="blue" />;
//   }


//   // ============================================================
//   // 🔵 MAIN UI
//   // ============================================================
//   return (
//     <ScrollView style={{ padding: 10 }}>

//       {/* ================= GRAPH ================= */}
//       <Text style={{ fontSize: 18, fontWeight: "bold" }}>
//         Evaluation Graph
//       </Text>

//       <BarChart
//         data={graphData}
//         barWidth={30}
//         spacing={20}
//       />


//       {/* ================= RAW SQLITE DATA ================= */}
//       <Text style={{ fontSize: 18, marginTop: 20 }}>
//         Local DB Records
//       </Text>

//       <FlatList
//         data={localData}
//         keyExtractor={(item) => item.id.toString()}
//         renderItem={({ item }) => {

//           const parsed = JSON.parse(item.payload);

//           return (
//             <View style={{
//               padding: 10,
//               marginVertical: 5,
//               backgroundColor: "#f1f1f1"
//             }}>

//               <Text>Student: {parsed.StudentId}</Text>
//               <Text>Teacher: {parsed.teacherId}</Text>
//               <Text>Course: {parsed.courseCode}</Text>
//               <Text>Total Questions: {parsed.Answers.length}</Text>

//             </View>
//           );
//         }}
//       />

//     </ScrollView>
//   );
// };

// export default ConfidentialEvaluationDashboard;














// 🔹 1. HOW DATA IS STORED

// SQLite stores:

// {
//   "EnrollmentId": 1,
//   "StudentId": 10,
//   "teacherId": 5,
//   "courseCode": "CS101",
//   "Answers": [...]
// }

// BUT saved as STRING:

// payload = JSON.stringify(object)
// 🔹 2. HOW DATA IS READ
// SQLite row → row.payload (STRING)

// Convert:

// JSON.parse(row.payload)
// 🔹 3. MULTIPLE QUERY TYPES
// Function	Purpose
// fetchAllEvaluations	get everything
// fetchByStudent	filter student
// fetchByEnrollment	filter enrollment
// fetchByStudentAndEnrollment	combined filter
// 🔹 4. HOW GRAPH IS CREATED
// Step 1:

// Read SQLite rows

// Step 2:

// Parse JSON

// Step 3:

// Extract answers

// Step 4:

// Convert to graph format

// score → bar height
// course → label
// teacher → top label
// 🔹 5. FINAL DATA FLOW
// SQLite
//    ↓
// executeSql()
//    ↓
// rows
//    ↓
// JSON.parse(payload)
//    ↓
// Answers mapping
//    ↓
// graphData
//    ↓
// BarChart UI