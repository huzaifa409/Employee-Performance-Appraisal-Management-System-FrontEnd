import SQLite from "react-native-sqlite-storage";

SQLite.enablePromise(true);

const db = SQLite.openDatabase(
  {
    name: "evaluation.db",
    location: "default",
  },
  () => console.log("DB Connected"),
  (error) => console.log("DB Error", error)
);

// =======================
// CREATE TABLE
// =======================
export const initDB = async () => {
  try {
    const conn = await db;

    await conn.executeSql(`
      CREATE TABLE IF NOT EXISTS ConfidentialEvaluation (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        enrollmentID TEXT,
        studentID TEXT,
        payload TEXT,
        createdAt TEXT
      );
    `);

    console.log("Table Created");
  } catch (error) {
    console.log("Init DB Error:", error);
  }
};

// =======================
// INSERT DATA
// =======================
export const saveEvaluationLocal = async (
  enrollmentID,
  studentID,
  payload
) => {
  try {
    const conn = await db;

    await conn.executeSql(
      `INSERT INTO ConfidentialEvaluation 
       (enrollmentID, studentID, payload, createdAt)
       VALUES (?, ?, ?, ?)`,
      [
        enrollmentID,
        studentID,
        JSON.stringify(payload),
        new Date().toISOString(),
      ]
    );

    console.log("Saved to SQLite");
  } catch (error) {
    console.log("Insert Error:", error);
  }
};

export default db;



// =======================
// GET CONFIDENTIAL DATA
// =======================
export const getConfidentialByTeacherAndSession = async (
  teacherID,
  sessionID
) => {
  try {
    const conn = await db;

    const res = await conn.executeSql(
      `SELECT * FROM ConfidentialEvaluation`
    );

    let results = [];

    res.forEach((r) => {
      for (let i = 0; i < r.rows.length; i++) {
        const row = r.rows.item(i);

        const parsed = JSON.parse(row.payload);

        // filter by teacher + session if needed
        if (
          parsed?.EnrollmentId &&
          parsed?.StudentId // optional filter
        ) {
          results.push(parsed);
        }
      }
    });

    return results;
  } catch (error) {
    console.log("Fetch Local Error:", error);
    return [];
  }
};


export const getConfidentialByTeacherSession = async (teacherId) => {
  try {
    const conn = await db;

    const res = await conn.executeSql(
      `SELECT payload FROM ConfidentialEvaluation`
    );

    let scores = [];

    res[0].rows.raw().forEach((row) => {
      const data = JSON.parse(row.payload);

      if (data?.Answers?.length) {
        data.Answers.forEach((a) => {
          scores.push(a.score);
        });
      }
    });

    return scores;
  } catch (error) {
    console.log("Fetch Local Error:", error);
    return [];
  }
};