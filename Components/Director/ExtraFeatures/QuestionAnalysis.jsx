import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import BASE_URL from '../../../API-URL/API';

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

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch(
        `${BASE_URL}/ExtraFeatures/GetMyCourses/${teacherId}/${sessionId}`
      );
      const data = await res.json();
      const formatted = data.map(c => ({ label: c, value: c }));
      setCourses(formatted);
      if (formatted.length > 0) setSelectedCourse(formatted[0].value);
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

  const getEvalTag = (type) => {
    switch (type?.toLowerCase()) {
      case 'student':
        return { label: 'Student eval', style: styles.tagStudent, textStyle: styles.tagStudentText };
      case 'peer':
        return { label: 'Peer eval', style: styles.tagPeer, textStyle: styles.tagPeerText };
      default:
        return { label: 'Both', style: styles.tagBoth, textStyle: styles.tagBothText };
    }
  };

  const renderBar = (count, total, level) => {
    const width = total > 0 ? (count / total) * 100 : 0;
    const barColors = {
      4: '#1D9E75',
      3: '#5DCAA5',
      2: '#9FE1CB',
      1: '#B4B2A9',
    };

    return (
      <View style={styles.barTrack}>
        <View
          style={[
            styles.barFill,
            { width: `${width}%`, backgroundColor: barColors[level] ?? '#1D9E75' },
          ]}
        />
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Question Analysis</Text>
        <Text style={styles.subtitle}>Score distribution per question</Text>
      </View>

      {/* Filters */}
      <View style={styles.row}>
        <Dropdown
          style={styles.dropdown}
          containerStyle={styles.dropdownContainer}
          selectedTextStyle={styles.dropdownText}
          data={courses}
          labelField="label"
          valueField="value"
          value={selectedCourse}
          placeholder="Select Course"
          placeholderStyle={styles.dropdownPlaceholder}
          onChange={item => setSelectedCourse(item.value)}
        />
        <Dropdown
          style={styles.dropdown}
          containerStyle={styles.dropdownContainer}
          selectedTextStyle={styles.dropdownText}
          data={evalOptions}
          labelField="label"
          valueField="value"
          value={evaluationType}
          placeholderStyle={styles.dropdownPlaceholder}
          onChange={item => setEvaluationType(item.value)}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1D9E75" style={{ marginTop: 40 }} />
      ) : (
        questions.map((q, index) => {
         const tag = getEvalTag(q.Type);
          return (
            <View key={index} style={styles.card}>
              {/* Question header */}
              <View style={styles.cardTop}>
                <Text style={styles.qNumber}>Q{index + 1}</Text>
                <Text style={styles.question}>{q.QuestionText}</Text>
                <View style={[styles.tag, tag.style]}>
                  <Text style={[styles.tagText, tag.textStyle]}>{tag.label}</Text>
                </View>
              </View>

              {/* Meta row */}
              <View style={styles.metaRow}>
                <View style={styles.avgBadge}>
                  <Text style={styles.avgText}>{q.AverageScore.toFixed(2)} avg</Text>
                </View>
                <Text style={styles.responseCount}>{q.TotalResponses} responses</Text>
              </View>

              <View style={styles.divider} />

              {/* Score distribution */}
              {[4, 3, 2, 1].map(score => (
                <View key={score} style={styles.distRow}>
                  <Text style={styles.scoreLabel}>{score}</Text>
                  {renderBar(q[`Score${score}`], q.TotalResponses, score)}
                  <Text style={styles.scoreCount}>{q[`Score${score}`]}</Text>
                </View>
              ))}
            </View>
          );
        })
      )}

      <View style={{ height: 24 }} />
    </ScrollView>
  );
};

export default QuestionAnalysis;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    paddingHorizontal: 14,
  },

  header: {
    paddingTop: 20,
    marginBottom: 16,
  },

  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111',
  },

  subtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },

  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },

  dropdown: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: '#d0d0d0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    height: 40,
  },

  dropdownContainer: {
    borderRadius: 8,
    borderColor: '#d0d0d0',
  },

  dropdownText: {
    fontSize: 13,
    color: '#111',
  },

  dropdownPlaceholder: {
    fontSize: 13,
    color: '#aaa',
  },

  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.08)',
  },

  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 10,
  },

  qNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#aaa',
    marginTop: 2,
    minWidth: 20,
  },

  question: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#111',
    lineHeight: 19,
  },

  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    flexShrink: 0,
    marginTop: 1,
  },

  tagText: {
    fontSize: 11,
    fontWeight: '600',
  },

  tagStudent: {
    backgroundColor: '#E6F1FB',
  },

  tagStudentText: {
    color: '#0C447C',
  },

  tagPeer: {
    backgroundColor: '#EEEDFE',
  },

  tagPeerText: {
    color: '#3C3489',
  },

  tagBoth: {
    backgroundColor: '#EAF3DE',
  },

  tagBothText: {
    color: '#27500A',
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },

  avgBadge: {
    backgroundColor: '#E1F5EE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },

  avgText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F6E56',
  },

  responseCount: {
    fontSize: 12,
    color: '#aaa',
  },

  divider: {
    borderTopWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.07)',
    marginBottom: 10,
  },

  distRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },

  scoreLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#aaa',
    width: 14,
    textAlign: 'right',
  },

  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#eee',
    borderRadius: 4,
    overflow: 'hidden',
  },

  barFill: {
    height: '100%',
    borderRadius: 4,
  },

  scoreCount: {
    fontSize: 12,
    color: '#aaa',
    width: 18,
    textAlign: 'right',
  },
});