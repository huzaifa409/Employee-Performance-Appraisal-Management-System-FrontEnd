import React from "react";
import { View, Text, StyleSheet, Image, TextInput, ScrollView, TouchableOpacity } from 'react-native'
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
                <Text style={{ color: "#ffff" }}>
                    Configure How CHR Activities affect Teacher Performance Scores
                </Text>
            </View>

            <View style={{ padding: 16 }}>

               
                <View style={ss.Card}>
                    <View style={ss.headrow}>
                        <Text style={ss.title}>Class Held</Text>
                        <View style={ss.positiveBadge}>
                            <Text style={ss.positiveBadgeText}>Positive</Text>
                        </View>
                    </View>

                    <Text style={ss.description}>
                        Points awarded when a class is conducted as scheduled
                    </Text>

                    <Text style={ss.label}>Point Value</Text>

                    <View style={ss.inputRow}>
                        <TextInput keyboardType="numeric" style={ss.input} />
                        <Text style={ss.pointsText}>points</Text>
                    </View>

                    <View style={ss.hintBox}>
                        <Text style={ss.hintText}>+1 points per occurrence</Text>
                    </View>
                </View>

              
                <View style={[ss.Card, ss.negativeCard]}>
                    <View style={ss.headrow}>
                        <Text style={ss.title}>Class Not Held</Text>
                        <View style={ss.negativeBadge}>
                            <Text style={ss.negativeBadgeText}>Negative</Text>
                        </View>
                    </View>

                    <Text style={ss.description}>
                        Points deducted when a scheduled class is not conducted
                    </Text>

                    <Text style={ss.label}>Point Value</Text>

                    <View style={ss.inputRow}>
                        <TextInput keyboardType="numeric" style={[ss.input, ss.negativeInput]} />
                        <Text style={ss.pointsText}>points</Text>
                    </View>

                    <View style={[ss.hintBox, ss.negativeHintBox]}>
                        <Text style={ss.negativeHintText}>-1 points per occurrence</Text>
                    </View>
                </View>

             
                <View style={[ss.Card, ss.negativeCard]}>
                    <View style={ss.headrow}>
                        <Text style={ss.title}>Late In</Text>
                        <View style={ss.negativeBadge}>
                            <Text style={ss.negativeBadgeText}>Negative</Text>
                        </View>
                    </View>

                    <Text style={ss.description}>
                        Points deducted when teacher arrives late to class
                    </Text>

                    <Text style={ss.label}>Point Value</Text>

                    <View style={ss.inputRow}>
                        <TextInput keyboardType="numeric" style={[ss.input, ss.negativeInput]} />
                        <Text style={ss.pointsText}>points</Text>
                    </View>

                    <View style={[ss.hintBox, ss.negativeHintBox]}>
                        <Text style={ss.negativeHintText}>-1 points per occurrence</Text>
                    </View>
                </View>

               
                <View style={[ss.Card, ss.negativeCard]}>
                    <View style={ss.headrow}>
                        <Text style={ss.title}>Left Early</Text>
                        <View style={ss.negativeBadge}>
                            <Text style={ss.negativeBadgeText}>Negative</Text>
                        </View>
                    </View>

                    <Text style={ss.description}>
                        Points deducted when teacher leaves before class ends
                    </Text>

                    <Text style={ss.label}>Point Value</Text>

                    <View style={ss.inputRow}>
                        <TextInput keyboardType="numeric" style={[ss.input, ss.negativeInput]} />
                        <Text style={ss.pointsText}>points</Text>
                    </View>

                    <View style={[ss.hintBox, ss.negativeHintBox]}>
                        <Text style={ss.negativeHintText}>-1 points per occurrence</Text>
                    </View>
                </View>

               
                <View style={ss.Card}>
                    <View style={ss.headrow}>
                        <Text style={ss.title}>Held On Time</Text>
                        <View style={ss.positiveBadge}>
                            <Text style={ss.positiveBadgeText}>Positive</Text>
                        </View>
                    </View>

                    <Text style={ss.description}>
                        Points awarded when class starts on time
                    </Text>

                    <Text style={ss.label}>Point Value</Text>

                    <View style={ss.inputRow}>
                        <TextInput keyboardType="numeric" style={ss.input} />
                        <Text style={ss.pointsText}>points</Text>
                    </View>

                    <View style={ss.hintBox}>
                        <Text style={ss.hintText}>+1 points per occurrence</Text>
                    </View>
                </View>

            </View>

            <TouchableOpacity style={ss.button}>

               
                <Icon name="save" size={22} color="#fff" style={{marginHorizontal:10}} />
                <Text style={{fontWeight:700,color:"#fff",textAlign:"center",fontSize:15}}>Save CHR Point Setting</Text>
                
                
                
                
                
                 </TouchableOpacity>

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

    Card: {
        borderWidth: 1.5,
        borderColor: '#6BCF9B',
        backgroundColor: "#F4FFF8",
        borderRadius: 16,
        padding: 16,
        marginBottom: 20
    },

    negativeCard: {
        borderColor: "#F2A6A6",
        backgroundColor: "#FFF6F6",
    },

    headrow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },

    title: {
        fontSize: 18,
        fontWeight: "700",
    },

    positiveBadge: {
        backgroundColor: "#DFF5E8",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },

    positiveBadgeText: {
        color: "#1E9E61",
        fontWeight: "600",
    },

    negativeBadge: {
        backgroundColor: "#FDE2E2",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },

    negativeBadgeText: {
        color: "#D64545",
        fontWeight: "600",
    },

    description: {
        marginTop: 10,
        color: "#555",
        lineHeight: 20,
    },

    label: {
        marginTop: 14,
        fontWeight: "600",
    },

    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 6,
    },

    input: {
        flex: 1,
        borderWidth: 1.5,
        borderColor: "#6BCF9B",
        borderRadius: 10,
        padding: 10,
        fontSize: 16,
        backgroundColor: "#fff",
    },

    negativeInput: {
        borderColor: "#F2A6A6",
    },

    pointsText: {
        marginLeft: 10,
        fontWeight: "600",
        color: "#555",
    },

    hintBox: {
        marginTop: 12,
        backgroundColor: "#DFF5E8",
        padding: 10,
        borderRadius: 10,
    },

    negativeHintBox: {
        backgroundColor: "#FDE2E2",
    },

    hintText: {
        color: "#1E9E61",
        fontWeight: "500",
    },

    negativeHintText: {
        color: "#D64545",
        fontWeight: "500",
    },
    button:
    {
        backgroundColor:"green",
        padding:10,
        paddingVertical:15,
        marginBottom:12,
        borderRadius:20,
        marginHorizontal:20,
        flexDirection:"row",
        alignItems:"center",
        justifyContent:"center"    

    }

})

export default CHRPointSetting
