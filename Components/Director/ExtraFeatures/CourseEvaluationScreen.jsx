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
import Icon from 'react-native-vector-icons/MaterialIcons';
import BASE_URL from "../../../API-URL/API";

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  bg:          '#f0fdf4',
  surface:     '#ffffff',
  surfaceAlt:  '#f6fef9',
  border:      '#d1fae5',
  borderMid:   '#a7f3d0',
  green:       '#16a34a',
  greenLight:  '#dcfce7',
  greenDeep:   '#166534',
  purple:      '#7c3aed',
  purpleLight: '#ede9fe',
  textDark:    '#052e16',
  textMid:     '#166534',
  textLight:   '#4b7c5e',
  textFaint:   '#9ca3af',
  white:       '#ffffff',
};

const EVAL_OPTIONS = [
  { label: 'Both (Student + Peer)', value: 'both',    icon: 'people'  },
  { label: 'Student Only',          value: 'student', icon: 'school'  },
  { label: 'Peer Only',             value: 'peer',    icon: 'person'  },
];

// ── Legend dot ────────────────────────────────────────────────────────────────
const LegendDot = ({ color, label }) => (
  <View style={s.legendItem}>
    <View style={[s.legendDot, { backgroundColor: color }]} />
    <Text style={s.legendText}>{label}</Text>
  </View>
);

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, color, bg }) => (
  <View style={[s.statCard, { backgroundColor: bg, borderColor: color + '33' }]}>
    <Text style={[s.statVal, { color }]}>{value}</Text>
    <Text style={s.statLabel}>{label}</Text>
  </View>
);

