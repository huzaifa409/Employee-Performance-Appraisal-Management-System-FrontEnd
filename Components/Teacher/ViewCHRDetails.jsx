import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const ViewCHRDetails = ({ navigation }) => {
  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#2e7d32" />
        </TouchableOpacity>

        <View>
          <Text style={styles.title}>CHR Details</Text>
          <Text style={styles.subtitle}>24 Nov 2025</Text>
        </View>

        <View style={styles.logoCircle}>
          <Text style={{color:"#2e7d32", fontWeight:"bold"}}>U</Text>
        </View>
      </View>

      {/* PURPLE BANNER */}
      <View style={styles.banner}>
        <Text style={styles.bannerText}>
          Detailed class records for the selected date.
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* DATE CARD */}
        <View style={styles.dateCard}>
          <Icon name="event" size={28} color="#8e24aa" />
          <View style={{marginLeft:10}}>
            <Text style={styles.cardTitle}>CHR Details</Text>
            <Text style={styles.cardDate}>📅 24 Nov 2025</Text>
          </View>
        </View>

        {/* NOT HELD CARD */}
        <View style={[styles.detailCard, styles.notHeldCard]}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.courseTitle}>
              Web Technologies (WT)
            </Text>
            <Text style={styles.badgeRed}>Not Held</Text>
          </View>

          <View style={styles.grid}>
            <Info label="Date" value="24 Nov 2025" />
            <Info label="Teacher" value="Mr. Muhammad Ahsan" />
            <Info label="Discipline" value="BCS-4A" />
            <Info label="Status" value="Not Held" red />
            <Info label="Late In" value="—" />
            <Info label="Left Early" value="—" />
          </View>

          <View style={styles.divider} />

          <Text style={styles.remarkLabel}>Remarks</Text>
          <Text style={styles.remarkText}>
            Class not conducted due to faculty meeting.
          </Text>
        </View>

        {/* HELD CARD */}
        <View style={[styles.detailCard, styles.heldCard]}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.courseTitle}>
              Database Systems (DBS)
            </Text>
            <Text style={styles.badgeGreen}>Held</Text>
          </View>

          <View style={styles.grid}>
            <Info label="Date" value="24 Nov 2025" />
            <Info label="Teacher" value="Mr. Muhammad Ahsan" />
            <Info label="Discipline" value="BCS-5B" />
            <Info label="Status" value="Held" green />
            <Info label="Late In" value="—" />
            <Info label="Left Early" value="10 minutes" />
          </View>

          <View style={styles.divider} />

          <Text style={styles.remarkLabel}>Remarks</Text>
          <Text style={styles.remarkText}>
            Left early for administrative work.
          </Text>
        </View>

      </ScrollView>
    </View>
  );
};

const Info = ({ label, value, red, green }) => (
  <View style={styles.infoBox}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={[
      styles.infoValue,
      red && { color: "#d32f2f" },
      green && { color: "#2e7d32" }
    ]}>
      {value}
    </Text>
  </View>
);

export default ViewCHRDetails;

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#f5f7f6"
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#fff"
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333"
  },

  subtitle: {
    color: "#666"
  },

  logoCircle: {
    height: 36,
    width: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#2e7d32",
    justifyContent: "center",
    alignItems: "center"
  },

  banner: {
    backgroundColor: "#8e24aa",
    padding: 12
  },

  bannerText: {
    color: "#fff",
    fontSize: 14
  },

  dateCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 15,
    padding: 16,
    borderRadius: 12,
    elevation: 3
  },

  cardTitle: {
    fontWeight: "bold",
    fontSize: 16
  },

  cardDate: {
    color: "#666",
    marginTop: 4
  },

  detailCard: {
    marginHorizontal: 15,
    marginBottom: 18,
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#fff",
    elevation: 3
  },

  heldCard: {
    borderWidth: 1.5,
    borderColor: "#a5d6a7"
  },

  notHeldCard: {
    borderWidth: 1.5,
    borderColor: "#ef9a9a"
  },

  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12
  },

  courseTitle: {
    fontSize: 16,
    fontWeight: "600"
  },

  badgeGreen: {
    backgroundColor: "#e8f5e9",
    color: "#2e7d32",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    fontWeight: "600"
  },

  badgeRed: {
    backgroundColor: "#ffebee",
    color: "#d32f2f",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    fontWeight: "600"
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between"
  },

  infoBox: {
    width: "48%",
    marginBottom: 10
  },

  infoLabel: {
    color: "#777",
    fontSize: 12
  },

  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333"
  },

  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 10
  },

  remarkLabel: {
    fontWeight: "600",
    marginBottom: 4
  },

  remarkText: {
    fontStyle: "italic",
    color: "#444"
  }

});
