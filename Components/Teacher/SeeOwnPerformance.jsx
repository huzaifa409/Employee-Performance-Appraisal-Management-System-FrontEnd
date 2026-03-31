import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Alert,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BarChart } from "react-native-gifted-charts";
import { Dropdown } from 'react-native-element-dropdown';
import Icon from "react-native-vector-icons/MaterialIcons";
import BASE_URL from "../../API-URL/API";

const { width } = Dimensions.get("window");

const SeeOwnPerformance = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { userId, username } = route.params;

  const [loading, setLoading] = useState(true);
  const [fetchingData, setFetchingData] = useState(false); // New state for session switching
  const [performanceData, setPerformanceData] = useState(null);
  const [chartData, setChartData] = useState([]);
  
  const [sessions, setSessions] = useState([]);
  const [selectedSessionValue, setSelectedSessionValue] = useState(null);
  const [isFocus, setIsFocus] = useState(false);

  useEffect(() => {
    initialFetch();
  }, [userId]);

  const initialFetch = async () => {
    setLoading(true);
    await fetchSessions();
    setLoading(false);
  };

  const fetchSessions = async () => {
    try {
      const response = await fetch(`${BASE_URL}/PeerEvaluator/Sessions`);
      const result = await response.json();
      
      const formattedSessions = result.map(s => ({
        label: s.name,
        value: s.id
      }));

      setSessions(formattedSessions);
      
      if (formattedSessions.length > 0) {
        const firstSession = formattedSessions[0].value;
        setSelectedSessionValue(firstSession);
        fetchPerformance(firstSession); // Fetch data for the first session immediately
      }
    } catch (error) {
      console.error("Session Fetch Error:", error);
      Alert.alert("Error", "Could not load sessions.");
    }
  };

  const fetchPerformance = async (sessionId) => {
    setFetchingData(true);
    try {
      const response = await fetch(
        `${BASE_URL}/TeacherDashboard/SeeOwnPerformance?userId=${userId}&sessionId=${sessionId}`
      );
      const result = await response.json();

      setPerformanceData(result);

      // Map API data to BarChart format
      const formattedChart = result.Kpis.map(kpi => ({
        value: kpi.Score,
        label: kpi.Name.split(' ')[0], // Shorten label if needed
        frontColor: '#1E7F4D',
        topLabelComponent: () => (
          <Text style={{ fontSize: 10, color: '#1E7F4D', marginBottom: 4 }}>{kpi.Score}</Text>
        ),
      }));
      setChartData(formattedChart);

    } catch (error) {
      console.error("Performance API Error:", error);
      Alert.alert("Error", "Failed to fetch performance scores.");
    } finally {
      setFetchingData(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#1E7F4D" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={24} color="#1E7F4D" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>My Performance</Text>
          <View style={styles.userRow}>
             <Icon name="person" size={14} color="#fff" style={{ marginRight: 4 }} />
             <Text style={styles.headerSubtitle}>{username || "Instructor"}</Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        
        {/* Session Selector */}
        <View style={styles.selectorContainer}>
            <Text style={styles.selectorLabel}>Academic Session</Text>
            <Dropdown
              style={[styles.dropdown, isFocus && { borderColor: '#1E7F4D' }]}
              data={sessions}
              maxHeight={300}
              labelField="label"
              valueField="value"
              value={selectedSessionValue}
              onFocus={() => setIsFocus(true)}
              onBlur={() => setIsFocus(false)}
              onChange={item => {
                setSelectedSessionValue(item.value);
                setIsFocus(false);
                fetchPerformance(item.value);
              }}
              renderLeftIcon={() => <Icon style={styles.icon} color="#1E7F4D" name="calendar-month" size={20} />}
            />
        </View>

        {fetchingData ? (
          <ActivityIndicator size="large" color="#1E7F4D" style={{ marginTop: 40 }} />
        ) : performanceData ? (
          <>
            {/* Overall Score Card */}
            <View style={styles.overallCard}>
                <View style={styles.iconBox}>
                    <Text style={styles.overallPercentText}>{performanceData.OverallPercentage}%</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 15 }}>
                    <Text style={styles.overallLabel}>Aggregate Performance</Text>
                    <Text style={styles.pointsSubText}>
                      {performanceData.ObtainedPoints} / {performanceData.TotalPoints} Obtained Points
                    </Text>
                </View>
            </View>

            {/* Bar Chart Section */}
            <View style={styles.chartContainer}>
                <Text style={styles.sectionHeading}>KPI Overview</Text>
                <BarChart
                  data={chartData}
                  barWidth={35}
                  noOfSections={4}
                  barBorderRadius={4}
                  frontColor="#1E7F4D"
                  yAxisThickness={0}
                  xAxisThickness={1}
                  xAxisColor={'#e2e8f0'}
                  hideRules
                  maxValue={performanceData.Kpis[0]?.Total || 100} // Dynamic max based on first KPI total
                />
            </View>

            {/* Detailed KPI List */}
            <Text style={[styles.sectionHeading, { marginLeft: 20, marginTop: 20 }]}>Breakdown by Category</Text>
            {performanceData.Kpis.map((kpi, index) => (
              <View key={index} style={styles.kpiCard}>
                <View style={styles.kpiHeader}>
                  <Text style={styles.kpiName}>{kpi.Name}</Text>
                  <Text style={styles.kpiScoreText}>{kpi.Score}/{kpi.Total}</Text>
                </View>
                
                {kpi.SubKpis.map((sub, sIdx) => (
                  <View key={sIdx} style={styles.subKpiRow}>
                    <Text style={styles.subKpiName}>{sub.Name}</Text>
                    <View style={styles.subKpiScoreBox}>
                      <Text style={styles.subKpiScore}>{sub.Score}</Text>
                      <Text style={styles.subKpiTotal}>/{sub.Total}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </>
        ) : (
          <View style={styles.detailsContainer}>
              <Text style={styles.noDataText}>No performance records found for this session.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
   backgroundColor:"#1E7F4D",
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  backBtn: {
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1E7F4D',
    backgroundColor:"#fff",
    marginRight: 15
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#fff" },
  userRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  headerSubtitle: { fontSize: 13, color: "#fff", fontWeight: '500' },

  selectorContainer: { padding: 20 },
  selectorLabel: { fontSize: 14, color: "#64748b", marginBottom: 10, fontWeight: '600' },

  dropdown: {
    height: 50,
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  icon: { marginRight: 10 },

  overallCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10
  },
  iconBox: {
    backgroundColor: '#1E7F4D',
    width: 65,
    height: 65,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  overallPercentText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  overallLabel: { fontSize: 14, color: '#64748b', fontWeight: '700' },
  pointsSubText: { fontSize: 13, color: '#1E7F4D', fontWeight: '600', marginTop: 2 },

  chartContainer: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 15,
    borderRadius: 16,
    elevation: 2
  },
  sectionHeading: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 15 },

  kpiCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  kpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  kpiName: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  kpiScoreText: { fontSize: 15, fontWeight: '700', color: '#1E7F4D' },

  subKpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6
  },
  subKpiName: { fontSize: 13, color: '#64748b', flex: 1 },
  subKpiScoreBox: { flexDirection: 'row', alignItems: 'center' },
  subKpiScore: { fontSize: 13, fontWeight: '700', color: '#1e293b' },
  subKpiTotal: { fontSize: 11, color: '#94a3b8' },

  detailsContainer: {
    margin: 20,
    padding: 40,
    alignItems: 'center',
  },
  noDataText: { color: '#94a3b8', fontSize: 14, textAlign: 'center' },
});

export default SeeOwnPerformance;