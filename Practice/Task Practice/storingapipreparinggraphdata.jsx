// ===============================================================
// AnalyticsScreen.jsx
// ===============================================================
// PURPOSE:
// This file teaches:
// 1. How to receive API data from backend
// 2. How to store API data
// 3. How to render FlatList
// 4. How to populate Dropdown dynamically
// 5. How to create Teacher Checkbox List
// 6. How to filter data
// 7. How to prepare graph data
// 8. How to show CourseCode above graph bars
// 9. How to show Teacher Names below graph
// 10. How to handle dynamic analytics
//
// TECHNOLOGIES:
// - React Native
// - Hooks
// - FlatList
// - Dropdown
// - Checkbox Logic
// - react-native-gifted-charts
// ===============================================================



import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import { Dropdown } from "react-native-element-dropdown";

import { BarChart } from "react-native-gifted-charts";



// ===============================================================
// DUMMY API URL
// ===============================================================

const BASE_URL = "https://your-api-url/api";



// ===============================================================
// MAIN COMPONENT
// ===============================================================

const AnalyticsScreen = () => {

  // ===========================================================
  // STATE VARIABLES
  // ===========================================================

  // Complete API data
  const [apiData, setApiData] = useState([]);

  // Loading State
  const [loading, setLoading] = useState(false);

  // Dropdown Courses
  const [courses, setCourses] = useState([]);

  // Selected Course
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Teacher Checkbox Selection
  const [selectedTeachers, setSelectedTeachers] = useState([]);

  // Graph Data
  const [graphData, setGraphData] = useState([]);




  // ===========================================================
  // FETCH DATA FROM BACKEND
  // ===========================================================

  const fetchAnalytics = async () => {

    try {

      setLoading(true);

      // API CALL
      const response = await fetch(
        `${BASE_URL}/Analytics/GetTeacherAnalytics`
      );

      // Convert JSON response
      const data = await response.json();

      console.log("API DATA:", data);

      // Save full backend response
      setApiData(data);




      // =======================================================
      // POPULATE COURSE DROPDOWN
      // =======================================================

      // Get unique course codes
      const uniqueCourses = [
        ...new Set(data.map(item => item.courseCode))
      ];

      // Convert into dropdown format
      const dropdownCourses = uniqueCourses.map(course => ({
        label: course,
        value: course,
      }));

      setCourses(dropdownCourses);




      // =======================================================
      // PREPARE GRAPH DATA
      // =======================================================

      prepareGraphData(data);

    }
    catch (error) {

      console.log("API Error:", error);

    }
    finally {

      setLoading(false);
    }
  };




  // ===========================================================
  // COMPONENT LOAD
  // ===========================================================

  useEffect(() => {

    fetchAnalytics();

  }, []);




  // ===========================================================
  // GRAPH DATA PREPARATION
  // ===========================================================

  const prepareGraphData = (data) => {

    // Convert backend data into chart format
    const formattedGraph = data.map(item => ({

      // Height of graph bar
      value: item.score,

      // Teacher Name below graph
      label: item.teacherName,

      // Course Code above graph
      topLabelComponent: () => (
        <Text style={styles.courseCodeText}>
          {item.courseCode}
        </Text>
      ),

      // Extra full object
      fullData: item,
    }));

    setGraphData(formattedGraph);
  };




  // ===========================================================
  // TEACHER CHECKBOX LOGIC
  // ===========================================================

  const toggleTeacherSelection = (teacherName) => {

    // Check if already selected
    const exists = selectedTeachers.includes(teacherName);

    if (exists) {

      // Remove teacher
      setSelectedTeachers(
        selectedTeachers.filter(t => t !== teacherName)
      );

    } else {

      // Add teacher
      setSelectedTeachers([
        ...selectedTeachers,
        teacherName
      ]);
    }
  };




  // ===========================================================
  // FILTER DATA
  // ===========================================================

  const filteredData = apiData.filter(item => {

    // Course Filter
    const courseMatch =
      !selectedCourse ||
      item.courseCode === selectedCourse;

    // Teacher Filter
    const teacherMatch =
      selectedTeachers.length === 0 ||
      selectedTeachers.includes(item.teacherName);

    return courseMatch && teacherMatch;
  });




  // ===========================================================
  // UPDATE GRAPH AFTER FILTERING
  // ===========================================================

  useEffect(() => {

    prepareGraphData(filteredData);

  }, [selectedCourse, selectedTeachers]);




  // ===========================================================
  // UNIQUE TEACHERS
  // ===========================================================

  const uniqueTeachers = [
    ...new Set(apiData.map(item => item.teacherName))
  ];




  // ===========================================================
  // LOADING SCREEN
  // ===========================================================

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="green" />
      </View>
    );
  }




  // ===========================================================
  // MAIN UI
  // ===========================================================

  return (

    <ScrollView style={styles.container}>

      {/* =======================================================
          SCREEN TITLE
      ======================================================= */}

      <Text style={styles.heading}>
        Teacher Analytics Dashboard
      </Text>




      {/* =======================================================
          COURSE DROPDOWN
      ======================================================= */}

      <Text style={styles.label}>
        Select Course
      </Text>

      <Dropdown
        style={styles.dropdown}

        data={courses}

        labelField="label"

        valueField="value"

        placeholder="Select Course"

        value={selectedCourse}

        onChange={(item) => {
          setSelectedCourse(item.value);
        }}
      />




      {/* =======================================================
          TEACHER CHECKBOX LIST
      ======================================================= */}

      <Text style={styles.label}>
        Select Teachers
      </Text>

      <FlatList

        data={uniqueTeachers}

        horizontal

        keyExtractor={(item) => item}

        renderItem={({ item }) => {

          const selected =
            selectedTeachers.includes(item);

          return (

            <TouchableOpacity
              style={[
                styles.checkboxItem,

                selected && styles.selectedCheckbox
              ]}

              onPress={() => toggleTeacherSelection(item)}
            >

              <Text style={styles.checkboxText}>
                {selected ? "☑" : "☐"} {item}
              </Text>

            </TouchableOpacity>
          );
        }}
      />




      {/* =======================================================
          GRAPH SECTION
      ======================================================= */}

      <Text style={styles.label}>
        Teacher Performance Graph
      </Text>

      <ScrollView horizontal>

        <BarChart

          data={graphData}

          barWidth={45}

          spacing={30}

          roundedTop

          roundedBottom

          hideRules

          yAxisThickness={1}

          xAxisThickness={1}

          noOfSections={5}

          maxValue={10}

          height={250}

          isAnimated

        />

      </ScrollView>




      {/* =======================================================
          DATA CARDS
      ======================================================= */}

      <Text style={styles.label}>
        Detailed Analytics
      </Text>

      <FlatList

        data={filteredData}

        keyExtractor={(item, index) => index.toString()}

        renderItem={({ item }) => (

          <View style={styles.card}>

            <Text style={styles.teacherName}>
              {item.teacherName}
            </Text>

            <Text>
              Course: {item.courseCode}
            </Text>

            <Text>
              KPI: {item.kpiName}
            </Text>

            <Text>
              Sub KPI: {item.subKpiName}
            </Text>

            <Text>
              Score: {item.score}
            </Text>

          </View>
        )}
      />

    </ScrollView>
  );
};




