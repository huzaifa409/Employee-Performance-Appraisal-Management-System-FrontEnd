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
  Modal,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import BASE_URL from "../../API-URL/API";

const MakeQuestionaire = ({ navigation }) => {
  const [questionnaires, setQuestionnaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showArchive, setShowArchive] = useState(false);

  useEffect(() => {
    fetchQuestionnaires();
  }, []);

  const fetchQuestionnaires = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/Questionnaire/GetAll`);
      if (!response.ok) return;
      const data = await response.json();
      setQuestionnaires(data);
    } catch (error) {
      console.log("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleEvaluation = async (item, turnOn) => {
    try {
      const response = await fetch(`${BASE_URL}/Questionnaire/Toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionnaireId: item.Id,
          turnOn: turnOn,
        }),
      });

      if (!response.ok) {
        const msg = await response.text();
        Alert.alert("Access Restricted", msg);
        return;
      }
      fetchQuestionnaires();
    } catch (error) {
      console.log("Toggle error:", error);
    }
  };

  const handleEdit = (item) => {
    if (item.Flag === "1") {
      Alert.alert(
        "Form is Active",
        "You cannot edit a live questionnaire. Please deactivate it first to make changes.",
        [{ text: "Understood", style: "default" }]
      );
    } else {
      setShowArchive(false);
      navigation.navigate("EditEvaluationQuestionnaire", {
        questionnaireId: item.Id,
      });
    }
  };

  const activeList = questionnaires.filter((q) => q.Flag === "1");
  const archivedList = questionnaires.filter((q) => q.Flag !== "1");

  const renderCard = (item) => (
    <View key={item.Id} style={[ss.card, item.Flag === "1" ? ss.activeCardBorder : ss.inactiveCardBorder]}>
      <View style={ss.cardTop}>
        <View>
          <Text style={ss.cardTitle}>{item.Type}</Text>
          <Text style={ss.cardTimestamp}>Last updated: Just now</Text>
        </View>
        <View style={ss.badge}>
          <Text style={ss.badgeText}>{item.QuestionCount} Questions</Text>
        </View>
      </View>

      <View style={ss.divider} />

      <View style={ss.cardBottom}>
        <View style={ss.statusRow}>
          <Switch
            value={item.Flag === "1"}
            onValueChange={(value) => toggleEvaluation(item, value)}
            trackColor={{ false: "#CBD5E1", true: "#22C55E" }}
            thumbColor="#FFFFFF"
          />
          <Text style={[ss.statusLabel, { color: item.Flag === "1" ? "#166534" : "#64748B" }]}>
            {item.Flag === "1" ? "LIVE" : "DRAFT"}
          </Text>
        </View>

        <TouchableOpacity 
          activeOpacity={0.7}
          style={[ss.actionChip, item.Flag === "1" ? ss.lockedChip : ss.editChip]} 
          onPress={() => handleEdit(item)}
        >
          <Icon name={item.Flag === "1" ? "lock" : "edit-note"} size={20} color={item.Flag === "1" ? "#94A3B8" : "#1E293B"} />
          <Text style={[ss.actionText, { color: item.Flag === "1" ? "#94A3B8" : "#1E293B" }]}>
            {item.Flag === "1" ? "Locked" : "Edit"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={ss.container}>
      <StatusBar barStyle="light-content" backgroundColor="#166534" />
      
      {/* Premium Header */}
      <View style={ss.header}>
        <View style={ss.headerLeft}>
          <View style={ss.logoBg}>
            <Image source={require("../../Assets/BIIT_logo.png")} style={ss.logo} />
          </View>
          <View>
            <Text style={ss.headerTitle}>Evaluation Questionaires</Text>
            <Text style={ss.headerSub}>Quality Assurance Division</Text>
          </View>
        </View>
        <TouchableOpacity style={ss.archiveTrigger} onPress={() => setShowArchive(true)}>
            <Icon name="inventory-2" size={24} color="#166534" />
            {archivedList.length > 0 && <View style={ss.dot} />}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Action Banner */}
        <View style={ss.heroBanner}>
            <View style={{ flex: 1 }}>
                <Text style={ss.heroTitle}>Manage Forms</Text>
                <Text style={ss.heroDesc}>Create or toggle active surveys for current sessions.</Text>
            </View>
            <TouchableOpacity
                style={ss.createFab}
                onPress={() => navigation.navigate("CreateEvaluationQuestionaire")}
            >
                <Icon name="add" size={28} color="#fff" />
            </TouchableOpacity>
        </View>

        <View style={ss.sectionLabelRow}>
            <Text style={ss.sectionTitle}>ACTIVE FORMS</Text>
            <View style={ss.line} />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#166534" style={{ marginTop: 50 }} />
        ) : activeList.length > 0 ? (
          activeList.map(renderCard)
        ) : (
          <View style={ss.emptyContainer}>
            <Icon name="layers-clear" size={60} color="#E2E8F0" />
            <Text style={ss.emptyMainText}>No Live Questionnaires</Text>
            <Text style={ss.emptySubText}>Active surveys will appear here for management.</Text>
          </View>
        )}
      </ScrollView>

      {/* Modern Archive Modal */}
      <Modal
        visible={showArchive}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowArchive(false)}
      >
        <View style={ss.modalDimmer}>
          <View style={ss.modalSheet}>
            <View style={ss.dragHandle} />
            <View style={ss.modalHeader}>
              <View>
                <Text style={ss.modalTitle}>Archive Repository</Text>
                <Text style={ss.modalSub}>Drafts and inactive forms</Text>
              </View>
              <TouchableOpacity style={ss.closeBtn} onPress={() => setShowArchive(false)}>
                <Icon name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
              {archivedList.length > 0 ? (
                archivedList.map(renderCard)
              ) : (
                <View style={ss.modalEmpty}>
                    <Text style={ss.emptySubText}>Archive is currently empty.</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const ss = StyleSheet.create({
  container: { backgroundColor: "#F8FAFC", flex: 1 },
  
  // Header
  header: {
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  logoBg: { backgroundColor: "#F0FDF4", padding: 8, borderRadius: 12, marginRight: 12 },
  logo: { width: 28, height: 28, resizeMode: 'contain' },
  headerTitle: { fontWeight: "800", fontSize: 18, color: "#1E293B" },
  headerSub: { fontSize: 11, color: "#94A3B8", fontWeight: "600", textTransform: 'uppercase' },
  archiveTrigger: { padding: 10, backgroundColor: "#F1F5F9", borderRadius: 12 },
  dot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, backgroundColor: '#EF4444', borderRadius: 4, borderWidth: 2, borderColor: '#FFF' },

  // Hero Section
  heroBanner: {
    backgroundColor: "#166534",
    margin: 20,
    padding: 24,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#166534",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 10 }
  },
  heroTitle: { color: "#FFF", fontSize: 22, fontWeight: "800" },
  heroDesc: { color: "#BBF7D0", fontSize: 13, marginTop: 4, lineHeight: 18 },
  createFab: { backgroundColor: "#22C55E", padding: 12, borderRadius: 16, elevation: 4 },

  // Cards
  sectionLabelRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 25, marginBottom: 10 },
  sectionTitle: { fontSize: 12, fontWeight: "800", color: "#64748B", letterSpacing: 1.5 },
  line: { flex: 1, height: 1, backgroundColor: "#E2E8F0", marginLeft: 15 },
  
  card: {
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    elevation: 2,
  },
  activeCardBorder: { borderLeftWidth: 5, borderLeftColor: "#22C55E" },
  inactiveCardBorder: { borderLeftWidth: 5, borderLeftColor: "#94A3B8" },
  
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: 'flex-start' },
  cardTitle: { fontSize: 17, fontWeight: "700", color: "#1E293B" },
  cardTimestamp: { fontSize: 11, color: "#94A3B8", marginTop: 2 },
  badge: { backgroundColor: "#F1F5F9", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { color: "#475569", fontSize: 11, fontWeight: "700" },
  
  divider: { height: 1, backgroundColor: "#F8FAFC", marginVertical: 15 },
  
  cardBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  statusRow: { flexDirection: "row", alignItems: "center" },
  statusLabel: { fontSize: 12, fontWeight: "800", marginLeft: 8 },
  
  actionChip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  editChip: { backgroundColor: "#F1F5F9" },
  lockedChip: { backgroundColor: "#F8FAFC" },
  actionText: { fontSize: 13, fontWeight: "700", marginLeft: 6 },

  // Empty State
  emptyContainer: { alignItems: "center", marginTop: 60, paddingHorizontal: 40 },
  emptyMainText: { fontSize: 18, fontWeight: "700", color: "#475569", marginTop: 15 },
  emptySubText: { fontSize: 13, color: "#94A3B8", textAlign: "center", marginTop: 8, lineHeight: 20 },

  // Modal
  modalDimmer: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.7)", justifyContent: "flex-end" },
  modalSheet: { backgroundColor: "#F8FAFC", borderTopLeftRadius: 32, borderTopRightRadius: 32, height: "85%", paddingBottom: 20 },
  dragHandle: { width: 40, height: 4, backgroundColor: "#E2E8F0", borderRadius: 2, alignSelf: "center", marginTop: 12 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 25, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", backgroundColor: '#FFF', borderTopLeftRadius: 32, borderTopRightRadius: 32 },
  modalTitle: { fontSize: 20, fontWeight: "800", color: "#1E293B" },
  modalSub: { fontSize: 13, color: "#94A3B8" },
  closeBtn: { padding: 8, backgroundColor: "#F1F5F9", borderRadius: 12 },
  modalEmpty: { padding: 50, alignItems: 'center' }
});

export default MakeQuestionaire;