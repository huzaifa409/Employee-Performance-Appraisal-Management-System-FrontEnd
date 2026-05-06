import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { Dropdown } from 'react-native-element-dropdown';

import BASE_URL from "../../../API-URL/API";

const COLORS = {
  primary: '#1a6b45',
  primaryLight: '#e1f5ee',
  peer: '#7f77dd',
  white: '#ffffff',
  bg: '#f5f6f8',
  border: '#e0e0e0',
};

const EVAL_OPTIONS = [
  { label: 'Both (Student + Peer)', value: 'both' },
  { label: 'Student Only', value: 'student' },
  { label: 'Peer Only', value: 'peer' },
];

const CourseEvaluationScreen = ({ navigation }) => {
  const [sessions, setSessions] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [evalType, setEvalType] = useState('both');

  const [loading, setLoading] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  const [comparisonData, setComparisonData] = useState([]);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  // ---------------- SESSIONS ----------------
  const fetchSessions = async () => {
    try {
      const res = await fetch(`${BASE_URL}/ExtraFeatures/GetSessions`);
      const data = await res.json();

      setSessions(
        data.map(s => ({
          label: s.name,
          value: s.id,
        }))
      );
    } catch (e) {
      console.log("SESSION ERROR:", e);
    }
  };

  // ---------------- TEACHERS ----------------
  const fetchTeachers = async (sessionId) => {
    setLoadingTeachers(true);
    setTeachers([]);
    setSelectedTeacher(null);

    try {
      const res = await fetch(
        `${BASE_URL}/ExtraFeatures/GetTeachersBySession/${sessionId}`
      );
      const data = await res.json();

      console.log("TEACHERS API RESPONSE:", data);

      setTeachers(
        data.map(t => ({
          label: t.Name,     // ✅ FIXED (IMPORTANT)
          value: t.UserID,   // ✅ FIXED (IMPORTANT)
        }))
      );

    } catch (e) {
      console.log("TEACHERS ERROR:", e);
    } finally {
      setLoadingTeachers(false);
    }
  };

  // ---------------- VIEW DATA ----------------
  const handleView = async () => {
    if (!selectedSession || !selectedTeacher) {
      Alert.alert('Missing Fields', 'Please select session and teacher.');
      return;
    }

    setLoading(true);
    setHasData(false);

    try {
      const res = await fetch(
        `${BASE_URL}/ExtraFeatures/GetCourseComparison/${selectedTeacher}/${selectedSession}?evaluationType=${evalType}`
      );

      const data = await res.json();
      setComparisonData(data);
      setHasData(true);

    } catch (e) {
      console.log("VIEW ERROR:", e);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- DETAIL SCREEN ----------------
  const handleShowDetail = () => {
    navigation.navigate('QuestionAnalysis', {
      teacherId: selectedTeacher,
      sessionId: selectedSession,
      evalType: evalType,
    });
  };

  // ---------------- CHART ----------------
  const buildChartData = () => {
    const bars = [];

    comparisonData.forEach((item, idx) => {
      if (evalType === 'student' || evalType === 'both') {
        bars.push({
          value: item.StudentAverage,
          label: idx === 0 ? item.CourseCode : '',
          frontColor: COLORS.primary,
          spacing: 6,
        });
      }

      if (evalType === 'peer' || evalType === 'both') {
        bars.push({
          value: item.PeerAverage,
          label: item.CourseCode,
          frontColor: COLORS.peer,
          spacing: 20,
        });
      }
    });

    return bars;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      <ScrollView style={styles.container}>

        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>Course Evaluation Ratings</Text>
          <Text style={styles.subtitle}>
            Select session, teacher and evaluation type
          </Text>
        </View>

        {/* FILTERS */}
        <View style={styles.card}>

          {/* SESSION + TEACHER */}
          <View style={styles.row}>
            <Dropdown
              style={styles.dropdown}
              data={sessions}
              labelField="label"
              valueField="value"
              placeholder="Session"
              value={selectedSession}
              onChange={item => {
                setSelectedSession(item.value);
                fetchTeachers(item.value);
                setHasData(false);
              }}
            />

            <Dropdown
              style={styles.dropdown}
              data={teachers}
              labelField="label"
              valueField="value"
              placeholder={loadingTeachers ? "Loading..." : "Teacher"}
              value={selectedTeacher}
              disable={!selectedSession || loadingTeachers}
              onChange={item => {
                setSelectedTeacher(item.value);
                setHasData(false);
              }}
              renderItem={(item) => (
                <View style={{ padding: 10 }}>
                  <Text>{item.label}</Text>
                </View>
              )}
            />
          </View>

          {/* EVAL TYPE + BUTTON */}
          <View style={styles.row}>
            <Dropdown
              style={styles.dropdown}
              data={EVAL_OPTIONS}
              labelField="label"
              valueField="value"
              value={evalType}
              onChange={item => {
                setEvalType(item.value);
                setHasData(false);
              }}
            />

            <TouchableOpacity style={styles.viewBtn} onPress={handleView}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: '#fff' }}>View</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* CHART */}
        {hasData && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              Performance Comparison
            </Text>

            <ScrollView horizontal>
              <BarChart
                data={buildChartData()}
                barWidth={28}
                spacing={10}
                maxValue={10}
                noOfSections={5}
              />
            </ScrollView>

            {/* DETAIL BUTTON */}
            <TouchableOpacity
              style={styles.detailBtn}
              onPress={handleShowDetail}
            >
              <Text style={styles.detailText}>
                Show Detail →
              </Text>
            </TouchableOpacity>

          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

export default CourseEvaluationScreen;

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f6f8' },
  container: { padding: 14 },

  header: {
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: 12,
    marginBottom: 10,
  },

  title: { color: '#fff', fontSize: 18, fontWeight: '700' },
  subtitle: { color: '#ddd', fontSize: 12 },

  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },

  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },

  dropdown: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    borderColor: '#ccc',
  },

  viewBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    justifyContent: 'center',
    borderRadius: 8,
  },

  sectionTitle: {
    fontWeight: '600',
    marginBottom: 10,
  },

  detailBtn: {
    backgroundColor: COLORS.primary,
    marginTop: 15,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },

  detailText: {
    color: '#fff',
    fontWeight: '600',
  },
});