import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';
import { Dropdown } from 'react-native-element-dropdown';
import BASE_URL from '../../API-URL/API';

export default function AddPeerEvaluatorScreen() {

  const [sessions, setSessions] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [modalTeachers, setModalTeachers] = useState([]);
  const [permanentTeachers, setPermanentTeachers] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [peerEvaluators, setPeerEvaluators] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalSelected, setModalSelected] = useState([]);
  const [search, setSearch] = useState('');
  const [modalSearch, setModalSearch] = useState('');

  /* ================= FETCH ================= */

  const getSessions = async () => {
    const res = await fetch(`${BASE_URL}/PeerEvaluator/Sessions`);
    const data = await res.json();
    setSessions(data.map(s => ({ label: s.name, value: s.id })));
  };

  const getTeachers = async () => {
    const res = await fetch(`${BASE_URL}/PeerEvaluator/GetNonPermenentTeachers`);
    const data = await res.json();
    setTeachers(data.map(t => ({ id: t.userID, name: t.name, department: t.department })));
  };

  const getAllTeachers = async () => {
    const res = await fetch(`${BASE_URL}/PeerEvaluator/Teachers`);
    const data = await res.json();
    setModalTeachers(data.map(t => ({
      id: t.userID,
      name: t.name,
      department: t.department,
      isPermanent: t.isPermanentEvaluator === 1,
    })));
  };

  const getPermanentTeachers = async () => {
    const res = await fetch(`${BASE_URL}/PeerEvaluator/PermanentEvaluators`);
    const data = await res.json();
    setPermanentTeachers(data.map(t => ({ id: t.userID, name: t.name, department: t.department })));
  };

  const getPeerEvaluators = async (sessionId) => {
    const res = await fetch(`${BASE_URL}/PeerEvaluator/BySession/${sessionId}`);
    const data = await res.json();
    setPeerEvaluators(data);
  };

  useEffect(() => {
    getSessions();
    getTeachers();
    getAllTeachers();
    getPermanentTeachers();
  }, []);

  /* ================= NORMAL ================= */

  const isPermanent = (id) => permanentTeachers.some(t => t.id === id);

  const toggleTeacher = (id) => {
    if (isPermanent(id)) return;
    if (selectedTeachers.includes(id)) {
      setSelectedTeachers(selectedTeachers.filter(t => t !== id));
    } else {
      setSelectedTeachers([...selectedTeachers, id]);
    }
  };

  const addPeerEvaluators = async () => {
    if (!selectedSession) return Alert.alert('Select Session');
    if (selectedTeachers.length === 0) return Alert.alert('Select Teachers');

    await fetch(`${BASE_URL}/PeerEvaluator/Add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: selectedSession, teacherIds: selectedTeachers }),
    });

    setSelectedTeachers([]);
    getPeerEvaluators(selectedSession);
  };

  /* ================= MODAL ================= */

  const toggleModalTeacher = (id) => {
    if (modalSelected.includes(id)) {
      setModalSelected(modalSelected.filter(t => t !== id));
    } else {
      setModalSelected([...modalSelected, id]);
    }
  };

  const savePermanentEvaluators = async () => {
    if (modalSelected.length === 0) return Alert.alert("Select at least one teacher");

    await fetch(`${BASE_URL}/PeerEvaluator/SetBulkPermanent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userIDs: modalSelected }),
    });

    setModalVisible(false);
    setModalSelected([]);
    await getTeachers();
    await getAllTeachers();
    await getPermanentTeachers();
  };

  /* ================= FILTERS ================= */

  const filteredTeachers = teachers.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.department.toLowerCase().includes(search.toLowerCase())
  );

  const filteredModalTeachers = modalTeachers.filter(t =>
    t.name.toLowerCase().includes(modalSearch.toLowerCase()) ||
    t.department.toLowerCase().includes(modalSearch.toLowerCase())
  );

  /* ================= UI ================= */

  return (
    <View style={{ flex: 1, backgroundColor: '#F0F4FF' }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerIconWrap}>
            <Icon name="supervisor-account" size={28} color="#fff" />
          </View>
          <View>
            <Text style={styles.heading}>Peer Evaluator Setup</Text>
            <Text style={styles.subheading}>Manage sessions & evaluators</Text>
          </View>
        </View>

        {/* MANAGE PERMANENT BUTTON */}
        <TouchableOpacity
          style={styles.permanentBtn}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.85}
        >
          <Icon name="star" size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.permanentBtnText}>Manage Permanent Evaluators</Text>
          <Icon name="chevron-right" size={20} color="rgba(255,255,255,0.7)" style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

        {/* SESSION DROPDOWN */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>
            <Icon name="event" size={14} color="#4361EE" />  Select Session
          </Text>
          <Dropdown
            style={styles.dropdown}
            data={sessions}
            labelField="label"
            valueField="value"
            placeholder="Choose a session..."
            placeholderStyle={styles.dropdownPlaceholder}
            selectedTextStyle={styles.dropdownSelected}
            value={selectedSession}
            onChange={item => {
              setSelectedSession(item.value);
              getPeerEvaluators(item.value);
            }}
          />
        </View>

        {/* SEARCH */}
        <View style={styles.searchWrap}>
          <Icon name="search" size={20} color="#9AABD8" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search teachers by name or department..."
            placeholderTextColor="#9AABD8"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
        </View>

        {/* NORMAL EVALUATORS */}
        <View style={styles.listSection}>
          <View style={styles.listHeader}>
            <View style={[styles.badge, { backgroundColor: '#EEF2FF' }]}>
              <Icon name="person" size={14} color="#4361EE" />
            </View>
            <Text style={styles.listTitle}>Normal Evaluators</Text>
            <View style={styles.countChip}>
              <Text style={styles.countChipText}>{filteredTeachers.length}</Text>
            </View>
          </View>

          {filteredTeachers.map(item => {
            const disabled = isPermanent(item.id);
            const selected = selectedTeachers.includes(item.id);

            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.card,
                  disabled && styles.cardDisabled,
                  selected && styles.cardSelected,
                ]}
                onPress={() => toggleTeacher(item.id)}
                activeOpacity={0.75}
              >
                <View style={[styles.avatarCircle, { backgroundColor: disabled ? '#E0E0E0' : selected ? '#4361EE' : '#EEF2FF' }]}>
                  <Text style={[styles.avatarText, { color: disabled ? '#9E9E9E' : selected ? '#fff' : '#4361EE' }]}>
                    {item.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.cardName, disabled && { color: '#9E9E9E' }]}>{item.name}</Text>
                  <Text style={styles.cardDept}>{item.department}</Text>
                  {disabled && (
                    <View style={styles.permanentTag}>
                      <Icon name="star" size={10} color="#F39C12" />
                      <Text style={styles.permanentTagText}>Permanent Evaluator</Text>
                    </View>
                  )}
                </View>
                {!disabled && selected && (
                  <View style={styles.checkCircle}>
                    <Icon name="check" size={14} color="#fff" />
                  </View>
                )}
                {!disabled && !selected && (
                  <View style={styles.uncheckCircle} />
                )}
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity style={styles.addBtn} onPress={addPeerEvaluators} activeOpacity={0.85}>
            <Icon name="person-add" size={18} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.addBtnText}>Add Evaluators</Text>
            {selectedTeachers.length > 0 && (
              <View style={styles.addBtnBadge}>
                <Text style={styles.addBtnBadgeText}>{selectedTeachers.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* PERMANENT EVALUATORS */}
        <View style={styles.listSection}>
          <View style={styles.listHeader}>
            <View style={[styles.badge, { backgroundColor: '#FFF8E7' }]}>
              <Icon name="star" size={14} color="#F39C12" />
            </View>
            <Text style={styles.listTitle}>Permanent Evaluators</Text>
            <View style={[styles.countChip, { backgroundColor: '#FFF3CD' }]}>
              <Text style={[styles.countChipText, { color: '#D68910' }]}>{permanentTeachers.length}</Text>
            </View>
          </View>

          {permanentTeachers.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="star-border" size={32} color="#D0D8F0" />
              <Text style={styles.emptyText}>No permanent evaluators yet</Text>
            </View>
          ) : (
            permanentTeachers.map(item => (
              <View key={item.id} style={[styles.card, styles.cardPermanent]}>
                <View style={[styles.avatarCircle, { backgroundColor: '#FFF3CD' }]}>
                  <Text style={[styles.avatarText, { color: '#D68910' }]}>
                    {item.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.cardName}>{item.name}</Text>
                  <Text style={styles.cardDept}>{item.department}</Text>
                </View>
                <View style={[styles.permanentTag, { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }]}>
                  <Icon name="star" size={11} color="#F39C12" />
                  <Text style={[styles.permanentTagText, { fontSize: 12 }]}>Permanent</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* SESSION EVALUATORS */}
        <View style={[styles.listSection, { marginBottom: 32 }]}>
          <View style={styles.listHeader}>
            <View style={[styles.badge, { backgroundColor: '#E8F8F2' }]}>
              <Icon name="group" size={14} color="#27AE60" />
            </View>
            <Text style={styles.listTitle}>Session Evaluators</Text>
            <View style={[styles.countChip, { backgroundColor: '#D5F5E3' }]}>
              <Text style={[styles.countChipText, { color: '#1E8449' }]}>{peerEvaluators.length}</Text>
            </View>
          </View>

          {peerEvaluators.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="group-add" size={32} color="#D0D8F0" />
              <Text style={styles.emptyText}>No evaluators for this session</Text>
            </View>
          ) : (
            peerEvaluators.map(item => (
              <View key={item.userID} style={styles.card}>
                <View style={[styles.avatarCircle, { backgroundColor: '#E8F8F2' }]}>
                  <Text style={[styles.avatarText, { color: '#27AE60' }]}>
                    {item.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.cardName}>{item.name}</Text>
                  <Text style={styles.cardDept}>{item.department}</Text>
                </View>
              </View>
            ))
          )}
        </View>

      </ScrollView>

      {/* ================= MODAL ================= */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={{ flex: 1, backgroundColor: '#F0F4FF' }}>

          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalBackBtn}>
              <Icon name="arrow-back" size={22} color="#4361EE" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalTitle}>Permanent Evaluators</Text>
              <Text style={styles.modalSubtitle}>Select teachers to mark as permanent</Text>
            </View>
          </View>

          <ScrollView style={{ padding: 16 }} showsVerticalScrollIndicator={false}>

            {/* Modal Search */}
            <View style={styles.searchWrap}>
              <Icon name="search" size={20} color="#9AABD8" style={{ marginRight: 8 }} />
              <TextInput
                placeholder="Search teachers..."
                placeholderTextColor="#9AABD8"
                value={modalSearch}
                onChangeText={setModalSearch}
                style={styles.searchInput}
              />
            </View>

            {/* Modal List */}
            <View style={styles.listSection}>
              {filteredModalTeachers.map(item => {
                const selected = modalSelected.includes(item.id);

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.card,
                      item.isPermanent && styles.cardAlreadyPermanent,
                      selected && styles.cardSelected,
                    ]}
                    onPress={() => toggleModalTeacher(item.id)}
                    activeOpacity={0.75}
                  >
                    <View style={[styles.avatarCircle, {
                      backgroundColor: item.isPermanent ? '#FFF3CD' : selected ? '#4361EE' : '#EEF2FF'
                    }]}>
                      <Text style={[styles.avatarText, {
                        color: item.isPermanent ? '#D68910' : selected ? '#fff' : '#4361EE'
                      }]}>
                        {item.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.cardName}>{item.name}</Text>
                      <Text style={styles.cardDept}>{item.department}</Text>
                      {item.isPermanent && (
                        <View style={styles.permanentTag}>
                          <Icon name="star" size={10} color="#F39C12" />
                          <Text style={styles.permanentTagText}>Already Permanent</Text>
                        </View>
                      )}
                    </View>
                    {selected ? (
                      <View style={styles.checkCircle}>
                        <Icon name="check" size={14} color="#fff" />
                      </View>
                    ) : (
                      <View style={styles.uncheckCircle} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Modal Actions */}
            <TouchableOpacity style={styles.addBtn} onPress={savePermanentEvaluators} activeOpacity={0.85}>
              <Icon name="star" size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.addBtnText}>Save Permanent</Text>
              {modalSelected.length > 0 && (
                <View style={styles.addBtnBadge}>
                  <Text style={styles.addBtnBadgeText}>{modalSelected.length}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.addBtn, styles.cancelBtn]}
              onPress={() => setModalVisible(false)}
              activeOpacity={0.85}
            >
              <Icon name="close" size={18} color="#4361EE" style={{ marginRight: 8 }} />
              <Text style={[styles.addBtnText, { color: '#4361EE' }]}>Cancel</Text>
            </TouchableOpacity>

          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 16,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  headerIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#4361EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    shadowColor: '#4361EE',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1F3C',
    letterSpacing: -0.5,
  },
  subheading: {
    fontSize: 13,
    color: '#7B8DB0',
    marginTop: 2,
  },

  /* Permanent Button */
  permanentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F39C12',
    padding: 15,
    borderRadius: 14,
    marginBottom: 18,
    shadowColor: '#F39C12',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  permanentBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },

  /* Section Card */
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#4361EE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4361EE',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },

  /* Dropdown */
  dropdown: {
    backgroundColor: '#F5F7FF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderWidth: 1.5,
    borderColor: '#E0E7FF',
  },
  dropdownPlaceholder: {
    color: '#9AABD8',
    fontSize: 14,
  },
  dropdownSelected: {
    color: '#1A1F3C',
    fontSize: 14,
    fontWeight: '600',
  },

  /* Search */
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#E0E7FF',
    shadowColor: '#4361EE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1A1F3C',
    padding: 0,
  },

  /* List Section */
  listSection: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#4361EE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  listTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1F3C',
    flex: 1,
  },
  countChip: {
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  countChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4361EE',
  },

  /* Card */
  card: {
    backgroundColor: '#F8FAFF',
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#EEF2FF',
  },
  cardSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4361EE',
  },
  cardDisabled: {
    backgroundColor: '#FAFAFA',
    borderColor: '#EBEBEB',
  },
  cardPermanent: {
    borderColor: '#FAD89B',
    backgroundColor: '#FFFBF0',
  },
  cardAlreadyPermanent: {
    backgroundColor: '#FFFBF0',
    borderColor: '#FAD89B',
  },

  /* Avatar */
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
  },

  /* Card Text */
  cardName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1F3C',
    marginBottom: 2,
  },
  cardDept: {
    fontSize: 12,
    color: '#7B8DB0',
  },

  /* Permanent Tag */
  permanentTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 3,
  },
  permanentTagText: {
    fontSize: 11,
    color: '#F39C12',
    fontWeight: '600',
    marginLeft: 3,
  },

  /* Check / Uncheck */
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#4361EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uncheckCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#C5CFF0',
    backgroundColor: 'transparent',
  },

  /* Add Button */
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4361EE',
    padding: 16,
    borderRadius: 14,
    marginTop: 10,
    shadowColor: '#4361EE',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 7,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  addBtnBadge: {
    marginLeft: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  addBtnBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  cancelBtn: {
    backgroundColor: '#EEF2FF',
    shadowColor: 'transparent',
    elevation: 0,
    marginTop: 10,
    marginBottom: 32,
  },

  /* Empty State */
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    color: '#B0BDD8',
    fontSize: 14,
    marginTop: 8,
    fontWeight: '500',
  },

  /* Modal Header */
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 56,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2FF',
    shadowColor: '#4361EE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  modalBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1F3C',
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#7B8DB0',
    marginTop: 2,
  },
});