import React, { useContext } from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/Feather";
import { useAppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";

import AddProduct from "./AddProduct";
import ProductList from "./ProductList";
import Orders from "./Orders";

const Drawer = createDrawerNavigator();

const CustomHeader = ({ navigation, logout }) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
      <Icon name="menu" size={24} color="#333" />
    </TouchableOpacity>
    <Image source={assets.logo} style={styles.logo} resizeMode="contain" />
    <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
      <Text style={styles.logoutText}>Logout</Text>
    </TouchableOpacity>
  </View>
);

const SellerLayout = () => {
  const { axios, navigate } = useAppContext();

  const logout = async () => {
    try {
      const { data } = await axios.get("/api/seller/logout");
      if (data.success) {
        Toast.show({ type: "success", text1: data.message });
        navigate("Home"); // adjust navigation to your root screen
      } else {
        Toast.show({ type: "error", text1: data.message });
      }
    } catch (error) {
      Toast.show({ type: "error", text1: error.message });
    }
  };

  const screenOptions = ({ navigation }) => ({
    header: () => <CustomHeader navigation={navigation} logout={logout} />,
  });

  return (
    <>
      <Drawer.Navigator
        initialRouteName="AddProduct"
        screenOptions={screenOptions}
      >
        <Drawer.Screen
          name="AddProduct"
          component={AddProduct}
          options={{
            drawerLabel: "Add Product",
            drawerIcon: () => <Image source={assets.add_icon} style={styles.icon} />,
          }}
        />
        <Drawer.Screen
          name="ProductList"
          component={ProductList}
          options={{
            drawerLabel: "Product List",
            drawerIcon: () => <Image source={assets.product_list_icon} style={styles.icon} />,
          }}
        />
        <Drawer.Screen
          name="Orders"
          component={Orders}
          options={{
            drawerLabel: "Orders",
            drawerIcon: () => <Image source={assets.order_icon} style={styles.icon} />,
          }}
        />
      </Drawer.Navigator>
      <Toast />
    </>
  );
};

export default SellerLayout;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  logo: { width: 80, height: 30 },
  logoutBtn: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  logoutText: { color: "#333" },
  icon: { width: 22, height: 22, marginRight: -4 },
});
