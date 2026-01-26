import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity,Alert } from 'react-native'
import BASE_URL from "../../API-URL/API";
const Login = ({onLogin}) => {


    const [username, setUsername] = useState("");
    const [Password, setPassword] = useState("");

    const LoginUser = async () => {

        if (!username || !Password) {
            Alert.alert("Error", "Please enter username and password");
            return;
        }


        try {
            const response = await fetch(`${BASE_URL}/Users/Login?id=${username}&password=${Password}`,
                {
                    method: "POST"
                }
            );

            if (!response.ok) {
                Alert.alert("Login Failed", "Invalid username or password");
                return;
            }

            const data = await response.json();

          
               if (onLogin)
                { 
                    onLogin(data.role.toUpperCase());

                }


            Alert.alert("Success", data.message);

        } catch (error) {
            Alert.alert("Error", "Server not responding");
            console.log(error);
        }


    }

    return (

        <View style={{ backgroundColor: "white", flex: 1 }}>



            <View style={ss.logoheader}>
                <Image
                    source={require("../../Assets/BIIT_logo.png")}
                    style={ss.logo}
                    resizeMode="contain"

                />
                <Text style={ss.headerTitle}>Employee Performance Appraisal Management System</Text>
                <Text style={ss.headerSubtitle}>Welcome Back! Please Login to Continue...</Text>
            </View>

            <View>
                <Text style={[ss.headerTitle, { fontSize: 30 }]}>Login</Text>
            </View>

            <View>
                <Text style={{ paddingLeft: 25, fontWeight: 'bold', fontSize: 20, paddingTop: 30, color: "#1E7F4D" }}>Username</Text>
                <TextInput
                    placeholder="Enter Your Username"
                    onChangeText={setUsername}
                    placeholderTextColor={'black'}
                    style={ss.input}
                />
            </View>
            <View>
                <Text style={{ paddingLeft: 25, fontWeight: 'bold', fontSize: 20, paddingTop: 30, color: "#1E7F4D" }}>Password</Text>
                <TextInput
                    placeholder="Enter Your Password"
                    onChangeText={setPassword}
                    placeholderTextColor={'black'}
                    secureTextEntry

                    style={ss.input}
                />
            </View>


            <TouchableOpacity style={ss.button} onPress={LoginUser}>
                <Text style={ss.buttonText}>Login</Text>

            </TouchableOpacity>



        </View>

    )

}


const ss = StyleSheet.create({


    logoheader: {
        backgroundColor: "#eafaf1",
        // width: 144,
        // height: 144,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 50,
        paddingBottom: 10,
    },

    logo: {
        width: 198,
        height: 198,
    },

    headerTitle: {
        fontSize: 20,
        textAlign: "center",
        fontWeight: "700",
        fontFamily: "Montserrat-Bold",
        color: "#000",
    },

    headerSubtitle: {
        fontSize: 12,
        color: "#777",
        marginTop: 4,
        maxWidth: 250,
        paddingTop: 10
    },
    input: {
        color: "black",
        height: 50,
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 0,
        borderWidth: 1,
        borderColor: "#E0E0E0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        marginHorizontal: 18
    },
    button: {
        height: 50,
        backgroundColor: "#0F9D58",
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 50,
        marginHorizontal: 20
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },


});


export default Login;