import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../supabase/supabaseConfig';

const LihatTiket = ({ route }) => {
  const { pemesananId } = route.params;
  const [tiket, setTiket] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTiket = async () => {
    try {
      setLoading(true);

      const { data: tiketData, error } = await supabase
        .from('tiket')
        .select('*')
        .eq('pemesanan_tiket_id_pemesanan', pemesananId);

      if (error) throw error;

      setTiket(tiketData);
    } catch (error) {
      console.error('Error fetching tiket:', error);
      Alert.alert('Error', 'Gagal memuat tiket. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTiket();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Memuat data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {tiket.map((item) => (
        <View key={item.id_tiket} style={styles.card}>
          {/* Bagian Kiri dengan ID Tiket */}
          <View style={styles.idContainer}>
            <Text style={styles.idText}>{item.id_tiket}</Text>
          </View>

          {/* Bagian Konten Tiket */}
          <View style={styles.ticketContent}>
            <Image source={require('../assets/gambar1.png')} style={styles.image} />
            <View style={styles.ticketDetails}>
              <Text style={styles.title}>Summer Pool Party</Text>
              <Text style={styles.subTitle}>Jl. Kaliurang No.158, Krajan Barat, Tegalgede,</Text>
              <Text style={styles.subTitle}>Kabupaten Jember, Jawa Timur</Text>
              <Text style={styles.dateText}>
                {new Date(item.tanggal_berlaku).toLocaleDateString('id-ID')} | 08.00 - 17.00
              </Text>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f0f4f8',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    overflow: 'hidden',
  },
  idContainer: {
    backgroundColor: '#A0C4FF',
    width: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  idText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    transform: [{ rotate: '-90deg' }],
    textAlign: 'center',
  },
  ticketContent: {
    flex: 1,
    flexDirection: 'row-reverse', // Membalikkan urutan elemen
    padding: 12,
  },
  image: {
    width: 90,
    height: 90,
    resizeMode: 'contain',
    marginLeft: 12, // Margin untuk memberikan jarak antara detail tiket dan gambar
  },
  ticketDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subTitle: {
    fontSize: 12,
    color: '#555',
    marginBottom: 2,
  },
  dateText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 8,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#888',
    marginTop: 8,
  },
});



export default LihatTiket;
