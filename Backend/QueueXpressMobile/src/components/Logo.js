import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

const Logo = ({ size = "medium", showText = true, useImage = true }) => {
  const getSize = () => {
    switch (size) {
      case "small":
        return { image: 120, text: 18 };
      case "large":
        return { image: 280, text: 28 };
      default:
        return { image: 200, text: 22 }; // Increased from 150 to 200
    }
  };

  const dimensions = getSize();

  // If useImage is true, show your custom logo image
  if (useImage) {
    return (
      <View style={styles.container}>
        <Image
          source={require("../../assets/logo.png")}
          style={{
            width: dimensions.image * 2,
            height: dimensions.image,
            resizeMode: "contain",
          }}
        />
      </View>
    );
  }

  // Fallback to text logo if image not found
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconContainer,
          {
            width: dimensions.container,
            height: dimensions.container,
            borderRadius: dimensions.container / 2,
          },
        ]}
      >
        <Text style={[styles.iconText, { fontSize: dimensions.image / 2 }]}>
          Q
        </Text>
      </View>
      {showText && (
        <View style={styles.textContainer}>
          <Text style={[styles.title, { fontSize: dimensions.text }]}>
            Queue<Text style={styles.titleAccent}>Xpress</Text>
          </Text>
          <Text style={styles.subtitle}>Queue Management System</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  iconContainer: {
    backgroundColor: "#0099CC",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  iconText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  textContainer: {
    alignItems: "center",
  },
  title: {
    fontWeight: "bold",
    color: "#1E293B",
  },
  titleAccent: {
    color: "#0099CC",
  },
  subtitle: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 2,
  },
});

export default Logo;
