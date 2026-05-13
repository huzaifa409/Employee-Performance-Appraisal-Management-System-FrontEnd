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


// =======================
// QUESTION-WISE CONFIDENTIAL ANALYSIS
// =======================
export const getConfidentialQuestionStats = async (
  teacherId,
  sessionId,
  courseCode
) => {
  try {
    const conn = await db;

    const res = await conn.executeSql(
      `SELECT payload FROM ConfidentialEvaluation`
    );

    const grouped = {};

    res[0].rows.raw().forEach((row) => {

      const data = JSON.parse(row.payload);

      console.log("LOCAL SQLITE DATA:", data);

      // =========================
      // SAFE FILTERING
      // =========================
      const dbTeacher =
        String(data.teacherId).trim();

      const dbSession =
        String(data.sessionId).trim();

      const dbCourse =
        String(data.courseCode).trim().toLowerCase();

      const currentTeacher =
        String(teacherId).trim();

      const currentSession =
        String(sessionId).trim();

      const currentCourse =
        String(courseCode).trim().toLowerCase();

      console.log("COMPARE:");
      console.log(dbTeacher, currentTeacher);
      console.log(dbSession, currentSession);
      console.log(dbCourse, currentCourse);

      // =========================
      // FILTER
      // =========================
      if (
        dbTeacher !== currentTeacher ||
        dbSession !== currentSession ||
        dbCourse !== currentCourse
      ) {
        return;
      }

      // =========================
      // ANSWERS LOOP
      // =========================
      data.Answers?.forEach((ans) => {

        const qid = ans.questionID;

        if (!grouped[qid]) {

          grouped[qid] = {
            QuestionId: qid,
            QuestionText:
              ans.questionText ||
              `Question ${qid}`,

            totalScore: 0,
            TotalResponses: 0,

            Score1: 0,
            Score2: 0,
            Score3: 0,
            Score4: 0,

            Type: "Confidential",
          };
        }

        grouped[qid].totalScore += ans.score;

        grouped[qid].TotalResponses += 1;

        if (ans.score === 1)
          grouped[qid].Score1 += 1;

        if (ans.score === 2)
          grouped[qid].Score2 += 1;

        if (ans.score === 3)
          grouped[qid].Score3 += 1;

        if (ans.score === 4)
          grouped[qid].Score4 += 1;
      });
    });

    // =========================
    // FINAL FORMAT
    // =========================
    const finalData = Object.values(grouped).map(
      (q) => ({
        ...q,

        AverageScore:
          q.TotalResponses > 0
            ? q.totalScore / q.TotalResponses
            : 0,
      })
    );

    console.log(
      "FINAL CONFIDENTIAL DATA:",
      finalData
    );

    return finalData;

  } catch (error) {

    console.log(
      "Confidential Stats Error:",
      error
    );

    return [];
  }
};


// =======================
// DELETE ALL CONFIDENTIAL DATA
// =======================
export const deleteAllConfidentialEvaluations = async () => {
  try {
    const conn = await db;

    await conn.executeSql(`DELETE FROM ConfidentialEvaluation`);

    console.log("All confidential evaluations deleted");
  } catch (error) {
    console.log("Delete Error:", error);
  }
};




// =======================
// CHECK RECORD COUNT
// =======================
export const getConfidentialEvaluationCount = async () => {
  try {
    const conn = await db;

    const res = await conn.executeSql(
      `SELECT COUNT(*) as total FROM ConfidentialEvaluation`
    );

    const count = res[0].rows.item(0).total;
    console.log("Total records:", count);
    return count;

  } catch (error) {
    console.log("Count Error:", error);
    return -1;
  }
};




export const getConfidentialAverageForTeacher = async (
  teacherId,
  sessionId,
  courseCode
) => {
  try {
    const conn = await db;

    const res = await conn.executeSql(
      `SELECT payload FROM ConfidentialEvaluation`
    );

    let total = 0;
    let count = 0;

    res[0].rows.raw().forEach((row) => {
      const data = JSON.parse(row.payload);

      console.log("CONF ROW:", data);

      // SAFE NORMALIZATION
      const dbTeacher = String(data.teacherId || "").trim();
      const dbSession = String(data.sessionId || "").trim();
      const dbCourse = String(data.courseCode || "").trim().toLowerCase();

      const tId = String(teacherId || "").trim();
      const sId = String(sessionId || "").trim();
      const cCode = String(courseCode || "").trim().toLowerCase();

      // FILTER
      if (dbTeacher !== tId) return;
      if (dbCourse !== cCode) return;

      // ⚠️ session optional (IMPORTANT FIX)
      if (sessionId && dbSession !== sId) return;

      const answers = data.Answers || data.answers || [];

      answers.forEach((ans) => {
        if (ans?.score) {
          total += ans.score;
          count++;
        }
      });
    });

    const avgOutOf4 = count ? total / count : 0;

    return {
      avgOutOf10: Number(((avgOutOf4 / 4) * 10).toFixed(2)),
      avgOutOf100: Number(((avgOutOf4 / 4) * 100).toFixed(2)),
      count,
    };
  } catch (error) {
    console.log("CONF ERROR:", error);
    return { avgOutOf10: 0, avgOutOf100: 0, count: 0 };
  }
};




export const getConfidentialScoresForPerformance = async (
  teacherId,
  sessionId,
  courseCode = null
) => {
  try {
    const conn = await db;

    const res = await conn.executeSql(
      `SELECT payload FROM ConfidentialEvaluation`
    );

    let scores = [];

    res[0].rows.raw().forEach((row) => {

      try {

        const data = JSON.parse(row.payload);

        console.log("SQLITE PERFORMANCE ROW:", data);

        // =========================
        // NORMALIZE VALUES
        // =========================
        const dbTeacher =
          String(data.teacherId || "").trim();

        const dbSession =
          String(data.sessionId || "").trim();

        const dbCourse =
          String(data.courseCode || "")
            .trim()
            .toLowerCase();

        const currentTeacher =
          String(teacherId || "").trim();

        const currentSession =
          String(sessionId || "").trim();

        const currentCourse =
          String(courseCode || "")
            .trim()
            .toLowerCase();

        // =========================
        // FILTER TEACHER
        // =========================
        if (dbTeacher !== currentTeacher) {
          return;
        }

        // =========================
        // FILTER SESSION
        // =========================
        if (
          sessionId &&
          dbSession !== currentSession
        ) {
          return;
        }

        // =========================
        // FILTER COURSE
        // =========================
        if (
          courseCode &&
          dbCourse !== currentCourse
        ) {
          return;
        }

        // =========================
        // GET ANSWERS
        // =========================
        const answers =
          data.Answers ||
          data.answers ||
          [];

        answers.forEach((a) => {

          if (a?.score !== undefined) {

            scores.push(Number(a.score));

          }

        });

      } catch (err) {

        console.log(
          "Performance Payload Parse Error:",
          err
        );

      }

    });

    console.log(
      "FINAL PERFORMANCE CONFIDENTIAL SCORES:",
      scores
    );

    return scores;

  } catch (error) {

    console.log(
      "Performance Confidential Error:",
      error
    );

    return [];

  }
};