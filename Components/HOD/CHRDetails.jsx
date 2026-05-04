import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import BASE_URL from "../../API-URL/API";

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  bg:          "#f4f6f3",
  surface:     "#ffffff",
  surfaceAlt:  "#f9fafb",
  border:      "#e4e8e2",
  green:       "#16a34a",
  greenLight:  "#dcfce7",
  greenDeep:   "#166534",
  amber:       "#d97706",
  amberLight:  "#fef3c7",
  red:         "#dc2626",
  redLight:    "#fee2e2",
  blue:        "#2563eb",
  blueLight:   "#dbeafe",
  slate:       "#64748b",
  textDark:    "#111827",
  textMid:     "#374151",
  textLight:   "#6b7280",
  textFaint:   "#9ca3af",
  white:       "#ffffff",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const scoreColor = (score) => {
  if (score >= 5) return C.blue;
  if (score >= 4) return C.green;
  if (score >= 3) return C.amber;
  return C.red;
};
const scoreBg = (score) => {
  if (score >= 5) return C.blueLight;
  if (score >= 4) return C.greenLight;
  if (score >= 3) return C.amberLight;
  return C.redLight;
};
const statusColor = (status) =>
  status === "Cancelled" ? C.red : C.green;
const statusBg = (status) =>
  status === "Cancelled" ? C.redLight : C.greenLight;

const lateColor = (min) => {
  if (!min || min === 0) return { bg: "#f3f4f6", text: C.textFaint };
  if (min >= 10) return { bg: C.redLight, text: C.red };
  if (min >= 5)  return { bg: C.amberLight, text: C.amber };
  return { bg: "#fef9c3", text: "#92400e" };
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return dateStr; }
};

// ── Sub-components ────────────────────────────────────────────────────────────

const StatChip = ({ label, value, color, bg }) => (
  <View style={[s.statChip, { backgroundColor: bg }]}>
    <Text style={[s.statChipVal, { color }]}>{value}</Text>
    <Text style={[s.statChipLabel, { color }]}>{label}</Text>
  </View>
);

const MinuteBadge = ({ value }) => {
  const { bg, text } = lateColor(value);
  return (
    <View style={[s.minuteBadge, { backgroundColor: bg }]}>
      <Text style={[s.minuteBadgeText, { color: text }]}>
        {value ?? 0}
      </Text>
    </View>
  );
};

const ScoreBadge = ({ score }) => (
  <View style={[s.scoreBadge, { backgroundColor: scoreBg(score) }]}>
    <Icon name="star" size={11} color={scoreColor(score)} />
    <Text style={[s.scoreBadgeText, { color: scoreColor(score) }]}>
      {score}/5
    </Text>
  </View>
);

const StatusPill = ({ status }) => (
  <View style={[s.statusPill, { backgroundColor: statusBg(status) }]}>
    <View style={[s.statusDot, { backgroundColor: statusColor(status) }]} />
    <Text style={[s.statusText, { color: statusColor(status) }]}>{status}</Text>
  </View>
);

