import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import BASE_URL from "../../API-URL/API";

const AddKPI = () => {
  // --------- STATE HOOKS ---------
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);

  const [employeeTypes, setEmployeeTypes] = useState([]);
  const [selectedEmpType, setSelectedEmpType] = useState(null);

  const [kpiName, setKpiName] = useState("");
  const [kpiWeight, setKpiWeight] = useState("");
  const [showSubSection, setShowSubSection] = useState(false);

  const [subName, setSubName] = useState("");
  const [subWeight, setSubWeight] = useState("");
  const [subKpis, setSubKpis] = useState([]);

  const [savedKpis, setSavedKpis] = useState([]);
  const [loading, setLoading] = useState(false);

  // --------- FETCH DROPDOWNS ---------
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const resSessions = await fetch(`${BASE_URL}/Kpi/sessions`);
        const sessionsData = await resSessions.json();
        setSessions(sessionsData);

        const resTypes = await fetch(`${BASE_URL}/Kpi/emptypes`);
        const empData = await resTypes.json();
        const mappedTypes = empData.map((t) => ({
          label: t.Type || t.type,
          value: t.Id || t.id,
        }));
        setEmployeeTypes(mappedTypes);
      } catch (err) {
        Alert.alert("Error", "Failed to load sessions or employee types");
      }
    };
    fetchDropdowns();
  }, []);

  // --------- FETCH SAVED KPIS ---------
  useEffect(() => {
    const fetchSavedKpis = async () => {
      if (!selectedSession || !selectedEmpType) {
        setSavedKpis([]);
        return;
      }
      try {
        setLoading(true);
        const res = await fetch(
          `${BASE_URL}/Kpi/view-weights/${selectedSession}/${selectedEmpType}`
        );
        const data = await res.json();
        setSavedKpis(data);
      } catch (err) {
        Alert.alert("Error", "Failed to load saved KPIs");
      } finally {
        setLoading(false);
      }
    };
    fetchSavedKpis();
  }, [selectedSession, selectedEmpType]);

  // --------- ADD SUB KPI ---------
  const addSubKpi = () => {
    if (!subName || !subWeight) {
      Alert.alert("Error", "Please enter sub-KPI name and weight");
      return;
    }
    setSubKpis((prev) => [
      ...prev,
      { id: Date.now().toString(), name: subName, weight: subWeight },
    ]);
    setSubName("");
    setSubWeight("");
  };

  // --------- SAVE KPI ---------
  const saveKpi = async () => {
    if (!selectedSession || !selectedEmpType || !kpiName || !kpiWeight || subKpis.length === 0) {
      Alert.alert("Error", "Complete all fields and add at least one sub-KPI");
      return;
    }

    const payload = {
      SessionId: parseInt(selectedSession),
      EmployeeTypeId: parseInt(selectedEmpType),
      KPIName: kpiName,
      RequestedKPIWeight: parseInt(kpiWeight),
      SubKPIs: subKpis.map((s) => ({ Name: s.name, Weight: parseInt(s.weight) })),
    };

    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/Kpi/create-with-weight`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save KPI");
      Alert.alert("Success", "KPI Saved Successfully!");

      // Reset form
      setKpiName("");
      setKpiWeight("");
      setSubKpis([]);
      setShowSubSection(false);

      // Refresh saved KPIs
      const updated = await fetch(
        `${BASE_URL}/Kpi/view-weights/${selectedSession}/${selectedEmpType}`
      );
      const data = await updated.json();
      setSavedKpis(data);
    } catch (err) {
      Alert.alert("Error", err.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  // --------- RENDER SUB KPI ---------
  const renderSubKpi = ({ item }) => (
    <View style={ss.subRow}>
      <Text>
        {item.name} — {item.weight}%
      </Text>
    </View>
  );

  // --------- RENDER SAVED KPI CARD ---------
  const renderKpiCard = ({ item }) => (
    <View style={ss.categoryCard}>
      <View style={ss.rowBetween}>
        <Text style={ss.kpiTitle}>{item.kpiName}</Text>
        <Text style={{ color: "#0F9D58" }}>{item.totalKpiWeight}%</Text>
      </View>
      <Text style={ss.subText}>{item.subKpis.length} Sub-KPIs</Text>
      <FlatList
        data={item.subKpis}
        keyExtractor={(sub) => sub.subKpiId.toString()}
        renderItem={({ item: sk }) => (
          <View style={ss.subRow}>
            <Text>
              {sk.subKpiName} — {sk.weight}%
            </Text>
          </View>
        )}
      />
    </View>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#EDF4EE", paddingBottom: 20 }}>
      {/* Session & Employee Type */}
      <View style={ss.card}>
        <Text style={ss.cardTitle}>Select Session & Employee Type</Text>

        <Text style={ss.label}>Session</Text>
        <Dropdown
          style={ss.dropdown}
          data={sessions.map((s) => ({ label: s.name, value: s.id }))}
          labelField="label"
          valueField="value"
          placeholder="Select Session"
          value={selectedSession}
          onChange={(item) => setSelectedSession(item.value)}
        />

        <Text style={ss.label}>Employee Type</Text>
        <Dropdown
          style={ss.dropdown}
          data={employeeTypes}
          labelField="label"
          valueField="value"
          placeholder="Select Employee Type"
          value={selectedEmpType}
          onChange={(item) => setSelectedEmpType(item.value)}
        />
      </View>

      {/* KPI Form */}
      <View style={ss.card}>
        <Text style={ss.cardTitle}>
          {showSubSection ? `Create KPI: ${kpiName}` : "Create New KPI"}
        </Text>

        <Text style={ss.label}>KPI Name</Text>
        <TextInput
          style={ss.dropdown}
          placeholder="e.g: Academics"
          value={kpiName}
          onChangeText={setKpiName}
        />

        <Text style={ss.label}>KPI Weight (%)</Text>
        <TextInput
          style={ss.dropdown}
          placeholder="e.g: 80"
          keyboardType="numeric"
          value={kpiWeight}
          onChangeText={setKpiWeight}
        />

        {!showSubSection && (
          <TouchableOpacity
            style={ss.button}
            onPress={() => setShowSubSection(true)}
          >
            <Text style={ss.buttonText}>Next: Add Sub KPIs</Text>
          </TouchableOpacity>
        )}

        {showSubSection && (
          <>
            <View style={ss.divider} />
            <Text style={ss.label}>Sub-KPI Name</Text>
            <TextInput
              style={ss.dropdown}
              placeholder="e.g: Peer Evaluation"
              value={subName}
              onChangeText={setSubName}
            />
            <Text style={ss.label}>Weight (%)</Text>
            <TextInput
              style={ss.dropdown}
              keyboardType="numeric"
              placeholder="e.g: 20"
              value={subWeight}
              onChangeText={setSubWeight}
            />
            <TouchableOpacity style={ss.addSubBtn} onPress={addSubKpi}>
              <Text style={{ color: "#0F9D58", fontWeight: "600" }}>
                + Add Sub-KPI
              </Text>
            </TouchableOpacity>

            <View style={ss.subBox}>
              <View style={ss.rowBetween}>
                <Text style={{ fontWeight: "600" }}>Added Sub-KPIs</Text>
                <Text style={{ color: "#0F9D58" }}>
                  Total: {subKpis.reduce((a, b) => a + Number(b.weight), 0)}%
                </Text>
              </View>
              <FlatList
                data={subKpis}
                keyExtractor={(item) => item.id}
                renderItem={renderSubKpi}
              />
            </View>

            <TouchableOpacity style={ss.saveBtn} onPress={saveKpi}>
              <Text style={ss.buttonText}>Save KPI</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Saved KPIs */}
      {savedKpis.length > 0 && (
        <View style={{ margin: 15 }}>
          <Text style={ss.sectionTitle}>Saved KPI Categories</Text>
          <FlatList
            data={savedKpis}
            keyExtractor={(item) => item.kpiId.toString()}
            renderItem={renderKpiCard}
          />
        </View>
      )}
    </ScrollView>
  );
};

export default AddKPI;

const ss = StyleSheet.create({
  card: {
    margin: 15,
    padding: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  cardTitle: { fontSize: 20, fontWeight: "500", marginBottom: 10 },
  label: { marginTop: 16 },
  dropdown: {
    height: 45,
    borderWidth: 1,
    borderColor: "#4CAF50",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginTop: 6,
    backgroundColor: "#F9F9F9",
  },
  button: {
    height: 50,
    backgroundColor: "#0F9D58",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  divider: { height: 1, backgroundColor: "#cceedd", marginVertical: 15 },
  addSubBtn: {
    borderWidth: 1,
    borderColor: "#0F9D58",
    borderRadius: 10,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  subBox: {
    backgroundColor: "#eafaf1",
    borderRadius: 12,
    padding: 12,
    marginTop: 15,
  },
  subRow: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  saveBtn: {
    height: 50,
    backgroundColor: "#0F9D58",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  categoryCard: {
    backgroundColor: "#eafaf1",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  kpiTitle: { fontSize: 16, fontWeight: "600" },
  subText: { color: "#555", marginVertical: 6 },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

