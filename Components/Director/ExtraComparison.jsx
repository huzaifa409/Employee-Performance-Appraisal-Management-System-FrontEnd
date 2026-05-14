import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from "react-native";

import { BarChart } from "react-native-gifted-charts";
import BASE_URL from "../../API-URL/API";

import { ExtragetConfidentialScoresForPerformance } from "../../Database/db";

const screenWidth = Dimensions.get("window").width;

const ExtraComparison = ({ route }) => {
  const {
    mode,
    teacherA,
    teacherB,
    session1,
    session2,
  } = route.params;

  const [loading, setLoading] = useState(true);

  const [teacherAData, setTeacherAData] = useState(null);
  const [teacherBData, setTeacherBData] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  // ============================
  // CONVERT CONFIDENTIAL TO %
  // ============================
  const getConfPercent = (arr) => {
    if (!arr || arr.length === 0) return 0;
    const avg = arr.reduce((a, b) => a + b, 0) / arr.length;

    // assuming score is out of 4
    return ((avg / 4) * 100).toFixed(2);
  };

  // ============================
  // INJECT INTO KPI BREAKDOWN
  // ============================
  const injectConfidentialIntoKPI = (apiData, confScores) => {
    if (!apiData?.KPIBreakdown) return apiData;

    const confidentialPercent = parseFloat(getConfPercent(confScores));

    return {
      ...apiData,
      KPIBreakdown: apiData.KPIBreakdown.map((kpi) => {
        if (kpi.KPIName?.toLowerCase() === "academics") {
          const updatedSubKPIs = [...(kpi.SubKPIs || [])];

          const idx = updatedSubKPIs.findIndex(
            (s) =>
              s.SubName?.toLowerCase().includes("confidential")
          );

          if (idx !== -1) {
            // override existing
            updatedSubKPIs[idx] = {
              ...updatedSubKPIs[idx],
              Percentage: confidentialPercent,
            };
          } else {
            // or add new subkpi safely
            updatedSubKPIs.push({
              SubName: "Confidential Evaluation",
              Percentage: confidentialPercent,
            });
          }

          return {
            ...kpi,
            SubKPIs: updatedSubKPIs,
          };
        }

        return kpi;
      }),
    };
  };

  const loadData = async () => {
    try {
      setLoading(true);

      let apiA = null;
      let apiB = null;

      // ============================
      // API CALLS
      // ============================
      if (mode === "course") {
        const res1 = await fetch(
          `${BASE_URL}/OverallPerformance/GetTeacherComparisonAnalytics/${teacherA}/${session1}`
        );
        apiA = await res1.json();

        const res2 = await fetch(
          `${BASE_URL}/OverallPerformance/GetTeacherComparisonAnalytics/${teacherB}/${session1}`
        );
        apiB = await res2.json();
      } else {
        const res1 = await fetch(
          `${BASE_URL}/OverallPerformance/GetTeacherComparisonAnalytics/${teacherA}/${session1}`
        );
        apiA = await res1.json();

        const res2 = await fetch(
          `${BASE_URL}/OverallPerformance/GetTeacherComparisonAnalytics/${teacherA}/${session2}`
        );
        apiB = await res2.json();
      }

      // ============================
      // SQLITE CONFIDENTIAL
      // ============================
      const confScoresA =
        await ExtragetConfidentialScoresForPerformance(
          teacherA,
          session1,
          null
        );

      const confScoresB =
        mode === "course"
          ? await ExtragetConfidentialScoresForPerformance(
              teacherB,
              session1,
              null
            )
          : await ExtragetConfidentialScoresForPerformance(
              teacherA,
              session2,
              null
            );

      console.log("CONF A:", confScoresA);
      console.log("CONF B:", confScoresB);

      // ============================
      // 🔥 INJECT INTO KPI (IMPORTANT FIX)
      // ============================
      apiA = injectConfidentialIntoKPI(apiA, confScoresA);
      apiB = injectConfidentialIntoKPI(apiB, confScoresB);

      setTeacherAData(apiA);
      setTeacherBData(apiB);
    } catch (err) {
      console.log("LOAD ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  // ====================================
  // LOADING
  // ====================================
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#15803d" />
      </View>
    );
  }

  // ====================================
  // NO DATA
  // ====================================
  if (
    !teacherAData ||
    !teacherBData ||
    teacherAData.Status !== "Success" ||
    teacherBData.Status !== "Success"
  ) {
    return (
      <View style={styles.loader}>
        <Text style={{ fontSize: 16, color: "red" }}>
          No comparison data found
        </Text>
      </View>
    );
  }

  // ====================================
  // GRAPH DATA
  // ====================================
  const graphData =
    teacherAData?.KPIBreakdown?.flatMap((kpi) => {
      const second =
        teacherBData?.KPIBreakdown?.find(
          (x) => x.KPIName === kpi.KPIName
        );

      return [
        {
          value: kpi.KPIPercentage || 0,
          label: kpi.KPIName?.substring(0, 6),
          frontColor: "#16a34a",
        },
        {
          value: second?.KPIPercentage || 0,
          frontColor: "#2563eb",
        },
      ];
    }) || [];

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Performance Comparison</Text>
        <Text style={styles.subtitle}>
          Detailed KPI & SubKPI Comparison
        </Text>
      </View>

      {/* SUMMARY CARDS (UNCHANGED) */}
      <View style={styles.row}>
        {/* TEACHER A */}
        <View style={styles.summaryCard}>
          <Text style={styles.teacherName}>
            {teacherAData.TeacherName}
          </Text>

          <Text style={styles.smallText}>
            Performance Overview
          </Text>

          {teacherAData?.KPIBreakdown?.map((item, index) => (
            <View key={index} style={styles.kpiMiniRow}>
              <Text style={styles.kpiMiniTitle}>
                {item.KPIName}
              </Text>

              <Text style={styles.kpiMiniValue}>
                {item.KPIPercentage}%
              </Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.finalRow}>
            <Text style={styles.finalLabel}>
              Final Score
            </Text>

            <Text style={styles.finalScoreGreen}>
              {teacherAData.OverallPercentage}%
            </Text>
          </View>
        </View>

        {/* TEACHER B */}
        <View style={styles.summaryCard}>
          <Text style={styles.teacherName}>
            {teacherBData.TeacherName}
          </Text>

          <Text style={styles.smallText}>
            Performance Overview
          </Text>

          {teacherBData?.KPIBreakdown?.map((item, index) => (
            <View key={index} style={styles.kpiMiniRow}>
              <Text style={styles.kpiMiniTitle}>
                {item.KPIName}
              </Text>

              <Text style={styles.kpiMiniValue}>
                {item.KPIPercentage}%
              </Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.finalRow}>
            <Text style={styles.finalLabel}>
              Final Score
            </Text>

            <Text style={styles.finalScoreBlue}>
              {teacherBData.OverallPercentage}%
            </Text>
          </View>
        </View>
      </View>

      {/* BAR CHART (UNCHANGED) */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>
          KPI Wise Comparison
        </Text>

        <ScrollView horizontal>
          <BarChart
            data={graphData}
            barWidth={18}
            spacing={24}
            roundedTop
            roundedBottom
            hideRules={false}
            xAxisThickness={1}
            yAxisThickness={1}
            yAxisTextStyle={{ fontSize: 10 }}
            noOfSections={5}
            maxValue={100}
            width={screenWidth + 200}
          />
        </ScrollView>
      </View>

      {/* KPI DETAILS (UNCHANGED BUT NOW FIXED DATA) */}
      {teacherAData?.KPIBreakdown?.map((kpi, index) => {
        const secondKpi =
          teacherBData?.KPIBreakdown?.find(
            (x) => x.KPIName === kpi.KPIName
          );

        return (
          <View key={index} style={styles.detailCard}>
            <Text style={styles.detailTitle}>
              {kpi.KPIName}
            </Text>

            <View style={styles.compareRow}>
              <View style={styles.compareBox}>
                <Text style={styles.compareTeacher}>
                  {teacherAData.TeacherName}
                </Text>

                <Text style={styles.comparePercent}>
                  {kpi.KPIPercentage}%
                </Text>
              </View>

              <View style={styles.compareBox}>
                <Text style={styles.compareTeacher}>
                  {teacherBData.TeacherName}
                </Text>

                <Text style={styles.comparePercent}>
                  {secondKpi?.KPIPercentage || 0}%
                </Text>
              </View>
            </View>

            {/* SUB KPI (NOW INCLUDES CONFIDENTIAL CORRECTLY) */}
            {kpi?.SubKPIs?.map((sub, idx) => {
              const secondSub =
                secondKpi?.SubKPIs?.find(
                  (x) => x.SubName === sub.SubName
                );

              return (
                <View key={idx} style={styles.subCard}>
                  <Text style={styles.subTitle}>
                    {sub.SubName}
                  </Text>

                  <View style={styles.subRow}>
                    <Text style={styles.subText}>
                      {teacherAData.TeacherName}: {sub.Percentage}%
                    </Text>

                    <Text style={styles.subText}>
                      {teacherBData.TeacherName}:{" "}
                      {secondSub?.Percentage || 0}%
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        );
      })}
    </ScrollView>
  );
};

export default ExtraComparison;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    backgroundColor: "#166534",
    padding: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },

  subtitle: {
    color: "#d1fae5",
    marginTop: 4,
    fontSize: 13,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
  },

  summaryCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    elevation: 4,
  },

  teacherName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 6,
  },

  smallText: {
    color: "#6b7280",
    fontSize: 12,
    marginBottom: 12,
  },

  kpiMiniRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  kpiMiniTitle: {
    fontSize: 12,
    color: "#374151",
    flex: 1,
  },

  kpiMiniValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#15803d",
  },

  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 12,
  },

  finalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  finalLabel: {
    fontSize: 14,
    fontWeight: "bold",
  },

  finalScoreGreen: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#16a34a",
  },

  finalScoreBlue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2563eb",
  },

  chartCard: {
    backgroundColor: "#fff",
    margin: 15,
    borderRadius: 16,
    padding: 15,
    elevation: 4,
  },

  chartTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 20,
  },

  detailCard: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 16,
    padding: 15,
    elevation: 3,
  },

  detailTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#166534",
    marginBottom: 15,
  },

  compareRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  compareBox: {
    width: "48%",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 12,
  },

  compareTeacher: {
    fontWeight: "600",
    marginBottom: 8,
  },

  comparePercent: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#15803d",
  },

  subCard: {
    backgroundColor: "#f3f4f6",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },

  subTitle: {
    fontWeight: "bold",
    marginBottom: 6,
    fontSize: 13,
  },

  subRow: {
    gap: 4,
  },

  subText: {
    fontSize: 12,
    color: "#444",
  },
});