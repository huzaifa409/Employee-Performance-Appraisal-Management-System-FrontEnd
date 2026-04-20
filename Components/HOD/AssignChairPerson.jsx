import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
  StatusBar,
} from "react-native";

import { Dropdown } from "react-native-element-dropdown";
import Ionicons from "react-native-vector-icons/Ionicons";
import BASE_URL from "../../API-URL/API";

const AssignChairperson = ({ route, navigation }) => {
  const { sessionId, sessionName } = route.params;

  const [societies, setSocieties] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [selectedSociety, setSelectedSociety] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  // 🔥 single chairperson object (NOT array)
  const [chairData, setChairData] = useState(null);

  useEffect(() => {
    fetchSocieties();
    fetchTeachers();
  }, []);

  // =========================
  // FETCH SOCIETIES
  // =========================
  const fetchSocieties = async () => {
    try {
      const res = await fetch(`${BASE_URL}/CourseManagement/GetAll`);
      const data = await res.json();
      setSocieties(data);
    } catch (err) {
      console.log(err);
    }
  };

  // =========================
  // FETCH TEACHERS
  // =========================
  const fetchTeachers = async () => {
    try {
      const res = await fetch(`${BASE_URL}/CourseManagement/GetTeachers`);
      const data = await res.json();
      setTeachers(data);
    } catch (err) {
      console.log(err);
    }
  };

  // =========================
  // FETCH CHAIRPERSON (SINGLE)
  // =========================
  const fetchChairperson = async (societyId) => {
    try {
      const res = await fetch(
        `${BASE_URL}/CourseManagement/GetChairpersons/${societyId}/${sessionId}`
      );

      const data = await res.json();
      setChairData(data || null);
    } catch (err) {
      console.log(err);
    }
  };

  // =========================
  // SELECT SOCIETY
  // =========================
  const onSelectSociety = (item) => {
    setSelectedSociety(item.SocietyId);
    setSelectedTeacher(null);
    setChairData(null);

    fetchChairperson(item.SocietyId);
  };

  // =========================
  // ASSIGN CHAIRPERSON
  // =========================
  const handleAssign = async () => {
    if (!selectedSociety || !selectedTeacher) {
      return Alert.alert("Error", "Please select all fields");
    }

    try {
      const res = await fetch(
        `${BASE_URL}/CourseManagement/AssignTeacher`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            TeacherId: selectedTeacher,
            SocietyId: selectedSociety,
            SessionId: sessionId,
            IsChairperson: true,
            IsMentor: false,
          }),
        }
      );

      if (res.ok) {
        Alert.alert("Success", "Chairperson Assigned");

        setSelectedTeacher(null);

        // 🔥 refresh single chairperson
        fetchChairperson(selectedSociety);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // =========================
  // UI
  // =========================
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
            <Text style={styles.headerTitle}>Assign Chairperson</Text>
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

        {/* SOCIETY */}
        <View style={styles.card}>
          <Text style={styles.label}>Select Society</Text>

          <Dropdown
            style={styles.dropdown}
            data={societies}
            labelField="SocietyName"
            valueField="SocietyId"
            placeholder="Choose Society"
            value={selectedSociety}
            onChange={onSelectSociety}
          />
        </View>

        {/* CURRENT CHAIRPERSON */}
        {chairData && (
          <View style={styles.currentBox}>
            <Text style={styles.currentTitle}>Current Chairperson</Text>
            <Text style={styles.currentName}>
              👑 {chairData.TeacherName}
            </Text>
          </View>
        )}

        {/* TEACHERS */}
        <Text style={styles.sectionTitle}>Select Teacher</Text>

        <FlatList
          data={teachers}
          keyExtractor={(item) => item.userID.toString()}
          renderItem={({ item }) => {
            const isSelected = selectedTeacher === item.userID;

            const isChair =
              chairData?.TeacherId?.toString() ===
              item.userID?.toString();

            return (
              <TouchableOpacity
                onPress={() => setSelectedTeacher(item.userID)}
                style={[
                  styles.teacherCard,
                  isSelected && styles.selectedCard,
                  isChair && styles.chairCard,
                ]}
              >
                <View>
                  <Text style={styles.teacherName}>{item.name}</Text>

                  <Text style={styles.teacherDes}>
                    {item.designation}
                  </Text>

                  {isChair && (
                    <Text style={styles.chairLabel}>
                      👑 Current Chairperson
                    </Text>
                  )}
                </View>

                {isSelected && (
                  <Ionicons
                    name="checkmark-circle"
                    size={22}
                    color="green"
                  />
                )}
              </TouchableOpacity>
            );
          }}
        />

        {/* BUTTON */}
        <TouchableOpacity style={styles.btn} onPress={handleAssign}>
          <Text style={styles.btnText}>Assign Chairperson</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default AssignChairperson;

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

  sectionTitle: {
    marginLeft: 15,
    fontWeight: "700",
    marginBottom: 5,
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
  chairCard: {
  borderWidth: 2,
  borderColor: "#f1c40f",
  backgroundColor: "#fff8dc",
},

chairLabel: {
  marginTop: 4,
  fontSize: 11,
  color: "#b8860b",
  fontWeight: "600",
},
currentBox: {
  backgroundColor: "#fff",
  margin: 15,
  padding: 15,
  borderRadius: 12,
  borderLeftWidth: 5,
  borderLeftColor: "gold",
},

currentTitle: {
  fontWeight: "700",
  marginBottom: 5,
},

currentName: {
  fontSize: 14,
  color: "#333",
},
});