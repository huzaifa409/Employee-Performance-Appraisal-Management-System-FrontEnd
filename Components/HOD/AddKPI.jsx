import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";

const AddKPI = () => {

  const [kpiTypes] = useState([
    { label: "Teacher-CS", value: "Teacher-CS" },
    { label: "Teacher-Non CS", value: "Teacher-Non CS" },
  ]);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [kpiName, setKpiName] = useState("");
  const [kpiWeight, setKpiWeight] = useState("");
  const [showSubSection, setShowSubSection] = useState(false);

  const [subName, setSubName] = useState("");
  const [subWeight, setSubWeight] = useState("");
  const [subKpis, setSubKpis] = useState([]);

  const [savedKpis, setSavedKpis] = useState([]);

  /* ---------------- ADD SUB KPI ---------------- */
  const addSubKpi = () => {
    if (!subName || !subWeight) return;

    setSubKpis(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        name: subName,
        weight: subWeight,
      },
    ]);

    setSubName("");
    setSubWeight("");
  };

  /* ---------------- SAVE KPI ---------------- */
  const saveKpi = () => {
    if (!kpiName || !kpiWeight || subKpis.length === 0) return;

    const newKpi = {
      id: Date.now().toString(),
      category: selectedCategory,
      name: kpiName,
      weight: kpiWeight,
      subKpis,
    };

    setSavedKpis(prev => [...prev, newKpi]);

    // reset
    setKpiName("");
    setKpiWeight("");
    setSubKpis([]);
    setShowSubSection(false);
  };

  /* ---------------- RENDER SUB KPI ---------------- */
  const renderSubKpi = ({ item }) => (
    <View style={ss.subRow}>
      <Text>{item.name} — {item.weight}%</Text>
    </View>
  );

  /* ---------------- RENDER KPI CARD ---------------- */
  const renderKpiCard = ({ item }) => (
    <View style={ss.categoryCard}>
      <View style={ss.rowBetween}>
        <Text style={ss.kpiTitle}>{item.name}</Text>
        <Text style={{ color: "#0F9D58" }}>{item.weight}%</Text>
      </View>

      <Text style={ss.subText}>
        {item.subKpis.length} Sub-KPIs
      </Text>

      <FlatList
        data={item.subKpis}
        keyExtractor={sub => sub.id}
        renderItem={renderSubKpi}
      />
    </View>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#EDF4EE" }}>

      {/* HEADER */}
      <View style={ss.header}>
        <View>
          <Text style={ss.headerTitle}>Add KPI</Text>
          <Text style={ss.headerSubtitle}>Head Of Department</Text>
        </View>
        <View style={ss.logoheader}>
          <Image
            source={require("../../Assets/BIIT_logo.png")}
            style={ss.logo}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* FORM CARD */}
      <View style={ss.card}>
        <Text style={ss.cardTitle}>
          {showSubSection ? `Create KPI: ${kpiName}` : "Create New KPI"}
        </Text>

        <Text style={ss.label}>Select KPI Category Type</Text>
        <Dropdown
          style={ss.dropdown}
          data={kpiTypes}
          labelField="label"
          valueField="value"
          placeholder="Select Category Type"
          value={selectedCategory}
          onChange={item => setSelectedCategory(item.value)}
        />

        <Text style={ss.label}>KPI Name</Text>
        <TextInput
          style={ss.dropdown}
          placeholder="e.g: Academics"
          placeholderTextColor={'black'}
          value={kpiName}
          onChangeText={setKpiName}
        />

        <Text style={ss.label}>KPI Weight (%)</Text>
        <TextInput
          style={ss.dropdown}
          keyboardType="numeric"
          placeholderTextColor={'black'}
          placeholder="e.g: 80"
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
              placeholderTextColor={'black'}
              placeholder="e.g: Peer Evaluation"
              value={subName}
              onChangeText={setSubName}
            />

            <Text style={ss.label}>Weight (%)</Text>
            <TextInput
              style={ss.dropdown}
              keyboardType="numeric"
              placeholderTextColor={'black'}
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
                keyExtractor={item => item.id}
                renderItem={renderSubKpi}
              />
            </View>

            <TouchableOpacity style={ss.saveBtn} onPress={saveKpi}>
              <Text style={ss.buttonText}>Save KPI</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* KPI CATEGORIES LIST */}
      {savedKpis.length > 0 && (
        <View style={{ margin: 15 }}>
          <Text style={ss.sectionTitle}>KPI Categories</Text>

          <FlatList
            data={savedKpis}
            keyExtractor={item => item.id}
            renderItem={renderKpiCard}
          />
        </View>
      )}

    </ScrollView>
  );
};

export default AddKPI;

/* ---------------- STYLES ---------------- */

const ss = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 14,
    backgroundColor: "#fff",
    elevation: 3,
  },
  headerTitle: { fontSize: 26, fontWeight: "700" },
  headerSubtitle: { fontSize: 12, color: "#777" },
  logoheader: {
    backgroundColor: "#eafaf1",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: { width: 40, height: 40 },

  card: {
    margin: 15,
    padding: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  cardTitle: { fontSize: 20, fontWeight: "500" },
  label: { marginTop: 16 },

  dropdown: {
    height: 40,
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
