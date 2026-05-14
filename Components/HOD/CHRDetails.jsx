import React, { useEffect, useState, useMemo } from "react";
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
import { Dropdown } from "react-native-element-dropdown";
import BASE_URL from "../../API-URL/API";

// ── Colors ────────────────────────────────────────────────────────────────────
const C = {
  bg: "#f4f6f3",
  white: "#ffffff",
  border: "#e4e8e2",
  green: "#16a34a",
  greenLight: "#dcfce7",
  greenDeep: "#166534",
  amber: "#d97706",
  amberLight: "#fef3c7",
  red: "#dc2626",
  redLight: "#fee2e2",
  blue: "#2563eb",
  blueLight: "#dbeafe",
  textDark: "#111827",
  textMid: "#374151",
  textLight: "#6b7280",
  textFaint: "#9ca3af",
  surfaceAlt: "#f9fafb",
};

// ── Color helpers ─────────────────────────────────────────────────────────────
const getScoreColor = (score) => {
  if (score >= 5) return { text: C.blue, bg: C.blueLight };
  if (score >= 4) return { text: C.green, bg: C.greenLight };
  if (score >= 3) return { text: C.amber, bg: C.amberLight };
  return { text: C.red, bg: C.redLight };
};

const getLateColor = (min) => {
  if (!min || min === 0) return { text: C.textFaint, bg: "#f3f4f6" };
  if (min >= 10) return { text: C.red, bg: C.redLight };
  if (min >= 5) return { text: C.amber, bg: C.amberLight };
  return { text: "#92400e", bg: "#fef9c3" };
};

