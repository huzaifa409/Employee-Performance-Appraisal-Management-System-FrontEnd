import React from "react";
import { View, Text, StyleSheet, Image, TextInput,TouchableOpacity,ScrollView } from 'react-native'


import Icon from "react-native-vector-icons/MaterialIcons";

const HodDashboard=({navigation})=>
{
    return(

        <ScrollView style={{backgroundColor:"#ffff"}}>
       
             
             <View style={ss.header}>
               <View>
                 <Text style={ss.headerTitle}>HOD : DR.Munir</Text>
                 <Text style={ss.headerSubtitle}>
                  Head Of Department
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

             <View style={[ss.header,{borderRadius:0,backgroundColor:'#1E7F4D'}]}>
                    <Text style={{color:"#ffff",margin:0}}>Monitor Teacher Performance,Manage KPIs and assign Peer Evaluator</Text>
             </View>

          <View style={ss.container}>      
             <View style={ss.box}> 
                <Text style={{textAlign:"center",padding:7}}>Total Teachers</Text>
                <View style={ss.icon}>
                <Icon name="groups" size={50} color="#1565C0" /> 
                </View>
                <Text style={{textAlign:"center",paddingTop:7,marginTop:20}}>6</Text>
                <Text style={{textAlign:"center"}}>Active Faculty</Text>
             </View>
             <View style={ss.box}> 
                 <Text style={{textAlign:"center",padding:7}}>Top Performer</Text>
                 <View style={ss.icon}>
                 <Icon  name="workspace-premium" size={50}color="#FFC107" /> 
                 </View>
                <Text style={{textAlign:"center",paddingTop:7,marginTop:20}}>MR.Muhammad Zahid</Text>
                <Text style={{textAlign:"center"}}>93% Rating </Text>
             </View>
          </View>  

          <TouchableOpacity style={[ss.containers, { marginTop: 40, backgroundColor: '#e8faf0'}]}>
                  <View style={[ss.iconContainer,{backgroundColor: '#1E7F4D'}]}>
                    <Icon name="add" size={26} color="#fff"  />
                  </View>
          
                  <View style={ss.textBlock}>
                    <Text style={ss.HeadText}>Add KPI</Text>
                    <Text style={ss.subtitle}>
                     Define New Performance Indicators
                    </Text>
                  </View>
          
                  <Icon name="chevron-right" size={26} color="#1E7F4D" />
                </TouchableOpacity>
          <TouchableOpacity style={[ss.containers, { marginTop: 3,backgroundColor: '#dfe4f7'}]} onPress={()=>navigation.navigate("AddPeerEvaluator")}>
                  <View style={[ss.iconContainer,{backgroundColor:"#476efc" }]}>
                    <Icon name="person-add-alt-1" size={26} color="#fff" />

                  </View>
          
                  <View style={ss.textBlock}>
                    <Text style={ss.HeadText}>Add Peer Evaluators</Text>
                    <Text style={ss.subtitle}>
                     Assign new Evaluators
                    </Text>
                  </View>
          
                  <Icon name="chevron-right" size={26} color="#1E7F4D" />
                </TouchableOpacity>
          <TouchableOpacity style={[ss.containers, { marginTop: 3 ,backgroundColor: '#f6e4fa'}]}>
            <View style={[ss.iconContainer,{backgroundColor: '#c40bf7'}]}>
                    <Icon name="checklist" size={26} color="#fff" />

                  </View>
          
                  <View style={ss.textBlock}>
                    <Text style={ss.HeadText}>Course Management</Text>
                    <Text style={ss.subtitle}>
                      Evaluate Course Submission
                    </Text>
                  </View>
          
                  <Icon name="chevron-right" size={26} color="#1E7F4D" />
                </TouchableOpacity>
          <TouchableOpacity style={[ss.containers, { marginTop: 3,backgroundColor:'rgba(248, 221, 187, 0.88)' }]}>
                  <View style={[ss.iconContainer,{backgroundColor:'rgba(234, 133, 1, 0.88)'}]}>
                    <Icon name="bar-chart" size={26} color="#fff" />

                  </View>
          
                  <View style={ss.textBlock}>
                    <Text style={ss.HeadText}>See Performance </Text>
                    <Text style={ss.subtitle}>
                      View Detail Analytics
                    </Text>
                  </View>
          
                  <Icon name="chevron-right" size={26} color="#1E7F4D" />
                </TouchableOpacity>
          <TouchableOpacity style={[ss.containers, { marginTop: 3 ,backgroundColor:"#b5c3fa"}]}>
                  <View style={[ss.iconContainer,{backgroundColor:"blue"}]}>
                    <Icon name="settings" size={26} color="#fff" />

                  </View>
          
                  <View style={ss.textBlock}>
                    <Text style={ss.HeadText}>CHR Point Setting</Text>
                    <Text style={ss.subtitle}>
                     configure CHR scoring rules
                    </Text>
                  </View>
          
                  <Icon name="chevron-right" size={26} color="#1E7F4D" />
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
    paddingTop:15,
    paddingHorizontal: 14,
    margin: 0,
    marginTop:0,
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

  container:{
     display:'flex',
    flexDirection:'row',
    justifyContent:'space-evenly',
  },
  containers: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 15,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    elevation: 3,
    height: 100,
    marginHorizontal: 12,
  },
  box:
  {
   
    width:160,
    height:160,
   
    borderRadius:22,
    margin:10,
     backgroundColor: "#ffffff",
     elevation:9
    
     

},
icon:
{
  alignItems:'center',justifyContent:'center'
},

iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#E3F8EA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  textBlock: {
    flex: 1,
  },

  HeadText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },

  subtitle: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
    maxWidth: "95%",
  },

})


export default HodDashboard;