// ============================================================
// 📊 ANALYTICS MASTER SCREEN (DETAILED LEARNING VERSION)
// ============================================================
//
// 🧠 WHAT THIS SCREEN DOES:
// ------------------------------------------------------------
// This screen:
// 1. Fetches performance analytics data from backend API
// 2. Stores it in a MASTER list (original data)
// 3. Creates FILTERED list for UI display
// 4. Applies SEARCH + DROPDOWN + CHECKBOX filtering
// 5. Converts data into GRAPH format
// 6. Displays:
//    - Teacher list (checkbox)
//    - Course dropdown
//    - Graph (bar chart)
//    - Table view
//
// ============================================================
//
// 🔥 BIG IDEA (VERY IMPORTANT FOR EXAMS):
// ------------------------------------------------------------
// We NEVER modify API data directly.
//
// We always use:
//   masterData    → original API data (unchanged)
//   filteredData  → UI display data (changes on filters)
//
// ============================================================

import React, { useEffect, useState } from "react";
import {
  View, Text, TextInput, FlatList,
  TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator
} from "react-native";

import { Dropdown } from "react-native-element-dropdown";
import { BarChart } from "react-native-gifted-charts";

const BASE_URL = "https://your-api-url/api";


// ============================================================
// MAIN COMPONENT
// ============================================================

