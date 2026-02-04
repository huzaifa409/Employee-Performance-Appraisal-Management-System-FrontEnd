import React from "react";
import { View,Text,StyleSheet,Image,TouchableOpacity,ScrollView,} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const DcDashboard = ({navigation,route}) => {


   const { onLogout } = route.params;

  const handleLogout = () => {
    onLogout(); 
  };
  return (
    <ScrollView>

      
      <View style={ss.header}>
        <View>
          <Text style={ss.headerTitle}>DataCell Dashboard</Text>
          <Text style={ss.headerSubtitle}>
            Manage Institutional Data uploads Efficiency
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

      
      <TouchableOpacity style={[ss.containers, { marginTop: 40 }]}>
        <View style={ss.iconContainer}>
          <Icon name="description" size={22} color="#1E7F4D" />
        </View>

        <View style={ss.textBlock}>
          <Text style={ss.HeadText}>Upload CHR Reports</Text>
          <Text style={ss.subtitle}>
            Upload and Manage daily Class Held Reports
          </Text>
        </View>

        <Icon name="chevron-right" size={26} color="#1E7F4D" />
      </TouchableOpacity>

    
      <TouchableOpacity style={ss.containers} onPress={()=>navigation.navigate("UploadStudents")}>
        <View style={ss.iconContainer}>
          <Icon name="school" size={22} color="#1E7F4D" />
        </View>

        <View style={ss.textBlock}>
          <Text style={ss.HeadText}>Upload Student</Text>
          <Text style={ss.subtitle}>
            Upload students list using Excel file
          </Text>
        </View>

        <Icon name="chevron-right" size={26} color="#1E7F4D" />
      </TouchableOpacity>

      
      <TouchableOpacity style={ss.containers} onPress={()=>navigation.navigate("UploadTeachers")}>
        <View style={ss.iconContainer}>
          <Icon name="person" size={22} color="#1E7F4D" />
        </View>

        <View style={ss.textBlock}>
          <Text style={ss.HeadText}>Upload Teachers</Text>
          <Text style={ss.subtitle}>
            Upload teachers list using Excel file
          </Text>
        </View>

        <Icon name="chevron-right" size={26} color="#1E7F4D" />
      </TouchableOpacity>
      <TouchableOpacity style={ss.containers} onPress={()=>navigation.navigate("UploadEnrollment")}>
        <View style={ss.iconContainer}>
          <Icon name="person" size={22} color="#1E7F4D" />
        </View>

        <View style={ss.textBlock}>
          <Text style={ss.HeadText}>Upload Enrollment</Text>
          <Text style={ss.subtitle}>
            Upload Enrollment list using Excel file
          </Text>
        </View>

        <Icon name="chevron-right" size={26} color="#1E7F4D" />
      </TouchableOpacity>

      
      <TouchableOpacity style={ss.containers} onPress={()=>navigation.navigate("UploadCourses")}>
        <View style={ss.iconContainer}>
          <Icon name="menu-book" size={22} color="#1E7F4D" />
        </View>

        <View style={ss.textBlock}>
          <Text style={ss.HeadText}>Upload Courses</Text>
          <Text style={ss.subtitle}>
            Upload course and subject information
          </Text>
        </View>

        <Icon name="chevron-right" size={26} color="#1E7F4D" />
      </TouchableOpacity>

      
      <TouchableOpacity style={ss.logoutButton} onPress={handleLogout}>
        <Text style={ss.logoutText}>Logout</Text>
      </TouchableOpacity>

    </ScrollView>
  );
};



const ss = StyleSheet.create({


  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingTop:10,
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

  logoutButton: {
    marginTop: 30,
    marginBottom: 40,
    marginHorizontal: 12,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    backgroundColor: "#D64545",
    elevation: 4,
  },

  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});



export default  DcDashboard;