// ── Edit Modal ────────────────────────────────────────────────────────────────
const EditModal = ({ visible, row, onClose, onSave }) => {
  const [lateIn, setLateIn]       = useState("");
  const [leftEarly, setLeftEarly] = useState("");
  const [remarks, setRemarks]     = useState("");
  const [saving, setSaving]       = useState(false);

  useEffect(() => {
    if (row) {
      setLateIn(String(row.LateIn ?? 0));
      setLeftEarly(String(row.LeftEarly ?? 0));
      setRemarks(row.Remarks ?? "");
    }
  }, [row]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/CHR/EditRow/${row.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          LateIn: parseInt(lateIn) || 0,
          LeftEarly: parseInt(leftEarly) || 0,
          Remarks: remarks,
        }),
      });
      const data = await res.json();
      onSave(row.id, data);
    } catch {
      Alert.alert("Error", "Failed to update record");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={s.modalOverlay}>
        <View style={s.modalSheet}>
          {/* Handle */}
          <View style={s.modalHandle} />

          <Text style={s.modalTitle}>Edit Record</Text>
          {row && (
            <Text style={s.modalSubtitle}>
              {row.TeacherName} · {row.CourseCode}
            </Text>
          )}

          <View style={s.modalDivider} />

          <Text style={s.inputLabel}>Late In (minutes)</Text>
          <TextInput
            style={s.input}
            value={lateIn}
            onChangeText={setLateIn}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={C.textFaint}
          />

          <Text style={s.inputLabel}>Left Early (minutes)</Text>
          <TextInput
            style={s.input}
            value={leftEarly}
            onChangeText={setLeftEarly}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={C.textFaint}
          />

          <Text style={s.inputLabel}>Remarks</Text>
          <TextInput
            style={[s.input, s.inputMulti]}
            value={remarks}
            onChangeText={setRemarks}
            multiline
            numberOfLines={3}
            placeholder="Add remarks..."
            placeholderTextColor={C.textFaint}
          />

          <View style={s.modalActions}>
            <TouchableOpacity style={s.modalCancelBtn} onPress={onClose}>
              <Text style={s.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.modalSaveBtn}
              onPress={handleSave}
              disabled={saving}
            >
              {saving
                ? <ActivityIndicator size="small" color={C.white} />
                : <Text style={s.modalSaveText}>Save Changes</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ── Teacher Row Card ──────────────────────────────────────────────────────────
const TeacherCard = ({ item, onEdit, onDelete }) => (
  <View style={s.card}>
    {/* Top row: teacher info + status */}
    <View style={s.cardHeader}>
      <View style={s.avatarBox}>
        <Text style={s.avatarText}>
          {item.TeacherName?.[0]?.toUpperCase() ?? "T"}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.teacherName}>{item.TeacherName}</Text>
        <Text style={s.teacherId}>{item.TeacherID}</Text>
      </View>
      <StatusPill status={item.Status} />
    </View>

    {/* Course + Venue */}
    <View style={s.courseRow}>
      <View style={s.courseTag}>
        <Icon name="book" size={12} color={C.green} />
        <Text style={s.courseText}>{item.CourseCode}</Text>
      </View>
      <View style={s.courseTag}>
        <Icon name="location-on" size={12} color={C.slate} />
        <Text style={[s.courseText, { color: C.slate }]}>{item.Venue || "—"}</Text>
      </View>
      <View style={s.courseTag}>
        <Icon name="business" size={12} color={C.slate} />
        <Text style={[s.courseText, { color: C.slate }]}>{item.Discipline || "—"}</Text>
      </View>
    </View>

    <View style={s.cardDivider} />

    {/* Metrics row */}
    <View style={s.metricsRow}>
      <View style={s.metric}>
        <Text style={s.metricLabel}>LATE IN</Text>
        <MinuteBadge value={item.LateIn} />
      </View>
      <View style={s.metricSep} />
      <View style={s.metric}>
        <Text style={s.metricLabel}>LEFT EARLY</Text>
        <MinuteBadge value={item.LeftEarly} />
      </View>
      <View style={s.metricSep} />
      <View style={s.metric}>
        <Text style={s.metricLabel}>SCORE</Text>
        <ScoreBadge score={item.Score} />
      </View>
    </View>

    {/* Remarks */}
    {item.Remarks ? (
      <View style={s.remarksRow}>
        <Icon name="notes" size={13} color={C.textFaint} style={{ marginRight: 5 }} />
        <Text style={s.remarksText}>{item.Remarks}</Text>
      </View>
    ) : null}

    <View style={s.cardDivider} />

    {/* Actions */}
    <View style={s.actionRow}>
      <TouchableOpacity style={s.editBtn} onPress={() => onEdit(item)}>
        <Icon name="edit" size={14} color={C.blue} />
        <Text style={s.editBtnText}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.deleteBtn} onPress={() => onDelete(item.id)}>
        <Icon name="delete-outline" size={14} color={C.red} />
        <Text style={s.deleteBtnText}>Delete</Text>
      </TouchableOpacity>
    </View>
  </View>
);