// ===============================================================
// STYLES
// ===============================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 15,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 10,
  },

  dropdown: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 10,
  },

  checkboxItem: {
    padding: 10,
    backgroundColor: "#eee",
    borderRadius: 10,
    marginRight: 10,
  },

  selectedCheckbox: {
    backgroundColor: "#A7F3D0",
  },

  checkboxText: {
    fontWeight: "600",
  },

  courseCodeText: {
    fontSize: 10,
    color: "green",
    marginBottom: 5,
    fontWeight: "bold",
  },

  card: {
    backgroundColor: "#F8FAFC",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },

  teacherName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
});



export default AnalyticsScreen;




// ===============================================================
// EXAMPLE BACKEND RESPONSE
// ===============================================================

/*

[
  {
    "teacherName": "Ali",
    "courseCode": "CS101",
    "score": 8,
    "kpiName": "Teaching",
    "subKpiName": "Attendance"
  },

  {
    "teacherName": "Ahmed",
    "courseCode": "CS102",
    "score": 9,
    "kpiName": "Research",
    "subKpiName": "Publications"
  }
]

*/




// ===============================================================
// IMPORTANT UNDERSTANDING
// ===============================================================

/*

==================================================
HOW FRONTEND HANDLES BACKEND DATA
==================================================

Backend returns JSON.

Frontend stores JSON inside state.

Example:

const [apiData, setApiData] = useState([]);




==================================================
HOW DROPDOWN IS POPULATED
==================================================

1. Extract unique course codes
2. Convert into dropdown format

Example:

[
  {
    label: "CS101",
    value: "CS101"
  }
]




==================================================
HOW CHECKBOXES WORK
==================================================

Teacher names stored in array.

When clicked:
- Add if not exists
- Remove if exists




==================================================
HOW GRAPH WORKS
==================================================

Graph needs:

value => bar height
label => bottom text

Example:

{
  value: 8,
  label: "Ali"
}




==================================================
HOW COURSE CODE SHOWS ABOVE GRAPH
==================================================

Using:

topLabelComponent




==================================================
HOW TEACHER NAME SHOWS BELOW GRAPH
==================================================

Using:

label




==================================================
HOW FILTERING WORKS
==================================================

Frontend filters locally using:

.filter()

No need to call backend repeatedly.




==================================================
WHY THIS IS POWERFUL
==================================================

This architecture supports:

- Analytics
- Reports
- Comparison
- Ranking
- Charts
- Dynamic filtering
- Teacher selection
- KPI analysis

Perfect for your FYP.

*/
