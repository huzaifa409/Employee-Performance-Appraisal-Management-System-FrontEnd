// ============================================================
// APIService.js
// ============================================================
// PURPOSE:
// This file demonstrates multiple API integration techniques
// commonly used in your FYP Employee Performance Appraisal System.
//
// CONCEPTS COVERED:
// 1. Send Single Object
// 2. Send Array
// 3. Send Complex Nested Object
// 4. GET Request
// 5. PUT Request
// 6. DELETE Request
// 7. Error Handling
// 8. Async Await
// 9. Dynamic Payloads
// 10. Reusable API Functions
// ============================================================


// ============================================================
// BASE URL
// ============================================================

const BASE_URL = "https://your-api-url/api";


// ============================================================
// 1. SIMPLE POST API
// Send Single Object to Backend
// ============================================================

export const createKPI = async () => {
  try {

    // Object Payload
    const payload = {
      SessionId: 1,
      EmployeeTypeId: 2,
      KPIName: "Teaching Performance",
      RequestedKPIWeight: 40
    };

    // API Call
    const response = await fetch(`${BASE_URL}/Kpi/create-main-kpi`, {
      method: "POST",

      // Headers
      headers: {
        "Content-Type": "application/json"
      },

      // Convert Object into JSON String
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    console.log("KPI Created:", data);

  } catch (error) {
    console.log("API Error:", error);
  }
};



// ============================================================
// 2. SEND ARRAY TO BACKEND
// Example: Multiple Sub KPIs
// ============================================================

export const sendArrayData = async () => {

  try {

    // Array Payload
    const payload = [
      {
        Name: "Attendance",
        Weight: 20
      },
      {
        Name: "Result",
        Weight: 30
      },
      {
        Name: "Feedback",
        Weight: 50
      }
    ];

    const response = await fetch(`${BASE_URL}/Kpi/save-subkpis`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify(payload)
    });

    const data = await response.json();

    console.log("Array Sent Successfully:", data);

  } catch (error) {
    console.log("Array API Error:", error);
  }
};



// ============================================================
// 3. SEND NESTED OBJECT (MOST IMPORTANT)
// This is exactly like your FYP Project
// ============================================================

export const createKPIWithSubKPIs = async () => {

  try {

    // Complex Nested Object
    const payload = {

      // Main KPI Information
      SessionId: 1,
      EmployeeTypeId: 2,
      KPIName: "Teaching",
      RequestedKPIWeight: 40,

      // Array inside Object
      SubKPIs: [
        {
          Name: "Attendance",
          Weight: 20
        },
        {
          Name: "Result",
          Weight: 30
        },
        {
          Name: "Student Feedback",
          Weight: 50
        }
      ]
    };

    const response = await fetch(`${BASE_URL}/Kpi/create-with-weight`, {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify(payload)
    });

    const data = await response.json();

    console.log("Complete KPI Architecture Created:", data);

  } catch (error) {
    console.log("Nested Object Error:", error);
  }
};



// ============================================================
// 4. GET DATA FROM BACKEND
// ============================================================

export const getAllKPIs = async (sessionId, employeeTypeId) => {

  try {

    const response = await fetch(
      `${BASE_URL}/Kpi/view-weights/${sessionId}/${employeeTypeId}`
    );

    const data = await response.json();

    console.log("All KPI Data:", data);

    return data;

  } catch (error) {

    console.log("GET API Error:", error);

    return [];
  }
};



// ============================================================
// 5. UPDATE DATA USING PUT
// Example: Edit KPI Name
// ============================================================

export const updateKPIName = async (kpiId, newName) => {

  try {

    const payload = {
      Name: newName
    };

    const response = await fetch(
      `${BASE_URL}/Kpi/edit-kpi-name/${kpiId}`,
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify(payload)
      }
    );

    const data = await response.json();

    console.log("KPI Updated:", data);

  } catch (error) {

    console.log("PUT API Error:", error);
  }
};



// ============================================================
// 6. UPDATE WEIGHT
// ============================================================

