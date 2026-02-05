import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Dropdown } from 'react-native-element-dropdown';
import BASE_URL from '../../API-URL/API';

export default function AddPeerEvaluatorScreen() {

  const [sessions, setSessions] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [peerEvaluators, setPeerEvaluators] = useState([]);
  const [search, setSearch] = useState("");

  /* ------------------ SEARCH FILTER ------------------ */

  const filteredTeachers = teachers.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.department.toLowerCase().includes(search.toLowerCase())
  );

  /* ------------------ API CALLS ------------------ */

  const getPeerEvaluators = async (sessionId) => {
    try {
      setPeerEvaluators([]);
      const res = await fetch(`${BASE_URL}/PeerEvaluator/BySession/${sessionId}`);
      if (!res.ok) return;
      setPeerEvaluators(await res.json());
    } catch {
      Alert.alert('Error', 'Failed to load peer evaluators');
    }
  };

  const getSessions = async () => {
    try {
      const res = await fetch(`${BASE_URL}/PeerEvaluator/Sessions`);
      const data = await res.json();
      setSessions(data.map(s => ({ label: s.name, value: s.id })));
    } catch {
      Alert.alert('Error', 'Failed to load sessions');
    }
  };

  const getTeachers = async () => {
    try {
      const res = await fetch(`${BASE_URL}/PeerEvaluator/Teachers`);
      const data = await res.json();
      setTeachers(data.map(t => ({
        id: t.userID,
        name: t.name,
        department: t.department,
      })));
    } catch {
      Alert.alert('Error', 'Failed to load teachers');
    }
  };

  useEffect(() => {
    getSessions();
    getTeachers();
  }, []);

  /* ------------------ LOGIC ------------------ */

  const toggleSelectTeacher = (id) => {
    if (selectedTeachers.includes(id)) {
      setSelectedTeachers(selectedTeachers.filter(t => t !== id));
    } else {
      setSelectedTeachers([...selectedTeachers, id]);
    }
  };

  const addPeerEvaluators = async () => {
    if (!selectedSession) return Alert.alert('Validation', 'Select session');
    if (selectedTeachers.length === 0) return Alert.alert('Validation', 'Select teachers');

    try {
      setLoading(true);

      const res = await fetch(`${BASE_URL}/PeerEvaluator/Add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: selectedSession,
          teacherIds: selectedTeachers,
        }),
      });

      Alert.alert('Success', await res.text());
      setSelectedTeachers([]);
      getPeerEvaluators(selectedSession);

    } catch {
      Alert.alert('Error', 'Failed to add peer evaluators');
    } finally {
      setLoading(false);
    }
  };

  /* ------------------ RENDERERS ------------------ */

  const renderTeacher = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.teacherCard,
        selectedTeachers.includes(item.id) && styles.teacherCardSelected,
      ]}
      onPress={() => toggleSelectTeacher(item.id)}
    >
      <View>
        <Text style={styles.teacherName}>{item.name}</Text>
        <Text style={styles.teacherSubject}>{item.department}</Text>
      </View>

      {selectedTeachers.includes(item.id) && (
        <Icon name="check-circle" size={24} color="#4CAF50" />
      )}
    </TouchableOpacity>
  );

  const ShowPeerEvaluators = ({ item }) => (
    <View style={styles.assignedCard}>
      <Icon name="person" size={26} color="#2e7d32" />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.assignedName}>{item.name}</Text>
        <Text style={styles.assignedDept}>{item.department}</Text>
      </View>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Assigned</Text>
      </View>
    </View>
  );

  /* ------------------ UI ------------------ */

  return (
    <ScrollView style={styles.container}>

      <Text style={styles.heading}>Peer Evaluator Setup</Text>

      <Dropdown
        style={styles.dropdown}
        data={sessions}
        labelField="label"
        valueField="value"
        placeholder="Select Session"
        value={selectedSession}
        onChange={item => {
          setSelectedSession(item.value);
          getPeerEvaluators(item.value);
        }}
        renderLeftIcon={() => (
          <Icon name="calendar-today" size={20} color="#4CAF50" />
        )}
      />

      {/* SEARCH BAR */}

      <View style={styles.searchBox}>
        <Icon name="search" size={20} color="#777" />
        <TextInput
          placeholder="Search teacher or department"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>

      <Text style={styles.sectionTitle}>
        Select teachers to assign
      </Text>

      <FlatList
        data={filteredTeachers}
        renderItem={renderTeacher}
        keyExtractor={item => item.id.toString()}
        scrollEnabled={false}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={addPeerEvaluators}
        disabled={loading}
      >
        <Text style={styles.addButtonText}>
          {loading ? 'Please wait...' :
            `Add ${selectedTeachers.length} Peer Evaluators`}
        </Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Assigned Peer Evaluators</Text>

      <FlatList
        data={peerEvaluators}
        keyExtractor={item => item.userID.toString()}
        renderItem={ShowPeerEvaluators}
        scrollEnabled={false}
      />

    </ScrollView>
  );
}

/* ------------------ STYLES ------------------ */

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f4f6f8',
  },

  heading: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 18,
    color: '#0d47a1',
  },

  dropdown: {
    height: 58,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    marginBottom: 16,

    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 14,

    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },

  searchInput: {
    flex: 1,
    padding: 12,
    marginLeft: 6,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginVertical: 12,
    color: '#333',
  },

  teacherCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,

    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },

  teacherCardSelected: {
    borderWidth: 2,
    borderColor: '#4CAF50',
    backgroundColor: '#e8f5e9',
  },

  teacherName: {
    fontSize: 16,
    fontWeight: '700',
  },

  teacherSubject: {
    fontSize: 13,
    color: '#666',
    marginTop: 3,
  },

  addButton: {
    backgroundColor: '#0d47a1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 20,

    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },

  addButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },

  assignedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,

    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },

  assignedName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1b5e20',
  },

  assignedDept: {
    fontSize: 13,
    color: '#555',
  },

  badge: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },

  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2e7d32',
  },

});
