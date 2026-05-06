import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, KeyboardAvoidingView,
  Platform, StatusBar, FlatList
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import BASE_URL from "../../API-URL/API";

const AddKPI = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [employeeTypes, setEmployeeTypes] = useState([]);
  const [selectedEmpType, setSelectedEmpType] = useState(null);
  const [kpiList, setKpiList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openKpiId, setOpenKpiId] = useState(null);

  const [kpiName, setKpiName] = useState("");
  const [kpiWeight, setKpiWeight] = useState("");
  const [showSubSection, setShowSubSection] = useState(false);
  const [tempSubKpis, setTempSubKpis] = useState([]);
  const [subName, setSubName] = useState("");
  const [subWeight, setSubWeight] = useState("");

  const [addingSubTo, setAddingSubTo] = useState(null);
  const [dynamicSub, setDynamicSub] = useState({ name: "", weight: "" });

  const [editingKpiId, setEditingKpiId] = useState(null);
  const [editKpiName, setEditKpiName] = useState("");
  const [editKpiWeight, setEditKpiWeight] = useState("");

  const [editingSubId, setEditingSubId] = useState(null);
  const [editSubName, setEditSubName] = useState("");
  const [editSubWeight, setEditSubWeight] = useState("");

  const fetchDropdowns = async () => {
    try {
      const [resSess, resType] = await Promise.all([
        fetch(`${BASE_URL}/Kpi/sessions`),
        fetch(`${BASE_URL}/Kpi/emptypes`),
      ]);
      const sData = await resSess.json();
      const tData = await resType.json();
      setSessions(sData.map(s => ({ label: s.name || s.Name, value: s.id || s.Id })));
      setEmployeeTypes(tData.map(t => ({ label: t.type || t.Type, value: t.id || t.Id })));
    } catch (e) {
      Alert.alert("Error", "Failed to load initial data");
    }
  };

  const refreshKpis = useCallback(async () => {
    if (!selectedSession || !selectedEmpType) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/Kpi/view-weights/${selectedSession}/${selectedEmpType}`);
      const data = await res.json();
      setKpiList(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, [selectedSession, selectedEmpType]);

  useEffect(() => { fetchDropdowns(); }, []);
  useEffect(() => {
    if (selectedSession && selectedEmpType) refreshKpis();
  }, [selectedSession, selectedEmpType]);

  const handleSaveMainKpi = async () => {
    if (!selectedSession || !selectedEmpType || !kpiName || !kpiWeight) {
      Alert.alert("Missing Info", "Please provide all details.");
      return;
    }
    const payload = {
      SessionId: parseInt(selectedSession),
      EmployeeTypeId: parseInt(selectedEmpType),
      KPIName: kpiName,
      RequestedKPIWeight: parseInt(kpiWeight),
      SubKPIs: tempSubKpis.map(s => ({ Name: s.name, Weight: parseInt(s.weight) })),
    };
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/Kpi/create-with-weight`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        Alert.alert("Success", "KPI Architecture Created");
        setKpiName(""); setKpiWeight(""); setTempSubKpis([]); setShowSubSection(false);
        refreshKpis();
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteKpi = (id) => {
    Alert.alert("Delete KPI?", "This will remove the KPI and balance weights.", [
      { text: "Cancel" },
      {
        text: "Confirm Delete", style: "destructive",
        onPress: async () => {
          const res = await fetch(
            `${BASE_URL}/Kpi/delete-main-kpi/${selectedSession}/${id}`,
            { method: "DELETE" }
          );
          if (res.ok) refreshKpis();
        },
      },
    ]);
  };

  const deleteSubKpi = (subId) => {
    Alert.alert("Delete Sub-KPI?", "Weights will be redistributed automatically.", [
      { text: "Cancel" },
      {
        text: "Confirm Delete", style: "destructive",
        onPress: async () => {
          const res = await fetch(
            `${BASE_URL}/Kpi/delete-subkpi/${selectedSession}/${subId}`,
            { method: "DELETE" }
          );
          if (res.ok) refreshKpis();
        },
      },
    ]);
  };

  const addDynamicSubKpi = async (kpiId) => {
    if (!dynamicSub.name || !dynamicSub.weight) return;
    const payload = {
      SessionId: parseInt(selectedSession),
      KpiId: parseInt(kpiId),
      Name: dynamicSub.name,
      NewWeight: parseInt(dynamicSub.weight),
    };
    const res = await fetch(`${BASE_URL}/Kpi/add-subkpi-dynamic`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setAddingSubTo(null);
      setDynamicSub({ name: "", weight: "" });
      refreshKpis();
    }
  };

  const openEditKpi = (item) => {
    if (editingKpiId === item.kpiId) { setEditingKpiId(null); return; }
    setEditingKpiId(item.kpiId);
    setEditKpiName(item.kpiName);
    setEditKpiWeight(item.totalKpiWeight.toString());
    setEditingSubId(null);
  };

  const saveKpiName = async (kpiId) => {
    if (!editKpiName.trim()) { Alert.alert("Error", "KPI name cannot be empty."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/Kpi/edit-kpi-name/${kpiId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Name: editKpiName.trim() }),
      });
      if (res.ok) refreshKpis();
      else Alert.alert("Error", "Failed to update KPI name.");
    } catch (e) { Alert.alert("Error", e.message); }
    finally { setLoading(false); }
  };

  const saveKpiWeight = async (kpiId) => {
    const w = parseInt(editKpiWeight);
    if (isNaN(w) || w <= 0 || w >= 100) { Alert.alert("Error", "Weight must be between 1 and 99."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/Kpi/edit-kpi-weight/${selectedSession}/${kpiId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Weight: w }),
      });
      if (res.ok) { setEditingKpiId(null); refreshKpis(); }
      else Alert.alert("Error", "Failed to update KPI weight.");
    } catch (e) { Alert.alert("Error", e.message); }
    finally { setLoading(false); }
  };

  const openEditSub = (sk) => {
    if (editingSubId === sk.subKpiId) { setEditingSubId(null); return; }
    setEditingSubId(sk.subKpiId);
    setEditSubName(sk.subKpiName);
    setEditSubWeight(sk.weight.toString());
  };

  const saveSubKpiName = async (subId) => {
    if (!editSubName.trim()) { Alert.alert("Error", "Name cannot be empty."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/Kpi/edit-subkpi-name/${subId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Name: editSubName.trim() }),
      });
      if (res.ok) refreshKpis();
      else Alert.alert("Error", "Failed to update Sub-KPI name.");
    } catch (e) { Alert.alert("Error", e.message); }
    finally { setLoading(false); }
  };

  const saveSubKpiWeight = async (subId) => {
    const w = parseInt(editSubWeight);
    if (isNaN(w) || w <= 0) { Alert.alert("Error", "Weight must be greater than 0."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/Kpi/edit-subkpi-weight/${selectedSession}/${subId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Weight: w }),
      });
      if (res.ok) { setEditingSubId(null); refreshKpis(); }
      else Alert.alert("Error", "Failed to update Sub-KPI weight.");
    } catch (e) { Alert.alert("Error", e.message); }
    finally { setLoading(false); }
  };

  // ── Render Sub-KPI row ─────────────────────────────────────────────────────
  const renderSubItem = ({ item: sk }) => (
    <View>
      <View style={ss.subItem}>
        <Text style={ss.subName}>{sk.subKpiName}</Text>
        <View style={ss.subRowRight}>
          <View style={ss.subWeightBadge}>
            <Text style={ss.subWeightValue}>{sk.weight}%</Text>
          </View>
          <TouchableOpacity onPress={() => openEditSub(sk)}>
            <Icon name="pencil-outline" size={18} color="#059669" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => deleteSubKpi(sk.subKpiId)}>
            <Icon name="trash-can-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      {editingSubId === sk.subKpiId && (
        <View style={ss.editSubBox}>
          <Text style={ss.editBoxTitle}>Edit Sub-KPI</Text>

          <View style={ss.editRow}>
            <TextInput
              style={[ss.editInput, { flex: 1 }]}
              value={editSubName}
              onChangeText={setEditSubName}
              placeholder="Sub-KPI name"
            />
            <TouchableOpacity style={ss.saveSmallBtn} onPress={() => saveSubKpiName(sk.subKpiId)}>
              <Icon name="check" size={16} color="white" />
            </TouchableOpacity>
          </View>

          <View style={[ss.editRow, { marginTop: 8 }]}>
            <TextInput
              style={[ss.editInput, { width: 70 }]}
              value={editSubWeight}
              onChangeText={setEditSubWeight}
              keyboardType="numeric"
              placeholder="%"
            />
            <Text style={ss.pctLabel}>%</Text>
            <TouchableOpacity style={ss.saveSmallBtn} onPress={() => saveSubKpiWeight(sk.subKpiId)}>
              <Icon name="check" size={16} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={ss.cancelSmallBtn} onPress={() => setEditingSubId(null)}>
              <Icon name="close" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>
          <Text style={ss.editHint}>Sibling sub-KPI weights will auto-adjust</Text>
        </View>
      )}
    </View>
  );

  // ── Render KPI card ────────────────────────────────────────────────────────
  const renderKpiItem = ({ item }) => (
    // FIX: outer wrapper must be kpiCard, not kpiHeader
    <View style={ss.kpiCard}>

      {/* ── Two-row header ── */}
      <View style={ss.kpiHeader}>

        {/* Row 1: icon  +  name  +  weight pill */}
        <View style={ss.kpiInfo}>
          <View style={ss.kpiIconBox}>
            <Icon name="chart-box-outline" size={24} color="#059669" />
          </View>
          <Text style={ss.kpiNameText} numberOfLines={2}>{item.kpiName}</Text>
          <View style={ss.kpiWeightPill}>
            <Text style={ss.kpiWeightText}>{item.totalKpiWeight}%</Text>
          </View>
        </View>

        {/* Row 2: labelled action buttons  +  chevron */}
        <View style={ss.actionIcons}>
          <TouchableOpacity style={ss.actionBtn} onPress={() => openEditKpi(item)}>
            <Icon name="pencil-outline" size={14} color="#059669" />
            <Text style={ss.actionBtnText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={ss.actionBtn}
            onPress={() => setAddingSubTo(prev => (prev === item.kpiId ? null : item.kpiId))}
          >
            <Icon name="plus" size={14} color="#059669" />
            <Text style={ss.actionBtnText}>Add sub</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[ss.actionBtn, ss.actionBtnDanger]}
            onPress={() => deleteKpi(item.kpiId)}
          >
            <Icon name="trash-can-outline" size={14} color="#EF4444" />
            <Text style={[ss.actionBtnText, { color: "#EF4444" }]}>Delete</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ marginLeft: "auto" }}
            onPress={() => setOpenKpiId(prev => (prev === item.kpiId ? null : item.kpiId))}
          >
            <Icon
              name={openKpiId === item.kpiId ? "chevron-up" : "chevron-down"}
              size={22}
              color="#64748B"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Inline KPI Edit Panel ── */}
      {editingKpiId === item.kpiId && (
        <View style={ss.editKpiBox}>
          <Text style={ss.editBoxTitle}>Edit KPI</Text>

          <View style={ss.editRow}>
            <TextInput
              style={[ss.editInput, { flex: 1 }]}
              value={editKpiName}
              onChangeText={setEditKpiName}
              placeholder="KPI name"
            />
            <TouchableOpacity style={ss.saveSmallBtn} onPress={() => saveKpiName(item.kpiId)}>
              <Icon name="check" size={16} color="white" />
            </TouchableOpacity>
          </View>

          <View style={[ss.editRow, { marginTop: 8 }]}>
            <TextInput
              style={[ss.editInput, { width: 70 }]}
              value={editKpiWeight}
              onChangeText={setEditKpiWeight}
              keyboardType="numeric"
              placeholder="%"
            />
            <Text style={ss.pctLabel}>%</Text>
            <TouchableOpacity style={ss.saveSmallBtn} onPress={() => saveKpiWeight(item.kpiId)}>
              <Icon name="check" size={16} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={ss.cancelSmallBtn} onPress={() => setEditingKpiId(null)}>
              <Icon name="close" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>
          <Text style={ss.editHint}>Other KPI weights will auto-adjust to maintain 100%</Text>
        </View>
      )}

      {/* ── Inline Add Sub-KPI ── */}
      {addingSubTo === item.kpiId && (
        <View style={ss.inlineAdd}>
          <TextInput
            placeholder="Sub-KPI Name"
            style={ss.inlineInput}
            value={dynamicSub.name}
            onChangeText={t => setDynamicSub({ ...dynamicSub, name: t })}
          />
          <TextInput
            placeholder="%"
            style={[ss.inlineInput, { width: 50 }]}
            value={dynamicSub.weight}
            onChangeText={t => setDynamicSub({ ...dynamicSub, weight: t })}
            keyboardType="numeric"
          />
          <TouchableOpacity style={ss.inlineCheck} onPress={() => addDynamicSubKpi(item.kpiId)}>
            <Icon name="check" size={20} color="white" />
          </TouchableOpacity>
        </View>
      )}

      {/* ── Expanded Sub-KPI list ── */}
      {openKpiId === item.kpiId && (
        <FlatList
          data={item.subKpis}
          keyExtractor={(sk) => sk.subKpiId.toString()}
          scrollEnabled={false}
          renderItem={renderSubItem}
        />
      )}

    </View>
  );

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={ss.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#065F46" />
      <FlatList
        data={kpiList}
        keyExtractor={(item) => item.kpiId.toString()}
        renderItem={renderKpiItem}
        extraData={{ openKpiId, addingSubTo, editingKpiId, editingSubId }}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListHeaderComponent={
          <>
            <View style={ss.header}>
              <Text style={ss.headerTitle}>KPI Configuration</Text>
              <Text style={ss.headerSub}>Manage Employee Performance Metrics</Text>
            </View>

            <View style={ss.card}>
              <Text style={ss.cardTitle}>Create New KPI</Text>
              <Text style={ss.fieldLabel}>Academic Session</Text>
              <Dropdown
                style={ss.dropdown}
                data={sessions}
                labelField="label"
                valueField="value"
                placeholder="Select Session"
                value={selectedSession}
                onChange={(item) => setSelectedSession(item.value)}
              />
              <Text style={ss.fieldLabel}>Target Employee Type</Text>
              <Dropdown
                style={ss.dropdown}
                data={employeeTypes}
                labelField="label"
                valueField="value"
                placeholder="Select Role"
                value={selectedEmpType}
                onChange={(item) => setSelectedEmpType(item.value)}
              />
              <View style={ss.inputGroup}>
                <Text style={ss.fieldLabel}>KPI Heading Name</Text>
                <TextInput style={ss.input} value={kpiName} onChangeText={setKpiName} />
              </View>
              <View style={ss.inputGroup}>
                <Text style={ss.fieldLabel}>Allocation Weight (%)</Text>
                <TextInput
                  style={ss.input}
                  keyboardType="numeric"
                  value={kpiWeight}
                  onChangeText={setKpiWeight}
                />
              </View>

              {!showSubSection ? (
                <TouchableOpacity style={ss.primaryBtn} onPress={() => setShowSubSection(true)}>
                  <Text style={ss.btnText}>Add Sub-Categories</Text>
                </TouchableOpacity>
              ) : (
                <View style={ss.subSection}>
                  <Text style={ss.subSectionTitle}>Define Sub-KPIs</Text>
                  <View style={ss.row}>
                    <TextInput
                      placeholder="Sub-KPI Name"
                      style={[ss.input, { flex: 2 }]}
                      value={subName}
                      onChangeText={setSubName}
                    />
                    <TextInput
                      placeholder="%"
                      style={[ss.input, { flex: 1, marginLeft: 10 }]}
                      value={subWeight}
                      onChangeText={setSubWeight}
                      keyboardType="numeric"
                    />
                  </View>
                  <TouchableOpacity
                    style={ss.addBtn}
                    onPress={() => {
                      if (subName && subWeight) {
                        setTempSubKpis([...tempSubKpis, { id: Date.now(), name: subName, weight: subWeight }]);
                        setSubName(""); setSubWeight("");
                      }
                    }}
                  >
                    <Text style={ss.addBtnText}>Add to Draft</Text>
                  </TouchableOpacity>

                  {tempSubKpis.map((s) => (
                    <View key={s.id} style={ss.draftItem}>
                      <Text style={ss.draftText}>{s.name} ({s.weight}%)</Text>
                      <TouchableOpacity onPress={() => setTempSubKpis(tempSubKpis.filter(x => x.id !== s.id))}>
                        <Icon name="close-circle-outline" size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ))}

                  <TouchableOpacity style={ss.saveBtn} onPress={handleSaveMainKpi}>
                    <Text style={ss.btnText}>Finalize & Save KPI</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={ss.listHeader}>
              <Text style={ss.listTitle}>Live KPI Overview</Text>
              {loading && <ActivityIndicator size="small" color="#059669" />}
            </View>
          </>
        }
      />
    </KeyboardAvoidingView>
  );
};

const ss = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    backgroundColor: "#065F46",
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: { color: "white", fontSize: 24, fontWeight: "bold" },
  headerSub: { color: "#A7F3D0", fontSize: 14, marginTop: 5 },
  card: {
    backgroundColor: "white", margin: 20, padding: 20, borderRadius: 20,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
      android: { elevation: 5 },
    }),
  },
  cardTitle: { fontSize: 18, fontWeight: "700", color: "#1E293B", marginBottom: 20 },
  inputGroup: { marginBottom: 15 },
  fieldLabel: { fontSize: 13, fontWeight: "600", color: "#64748B", marginBottom: 6, marginLeft: 2 },
  input: {
    backgroundColor: "#F1F5F9", padding: 12, borderRadius: 12,
    fontSize: 15, color: "#1E293B", borderWidth: 1, borderColor: "#E2E8F0",
  },
  dropdown: {
    backgroundColor: "#F1F5F9", height: 50, borderRadius: 12,
    paddingHorizontal: 12, marginBottom: 15, borderWidth: 1, borderColor: "#E2E8F0",
  },
  primaryBtn: {
    backgroundColor: "#059669", flexDirection: "row", justifyContent: "center",
    alignItems: "center", padding: 16, borderRadius: 12, gap: 10,
  },
  btnText: { color: "white", fontWeight: "bold", fontSize: 16 },
  subSection: { marginTop: 20, borderTopWidth: 1, borderTopColor: "#F1F5F9", paddingTop: 20 },
  subSectionTitle: { fontSize: 16, fontWeight: "600", color: "#059669", marginBottom: 15 },
  row: { flexDirection: "row" },
  addBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    padding: 10, borderStyle: "dashed", borderWidth: 1, borderColor: "#059669",
    borderRadius: 12, marginBottom: 15,
  },
  addBtnText: { color: "#059669", fontWeight: "bold", marginLeft: 5 },
  draftItem: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: "#ECFDF5", padding: 12, borderRadius: 10, marginBottom: 8,
  },
  draftText: { fontWeight: "500", color: "#065F46", flex: 1 },
  saveBtn: { backgroundColor: "#1E293B", padding: 16, borderRadius: 12, alignItems: "center", marginTop: 10 },
  listHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 25, marginBottom: 15, gap: 10 },
  listTitle: { fontSize: 18, fontWeight: "bold", color: "#475569" },

  // ── KPI card ──────────────────────────────────────────────────────────────
  kpiCard: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    elevation: 2,
    overflow: "hidden",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6 },
    }),
  },
  // inner padding container — NOT the card itself
  kpiHeader: {
    padding: 16,
  },
  // Row 1
  kpiInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  kpiIconBox: {
    backgroundColor: "#F0FDF4",
    padding: 10,
    borderRadius: 10,
    marginRight: 12,
    flexShrink: 0,
  },
  kpiNameText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    flex: 1,           // takes all remaining space
    flexShrink: 1,
    flexWrap: "wrap",  // wraps instead of truncating
  },
  kpiWeightPill: {
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    marginLeft: 8,
    flexShrink: 0,     // pill never shrinks
  },
  kpiWeightText: { fontSize: 12, color: "#065F46", fontWeight: "600" },
  // Row 2
  actionIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: "#BBF7D0",
  },
  actionBtnDanger: {
    borderColor: "#FECACA",
  },
  actionBtnText: {
    fontSize: 12,
    color: "#059669",
    fontWeight: "500",
  },

  // ── Edit KPI box ──────────────────────────────────────────────────────────
  editKpiBox: {
    backgroundColor: "#F0FDF4",
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: "#DCFCE7",
  },
  editBoxTitle: { fontSize: 13, fontWeight: "600", color: "#059669", marginBottom: 8 },
  editRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  editInput: {
    backgroundColor: "white", padding: 9, borderRadius: 10,
    borderWidth: 1, borderColor: "#BBF7D0", fontSize: 14, color: "#1E293B",
  },
  pctLabel: { fontSize: 14, color: "#64748B" },
  saveSmallBtn: {
    backgroundColor: "#059669", padding: 10, borderRadius: 8,
    justifyContent: "center", alignItems: "center",
  },
  cancelSmallBtn: {
    backgroundColor: "#F1F5F9", padding: 10, borderRadius: 8,
    justifyContent: "center", alignItems: "center",
    borderWidth: 1, borderColor: "#E2E8F0",
  },
  editHint: { fontSize: 11, color: "#059669", marginTop: 8 },

  // ── Edit Sub-KPI box ──────────────────────────────────────────────────────
  editSubBox: {
    backgroundColor: "#EFF6FF",
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: "#BFDBFE",
  },

  // ── Sub-KPI list ──────────────────────────────────────────────────────────
  subItem: {
    flexDirection: "row", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: "#E2E8F0",
  },
  subName: { color: "#475569", fontSize: 14, flex: 1 },
  subRowRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  subWeightBadge: {
    backgroundColor: "#E0F2FE", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6,
  },
  subWeightValue: { color: "#0369A1", fontSize: 12, fontWeight: "bold" },

  // ── Inline add Sub-KPI ────────────────────────────────────────────────────
  inlineAdd: {
    flexDirection: "row", padding: 15, backgroundColor: "#F0FDF4",
    gap: 10, borderTopWidth: 1, borderTopColor: "#DCFCE7",
  },
  inlineInput: {
    flex: 1, backgroundColor: "white", padding: 8, borderRadius: 8,
    borderWidth: 1, borderColor: "#BBF7D0",
  },
  inlineCheck: {
    backgroundColor: "#059669", padding: 10, borderRadius: 8, justifyContent: "center",
  },
});

export default AddKPI;