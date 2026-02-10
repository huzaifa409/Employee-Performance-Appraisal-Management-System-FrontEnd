import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import BASE_URL from "../../API-URL/API";

const MakeQuestionaire = ({ navigation }) => {

  const [questionnaires, setQuestionnaires] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestionnaires();
  }, []);

  const fetchQuestionnaires = async () => {
    try {
      const response = await fetch(`${BASE_URL}/Questionnaire/GetAll`);
      if (!response.ok) {
        setLoading(false);
        return;
      }
      const data = await response.json();
      setQuestionnaires(data);
      setLoading(false);
    } catch (error) {
      console.log("Fetch error:", error);
      setLoading(false);
    }
  };

  const toggleEvaluation = async (item, turnOn) => {
    try {
      const response = await fetch(
        `${BASE_URL}/Questionnaire/Toggle`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionnaireId: item.Id,
            turnOn: turnOn,
          }),
        }
      );

      if (!response.ok) {
        const msg = await response.text();
        Alert.alert("Not Allowed", msg);
        return;
      }

      await response.json();
      fetchQuestionnaires();

    } catch (error) {
      console.log("Toggle error:", error);
    }
  };

  return (
    <ScrollView style={ss.container} contentContainerStyle={{ paddingBottom: 40 }}>

      {/* ================= HEADER ================= */}
      <View style={ss.header}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={ss.logoCircle}>
            <Image
              source={require("../../Assets/BIIT_logo.png")}
              style={ss.logo}
            />
          </View>
          <View style={{ marginLeft: 10 }}>
            <Text style={ss.headerTitle}>Evaluation Questionnaires</Text>
            <Text style={ss.headerSubtitle}>
              Manage and Create Evaluation Forms
            </Text>
          </View>
        </View>
        <Icon name="assignment" size={26} color="#1b5e20" />
      </View>

      {/* ================= INFO BAR ================= */}
      <View style={ss.infoBar}>
        <Text style={ss.infoText}>
          {questionnaires.length} Questionnaire Available
        </Text>

        <TouchableOpacity
          style={ss.button}
          onPress={() => navigation.navigate("CreateEvaluationQuestionaire")}
        >
          <Icon name="add" size={18} color="#1b5e20" />
          <Text style={ss.buttonText}>Create New</Text>
        </TouchableOpacity>
      </View>

      {/* ================= BODY ================= */}
      {loading ? (
        <Text style={ss.loadingText}>Loading questionnaires...</Text>
      ) : questionnaires.length === 0 ? (
        <View style={ss.emptyBox}>
          <Icon name="quiz" size={64} color="#bdbdbd" />
          <Text style={ss.emptyTitle}>No Questionnaire Found</Text>
          <Text style={ss.emptySub}>
            Create a new evaluation questionnaire to get started.
          </Text>
        </View>
      ) : (
        questionnaires.map((item) => (
          <View key={item.Id} style={ss.card}>

            <View style={ss.cardTop}>
              <Text style={ss.cardTitle}>{item.Type}</Text>

              <View style={ss.badge}>
                <Icon name="help-outline" size={14} color="#1b5e20" />
                <Text style={ss.badgeText}>
                  {item.QuestionCount} Questions
                </Text>
              </View>
            </View>

            <View style={ss.divider} />

            <View style={ss.cardBottom}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text
                  style={[
                    ss.statusText,
                    { color: item.Flag === "1" ? "#1b5e20" : "#9e9e9e" },
                  ]}
                >
                  {item.Flag === "1" ? "Active" : "Inactive"}
                </Text>

                <Switch
                  value={item.Flag === "1"}
                  onValueChange={(value) =>
                    toggleEvaluation(item, value)
                  }
                  trackColor={{
                    false: "#cfd8dc",
                    true: "#66bb6a",
                  }}
                  thumbColor="#ffffff"
                />
              </View>

              <TouchableOpacity style={ss.editBtn} onPress={() => {
                navigation.navigate("EditEvaluationQuestionnaire", {
                  questionnaireId: item.Id
                });
              }}>
                <Icon name="edit" size={16} color="#1b5e20" />
                <Text style={ss.editText}>Edit</Text>
              </TouchableOpacity>
            </View>

          </View>
        ))
      )}
    </ScrollView>
  );
};

const ss = StyleSheet.create({
  container: { backgroundColor: "#f1f4f3", flex: 1 },

  header: {
    backgroundColor: "#ffffff",
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },

  logoCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#e8f5e9",
    justifyContent: "center",
    alignItems: "center",
  },

  logo: { width: 34, height: 34, resizeMode: "contain" },

  headerTitle: { fontWeight: "700", fontSize: 16 },
  headerSubtitle: { fontSize: 12, color: "#666", paddingTop: 3 },

  infoBar: {
    backgroundColor: "#1b5e20",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
  },

  infoText: { color: "#fff", fontSize: 14, fontWeight: "600" },

  button: {
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    elevation: 2,
  },

  buttonText: {
    color: "#1b5e20",
    fontWeight: "600",
    marginLeft: 4,
  },

  card: {
    backgroundColor: "#ffffff",
    marginHorizontal: 12,
    marginTop: 14,
    borderRadius: 14,
    padding: 14,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },

  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cardTitle: { fontSize: 15, fontWeight: "700" },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  badgeText: {
    color: "#1b5e20",
    fontWeight: "600",
    marginLeft: 4,
    fontSize: 12,
  },

  divider: {
    height: 1,
    backgroundColor: "#eeeeee",
    marginVertical: 10,
  },

  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  statusText: {
    marginRight: 8,
    fontWeight: "600",
  },

  editBtn: {
    flexDirection: "row",
    alignItems: "center",
  },

  editText: {
    marginLeft: 4,
    color: "#1b5e20",
    fontWeight: "600",
  },

  loadingText: {
    textAlign: "center",
    marginTop: 30,
    color: "#666",
  },

  emptyBox: {
    marginTop: 70,
    alignItems: "center",
    paddingHorizontal: 20,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 10,
  },

  emptySub: {
    fontSize: 13,
    color: "#777",
    marginTop: 6,
    textAlign: "center",
  },
});

export default MakeQuestionaire;
