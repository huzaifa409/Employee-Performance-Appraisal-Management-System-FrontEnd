import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Dropdown } from "react-native-element-dropdown";

import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

import BASE_URL from "../../API-URL/API";


// ✅ FIXED CARD COMPONENT
const Card = ({ title, desc, children, disabled, onPress }) => (
    <TouchableOpacity
        style={[styles.card, disabled && { opacity: 0.4 }]}
        disabled={disabled}
        onPress={onPress}
    >
        <View style={styles.iconBox}>{children}</View>

        <View style={styles.cardText}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardDesc}>{desc}</Text>
        </View>

        <Ionicons name="chevron-forward" size={22} color="green" />
    </TouchableOpacity>
);

const ManageSocieties = ({ navigation }) => {
    const [sessions, setSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);

    // 🔥 Fetch Sessions
    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const res = await fetch(`${BASE_URL}/PeerEvaluator/Sessions`);
            const data = await res.json();

            const formatted = data.map((item) => ({
                label: item.sessionName || item.name,
                value: item.sessionId || item.id,
            }));

            setSessions(formatted);
        } catch (error) {
            console.log("Session Fetch Error:", error);
        }
    };

    return (
        <>
            <StatusBar backgroundColor="green" barStyle="light-content" />

            <SafeAreaView style={styles.container} edges={["top"]}>
                {/* HEADER */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <View style={styles.logo}>
                            <Text style={styles.logoText}>SMO</Text>
                        </View>

                        <View>
                            <Text style={styles.title}>Society Management Office</Text>
                            <Text style={styles.subtitle}>SMO Administrator</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.logoutBtn}>
                        <Ionicons name="log-out-outline" size={22} color="green" />
                    </TouchableOpacity>
                </View>

                {/* SESSION DROPDOWN */}
                <View style={styles.sessionContainer}>
                    <Text style={styles.sessionText}>Select Session:</Text>

                    <Dropdown
                        style={styles.dropdown}
                        data={sessions}
                        labelField="label"
                        valueField="value"
                        placeholder="Select Session"
                        value={selectedSession}
                        onChange={(item) => setSelectedSession(item.value)}
                    />
                </View>

                {/* TITLE */}
                <View style={styles.titleSection}>
                    <Text style={styles.mainTitle}>Society Management</Text>
                    <Text style={styles.mainSubtitle}>
                        Manage societies, chairpersons, and mentors
                    </Text>
                </View>

                {/* CARDS */}
                <View style={styles.cardContainer}>
                    <Card
                        title="Manage Societies"
                        desc="Add, edit, and manage university societies"
                        disabled={!selectedSession}
                        onPress={() =>
                            navigation.navigate("SocietyDetails", {
                                sessionId: selectedSession,
                                sessionName:
                                    sessions.find((s) => s.value === selectedSession)
                                        ?.label,
                            })
                        }
                    >
                        <MaterialIcons name="apartment" size={24} color="#fff" />
                    </Card>

                    <Card
                        title="Assign Chairpersons"
                        desc="Assign chairpersons to societies (max 2)"
                        disabled={!selectedSession}
                         onPress={() =>
                            navigation.navigate("AssignChairperson", {
                                sessionId: selectedSession,
                                sessionName:
                                    sessions.find((s) => s.value === selectedSession)
                                        ?.label,
                            })
                        }
                    >
                        <FontAwesome5 name="user-cog" size={18} color="#fff" />
                    </Card>

                    <Card
                        title="Assign Mentors"
                        desc="Assign mentors to societies"
                        disabled={!selectedSession}
                        onPress={() =>
                            navigation.navigate("AssignMentors", {
                                sessionId: selectedSession,
                                sessionName:
                                    sessions.find((s) => s.value === selectedSession)
                                        ?.label,
                            })
                        }
                    >
                        <FontAwesome5 name="users" size={18} color="#fff" />
                    </Card>
                </View>

                {/* FOOTER */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        "Great societies are built by great communities working together."
                    </Text>
                </View>
            </SafeAreaView>
        </>
    );
};

export default ManageSocieties;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f4f7f5",
    },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 15,
    },

    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
    },

    logo: {
        width: 45,
        height: 45,
        borderRadius: 25,
        backgroundColor: "green",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },

    logoText: {
        color: "#fff",
        fontWeight: "bold",
    },

    title: {
        fontSize: 16,
        fontWeight: "600",
    },

    subtitle: {
        fontSize: 12,
        color: "gray",
    },

    logoutBtn: {
        borderWidth: 1,
        borderColor: "green",
        padding: 8,
        borderRadius: 8,
    },

    sessionContainer: {
        paddingHorizontal: 15,
        marginTop: 10,
    },

    sessionText: {
        marginBottom: 5,
        fontWeight: "600",
    },

    dropdown: {
        height: 45,
        borderColor: "gray",
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        backgroundColor: "#fff",
    },

    titleSection: {
        alignItems: "center",
        marginVertical: 15,
    },

    mainTitle: {
        fontSize: 18,
        fontWeight: "600",
    },

    mainSubtitle: {
        fontSize: 13,
        color: "gray",
    },

    cardContainer: {
        paddingHorizontal: 15,
    },

    card: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
        elevation: 3,
    },

    iconBox: {
        width: 45,
        height: 45,
        borderRadius: 10,
        backgroundColor: "green",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },

    cardText: {
        flex: 1,
    },

    cardTitle: {
        fontSize: 15,
        fontWeight: "600",
    },

    cardDesc: {
        fontSize: 12,
        color: "gray",
    },

    footer: {
        marginTop: "auto",
        alignItems: "center",
        padding: 15,
    },

    footerText: {
        fontSize: 12,
        color: "gray",
        fontStyle: "italic",
    },
});