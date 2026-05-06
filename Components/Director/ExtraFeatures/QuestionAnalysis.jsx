import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

import BASE_URL from "../../../API-URL/API";

const QuestionAnalysis = ({ route }) => {
  const { teacherId, sessionId, evalType } = route.params;

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [evaluationType, setEvaluationType] = useState(evalType || 'both');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const evalOptions = [
    { label: 'Both', value: 'both' },
    { label: 'Student', value: 'student' },
    { label: 'Peer', value: 'peer' },
  ];

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch(
        `${BASE_URL}/ExtraFeatures/GetMyCourses/${teacherId}/${sessionId}`
      );
      const data = await res.json();

      const formatted = data.map(c => ({
        label: c,
        value: c,
      }));

      setCourses(formatted);

      if (formatted.length > 0) {
        setSelectedCourse(formatted[0].value);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (selectedCourse) fetchQuestions();
  }, [selectedCourse, evaluationType]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${BASE_URL}/ExtraFeatures/GetCourseQuestionDetail/${teacherId}/${sessionId}/${selectedCourse}?evaluationType=${evaluationType}`
      );

      const data = await res.json();
      setQuestions(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const renderBar = (count, total) => {
    const width = total > 0 ? (count / total) * 100 : 0;

    return (
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${width}%` }]} />
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Question Analysis</Text>

      {/* Dropdowns */}
      <View style={styles.row}>
        <Dropdown
          style={styles.dropdown}
          data={courses}
          labelField="label"
          valueField="value"
          value={selectedCourse}
          placeholder="Select Course"
          onChange={item => setSelectedCourse(item.value)}
        />

        <Dropdown
          style={styles.dropdown}
          data={evalOptions}
          labelField="label"
          valueField="value"
          value={evaluationType}
          onChange={item => setEvaluationType(item.value)}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        questions.map((q, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.question}>
              {index + 1}. {q.QuestionText}
            </Text>

            <Text style={styles.avg}>
              {q.AverageScore.toFixed(2)} Avg Rating
            </Text>

            {/* Score Distribution */}
            <View style={styles.distRow}>
              <Text>S4</Text>
              {renderBar(q.Score4, q.TotalResponses)}
              <Text>{q.Score4}</Text>
            </View>

            <View style={styles.distRow}>
              <Text>S3</Text>
              {renderBar(q.Score3, q.TotalResponses)}
              <Text>{q.Score3}</Text>
            </View>

            <View style={styles.distRow}>
              <Text>S2</Text>
              {renderBar(q.Score2, q.TotalResponses)}
              <Text>{q.Score2}</Text>
            </View>

            <View style={styles.distRow}>
              <Text>S1</Text>
              {renderBar(q.Score1, q.TotalResponses)}
              <Text>{q.Score1}</Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
};

export default QuestionAnalysis;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 14,
    backgroundColor: '#f5f6f8',
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
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
  },

  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },

  question: {
    fontWeight: '600',
    marginBottom: 5,
  },

  avg: {
    color: 'green',
    marginBottom: 10,
  },

  distRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 5,
  },

  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#eee',
    borderRadius: 4,
  },

  barFill: {
    height: '100%',
    backgroundColor: '#1a6b45',
    borderRadius: 4,
  },
});