// ── Edit Modal ────────────────────────────────────────────────────────────────
const EditModal = ({ visible, row, onClose, onSave }) => {
  const [lateIn, setLateIn] = useState("");
  const [leftEarly, setLeftEarly] = useState("");
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (row) {
      setLateIn(String(row.LateIn ?? 0));
      setLeftEarly(String(row.LeftEarly ?? 0));
      setRemarks(row.Remarks ?? "");
    }
  }, [row]);

  const handleSave = async () => {
    try {
      setSaving(true);
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
          <View style={s.modalHandle} />
          <Text style={s.modalTitle}>Edit Record</Text>
          {row && (
            <Text style={s.modalSubtitle}>
              {row.TeacherName} · {row.CourseCode}
            </Text>
          )}
          <View style={s.divider} />

          <Text style={s.inputLabel}>Late In (minutes)</Text>
          <TextInput
            style={s.input}
            value={lateIn}
            onChangeText={setLateIn}
            keyboardType="numeric"
          />

          <Text style={s.inputLabel}>Left Early (minutes)</Text>
          <TextInput
            style={s.input}
            value={leftEarly}
            onChangeText={setLeftEarly}
            keyboardType="numeric"
          />

          <Text style={s.inputLabel}>Remarks</Text>
          <TextInput
            style={[s.input, { height: 80, textAlignVertical: "top" }]}
            value={remarks}
            onChangeText={setRemarks}
            multiline
          />

          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity
              style={[s.btn, { flex: 1, borderWidth: 1, borderColor: C.border }]}
              onPress={onClose}
            >
              <Text style={{ fontWeight: "700", color: C.textMid }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.btn, { flex: 1, backgroundColor: C.green }]}
              onPress={handleSave}
            >
              {saving ? (
                <ActivityIndicator color={C.white} />
              ) : (
                <Text style={{ fontWeight: "700", color: C.white }}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ── Dropdown Picker (react-native-element-dropdown) ──────────────────────────
// Converts a plain string[] into the { label, value } format the library expects
const DropdownPicker = ({ label, icon, iconColor, value, options, onChange }) => {
  const data = [
    { label: "All", value: "" },
    ...options.map((o) => ({ label: o, value: o })),
  ];

  return (
    <Dropdown
      data={data}
      labelField="label"
      valueField="value"
      placeholder={label}
      value={value || ""}
      onChange={(item) => onChange(item.value)}
      style={[s.dropdown, value ? { borderColor: iconColor, borderWidth: 1.5 } : null]}
      placeholderStyle={s.dropdownPlaceholder}
      selectedTextStyle={[s.dropdownSelected, { color: C.textDark }]}
      itemTextStyle={s.dropdownItemText}
      activeColor={C.greenLight}
      renderLeftIcon={() => (
        <Icon
          name={icon}
          size={15}
          color={value ? iconColor : C.textFaint}
          style={{ marginRight: 8 }}
        />
      )}
    />
  );
};

// ── Filter Panel ──────────────────────────────────────────────────────────────
const FilterPanel = ({
  teachers,
  courses,
  teacher,
  course,
  onTeacherChange,
  onCourseChange,
  onReset,
}) => {
  const [open, setOpen] = useState(false);
  const activeCount = [teacher, course].filter(Boolean).length;

  return (
    <View style={s.filterCard}>
      {/* Toggle row */}
      <TouchableOpacity
        style={s.filterToggleRow}
        onPress={() => setOpen((prev) => !prev)}
        activeOpacity={0.7}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Icon name="filter-list" size={18} color={C.green} />
          <Text style={s.filterToggleText}>Filters</Text>
          {activeCount > 0 && (
            <View style={s.filterBadge}>
              <Text style={s.filterBadgeText}>{activeCount}</Text>
            </View>
          )}
        </View>
        <Icon
          name={open ? "keyboard-arrow-up" : "keyboard-arrow-down"}
          size={20}
          color={C.textLight}
        />
      </TouchableOpacity>

      {/* Active chips — tap to remove individually */}
      {!open && activeCount > 0 && (
        <View style={s.chipRow}>
          {teacher ? (
            <TouchableOpacity style={s.chip} onPress={() => onTeacherChange("")}>
              <Icon name="person" size={11} color={C.greenDeep} />
              <Text style={s.chipText}>{teacher}</Text>
              <Icon name="close" size={11} color={C.greenDeep} />
            </TouchableOpacity>
          ) : null}
          {course ? (
            <TouchableOpacity
              style={[s.chip, { backgroundColor: C.blueLight }]}
              onPress={() => onCourseChange("")}
            >
              <Icon name="book" size={11} color={C.blue} />
              <Text style={[s.chipText, { color: C.blue }]}>{course}</Text>
              <Icon name="close" size={11} color={C.blue} />
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity onPress={onReset}>
            <Text style={{ color: C.red, fontSize: 12, fontWeight: "700" }}>Clear all</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Expanded dropdowns — selecting immediately filters the list */}
      {open && (
        <View style={{ marginTop: 12, gap: 10 }}>
          <DropdownPicker
            label="Select Teacher"
            icon="person"
            iconColor={C.green}
            value={teacher}
            options={teachers}
            onChange={onTeacherChange}
          />
          <DropdownPicker
            label="Select Course"
            icon="book"
            iconColor={C.blue}
            value={course}
            options={courses}
            onChange={onCourseChange}
          />
          {activeCount > 0 && (
            <TouchableOpacity
              style={[s.btn, { backgroundColor: C.redLight }]}
              onPress={() => { onReset(); setOpen(false); }}
            >
              <Text style={{ color: C.red, fontWeight: "700" }}>Clear Filters</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

// ── Teacher Card ──────────────────────────────────────────────────────────────
const TeacherCard = ({ item, onEdit, onDelete }) => {
  const scoreColors = getScoreColor(item.Score);
  const lateInColors = getLateColor(item.LateIn);
  const leftEarlyColors = getLateColor(item.LeftEarly);
  const isActive = item.Status !== "Cancelled";

  return (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>
            {item.TeacherName?.[0]?.toUpperCase() ?? "T"}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.teacherName}>{item.TeacherName}</Text>
          <Text style={s.teacherId}>{item.TeacherID}</Text>
        </View>
        <View style={[s.statusPill, { backgroundColor: isActive ? C.greenLight : C.redLight }]}>
          <View style={[s.statusDot, { backgroundColor: isActive ? C.green : C.red }]} />
          <Text style={[s.statusText, { color: isActive ? C.green : C.red }]}>
            {item.Status}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: 6, marginTop: 10 }}>
        <View style={s.tag}>
          <Icon name="book" size={12} color={C.green} />
          <Text style={[s.tagText, { color: C.green }]}>{item.CourseCode}</Text>
        </View>
        <View style={s.tag}>
          <Icon name="location-on" size={12} color={C.textLight} />
          <Text style={s.tagText}>{item.Venue || "—"}</Text>
        </View>
      </View>

      <View style={s.divider} />

      <View style={{ flexDirection: "row" }}>
        <View style={s.metric}>
          <Text style={s.metricLabel}>LATE IN</Text>
          <View style={[s.badge, { backgroundColor: lateInColors.bg }]}>
            <Text style={[s.badgeText, { color: lateInColors.text }]}>{item.LateIn ?? 0}</Text>
          </View>
        </View>
        <View style={s.metricSep} />
        <View style={s.metric}>
          <Text style={s.metricLabel}>LEFT EARLY</Text>
          <View style={[s.badge, { backgroundColor: leftEarlyColors.bg }]}>
            <Text style={[s.badgeText, { color: leftEarlyColors.text }]}>{item.LeftEarly ?? 0}</Text>
          </View>
        </View>
        <View style={s.metricSep} />
        <View style={s.metric}>
          <Text style={s.metricLabel}>SCORE</Text>
          <View style={[s.scoreBadge, { backgroundColor: scoreColors.bg }]}>
            <Icon name="star" size={11} color={scoreColors.text} />
            <Text style={[s.badgeText, { color: scoreColors.text, marginLeft: 4 }]}>
              {item.Score}/5
            </Text>
          </View>
        </View>
      </View>

      {item.Remarks ? (
        <View style={{ flexDirection: "row", marginTop: 10, alignItems: "flex-start" }}>
          <Icon name="notes" size={13} color={C.textFaint} style={{ marginRight: 5, marginTop: 1 }} />
          <Text style={{ flex: 1, fontSize: 12, color: C.textMid }}>{item.Remarks}</Text>
        </View>
      ) : null}

      <View style={s.divider} />

      <View style={{ flexDirection: "row", gap: 10 }}>
        <TouchableOpacity
          style={[s.actionBtn, { backgroundColor: C.blueLight }]}
          onPress={() => onEdit(item)}
        >
          <Icon name="edit" size={14} color={C.blue} />
          <Text style={[s.actionBtnText, { color: C.blue }]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.actionBtn, { backgroundColor: C.redLight }]}
          onPress={() => onDelete(item.id)}
        >
          <Icon name="delete-outline" size={14} color={C.red} />
          <Text style={[s.actionBtnText, { color: C.red }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ── Main Screen ───────────────────────────────────────────────────────────────
const CHRDetail = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { reportId } = route.params;

  // allRecords = full data from backend, never mutated by filters
  const [allRecords, setAllRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editRow, setEditRow] = useState(null);
  const [editVisible, setEditVisible] = useState(false);

  // Filter state
  const [teacherFilter, setTeacherFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");

  useEffect(() => {
    fetchDetail();
  }, []);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/CHR/GetReportById/${reportId}`);
      const data = await res.json();
      setAllRecords(Array.isArray(data) ? data : []);
    } catch {
      Alert.alert("Error", "Failed to load report details");
    } finally {
      setLoading(false);
    }
  };

  // Build unique sorted dropdown options from the loaded data
  const teachers = useMemo(
    () => [...new Set(allRecords.map((r) => r.TeacherName).filter(Boolean))].sort(),
    [allRecords]
  );
  const courses = useMemo(
    () => [...new Set(allRecords.map((r) => r.CourseCode).filter(Boolean))].sort(),
    [allRecords]
  );

  // Filter in memory — instant, no API call needed
  const records = useMemo(() => {
    return allRecords.filter((r) => {
      const matchTeacher = !teacherFilter || r.TeacherName === teacherFilter;
      const matchCourse = !courseFilter || r.CourseCode === courseFilter;
      return matchTeacher && matchCourse;
    });
  }, [allRecords, teacherFilter, courseFilter]);

  const handleSaved = (id, updated) => {
    setAllRecords((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              LateIn: updated.LateIn ?? r.LateIn,
              LeftEarly: updated.LeftEarly ?? r.LeftEarly,
              Remarks: updated.Remarks ?? r.Remarks,
              Score: updated.Score,
              Status: updated.Status,
            }
          : r
      )
    );
    setEditVisible(false);
  };

  const handleDelete = (id) => {
    Alert.alert("Delete Record", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await fetch(`${BASE_URL}/CHR/DeleteRow/${id}`, { method: "DELETE" });
            setAllRecords((prev) => prev.filter((r) => r.id !== id));
          } catch {
            Alert.alert("Error", "Failed to delete record");
          }
        },
      },
    ]);
  };

  // Stats are computed on filtered records, so they update instantly too
  const total = records.length;
  const cancelled = records.filter((r) => r.Status === "Cancelled").length;
  const late = records.filter((r) => (r.LateIn ?? 0) > 0).length;
  const avgScore = total
    ? (records.reduce((sum, r) => sum + (r.Score ?? 0), 0) / total).toFixed(1)
    : "0";

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 10 }}>
          <Icon name="arrow-back" size={20} color={C.green} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>CHR Detail</Text>
          <Text style={{ color: C.textFaint, fontSize: 12 }}>Detailed Report</Text>
        </View>
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={C.green} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 14 }}>

          {/* Filter Panel */}
          <FilterPanel
            teachers={teachers}
            courses={courses}
            teacher={teacherFilter}
            course={courseFilter}
            onTeacherChange={setTeacherFilter}
            onCourseChange={setCourseFilter}
            onReset={() => { setTeacherFilter(""); setCourseFilter(""); }}
          />

          {/* Summary — updates instantly with filters */}
          <View style={s.summaryRow}>
            {[
              { label: "Total", value: total, color: C.textDark },
              { label: "Cancelled", value: cancelled, color: C.red },
              { label: "Late", value: late, color: C.amber },
              { label: "Avg Score", value: avgScore, color: C.green },
            ].map((stat) => (
              <View key={stat.label} style={s.summaryCard}>
                <Text style={[s.summaryVal, { color: stat.color }]}>{stat.value}</Text>
                <Text style={s.summaryLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Records */}
          {records.length === 0 ? (
            <View style={[s.center, { paddingVertical: 50 }]}>
              <Text style={{ fontSize: 16, fontWeight: "700", color: C.textMid }}>
                No Records Found
              </Text>
            </View>
          ) : (
            records.map((item) => (
              <TeacherCard
                key={item.id}
                item={item}
                onEdit={(row) => { setEditRow(row); setEditVisible(true); }}
                onDelete={handleDelete}
              />
            ))
          )}
        </ScrollView>
      )}

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
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: C.white,
  },
  headerTitle: { fontSize: 18, fontWeight: "800", color: C.textDark },

  // Filter card
  filterCard: {
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  filterToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  filterToggleText: { fontSize: 15, fontWeight: "700", color: C.textDark },
  filterBadge: {
    backgroundColor: C.green,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 1,
  },
  filterBadgeText: { color: C.white, fontSize: 11, fontWeight: "700" },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
    alignItems: "center",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.greenLight,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  chipText: { fontSize: 12, fontWeight: "600", color: C.greenDeep },

  // react-native-element-dropdown styles
  dropdown: {
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    height: 48,
  },
  dropdownPlaceholder: { fontSize: 14, color: C.textFaint },
  dropdownSelected: { fontSize: 14 },
  dropdownItemText: { fontSize: 14, color: C.textMid },

  // Summary
  summaryRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  summaryCard: {
    flex: 1,
    backgroundColor: C.white,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  summaryVal: { fontSize: 20, fontWeight: "800" },
  summaryLabel: { fontSize: 11, color: C.textFaint },

  // Card
  card: {
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  cardHeader: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: C.greenLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarText: { color: C.greenDeep, fontWeight: "800", fontSize: 16 },
  teacherName: { fontWeight: "700", color: C.textDark },
  teacherId: { color: C.textFaint, fontSize: 12 },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  statusText: { fontWeight: "700", fontSize: 12 },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surfaceAlt,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    gap: 4,
  },
  tagText: { fontSize: 12, color: C.textLight },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 12 },
  metric: { flex: 1, alignItems: "center" },
  metricLabel: { fontSize: 10, color: C.textFaint, marginBottom: 6 },
  metricSep: { width: 1, backgroundColor: C.border },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { fontWeight: "800", fontSize: 13 },
  scoreBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  actionBtnText: { fontWeight: "700", fontSize: 13 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: C.white,
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    alignSelf: "center",
    marginBottom: 14,
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: C.textDark },
  modalSubtitle: { color: C.textLight, marginBottom: 14 },
  inputLabel: { fontWeight: "700", marginBottom: 5, color: C.textMid },
  input: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 14,
    color: C.textDark,
  },
  btn: {
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: 12,
    justifyContent: "center",
  },
});