export const updateKPIWeight = async (
  sessionId,
  kpiId,
  newWeight
) => {

  try {

    const payload = {
      Weight: newWeight
    };

    const response = await fetch(
      `${BASE_URL}/Kpi/edit-kpi-weight/${sessionId}/${kpiId}`,
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify(payload)
      }
    );

    const data = await response.json();

    console.log("Weight Updated:", data);

  } catch (error) {

    console.log("Weight Update Error:", error);
  }
};



// ============================================================
// 7. DELETE API
// ============================================================

export const deleteKPI = async (
  sessionId,
  kpiId
) => {

  try {

    const response = await fetch(
      `${BASE_URL}/Kpi/delete-main-kpi/${sessionId}/${kpiId}`,
      {
        method: "DELETE"
      }
    );

    const data = await response.json();

    console.log("KPI Deleted:", data);

  } catch (error) {

    console.log("Delete API Error:", error);
  }
};



// ============================================================
// 8. SEND MULTIPLE EVALUATIONS
// Real FYP Example
// ============================================================

export const saveTeacherEvaluation = async () => {

  try {

    // Array of evaluations
    const payload = {
      Evaluations: [

        {
          TeacherId: 1,
          KPIId: 2,
          SubKPIId: 4,
          Marks: 8,
          Remarks: "Excellent"
        },

        {
          TeacherId: 1,
          KPIId: 2,
          SubKPIId: 5,
          Marks: 7,
          Remarks: "Good"
        },

        {
          TeacherId: 1,
          KPIId: 2,
          SubKPIId: 6,
          Marks: 9,
          Remarks: "Outstanding"
        }
      ]
    };

    const response = await fetch(
      `${BASE_URL}/Evaluation/SaveEvaluation`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify(payload)
      }
    );

    const data = await response.json();

    console.log("Evaluations Saved:", data);

  } catch (error) {

    console.log("Evaluation Error:", error);
  }
};



// ============================================================
// 9. DYNAMIC API FUNCTION
// Reusable Universal Function
// ============================================================

export const callAPI = async (
  endpoint,
  method = "GET",
  payload = null
) => {

  try {

    const options = {

      method: method,

      headers: {
        "Content-Type": "application/json"
      }
    };

    // Add body only if payload exists
    if (payload) {
      options.body = JSON.stringify(payload);
    }

    const response = await fetch(
      `${BASE_URL}${endpoint}`,
      options
    );

    const data = await response.json();

    return data;

  } catch (error) {

    console.log("Dynamic API Error:", error);

    return null;
  }
};



// ============================================================
// 10. HOW TO USE DYNAMIC FUNCTION
// ============================================================

export const exampleUsage = async () => {

  // GET Example
  const kpis = await callAPI(
    "/Kpi/view-weights/1/2"
  );

  console.log(kpis);



  // POST Example
  const saveData = await callAPI(

    "/Kpi/create-with-weight",

    "POST",

    {
      SessionId: 1,
      EmployeeTypeId: 2,
      KPIName: "Research",
      RequestedKPIWeight: 30,

      SubKPIs: [
        {
          Name: "Publications",
          Weight: 50
        },
        {
          Name: "Projects",
          Weight: 50
        }
      ]
    }
  );

  console.log(saveData);
};



// ============================================================
// IMPORTANT NOTES
// ============================================================

/*

========================
JSON.stringify()
========================

Converts JavaScript object into JSON string
before sending to backend.

Example:

{
  name: "Huzaifa"
}

becomes:

"{\"name\":\"Huzaifa\"}"



========================
await
========================

Waits until API response comes back.



========================
async
========================

Makes function asynchronous.



========================
fetch()
========================

Used for API communication.



========================
headers
========================

Tell backend data type.

Example:
application/json



========================
POST
========================

Create data



========================
GET
========================

Retrieve data



========================
PUT
========================

Update data



========================
DELETE
========================

Delete data



========================
TRY CATCH
========================

Handles API errors safely.



========================
NESTED OBJECTS
========================

Very important in your FYP.

Example:

{
   KPIName: "Teaching",

   SubKPIs: [
      { Name: "Attendance" },
      { Name: "Result" }
   ]
}



========================
ARRAY PAYLOAD
========================

Useful when sending:
- Evaluations
- Scores
- Multiple Teachers
- KPI Lists



========================
BEST PRACTICE
========================

Always make reusable API functions
instead of writing fetch again and again.

*/