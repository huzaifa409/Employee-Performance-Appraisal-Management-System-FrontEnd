import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
  StatusBar,
  TextInput,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import Ionicons from "react-native-vector-icons/Ionicons";
import BASE_URL from "../../API-URL/API";

const AssignMentors = ({ route, navigation }) => {
  const { sessionId, sessionName } = route.params;

  const [societies, setSocieties] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);

  const [selectedSociety, setSelectedSociety] = useState(null);
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchSocieties();
    fetchTeachers();
  }, []);

  useEffect(() => {
    handleSearch(search);
  }, [search, teachers]);

  const fetchSocieties = async () => {
    const res = await fetch(`${BASE_URL}/CourseManagement/GetAll`);
    const data = await res.json();
    setSocieties(data);
  };

  const fetchTeachers = async () => {
    const res = await fetch(`${BASE_URL}/CourseManagement/GetTeachers`);
    const data = await res.json();
    setTeachers(data);
    setFilteredTeachers(data);
  };

  // SEARCH FILTER
  const handleSearch = (text) => {
    setSearch(text);
    const filtered = teachers.filter((t) =>
      t.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredTeachers(filtered);
  };

  // MULTI SELECT
  const toggleTeacher = (id) => {
    if (selectedTeachers.includes(id)) {
      setSelectedTeachers(selectedTeachers.filter((x) => x !== id));
    } else {
      setSelectedTeachers([...selectedTeachers, id]);
    }
  };

 const handleAssign = async () => {
  if (!selectedSociety || selectedTeachers.length === 0)
    return Alert.alert("Error", "Select all fields");

  const payload = selectedTeachers.map((id) => ({
    TeacherId: id,
    SocietyId: selectedSociety,
    SessionId: sessionId,
    IsMentor: true,
    IsChairperson: false,
  }));

  const res = await fetch(
    `${BASE_URL}/CourseManagement/AssignMentorsBulk`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  const data = await res.json();

  Alert.alert("Success", data.message);

  setSelectedTeachers([]);
};

  return (
    <>
      <StatusBar backgroundColor="green" barStyle="light-content" />

      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>

          <View style={{ marginLeft: 10 }}>
            <Text style={styles.headerTitle}>Assign Mentors</Text>
            <Text style={styles.headerSub}>Society Management</Text>
          </View>
        </View>

        {/* SESSION */}
        <View style={styles.sessionBar}>
          <Text style={styles.sessionText}>Session:</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{sessionName}</Text>
          </View>
        </View>

        {/* DROPDOWN */}
        <View style={styles.card}>
          <Text style={styles.label}>Select Society</Text>

          <Dropdown
            style={styles.dropdown}
            data={societies}
            labelField="SocietyName"
            valueField="SocietyId"
            placeholder="Choose Society"
            value={selectedSociety}
            onChange={(item) => setSelectedSociety(item.SocietyId)}
          />
        </View>

        {/* SEARCH */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="gray" />
          <TextInput
            placeholder="Search teachers..."
            style={{ marginLeft: 10, flex: 1 }}
            value={search}
            onChangeText={handleSearch}
          />
        </View>

        {/* SELECTED COUNT */}
        <Text style={styles.selectedText}>
          Selected: {selectedTeachers.length}
        </Text>

        {/* TEACHERS */}
        <FlatList
          data={filteredTeachers}
          keyExtractor={(item) => item.userID.toString()}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => {
            const selected = selectedTeachers.includes(item.userID);

            return (
              <TouchableOpacity
                onPress={() => toggleTeacher(item.userID)}
                style={[
                  styles.teacherCard,
                  selected && styles.selectedCard,
                ]}
              >
                <View>
                  <Text style={styles.teacherName}>{item.name}</Text>
                  <Text style={styles.teacherDes}>
                    {item.designation}
                  </Text>
                </View>

                <Ionicons
                  name={
                    selected
                      ? "checkbox"
                      : "square-outline"
                  }
                  size={22}
                  color={selected ? "green" : "gray"}
                />
              </TouchableOpacity>
            );
          }}
        />

        {/* BUTTON */}
        <TouchableOpacity style={styles.btn} onPress={handleAssign}>
          <Text style={styles.btnText}>Save Mentors</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default AssignMentors;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f7f5",
  },

  header: {
    backgroundColor: "green",
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },

  headerTitle: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  headerSub: {
    color: "#dcdcdc",
    fontSize: 12,
  },

  sessionBar: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#2ecc71",
    padding: 10,
  },

  sessionText: {
    color: "#fff",
    marginRight: 8,
  },

  badge: {
    backgroundColor: "#27ae60",
    paddingHorizontal: 10,
    borderRadius: 10,
  },

  badgeText: {
    color: "#fff",
    fontWeight: "bold",
  },

  card: {
    backgroundColor: "#fff",
    margin: 15,
    padding: 15,
    borderRadius: 12,
  },

  label: {
    marginBottom: 8,
    fontWeight: "600",
  },

  dropdown: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
  },

  searchBox: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 15,
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  selectedText: {
    marginLeft: 15,
    marginTop: 8,
    fontWeight: "600",
  },

  teacherCard: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginVertical: 6,
    padding: 15,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  selectedCard: {
    borderWidth: 2,
    borderColor: "green",
    backgroundColor: "#eafaf1",
  },

  teacherName: {
    fontWeight: "700",
  },

  teacherDes: {
    color: "gray",
    fontSize: 12,
  },

  btn: {
    backgroundColor: "green",
    padding: 15,
    margin: 15,
    borderRadius: 12,
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontWeight: "700",
  },
});