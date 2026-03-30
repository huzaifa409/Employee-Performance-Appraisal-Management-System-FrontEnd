import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
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

  // Form States
  const [kpiName, setKpiName] = useState("");
  const [kpiWeight, setKpiWeight] = useState("");
  const [showSubSection, setShowSubSection] = useState(false);
  const [tempSubKpis, setTempSubKpis] = useState([]);
  const [subName, setSubName] = useState("");
  const [subWeight, setSubWeight] = useState("");

  // Dynamic Add States
  const [addingSubTo, setAddingSubTo] = useState(null);
  const [dynamicSub, setDynamicSub] = useState({ name: "", weight: "" });

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
      if (!res.ok) throw new Error("Server mismatch");
      const data = await res.json();
      setKpiList(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, [selectedSession, selectedEmpType]);

  useEffect(() => { fetchDropdowns(); }, []);
  useEffect(() => { refreshKpis(); }, [refreshKpis]);

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
        text: "Confirm Delete",
        style: "destructive",
        onPress: async () => {
          const res = await fetch(`${BASE_URL}/Kpi/delete-main-kpi/${selectedSession}/${id}`, { method: "DELETE" });
          if (res.ok) refreshKpis();
        }
      }
    ]);
  };

  const addDynamicSubKpi = async (kpiId) => {
    if (!dynamicSub.name || !dynamicSub.weight) return;
    const payload = { SessionId: parseInt(selectedSession), KpiId: parseInt(kpiId), Name: dynamicSub.name, NewWeight: parseInt(dynamicSub.weight) };
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

  const LabelInput = ({ label, ...props }) => (
    <View style={ss.inputGroup}>
      <Text style={ss.fieldLabel}>{label}</Text>
      <TextInput style={ss.input} placeholderTextColor="#999" {...props} />
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={ss.container}>
      <StatusBar barStyle="light-content" backgroundColor="#065F46" />
      <View style={ss.header}>
        <Text style={ss.headerTitle}>KPI Configuration</Text>
        <Text style={ss.headerSub}>Manage Employee Performance Metrics</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* SETUP CARD */}
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
            onChange={item => setSelectedSession(item.value)}
          />

          <Text style={ss.fieldLabel}>Target Employee Type</Text>
          <Dropdown
            style={ss.dropdown}
            data={employeeTypes}
            labelField="label"
            valueField="value"
            placeholder="Select Role"
            value={selectedEmpType}
            onChange={item => setSelectedEmpType(item.value)}
          />

          <LabelInput label="KPI Heading Name" placeholder="e.g. Research & Development" value={kpiName} onChangeText={setKpiName} />
          <LabelInput label="Allocation Weight (%)" placeholder="e.g. 30" keyboardType="numeric" value={kpiWeight} onChangeText={setKpiWeight} />

          {!showSubSection ? (
            <TouchableOpacity style={ss.primaryBtn} onPress={() => setShowSubSection(true)}>
              <Text style={ss.btnText}>Add Sub-Categories</Text>
              <Icon name="arrow-right" size={20} color="white" />
            </TouchableOpacity>
          ) : (
            <View style={ss.subSection}>
              <Text style={ss.subSectionTitle}>Define Sub-KPIs</Text>
              <View style={ss.row}>
                <View style={{ flex: 2 }}>
                  <LabelInput label="Sub-KPI Name" placeholder="Specific Task" value={subName} onChangeText={setSubName} />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <LabelInput label="Weight" placeholder="%" keyboardType="numeric" value={subWeight} onChangeText={setSubWeight} />
                </View>
              </View>

              <TouchableOpacity style={ss.addBtn} onPress={() => {
                if (subName && subWeight) {
                  setTempSubKpis([...tempSubKpis, { id: Date.now(), name: subName, weight: subWeight }]);
                  setSubName(""); setSubWeight("");
                }
              }}>
                <Icon name="plus" size={20} color="#059669" />
                <Text style={ss.addBtnText}>Add to Draft</Text>
              </TouchableOpacity>

              {tempSubKpis.map(s => (
                <View key={s.id} style={ss.draftItem}>
                  <Text style={ss.draftText}>{s.name} <Text style={{ color: "#059669" }}>({s.weight}%)</Text></Text>
                  <TouchableOpacity onPress={() => setTempSubKpis(tempSubKpis.filter(x => x.id !== s.id))}>
                    <Icon name="close-circle" size={22} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity style={ss.saveBtn} onPress={handleSaveMainKpi}>
                <Text style={ss.btnText}>Finalize & Save KPI</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* LIST SECTION */}
        <View style={ss.listHeader}>
          <Text style={ss.listTitle}>Live KPI Overview</Text>
          {loading && <ActivityIndicator size="small" color="#059669" />}
        </View>

        {kpiList.map((item) => (
          <View key={item.kpiId} style={ss.kpiCard}>
            <TouchableOpacity 
                activeOpacity={0.7}
                style={ss.kpiHeader} 
                onPress={() => setOpenKpiId(openKpiId === item.kpiId ? null : item.kpiId)}
            >
              <View style={ss.kpiInfo}>
                <View style={ss.kpiIconBox}>
                    <Icon name="chart-box-outline" size={24} color="#059669" />
                </View>
                <View>
                  <Text style={ss.kpiNameText}>{item.kpiName}</Text>
                  <Text style={ss.kpiWeightText}>{item.totalKpiWeight}% of total</Text>
                </View>
              </View>
              <View style={ss.actionIcons}>
                <TouchableOpacity onPress={() => setAddingSubTo(addingSubTo === item.kpiId ? null : item.kpiId)}>
                    <Icon name="plus-box" size={26} color="#059669" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteKpi(item.kpiId)}>
                    <Icon name="trash-can-outline" size={26} color="#EF4444" />
                </TouchableOpacity>
                <Icon name={openKpiId === item.kpiId ? "chevron-up" : "chevron-down"} size={24} color="#666" />
              </View>
            </TouchableOpacity>

            {addingSubTo === item.kpiId && (
              <View style={ss.inlineAdd}>
                <TextInput placeholder="Sub-KPI Name" style={ss.inlineInput} value={dynamicSub.name} onChangeText={t => setDynamicSub({...dynamicSub, name: t})} />
                <TextInput placeholder="%" style={[ss.inlineInput, {width: 50}]} keyboardType="numeric" value={dynamicSub.weight} onChangeText={t => setDynamicSub({...dynamicSub, weight: t})} />
                <TouchableOpacity onPress={() => addDynamicSubKpi(item.kpiId)} style={ss.inlineCheck}>
                  <Icon name="check" size={20} color="white" />
                </TouchableOpacity>
              </View>
            )}

            {openKpiId === item.kpiId && (
              <View style={ss.subList}>
                {item.subKpis.map(sk => (
                  <View key={sk.subKpiId} style={ss.subItem}>
                    <Text style={ss.subName}>{sk.subKpiName}</Text>
                    <View style={ss.subWeightBadge}>
                        <Text style={ss.subWeightValue}>{sk.weight}%</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const ss = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: { backgroundColor: "#065F46", paddingHorizontal: 20, paddingBottom: 30, paddingTop: Platform.OS === 'ios' ? 60 : 40, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerTitle: { color: "white", fontSize: 24, fontWeight: "bold" },
  headerSub: { color: "#A7F3D0", fontSize: 14, marginTop: 5 },
  
  card: { backgroundColor: "white", margin: 20, padding: 20, borderRadius: 20, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 }, android: { elevation: 5 } }) },
  cardTitle: { fontSize: 18, fontWeight: "700", color: "#1E293B", marginBottom: 20 },
  
  inputGroup: { marginBottom: 15 },
  fieldLabel: { fontSize: 13, fontWeight: "600", color: "#64748B", marginBottom: 6, marginLeft: 2 },
  input: { backgroundColor: "#F1F5F9", padding: 12, borderRadius: 12, fontSize: 15, color: "#1E293B", borderWidth: 1, borderColor: "#E2E8F0" },
  dropdown: { backgroundColor: "#F1F5F9", height: 50, borderRadius: 12, paddingHorizontal: 12, marginBottom: 15, borderWidth: 1, borderColor: "#E2E8F0" },
  
  primaryBtn: { backgroundColor: "#059669", flexDirection: "row", justifyContent: "center", alignItems: "center", padding: 16, borderRadius: 12, gap: 10 },
  btnText: { color: "white", fontWeight: "bold", fontSize: 16 },
  
  subSection: { marginTop: 20, borderTopWidth: 1, borderTopColor: "#F1F5F9", paddingTop: 20 },
  subSectionTitle: { fontSize: 16, fontWeight: "600", color: "#059669", marginBottom: 15 },
  row: { flexDirection: "row" },
  addBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 10, borderStyle: "dashed", borderWidth: 1, borderColor: "#059669", borderRadius: 12, marginBottom: 15 },
  addBtnText: { color: "#059669", fontWeight: "bold", marginLeft: 5 },
  
  draftItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#ECFDF5", padding: 12, borderRadius: 10, marginBottom: 8 },
  draftText: { fontWeight: "500", color: "#065F46" },
  saveBtn: { backgroundColor: "#1E293B", padding: 16, borderRadius: 12, alignItems: "center", marginTop: 10 },

  listHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 25, marginBottom: 15, gap: 10 },
  listTitle: { fontSize: 18, fontWeight: "bold", color: "#475569" },
  
  kpiCard: { backgroundColor: "white", marginHorizontal: 20, marginBottom: 12, borderRadius: 16, elevation: 2, overflow: "hidden" },
  kpiHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16 },
  kpiInfo: { flexDirection: "row", alignItems: "center", flex: 1 },
  kpiIconBox: { backgroundColor: "#F0FDF4", padding: 10, borderRadius: 10, marginRight: 12 },
  kpiNameText: { fontSize: 16, fontWeight: "700", color: "#1E293B" },
  kpiWeightText: { fontSize: 12, color: "#059669", fontWeight: "600" },
  actionIcons: { flexDirection: "row", alignItems: "center", gap: 12 },

  subList: { backgroundColor: "#F8FAFC", paddingBottom: 10 },
  subItem: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 12, borderTopWidth: 1, borderTopColor: "#E2E8F0" },
  subName: { color: "#475569", fontSize: 14 },
  subWeightBadge: { backgroundColor: "#E0F2FE", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  subWeightValue: { color: "#0369A1", fontSize: 12, fontWeight: "bold" },

  inlineAdd: { flexDirection: "row", padding: 15, backgroundColor: "#F0FDF4", gap: 10, borderTopWidth: 1, borderTopColor: "#DCFCE7" },
  inlineInput: { flex: 1, backgroundColor: "white", padding: 8, borderRadius: 8, borderWidth: 1, borderColor: "#BBF7D0" },
  inlineCheck: { backgroundColor: "#059669", padding: 10, borderRadius: 8, justifyContent: "center" }
});

export default AddKPI;