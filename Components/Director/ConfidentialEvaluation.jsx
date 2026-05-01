import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import Icon from "react-native-vector-icons/MaterialIcons";
import BASE_URL from "../../API-URL/API";

const ConfidentialEvaluation = () => {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingEmails, setLoadingEmails] = useState(true);

  // =========================
  // LOAD EMAILS
  // =========================
  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    try {
      const res = await fetch(`${BASE_URL}/email/getall`);
      const data = await res.json();
      setEmails(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingEmails(false);
    }
  };

  // =========================
  // FETCH EVALUATIONS
  // =========================
  const fetchEvaluations = async () => {
    if (!selectedEmail) return;

    try {
      setLoading(true);

      const res = await fetch(`${BASE_URL}/Confidential/get-evaluations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mail: selectedEmail.mail,
        }),
      });

      const data = await res.json();
      console.log("API RESPONSE:", data);
      setEvaluations(data.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // CARD RENDER
  // =========================
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.subjectBadge}>
          <Icon name="menu-book" size={16} color="#fff" />
          <Text style={styles.subjectCode}>{item.subjectCode}</Text>
        </View>
        <View style={styles.sessionBadge}>
          <Icon name="event" size={12} color="#16a34a" />
          <Text style={styles.sessionText}>{item.session}</Text>
        </View>
      </View>

      {/* Info Rows */}
      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <View style={styles.iconCircle}>
            <Icon name="school" size={15} color="#16a34a" />
          </View>
          <View>
            <Text style={styles.infoLabel}>Student</Text>
            <Text style={styles.infoValue}>
              {item.studentName}{" "}
              <Text style={styles.infoId}>({item.studentId})</Text>
            </Text>
          </View>
        </View>

        <View style={styles.dividerDot} />

        <View style={styles.infoRow}>
          <View style={styles.iconCircle}>
            <Icon name="person" size={15} color="#2563eb" />
          </View>
          <View>
            <Text style={styles.infoLabel}>Teacher</Text>
            <Text style={styles.infoValue}>
              {item.teacherName}{" "}
              <Text style={styles.infoId}>({item.teacherId})</Text>
            </Text>
          </View>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.cardDivider} />

      {/* Evaluation Q&A */}
      <Text style={styles.evalTitle}>
        <Icon name="bar-chart" size={13} color="#64748b" /> Evaluation Scores
      </Text>
      {item.evaluation?.map((q, i) => (
        <View key={i} style={styles.qaRow}>
          <Text style={styles.qaText} numberOfLines={2}>
            {q.questionText}
          </Text>
          <View style={styles.scorePill}>
            <Icon name="star" size={12} color="#f59e0b" />
            <Text style={styles.scoreText}>{q.score}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* HEADER BANNER */}
      <View style={styles.heroBanner}>
        <View style={styles.heroIconWrap}>
          <Icon name="lock" size={22} color="#16a34a" />
        </View>
        <View>
          <Text style={styles.heroTitle}>Confidential</Text>
          <Text style={styles.heroSubtitle}>Evaluation Records</Text>
        </View>
      </View>

      {/* SELECTOR CARD */}
      <View style={styles.selectorCard}>
        <Text style={styles.selectorLabel}>
          <Icon name="email" size={13} color="#64748b" /> Select Email Address
        </Text>

        {loadingEmails ? (
          <ActivityIndicator size="large" color="#16a34a" style={{ marginTop: 10 }} />
        ) : (
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.placeholder}
            selectedTextStyle={styles.selectedText}
            containerStyle={styles.dropdownContainer}
            itemTextStyle={styles.dropdownItemText}
            data={emails}
            labelField="mail"
            valueField="mail"
            placeholder="Choose an email..."
            value={selectedEmail?.mail}
            onChange={(item) => setSelectedEmail(item)}
            renderLeftIcon={() => (
              <Icon
                name="alternate-email"
                size={18}
                color="#16a34a"
                style={{ marginRight: 8 }}
              />
            )}
          />
        )}

        {/* BUTTON */}
        <TouchableOpacity
          style={[styles.button, !selectedEmail && styles.buttonDisabled]}
          onPress={fetchEvaluations}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Icon name="search" size={18} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.buttonText}>Load Evaluations</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* RESULTS COUNT */}
      {evaluations.length > 0 && (
        <View style={styles.resultsHeader}>
          <Icon name="assessment" size={15} color="#16a34a" />
          <Text style={styles.resultsText}>
            {evaluations.length} record{evaluations.length > 1 ? "s" : ""} found
          </Text>
        </View>
      )}

      {/* LIST */}
      <FlatList
        data={evaluations}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyState}>
              <Icon name="inbox" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>No evaluations to display</Text>
              <Text style={styles.emptyHint}>Select an email and tap Load</Text>
            </View>
          )
        }
      />
    </View>
  );
};

export default ConfidentialEvaluation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f8",
  },

  // ── HERO BANNER ──────────────────────────────────
  heroBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 22,
    gap: 14,
  },
  heroIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(22,163,74,0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(22,163,74,0.3)",
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#f8fafc",
    letterSpacing: 0.3,
  },
  heroSubtitle: {
    fontSize: 13,
    color: "#94a3b8",
    marginTop: 1,
    fontWeight: "500",
  },

  // ── SELECTOR CARD ─────────────────────────────────
  selectorCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: -6,
    borderRadius: 18,
    padding: 18,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
    marginBottom: 12,
  },
  selectorLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  dropdown: {
    height: 50,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
  },
  dropdownContainer: {
    borderRadius: 12,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  placeholder: {
    color: "#94a3b8",
    fontSize: 14,
  },
  selectedText: {
    color: "#0f172a",
    fontSize: 14,
    fontWeight: "600",
  },
  dropdownItemText: {
    fontSize: 14,
    color: "#1e293b",
  },
  button: {
    backgroundColor: "#16a34a",
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#16a34a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: "#86efac",
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.3,
  },

  // ── RESULTS HEADER ────────────────────────────────
  resultsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  resultsText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },

  // ── LIST ──────────────────────────────────────────
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },

  // ── CARD ──────────────────────────────────────────
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  subjectBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
  },
  subjectCode: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 13,
    letterSpacing: 0.5,
  },
  sessionBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  sessionText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#16a34a",
  },

  // ── INFO SECTION ──────────────────────────────────
  infoSection: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
    gap: 10,
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  infoLabel: {
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 13,
    color: "#1e293b",
    fontWeight: "700",
    marginTop: 1,
  },
  infoId: {
    color: "#64748b",
    fontWeight: "400",
  },
  dividerDot: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginLeft: 44,
  },

  // ── EVALUATIONS ───────────────────────────────────
  cardDivider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginBottom: 12,
  },
  evalTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  qaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    gap: 10,
  },
  qaText: {
    flex: 1,
    fontSize: 13,
    color: "#334155",
    lineHeight: 18,
    fontWeight: "500",
  },
  scorePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fffbeb",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 3,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  scoreText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#b45309",
  },

  // ── EMPTY STATE ───────────────────────────────────
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#94a3b8",
    marginTop: 8,
  },
  emptyHint: {
    fontSize: 13,
    color: "#cbd5e1",
    fontWeight: "500",
  },
});
