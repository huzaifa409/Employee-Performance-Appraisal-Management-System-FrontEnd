/*
====================================================================
📱 EMPLOYEE PERFORMANCE DASHBOARD SCREEN (REACT NATIVE)
====================================================================

🎯 PURPOSE OF THIS SCREEN:

This screen is a complete FYP-level module that demonstrates:

1. Fetching data from backend API (with JOIN in multiple tables)
2. Displaying data in FlatList
3. Searching data (Employee Name, Department, ID)
4. Filtering data using dropdown (Department filter concept)
5. Converting API data into chart format
6. Displaying performance graph using react-native-gifted-charts

====================================================================
🔗 BACKEND API USED (JOIN MULTIPLE TABLES)

This API is created in ASP.NET Web API using Entity Framework JOIN:

--------------------------------------------------------------------

GET API:
${BASE_URL}/GetDepartmentWisePerformance?departmentId=1

--------------------------------------------------------------------

C# BACKEND LOGIC (JOIN Example):

from emp in db.Employee
join dept in db.Department on emp.DepartmentId equals dept.DepartmentId
join eval in db.Evaluation on emp.EmployeeId equals eval.EmployeeId

select new {
    EmployeeId = emp.EmployeeId,
    EmployeeName = emp.Name,
    DepartmentId = dept.DepartmentId,
    DepartmentName = dept.DepartmentName,
    Score = eval.Score
}

====================================================================
📊 FRONTEND FLOW

STEP 1: Fetch API data
STEP 2: Store in state
STEP 3: Show in FlatList
STEP 4: Search filter
STEP 5: Convert data for graph
STEP 6: Show BarChart

====================================================================
*/

import React, { useEffect, useState } from "react";

import {
    View,
    Text,
    TextInput,
    FlatList,
    ActivityIndicator,
    StyleSheet
} from "react-native";

import { BarChart } from "react-native-gifted-charts";

import BASE_URL from "../../API-URL/API";

const EmployeeDashboard = () => {

    // =========================================================
    // STATE VARIABLES
    // =========================================================

    // Original API Data
    const [data, setData] = useState([]);

    // Filtered Data (Search result)
    const [filteredData, setFilteredData] = useState([]);

    // Search input value
    const [search, setSearch] = useState("");

    // Loading state
    const [loading, setLoading] = useState(true);

    // =========================================================
    // API CALL (GET DATA FROM BACKEND WITH JOINS)
    // =========================================================

    /*
    API PURPOSE:
    - Fetch Employee + Department + Evaluation data
    - Backend already performs JOIN
    - Frontend only displays result
    */

    const fetchData = async () => {

        try {

            const response = await fetch(
                `${BASE_URL}/GetDepartmentWisePerformance`
            );

            const json = await response.json();

            // Store original API data
            setData(json);

            // Copy data for filtering/search
            setFilteredData(json);

        } catch (error) {

            console.log("API ERROR:", error);

        } finally {

            setLoading(false);
        }
    };

    // Run API once screen loads
    useEffect(() => {
        fetchData();
    }, []);

    // =========================================================
    // SEARCH FUNCTION (FILTER LOCAL DATA)
    // =========================================================

    /*
    SEARCH LOGIC:
    - Matches Employee Name
    - Matches Department Name
    - Matches Employee ID
    */

    const searchData = (text) => {

        setSearch(text);

        if (text === "") {
            setFilteredData(data);
        } else {

            const filtered = data.filter((item) =>

                item.employeeName
                    ?.toLowerCase()
                    .includes(text.toLowerCase())

                ||

                item.departmentName
                    ?.toLowerCase()
                    .includes(text.toLowerCase())

                ||

                item.employeeId
                    ?.toString()
                    .includes(text)
            );

            setFilteredData(filtered);
        }
    };

    // =========================================================
    // GRAPH DATA CONVERSION
    // =========================================================

    /*
    Gifted Charts format requires:

    [
      { value: 80, label: "Huzaifa" }
    ]
    */

    const chartData = filteredData.map((item) => ({
        value: item.score,
        label: item.employeeName
    }));

    // =========================================================
    // LOADING SCREEN
    // =========================================================

    if (loading) {
        return (
            <ActivityIndicator size="large" />
        );
    }

    // =========================================================
    // MAIN UI
    // =========================================================

    return (

        <View style={styles.container}>

            {/* ================= SEARCH BOX ================= */}

            <TextInput
                placeholder="Search Employee / Department / ID"

                value={search}

                onChangeText={searchData}

                style={styles.searchBox}
            />

            {/* ================= GRAPH SECTION ================= */}

            <Text style={styles.title}>
                Performance Graph
            </Text>

            <BarChart
                data={chartData}
                barWidth={25}
                spacing={30}
                height={200}
            />

            {/* ================= LIST SECTION ================= */}

            <Text style={styles.title}>
                Employee List
            </Text>

            <FlatList
                data={filteredData}

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

        </View>
    );
};

// =========================================================
// STYLES
// =========================================================

const styles = StyleSheet.create({

    container: {
        flex: 1,
        padding: 15,
        backgroundColor: "#fff"
    },

    searchBox: {
        borderWidth: 1,
        padding: 10,
        borderRadius: 8,
        marginBottom: 15
    },

    title: {
        fontSize: 18,
        fontWeight: "bold",
        marginVertical: 10
    },

    card: {
        borderWidth: 1,
        padding: 12,
        marginBottom: 10,
        borderRadius: 10
    },

    text: {
        fontSize: 14,
        marginVertical: 2
    }
});

export default EmployeeDashboard;