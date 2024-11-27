import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const BerandaAdmin = ({ route }) => {
  // Mengambil parameter username dari navigasi
  const { username } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Selamat datang Admin {username}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
  },
});

export default BerandaAdmin;