const AnalyticsMasterScreen = () => {

  // ==========================================================
  // 1. MASTER DATA (ORIGINAL API DATA)
  // ==========================================================
  // 👉 This stores raw data from backend API
  // 👉 NEVER modify directly
  const [masterData, setMasterData] = useState([]);

  // ==========================================================
  // 2. FILTERED DATA (UI DATA)
  // ==========================================================
  // 👉 This is what user sees
  // 👉 Changes when search/filter applied
  const [filteredData, setFilteredData] = useState([]);

  // ==========================================================
  // 3. SEARCH STATE
  // ==========================================================
  // 👉 Stores search text typed by user
  const [searchText, setSearchText] = useState("");

  // ==========================================================
  // 4. COURSE DROPDOWN DATA
  // ==========================================================
  // courses → list shown in dropdown
  // selectedCourse → currently selected value
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // ==========================================================
  // 5. TEACHER CHECKBOX SYSTEM
  // ==========================================================
  // teachers → all unique teachers from API
  // selectedTeachers → selected checkboxes
  const [teachers, setTeachers] = useState([]);
  const [selectedTeachers, setSelectedTeachers] = useState([]);

  // ==========================================================
  // 6. GRAPH DATA
  // ==========================================================
  // formatted data for BarChart
  const [graphData, setGraphData] = useState([]);

  // ==========================================================
  // 7. LOADING STATE
  // ==========================================================
  const [loading, setLoading] = useState(false);


// ============================================================
// 🔵 STEP 1: FETCH DATA FROM API
// ============================================================
//
// WHAT HAPPENS HERE:
// -------------------
// 1. Call backend API
// 2. Get JSON response
// 3. Store in masterData
// 4. Create dropdown list (courses)
// 5. Create checkbox list (teachers)
// 6. Build graph data
//
const fetchData = async () => {
  try {
    setLoading(true);

    // 👉 API CALL (GET request)
    const res = await fetch(`${BASE_URL}/Analytics/get-data`);

    // 👉 Convert response to JSON
    const data = await res.json();

    // ========================================================
    // STORE ORIGINAL DATA
    // ========================================================
    setMasterData(data);

    // UI starts same as API
    setFilteredData(data);

    // ========================================================
    // MAP COURSES (unique values only)
    // Example:
    // ["CS101","CS101","CS102"] → ["CS101","CS102"]
    // ========================================================
    const uniqueCourses = [...new Set(data.map(x => x.courseCode))];

    setCourses(
      uniqueCourses.map(c => ({
        label: c,
        value: c
      }))
    );

    // ========================================================
    // MAP TEACHERS (unique list)
    // ========================================================
    const uniqueTeachers = [...new Set(data.map(x => x.teacherName))];
    setTeachers(uniqueTeachers);

    // ========================================================
    // GRAPH PREPARATION
    // ========================================================
    prepareGraph(data);

  } catch (err) {
    console.log(err);
  } finally {
    setLoading(false);
  }
};


// ============================================================
// 🔵 STEP 2: RUN ON SCREEN LOAD
// ============================================================
//
// 👉 useEffect runs only once when screen opens
//
useEffect(() => {
  fetchData();
}, []);


// ============================================================
// 🔵 STEP 3: GRAPH FUNCTION (MAP)
// ============================================================
//
// INPUT: API data
// OUTPUT: formatted chart data
//
// 👉 THIS IS "TRANSFORMATION FUNCTION"
//
const prepareGraph = (data) => {

  const mapped = data.map(item => {

    return {
      value: item.score,         // 📊 bar height
      label: item.teacherName,   // 📍 bottom label

      // 📌 top label above bar
      topLabelComponent: () => (
        <Text style={{ fontSize: 10, color: "green" }}>
          {item.courseCode}
        </Text>
      ),

      raw: item // original record saved
    };
  });

  setGraphData(mapped);
};


// ============================================================
// 🔵 STEP 4: FILTER SYSTEM (MOST IMPORTANT)
// ============================================================
//
// INPUT: masterData
// OUTPUT: filteredData + graphData
//
// FILTERS USED:
// 1. Search
// 2. Course dropdown
// 3. Teacher checkbox
//
const applyFilters = () => {

  // start from original data every time
  let temp = [...masterData];

  // ========================================================
  // SEARCH FILTER
  // ========================================================
  if (searchText) {
    temp = temp.filter(item =>
      item.teacherName.toLowerCase().includes(searchText.toLowerCase()) ||
      item.courseCode.toLowerCase().includes(searchText.toLowerCase()) ||
      item.kpiName.toLowerCase().includes(searchText.toLowerCase())
    );
  }

  // ========================================================
  // COURSE FILTER
  // ========================================================
  if (selectedCourse) {
    temp = temp.filter(item =>
      item.courseCode === selectedCourse
    );
  }

  // ========================================================
  // TEACHER FILTER
  // ========================================================
  if (selectedTeachers.length > 0) {
    temp = temp.filter(item =>
      selectedTeachers.includes(item.teacherName)
    );
  }

  // ========================================================
  // UPDATE UI DATA
  // ========================================================
  setFilteredData(temp);

  // ALSO UPDATE GRAPH
  prepareGraph(temp);
};


// ============================================================
// 🔵 STEP 5: AUTO-RUN FILTER WHENEVER USER CHANGES INPUT
// ============================================================
//
// whenever:
// - search text changes
// - dropdown changes
// - checkbox changes
//
// 👉 filters automatically re-run
//
useEffect(() => {
  applyFilters();
}, [searchText, selectedCourse, selectedTeachers]);


// ============================================================
// 🔵 STEP 6: CHECKBOX TOGGLE FUNCTION
// ============================================================
//
// INPUT: teacher name
// OUTPUT: update selectedTeachers array
//
const toggleTeacher = (name) => {

  if (selectedTeachers.includes(name)) {

    // remove if already selected
    setSelectedTeachers(
      selectedTeachers.filter(x => x !== name)
    );

  } else {

    // add if not selected
    setSelectedTeachers([...selectedTeachers, name]);
  }
};


// ============================================================
// 🔵 LOADING SCREEN
// ============================================================
if (loading) {
  return <ActivityIndicator size="large" color="green" />;
}


// ============================================================
// 🔵 UI SECTION (WHAT USER SEES)
// ============================================================

return (
  <ScrollView style={{ padding: 10 }}>

    {/* ================= SEARCH BOX ================= */}
    <TextInput
      placeholder="Search teacher, course, KPI..."
      value={searchText}
      onChangeText={setSearchText}
    />

    {/* ================= DROPDOWN ================= */}
    <Dropdown
      data={courses}
      labelField="label"
      valueField="value"
      value={selectedCourse}
      onChange={(item) => setSelectedCourse(item.value)}
    />

    {/* ================= TEACHER CHECKBOX LIST ================= */}
    <FlatList
      data={teachers}
      horizontal
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => toggleTeacher(item)}
        >
          <Text>
            {selectedTeachers.includes(item) ? "☑" : "☐"} {item}
          </Text>
        </TouchableOpacity>
      )}
    />

    {/* ================= GRAPH ================= */}
    <BarChart
      data={graphData}
      barWidth={40}
      spacing={25}
    />

    {/* ================= TABLE ================= */}
    <FlatList
      data={filteredData}
      renderItem={({ item }) => (
        <View>
          <Text>{item.teacherName}</Text>
          <Text>{item.courseCode}</Text>
          <Text>{item.kpiName}</Text>
          <Text>{item.score}</Text>
        </View>
      )}
    />

  </ScrollView>
);

};

export default AnalyticsMasterScreen;