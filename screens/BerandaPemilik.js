import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const BerandaPemilik = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Beranda Pemilik</Text>
      {/* Konten untuk halaman Pemilik bisa ditambahkan di sini */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default BerandaPemilik;
