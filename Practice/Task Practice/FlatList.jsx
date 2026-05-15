/*
===========================================================
                COMPLETE FLOW OF THIS SCREEN
===========================================================

This React Native screen performs these tasks:

1. Calls API from backend
2. Receives JSON data
3. Stores API data in state variables
4. Displays data using FlatList
5. Searches data using TextInput
6. Filters data dynamically
7. Shows loading indicator while fetching data

===========================================================
                STEP-BY-STEP FLOW
===========================================================

---------------------------
STEP 1 — SCREEN LOADS
---------------------------

When screen opens:

useEffect(() => {
    fetchData();
}, []);

runs automatically.

This calls the fetchData() function.

------------------------------------------------------------

---------------------------
STEP 2 — API CALL
---------------------------

fetchData() function calls backend API:

fetch(`${BASE_URL}/GetEmployeePerformance`)

Backend sends data in JSON format.

Example:

[
   {
      "employeeId": 1,
      "employeeName": "Huzaifa",
      "departmentName": "IT",
      "score": 90
   }
]

------------------------------------------------------------

---------------------------
STEP 3 — STORE DATA
---------------------------

setData(json);

Stores original API data.

setFilteredData(json);

Stores filtered/searchable data.

Why both?

data:
- Original complete API data

filteredData:
- Data after searching/filtering

------------------------------------------------------------

---------------------------
STEP 4 — SEARCHING
---------------------------

When user types in TextInput:

onChangeText={searchData}

searchData() function runs.

------------------------------------------------------------

---------------------------
STEP 5 — FILTERING
---------------------------

filter() loops through every object inside array.

It checks:

1. employeeName
2. departmentName
3. employeeId

If ANY field matches,
that object is included.

Example:

User types:
"IT"

Then:

item.departmentName.includes("IT")

becomes TRUE.

------------------------------------------------------------

---------------------------
STEP 6 — DISPLAY DATA
---------------------------

FlatList displays filteredData array.

renderItem runs for every object.

Example:

{
   "employeeName": "Huzaifa"
}

Then:

item.employeeName

becomes:

Huzaifa

------------------------------------------------------------

---------------------------
STEP 7 — LOADING
---------------------------

While API is fetching:

<ActivityIndicator />

shows loading spinner.

After API finishes:

setLoading(false)

hides spinner.

===========================================================
                IMPORTANT CONCEPTS
===========================================================

useState()
- Stores data

useEffect()
- Runs code when screen opens

fetch()
- Calls API

filter()
- Searches array

FlatList
- Displays array data efficiently

TextInput
- Takes search input

===========================================================
*/

import { useEffect, useState } from "react";

import {
    Text,
    View,
    ActivityIndicator,
    FlatList,
    TextInput
} from "react-native";

import BASE_URL from "../../API-URL/API";

const P1 = () => {

    // =====================================================
    // STATE VARIABLES
    // =====================================================

    // Stores original API data
    const [data, setData] = useState([]);

    // Stores filtered/search data
    const [filteredData, setFilteredData] = useState([]);

    // Stores search text
    const [search, setSearch] = useState("");

    // Loading state
    const [loading, setLoading] = useState(true);

    // =====================================================
    // RUNS WHEN SCREEN LOADS
    // =====================================================

    useEffect(() => {
        fetchData();
    }, []);

    // =====================================================
    // FETCH API DATA
    // =====================================================

    const fetchData = async () => {

        try {

            // API CALL
            const response = await fetch(
                `${BASE_URL}/GetEmployeePerformance`
            );

            // Convert response into JSON
            const json = await response.json();

            console.log("API DATA:", json);

            // Store original data
            setData(json);

            // Store searchable data
            setFilteredData(json);

        } catch (error) {

            console.log("API ERROR:", error);

        } finally {

            // Stop loading spinner
            setLoading(false);
        }
    };

    // =====================================================
    // SEARCH FUNCTION
    // =====================================================

    const searchData = (text) => {

        // Update search state
        setSearch(text);

        // If search box empty
        if (text === "") {

            // Show all data again
            setFilteredData(data);

        } else {

            // Filter array
            const filtered = data.filter((item) =>

                // Search by Employee Name
                item.employeeName
                    ?.toLowerCase()
                    .includes(text.toLowerCase())

                ||

                // Search by Department Name
                item.departmentName
                    ?.toLowerCase()
                    .includes(text.toLowerCase())

                ||

                // Search by Employee ID
                item.employeeId
                    ?.toString()
                    .includes(text)
            );

            // Update filtered data
            setFilteredData(filtered);
        }
    };

    // =====================================================
    // LOADING SCREEN
    // =====================================================

    if (loading) {

        return (
            <ActivityIndicator
                size="large"
            />
        );
    }

    // =====================================================
    // MAIN UI
    // =====================================================

    return (

        <View style={{ flex: 1, padding: 20 }}>

            {/* ============================================
                    SEARCH INPUT
            ============================================ */}

            <TextInput
                placeholder="Search Employee"

                value={search}

                onChangeText={searchData}

                style={{
                    borderWidth: 1,
                    marginBottom: 20,
                    padding: 10,
                    borderRadius: 10
                }}
            />

            {/* ============================================
                    DISPLAY DATA USING FLATLIST
            ============================================ */}

            <FlatList

                // Data array
                data={filteredData}

                // Unique key for every row
                keyExtractor={(item) =>
                    item.employeeId.toString()
                }

                // Renders every item
                renderItem={({ item }) => (

                    <View
                        style={{
                            borderWidth: 1,
                            padding: 15,
                            marginBottom: 10,
                            borderRadius: 10
                        }}
                    >

                        {/* Employee Name */}
                        <Text>
                            Employee:
                            {" "}
                            {item.employeeName}
                        </Text>

                        {/* Department */}
                        <Text>
                            Department:
                            {" "}
                            {item.departmentName}
                        </Text>

                        {/* Score */}
                        <Text>
                            Score:
                            {" "}
                            {item.score}
                        </Text>

                    </View>
                )}
            />

        </View>
    );
};

export default P1;