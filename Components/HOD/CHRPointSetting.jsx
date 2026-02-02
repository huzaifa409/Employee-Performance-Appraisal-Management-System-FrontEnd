import React from "react";
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, ScrollView } from 'react-native'


import Icon from "react-native-vector-icons/MaterialIcons";

const CHRPointSetting = ({ navigation }) => {
    return (

        <ScrollView style={{ backgroundColor: "#ffff" }}>


            <View style={ss.header}>
                <View>
                    <Text style={ss.headerTitle}>CHR Point Setting</Text>
                    <Text style={ss.headerSubtitle}>
                        Set Point Values for Class Activity to Calculate Teacher Performance
                    </Text>
                </View>

                <View style={ss.logoheader}>
                    <Image
                        source={require("../../Assets/BIIT_logo.png")}
                        style={ss.logo}
                        resizeMode="contain"
                    />
                </View>
            </View>

            <View style={[ss.header, { borderRadius: 0, backgroundColor: '#1E7F4D' }]}>
                <Text style={{ color: "#ffff", margin: 0 }}>Configure How CHR Activities affect Teacher Performance Scores</Text>
            </View>


        </ScrollView>
    )
}

const ss = StyleSheet.create({


    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 14,
        paddingTop: 15,
        paddingHorizontal: 14,
        margin: 0,
        marginTop: 0,
        backgroundColor: "#ffffff",
        borderRadius: 14,
        elevation: 3,

    },

    headerTitle: {
        fontSize: 26,
        fontWeight: "700",
        color: "#000",
    },

    headerSubtitle: {
        fontSize: 12,
        color: "#777",
        marginTop: 4,
        maxWidth: 250,
    },

    logoheader: {
        backgroundColor: "#eafaf1",
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
    },

    logo: {
        width: 58,
        height: 58,
    },
})

export default CHRPointSetting