// ── Main Screen ───────────────────────────────────────────────────────────────
const CHRDetail = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { reportId, sessionID } = route.params;

  const [records, setRecords]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [editVisible, setEditVisible] = useState(false);
  const [editRow, setEditRow]       = useState(null);

  useEffect(() => {
    fetchDetail();
  }, []);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/CHR/GetReportById/${reportId}`);
      const data = await res.json();
      setRecords(Array.isArray(data) ? data : []);
    } catch {
      Alert.alert("Error", "Failed to load report details");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (row) => {
    setEditRow(row);
    setEditVisible(true);
  };

  const handleSaved = (id, updated) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, LateIn: updated.LateIn ?? r.LateIn,
                     LeftEarly: updated.LeftEarly ?? r.LeftEarly,
                     Remarks: updated.Remarks ?? r.Remarks,
                     Score: updated.Score,
                     Status: updated.Status }
          : r
      )
    );
    setEditVisible(false);
  };

  const handleDelete = (id) => {
    Alert.alert("Delete Record", "Are you sure you want to delete this record?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await fetch(`${BASE_URL}/CHR/DeleteRow/${id}`, { method: "DELETE" });
            setRecords((prev) => prev.filter((r) => r.id !== id));
          } catch {
            Alert.alert("Error", "Failed to delete record");
          }
        },
      },
    ]);
  };

  // ── Summary stats
  const total     = records.length;
  const cancelled = records.filter((r) => r.Status === "Cancelled").length;
  const late      = records.filter((r) => (r.LateIn ?? 0) > 0).length;
  const avgScore  = total
    ? (records.reduce((sum, r) => sum + (r.Score ?? 0), 0) / total).toFixed(1)
    : "0";
  const reportDate = records[0]?.ClassDate ? formatDate(records[0].ClassDate) : "";

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Icon name="arrow-back" size={20} color={C.green} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>CHR Detail</Text>
          <Text style={s.headerSub}>HOD Dashboard — Detailed Report</Text>
        </View>
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={C.green} />
          <Text style={s.loadingText}>Loading records…</Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── REPORT BANNER ────────────────────────────────────────────── */}
          <View style={s.banner}>
            <View style={s.bannerLeft}>
              <Text style={s.bannerTitle}>Detailed Attendance Report</Text>
              {reportDate ? (
                <View style={s.bannerDateRow}>
                  <Icon name="event" size={13} color={C.green} />
                  <Text style={s.bannerDate}>{reportDate}</Text>
                </View>
              ) : null}
            </View>
            <View style={s.bannerStats}>
              <StatChip label="records" value={total}     color={C.slate}  bg="#f1f5f9" />
              {cancelled > 0 && (
                <StatChip label="cancelled" value={cancelled} color={C.red}   bg={C.redLight} />
              )}
            </View>
          </View>

          {/* ── SUMMARY ROW ──────────────────────────────────────────────── */}
          <View style={s.summaryRow}>
            <View style={s.summaryCard}>
              <Text style={s.summaryVal}>{total}</Text>
              <Text style={s.summaryLabel}>Total</Text>
            </View>
            <View style={s.summaryCard}>
              <Text style={[s.summaryVal, { color: C.red }]}>{cancelled}</Text>
              <Text style={s.summaryLabel}>Cancelled</Text>
            </View>
            <View style={s.summaryCard}>
              <Text style={[s.summaryVal, { color: C.amber }]}>{late}</Text>
              <Text style={s.summaryLabel}>Late</Text>
            </View>
            <View style={s.summaryCard}>
              <Text style={[s.summaryVal, { color: C.green }]}>{avgScore}</Text>
              <Text style={s.summaryLabel}>Avg Score</Text>
            </View>
          </View>

          {/* ── RECORDS ──────────────────────────────────────────────────── */}
          {records.length === 0 ? (
            <View style={s.empty}>
              <Icon name="inbox" size={44} color={C.border} />
              <Text style={s.emptyTitle}>No Records Found</Text>
              <Text style={s.emptyText}>This batch appears to be empty.</Text>
            </View>
          ) : (
            records.map((item) => (
              <TeacherCard
                key={item.id}
                item={item}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* ── EDIT MODAL ───────────────────────────────────────────────────── */}
      <EditModal
        visible={editVisible}
        row={editRow}
        onClose={() => setEditVisible(false)}
        onSave={handleSaved}
      />
    </View>
  );
};

export default CHRDetail;

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 60 },
  loadingText: { color: C.textLight, marginTop: 10, fontSize: 13 },
  scrollContent: { padding: 14 },

  // HEADER
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.greenLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerTitle: {
    color: C.textDark,
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  headerSub: {
    color: C.textFaint,
    fontSize: 11,
    marginTop: 1,
  },

  // BANNER
  banner: {
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  bannerLeft: { flex: 1, marginRight: 10 },
  bannerTitle: {
    color: C.textDark,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: -0.2,
    marginBottom: 6,
  },
  bannerDateRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  bannerDate: { color: C.green, fontSize: 12, fontWeight: "600", marginLeft: 4 },
  bannerStats: { flexDirection: "row", gap: 6, alignItems: "flex-start" },

  // STAT CHIP
  statChip: {
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 60,
  },
  statChipVal: { fontSize: 16, fontWeight: "800" },
  statChipLabel: { fontSize: 10, fontWeight: "600", marginTop: 1, opacity: 0.8 },

  // SUMMARY ROW
  summaryRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 12,
    alignItems: "center",
  },
  summaryVal: {
    fontSize: 20,
    fontWeight: "900",
    color: C.textDark,
    letterSpacing: -0.5,
  },
  summaryLabel: {
    fontSize: 10,
    color: C.textFaint,
    fontWeight: "600",
    marginTop: 2,
    letterSpacing: 0.3,
  },

  // TEACHER CARD
  card: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    paddingBottom: 10,
  },
  avatarBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.greenLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarText: {
    color: C.greenDeep,
    fontSize: 16,
    fontWeight: "800",
  },
  teacherName: {
    color: C.textDark,
    fontSize: 14,
    fontWeight: "700",
  },
  teacherId: {
    color: C.textFaint,
    fontSize: 12,
    marginTop: 1,
  },

  // COURSE ROW
  courseRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  courseTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surfaceAlt,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  courseText: {
    fontSize: 12,
    fontWeight: "600",
    color: C.green,
    marginLeft: 3,
  },

  cardDivider: { height: 1, backgroundColor: C.border, marginHorizontal: 14 },

  // METRICS
  metricsRow: {
    flexDirection: "row",
    padding: 14,
    paddingVertical: 12,
  },
  metric: { flex: 1, alignItems: "center" },
  metricLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: C.textFaint,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  metricSep: { width: 1, backgroundColor: C.border, marginVertical: 4 },

  // MINUTE BADGE
  minuteBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  minuteBadgeText: { fontSize: 15, fontWeight: "800" },

  // SCORE BADGE
  scoreBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    gap: 3,
  },
  scoreBadgeText: { fontSize: 12, fontWeight: "800", marginLeft: 2 },

  // STATUS PILL
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 5,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontWeight: "700" },

  // REMARKS
  remarksRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  remarksText: {
    color: C.textMid,
    fontSize: 12,
    fontStyle: "italic",
    flex: 1,
  },

  // ACTIONS
  actionRow: {
    flexDirection: "row",
    padding: 12,
    gap: 8,
  },
  editBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.blueLight,
    borderRadius: 8,
    paddingVertical: 9,
    gap: 5,
  },
  editBtnText: { color: C.blue, fontSize: 13, fontWeight: "700" },
  deleteBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.redLight,
    borderRadius: 8,
    paddingVertical: 9,
    gap: 5,
  },
  deleteBtnText: { color: C.red, fontSize: 13, fontWeight: "700" },

  // EMPTY
  empty: { alignItems: "center", paddingVertical: 60 },
  emptyTitle: { color: C.textMid, fontSize: 16, fontWeight: "700", marginTop: 12 },
  emptyText: { color: C.textFaint, fontSize: 13, marginTop: 4 },

  // MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: C.border,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalTitle: {
    color: C.textDark,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    color: C.textLight,
    fontSize: 13,
    marginTop: 3,
    marginBottom: 14,
  },
  modalDivider: { height: 1, backgroundColor: C.border, marginBottom: 16 },

  inputLabel: {
    color: C.textMid,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: C.textDark,
    marginBottom: 14,
  },
  inputMulti: { height: 80, textAlignVertical: "top" },

  modalActions: { flexDirection: "row", gap: 10, marginTop: 4 },
  modalCancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
  },
  modalCancelText: { color: C.textMid, fontWeight: "700", fontSize: 14 },
  modalSaveBtn: {
    flex: 2,
    backgroundColor: C.green,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
    shadowColor: C.green,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  modalSaveText: { color: C.white, fontWeight: "800", fontSize: 14 },
});
