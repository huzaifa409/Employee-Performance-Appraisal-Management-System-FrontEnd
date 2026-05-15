/*
====================================================================
📊 COMPLETE FYP ANALYTICS SCREEN
====================================================================

🎯 PURPOSE OF THIS SCREEN

This screen demonstrates COMPLETE frontend + backend flow
used in a professional FYP.

This single screen teaches:

1. Backend JOIN queries
2. Multiple APIs
3. Dropdown population
4. FlatList rendering
5. Chart generation
6. Data transformation
7. API filtering
8. React Native state management

====================================================================
🧠 COMPLETE FLOW OF THIS SCREEN
====================================================================

                DATABASE TABLES
--------------------------------------------------

Employee Table
Department Table
Evaluation Table

These tables are JOINED in backend APIs.

====================================================================
🔗 API 1 — GET DEPARTMENTS
====================================================================

PURPOSE:
- Populate dropdown
- User selects department

API:
GET /GetDepartments

BACKEND JOIN LOGIC:

from dept in db.Department
select new {
   DepartmentId = dept.DepartmentId,
   DepartmentName = dept.DepartmentName
}

RETURNS:

[
   {
      "departmentId": 1,
      "departmentName": "IT"
   }
]

====================================================================
🔗 API 2 — GET EMPLOYEE PERFORMANCE
====================================================================

PURPOSE:
- Display employee evaluation data
- Filter by department

API:
GET /GetEmployeePerformanceByDepartment?departmentId=1

BACKEND JOIN LOGIC:

from emp in db.Employee

join dept in db.Department
on emp.DepartmentId equals dept.DepartmentId

join eval in db.Evaluation
on emp.EmployeeId equals eval.EmployeeId

select new {

   EmployeeId = emp.EmployeeId,

   EmployeeName = emp.Name,

   DepartmentName = dept.DepartmentName,

   Score = eval.Score
}

RETURNS:

[
   {
      "employeeId": 1,
      "employeeName": "Huzaifa",
      "departmentName": "IT",
      "score": 4
   }
]

====================================================================
🔗 API 3 — GET CHART DATA
====================================================================

PURPOSE:
- Send graph-ready data

API:
GET /GetChartDataByDepartment?departmentId=1

BACKEND JOIN LOGIC:

from emp in db.Employee

join eval in db.Evaluation
on emp.EmployeeId equals eval.EmployeeId

select new {

   label = emp.Name,
   value = eval.Score
}

RETURNS:

[
   {
      "label": "Huzaifa",
      "value": 4
   }
]

====================================================================
📱 FRONTEND FLOW
====================================================================

STEP 1:
Load departments into dropdown

STEP 2:
User selects department

STEP 3:
Call Employee API

STEP 4:
Display employee data in FlatList

STEP 5:
Call Chart API

STEP 6:
Display chart

====================================================================
*/

import React, { useEffect, useState } from "react";

import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    ScrollView
} from "react-native";

import { Dropdown } from "react-native-element-dropdown";

import { BarChart } from "react-native-gifted-charts";

import BASE_URL from "../../API-URL/API";

const CompleteAnalyticsScreen = () => {

    // =========================================================
    // STATE VARIABLES
    // =========================================================

    // Dropdown department data
    const [departments, setDepartments] = useState([]);

    // Selected department
    const [selectedDepartment, setSelectedDepartment] = useState(null);

    // Employee performance data
    const [employeeData, setEmployeeData] = useState([]);

    // Chart data
    const [chartData, setChartData] = useState([]);

    // Loading state
    const [loading, setLoading] = useState(true);

    // =========================================================
    // API 1 — FETCH DEPARTMENTS
    // =========================================================

    /*
    PURPOSE:
    Populate dropdown
    */

    const fetchDepartments = async () => {

        try {

            const response = await fetch(
                `${BASE_URL}/GetDepartments`
            );

            const json = await response.json();

            /*
            Dropdown requires:
            label + value
            */

            const formatted = json.map((item) => ({
                label: item.departmentName,
                value: item.departmentId
            }));

            setDepartments(formatted);

        } catch (error) {

            console.log("DEPARTMENT ERROR:", error);

        }
    };

    // =========================================================
    // API 2 — FETCH EMPLOYEE DATA
    // =========================================================

    /*
    PURPOSE:
    Fetch employee evaluations
    */

    const fetchEmployeeData = async (departmentId) => {

        try {

            const response = await fetch(
                `${BASE_URL}/GetEmployeePerformanceByDepartment?departmentId=${departmentId}`
            );

            const json = await response.json();

            setEmployeeData(json);

        } catch (error) {

            console.log("EMPLOYEE ERROR:", error);

        }
    };

    // =========================================================
    // API 3 — FETCH CHART DATA
    // =========================================================

    /*
    PURPOSE:
    Fetch graph-ready data
    */

    const fetchChartData = async (departmentId) => {

        try {

            const response = await fetch(
                `${BASE_URL}/GetChartDataByDepartment?departmentId=${departmentId}`
            );

            const json = await response.json();

            setChartData(json);

        } catch (error) {

            console.log("CHART ERROR:", error);

        } finally {

            setLoading(false);
        }
    };

    // =========================================================
    // INITIAL SCREEN LOAD
    // =========================================================

    useEffect(() => {
        fetchDepartments();
    }, []);

    // =========================================================
    // HANDLE DROPDOWN SELECTION
    // =========================================================

    const handleDepartmentChange = (item) => {

        // Store selected department
        setSelectedDepartment(item.value);

        // Call Employee API
        fetchEmployeeData(item.value);

        // Call Chart API
        fetchChartData(item.value);
    };

    // =========================================================
    // LOADING SCREEN
    // =========================================================

    if (loading && selectedDepartment) {

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

            {/* =================================================
                        SCREEN TITLE
            ================================================= */}

            <Text style={styles.title}>
                Employee Analytics Dashboard
            </Text>

            {/* =================================================
                        DROPDOWN
            ================================================= */}

            <Dropdown

                style={styles.dropdown}

                data={departments}

                labelField="label"

                valueField="value"

                placeholder="Select Department"

                value={selectedDepartment}

                onChange={handleDepartmentChange}
            />

            {/* =================================================
                        BAR CHART
            ================================================= */}

            <Text style={styles.sectionTitle}>
                Performance Graph
            </Text>

            <BarChart
                data={chartData}
                barWidth={22}
                spacing={30}
                height={220}
                maxValue={4}
                isAnimated
            />

            {/* =================================================
                        FLATLIST
            ================================================= */}

            <Text style={styles.sectionTitle}>
                Employee Evaluations
            </Text>

            <FlatList

                data={employeeData}

                scrollEnabled={false}

                keyExtractor={(item) =>
                    item.employeeId.toString()
                }

                renderItem={({ item }) => (

                    <View style={styles.card}>

                        <Text style={styles.text}>
                            👤 {item.employeeName}
                        </Text>

                        <Text style={styles.text}>
                            🏢 {item.departmentName}
                        </Text>

                        <Text style={styles.text}>
                            ⭐ Score: {item.score}
                        </Text>

                    </View>
                )}
            />

        </ScrollView>
    );
};

export default CompleteAnalyticsScreen;

// =========================================================
// STYLES
// =========================================================

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 15
    },

    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },

    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20
    },

    dropdown: {
        borderWidth: 1,
        borderRadius: 10,
        padding: 12,
        marginBottom: 20
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginVertical: 15
    },

    card: {
        borderWidth: 1,
        borderRadius: 10,
        padding: 14,
        marginBottom: 12
    },

    text: {
        fontSize: 14,
        marginVertical: 2
    }
});