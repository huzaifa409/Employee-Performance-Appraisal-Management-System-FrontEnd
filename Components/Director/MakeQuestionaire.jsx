import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    FlatList,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import Icon from "react-native-vector-icons/MaterialIcons";
import BASE_URL from "../../API-URL/API";



const MakeQuestionaire=()=>
{

     return (
    <ScrollView style={ss.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* HEADER */}

      <View style={ss.header}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={ss.logoCircle}>
            <Image
              source={require("../../Assets/BIIT_logo.png")}
              style={ss.logo}
            />
          </View>
          <View style={{ marginLeft: 10 }}>
            <Text style={ss.headerTitle}>Evalutaion Questionaires</Text>
            <Text style={ss.headerSubtitle}>Manage and Create Evaluation forms</Text>
          </View>
        </View>
      </View>

       <View style={{backgroundColor:'green'}}>
           <View style={{flexDirection:"row",paddingVertical:10,paddingHorizontal:5,justifyContent:'space-between',alignItems:"center"}}>
              <Text style={{color:"#ffff",fontSize:15,justifyContent:"center"}}>2 Questionaire Available</Text>
              <TouchableOpacity style={{backgroundColor:"#ffff",borderRadius:7,padding:5,marginHorizontal:5}}>
                <Text>+ Create New</Text>
              </TouchableOpacity>
           </View>
         </View>



      </ScrollView>


      )


}

const ss = StyleSheet.create({
  container: { backgroundColor: "#f3f6f4" },
  header: {
    backgroundColor: "#fff",
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
  logoCircle: { width: 46, height: 46, borderRadius: 23, backgroundColor: "#e8f5e9", justifyContent: "center", alignItems: "center" },
  logo: { width: 34, height: 34, resizeMode: "contain" },
  headerTitle: { fontWeight: "700", fontSize: 16 },
  headerSubtitle: { fontSize: 12, color: "#666",paddingTop:3},
});

export default MakeQuestionaire;
