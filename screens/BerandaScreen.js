import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const BerandaScreen = ({ route }) => {
  // Menerima userId dari navigasi
  const { userId } = route.params || {};

  // Hanya log userId untuk debugging jika diperlukan
  console.log('BerandaScreen - User ID:', userId);

  return (
    <View style={styles.container}>
      {/* Gambar di atas */}
      <Image
        source={require('../assets/gambarberanda.jpg')} // Gambar yang ada di folder assets
        style={styles.image}
      />

      {/* Frame dengan shadow dan konten */}
      <View style={styles.card}>
        <Text style={styles.text}>Jam Operasional:</Text>
        <View style={styles.infoContainer}>
          <MaterialCommunityIcons name="clock" size={20} color="#000" />
          <Text style={styles.infoText}>08.00 - 17.00</Text>
        </View>
        <View style={styles.infoContainer}>
          <MaterialCommunityIcons name="calendar" size={20} color="#000" />
          <Text style={styles.infoText}>Senin - Minggu</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // Latar belakang putih untuk seluruh halaman
    padding: 10,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10, // Membuat gambar sedikit melengkung di tepinya
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000', // Warna shadow
    shadowOffset: { width: 0, height: 5 }, // Arah shadow
    shadowOpacity: 0.1, // Kekuatan shadow
    shadowRadius: 5, // Ukuran blur shadow
    elevation: 5, // Shadow untuk Android
    padding: 20,
    marginTop: 10,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 18,
    marginLeft: 10,
  },
});

export default BerandaScreen;