// ── Main Screen ───────────────────────────────────────────────────────────────
const CourseEvaluationScreen = ({ navigation }) => {
  const [sessions,         setSessions]         = useState([]);
  const [teachers,         setTeachers]         = useState([]);
  const [selectedSession,  setSelectedSession]  = useState(null);
  const [selectedTeacher,  setSelectedTeacher]  = useState(null);
  const [evalType,         setEvalType]         = useState('both');
  const [loading,          setLoading]          = useState(false);
  const [loadingTeachers,  setLoadingTeachers]  = useState(false);
  const [comparisonData,   setComparisonData]   = useState([]);
  const [hasData,          setHasData]          = useState(false);

  useEffect(() => { fetchSessions(); }, []);

  const fetchSessions = async () => {
    try {
      const res  = await fetch(`${BASE_URL}/ExtraFeatures/GetSessions`);
      const data = await res.json();
      setSessions(data.map(s => ({ label: s.name, value: s.id })));
    } catch (e) { console.log('SESSION ERROR:', e); }
  };

  const fetchTeachers = async (sessionId) => {
    setLoadingTeachers(true);
    setTeachers([]);
    setSelectedTeacher(null);
    try {
      const res  = await fetch(`${BASE_URL}/ExtraFeatures/GetTeachersBySession/${sessionId}`);
      const data = await res.json();
      setTeachers(data.map(t => ({ label: t.Name, value: t.UserID })));
    } catch (e) { console.log('TEACHERS ERROR:', e); }
    finally { setLoadingTeachers(false); }
  };

  const handleView = async () => {
    if (!selectedSession || !selectedTeacher) {
      Alert.alert('Missing Fields', 'Please select both session and teacher.');
      return;
    }
    setLoading(true);
    setHasData(false);
    try {
      const res  = await fetch(
        `${BASE_URL}/ExtraFeatures/GetCourseComparison/${selectedTeacher}/${selectedSession}?evaluationType=${evalType}`
      );
      const data = await res.json();
      setComparisonData(data);
      setHasData(true);
    } catch (e) { console.log('VIEW ERROR:', e); }
    finally { setLoading(false); }
  };

  const handleShowDetail = () => {
    navigation.navigate('QuestionAnalysis', {
      teacherId: selectedTeacher,
      sessionId: selectedSession,
      evalType,
    });
  };

  const buildChartData = () => {
    const bars = [];
    comparisonData.forEach((item, idx) => {
      if (evalType === 'student' || evalType === 'both') {
        bars.push({
          value: item.StudentAverage,
          label: item.CourseCode,
          frontColor: C.green,
          spacing: evalType === 'both' ? 4 : 18,
          topLabelComponent: () => (
            <Text style={{ color: C.green, fontSize: 9, fontWeight: '700', marginBottom: 2 }}>
              {item.StudentAverage?.toFixed(1)}
            </Text>
          ),
        });
      }
      if (evalType === 'peer' || evalType === 'both') {
        bars.push({
          value: item.PeerAverage,
          label: evalType === 'both' ? '' : item.CourseCode,
          frontColor: C.purple,
          spacing: 18,
          topLabelComponent: () => (
            <Text style={{ color: C.purple, fontSize: 9, fontWeight: '700', marginBottom: 2 }}>
              {item.PeerAverage?.toFixed(1)}
            </Text>
          ),
        });
      }
    });
    return bars;
  };

  const avgStudent = comparisonData.length
    ? (comparisonData.reduce((s, d) => s + (d.StudentAverage ?? 0), 0) / comparisonData.length).toFixed(2)
    : null;
  const avgPeer = comparisonData.length
    ? (comparisonData.reduce((s, d) => s + (d.PeerAverage ?? 0), 0) / comparisonData.length).toFixed(2)
    : null;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar backgroundColor={C.green} barStyle="light-content" />

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Course Evaluation</Text>
          <Text style={s.headerSub}>Compare student & peer ratings</Text>
        </View>
        <View style={s.headerIconBox}>
          <Icon name="bar-chart" size={22} color={C.white} />
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ── FILTER CARD ───────────────────────────────────────────────── */}
        <View style={s.card}>
          <View style={s.cardTitleRow}>
            <View style={s.cardDot} />
            <Text style={s.cardTitle}>CONFIGURE</Text>
          </View>

          {/* Session + Teacher row */}
          <View style={s.filterRow}>
            <View style={s.dropdownWrap}>
              <Text style={s.dropLabel}>SESSION</Text>
              <Dropdown
                style={s.dropdown}
                containerStyle={s.dropdownContainer}
                selectedTextStyle={s.dropSelected}
                placeholderStyle={s.dropPlaceholder}
                itemTextStyle={s.dropItem}
                activeColor={C.greenLight}
                data={sessions}
                labelField="label"
                valueField="value"
                placeholder="Select session"
                value={selectedSession}
                onChange={item => {
                  setSelectedSession(item.value);
                  fetchTeachers(item.value);
                  setHasData(false);
                }}
              />
            </View>

            <View style={s.dropdownWrap}>
              <Text style={s.dropLabel}>TEACHER</Text>
              {loadingTeachers ? (
                <View style={[s.dropdown, s.dropLoading]}>
                  <ActivityIndicator size="small" color={C.green} />
                  <Text style={s.dropLoadingText}>Loading…</Text>
                </View>
              ) : (
                <Dropdown
                  style={[s.dropdown, !selectedSession && s.dropDisabled]}
                  containerStyle={s.dropdownContainer}
                  selectedTextStyle={s.dropSelected}
                  placeholderStyle={s.dropPlaceholder}
                  itemTextStyle={s.dropItem}
                  activeColor={C.greenLight}
                  data={teachers}
                  labelField="label"
                  valueField="value"
                  placeholder="Select teacher"
                  value={selectedTeacher}
                  disable={!selectedSession}
                  onChange={item => {
                    setSelectedTeacher(item.value);
                    setHasData(false);
                  }}
                />
              )}
            </View>
          </View>

          {/* Eval type chips */}
          <Text style={s.dropLabel}>EVALUATION TYPE</Text>
          <View style={s.evalChipRow}>
            {EVAL_OPTIONS.map(opt => {
              const active = evalType === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[s.evalChip, active && s.evalChipActive]}
                  onPress={() => { setEvalType(opt.value); setHasData(false); }}
                  activeOpacity={0.8}
                >
                  <Icon name={opt.icon} size={13} color={active ? C.white : C.textLight} />
                  <Text style={[s.evalChipText, active && s.evalChipTextActive]}>
                    {opt.label.split('(')[0].trim()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* View button */}
          <TouchableOpacity
            style={[s.viewBtn, (!selectedSession || !selectedTeacher) && s.viewBtnDisabled]}
            onPress={handleView}
            disabled={!selectedSession || !selectedTeacher}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color={C.white} size="small" />
              : <>
                  <Icon name="visibility" size={16} color={C.white} />
                  <Text style={s.viewBtnText}>View Results</Text>
                </>
            }
          </TouchableOpacity>
        </View>

        {/* ── RESULTS ───────────────────────────────────────────────────── */}
        {hasData && (
          <>
            {/* Summary stats */}
            <View style={s.statsRow}>
              <StatCard
                label="Courses"
                value={comparisonData.length}
                color={C.greenDeep}
                bg={C.greenLight}
              />
              {(evalType === 'student' || evalType === 'both') && (
                <StatCard
                  label="Avg Student"
                  value={avgStudent}
                  color={C.green}
                  bg={C.greenLight}
                />
              )}
              {(evalType === 'peer' || evalType === 'both') && (
                <StatCard
                  label="Avg Peer"
                  value={avgPeer}
                  color={C.purple}
                  bg={C.purpleLight}
                />
              )}
            </View>

            {/* Chart card */}
            <View style={s.card}>
              <View style={s.cardTitleRow}>
                <View style={s.cardDot} />
                <Text style={s.cardTitle}>PERFORMANCE COMPARISON</Text>
              </View>

              {/* Legend */}
              <View style={s.legendRow}>
                {(evalType === 'student' || evalType === 'both') && (
                  <LegendDot color={C.green}  label="Student" />
                )}
                {(evalType === 'peer' || evalType === 'both') && (
                  <LegendDot color={C.purple} label="Peer" />
                )}
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <BarChart
                  data={buildChartData()}
                  barWidth={28}
                  spacing={10}
                  maxValue={10}
                  noOfSections={5}
                  barBorderRadius={5}
                  yAxisThickness={0}
                  xAxisThickness={1}
                  xAxisColor={C.border}
                  rulesColor={C.border}
                  rulesType="dashed"
                  yAxisTextStyle={{ color: C.textFaint, fontSize: 10 }}
                  xAxisLabelTextStyle={{ color: C.textMid, fontSize: 10, fontWeight: '600' }}
                  isAnimated
                />
              </ScrollView>

              {/* Course score rows */}
              <View style={s.courseList}>
                {comparisonData.map((item, i) => (
                  <View key={i} style={s.courseRow}>
                    <View style={s.courseCodeTag}>
                      <Text style={s.courseCodeText}>{item.CourseCode}</Text>
                    </View>
                    <View style={s.courseScores}>
                      {(evalType === 'student' || evalType === 'both') && (
                        <View style={s.scorePill}>
                          <View style={[s.scoreDot, { backgroundColor: C.green }]} />
                          <Text style={[s.scorePillText, { color: C.green }]}>
                            {item.StudentAverage?.toFixed(2)}
                          </Text>
                        </View>
                      )}
                      {(evalType === 'peer' || evalType === 'both') && (
                        <View style={s.scorePill}>
                          <View style={[s.scoreDot, { backgroundColor: C.purple }]} />
                          <Text style={[s.scorePillText, { color: C.purple }]}>
                            {item.PeerAverage?.toFixed(2)}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>

              {/* Detail button */}
              <TouchableOpacity style={s.detailBtn} onPress={handleShowDetail} activeOpacity={0.85}>
                <Text style={s.detailBtnText}>Show Question Detail</Text>
                <Icon name="chevron-right" size={16} color={C.white} />
              </TouchableOpacity>
            </View>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default CourseEvaluationScreen;

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scrollContent: { padding: 14 },

  // HEADER
  header: {
    backgroundColor: C.green,
    paddingHorizontal: 18,
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: C.white,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  headerSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 2,
  },
  headerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // CARD
  card: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.green,
    marginRight: 8,
  },
  cardTitle: {
    color: C.textMid,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },

  // FILTER
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  dropdownWrap: { flex: 1 },
  dropLabel: {
    color: C.textFaint,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 5,
  },
  dropdown: {
    height: 46,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: C.surfaceAlt,
  },
  dropDisabled: { opacity: 0.4 },
  dropLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  dropLoadingText: { color: C.textFaint, fontSize: 13 },
  dropdownContainer: {
    backgroundColor: C.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  dropSelected:    { color: C.textDark,  fontSize: 13, fontWeight: '600' },
  dropPlaceholder: { color: C.textFaint, fontSize: 13 },
  dropItem:        { color: C.textDark,  fontSize: 13 },

  // EVAL CHIPS
  evalChipRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  evalChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
  evalChipActive: {
    backgroundColor: C.green,
    borderColor: C.green,
    shadowColor: C.green,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  evalChipText:       { color: C.textLight, fontSize: 10, fontWeight: '700' },
  evalChipTextActive: { color: C.white,     fontSize: 10, fontWeight: '700' },

  // VIEW BUTTON
  viewBtn: {
    backgroundColor: C.green,
    borderRadius: 10,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: C.green,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  viewBtnDisabled: {
    backgroundColor: '#d1d5db',
    shadowOpacity: 0,
    elevation: 0,
  },
  viewBtnText: {
    color: C.white,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  // STATS ROW
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  statLabel: {
    color: C.textFaint,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },

  // LEGEND
  legendRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    color: C.textLight,
    fontSize: 11,
    fontWeight: '600',
  },

  // COURSE LIST
  courseList: {
    marginTop: 14,
    gap: 8,
  },
  courseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  courseCodeTag: {
    backgroundColor: C.greenLight,
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: C.borderMid,
    minWidth: 72,
    alignItems: 'center',
  },
  courseCodeText: {
    color: C.greenDeep,
    fontSize: 11,
    fontWeight: '800',
  },
  courseScores: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  scorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: C.surfaceAlt,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: C.border,
  },
  scoreDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  scorePillText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // DETAIL BUTTON
  detailBtn: {
    backgroundColor: C.green,
    borderRadius: 10,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 5,
    shadowColor: C.green,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  detailBtnText: {
    color: C.white,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});