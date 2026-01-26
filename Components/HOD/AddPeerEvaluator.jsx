import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
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
  const [PeerEvaluator,setPeerEvaluators]=useState([]);


  const getPeerEvaluators=async ()=>
  {
    try{
        const res=await fetch(`${BASE_URL}/PeerEvaluators/BySession?${sessions}`)
        const data=await res.json();
        if(res.status==200)
        {
          setPeerEvaluators(data);
        }
        
      }
        catch (error) {
      console.log(error);
      Alert.alert('Error', 'Failed to load sessions');
    }

    
  }

  const getSessions = async () => {
    try {
      const res = await fetch(`${BASE_URL}/PeerEvaluator/Sessions`);
      const data = await res.json();

      const formatted = data.map(s => ({
        label: s.name,
        value: s.id,
      }));

      setSessions(formatted);
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Failed to load sessions');
    }
  };

  
  const getTeachers = async () => {
    try {
      const res = await fetch(`${BASE_URL}/PeerEvaluator/Teachers`);
      const data = await res.json();

      const formatted = data.map(t => ({
        id: t.userID,
        name: t.name,
        department: t.department,
      }));

      setTeachers(formatted);
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Failed to load teachers');
    }
  };

  useEffect(() => {
    getSessions();
    getTeachers();
  }, []);


  const toggleSelectTeacher = (id) => {
    if (selectedTeachers.includes(id)) {
      setSelectedTeachers(selectedTeachers.filter(t => t !== id));
    } else {
      setSelectedTeachers([...selectedTeachers, id]);
    }
  };

  const addPeerEvaluators = async () => {
    if (!selectedSession) {
      Alert.alert('Validation', 'Please select a session');
      return;
    }

    if (selectedTeachers.length === 0) {
      Alert.alert('Validation', 'Please select at least one teacher');
      return;
    }

    const payload = {
      sessionId: selectedSession,
      teacherIds: selectedTeachers,
    };

    try {
      setLoading(true);

      const res = await fetch(`${BASE_URL}/PeerEvaluator/Add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const msg = await res.text();

      Alert.alert('Success', msg);
      setSelectedTeachers([]);
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Failed to add peer evaluators');
    } finally {
      setLoading(false);
    }
  };

  
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
        <Icon name="check-circle" size={22} color="#4CAF50" />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Add Peer Evaluator</Text>

      
      <Dropdown
        style={styles.dropdown}
        data={sessions}
        labelField="label"
        valueField="value"
        placeholder="Select Session"
        value={selectedSession}
        onChange={item => setSelectedSession(item.value)}
        renderLeftIcon={() => (
          <Icon name="calendar-today" size={20} color="#4CAF50" />
        )}
      />

      <Text style={styles.sectionTitle}>
        Select teachers to assign as peer evaluators
      </Text>

      <FlatList
        data={teachers}
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
          {loading
            ? 'Please wait...'
            : `Add ${selectedTeachers.length} Teachers as Peer Evaluators`}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#fff' },
  heading: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },

  dropdown: {
    height: 55,
    borderColor: '#4CAF50',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: '#F9F9F9',
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },

  teacherCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#dcdcdc',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  teacherCardSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#e6f4ea',
  },
  teacherName: { fontSize: 16, fontWeight: '600' },
  teacherSubject: { fontSize: 14, color: '#555' },

  addButton: {
    backgroundColor: '#0d47a1',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20,
  },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
});
