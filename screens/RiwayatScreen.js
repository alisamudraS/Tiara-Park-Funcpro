import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../supabase/supabaseConfig';

const RiwayatScreen = ({ route, navigation }) => {
  const { userId } = route.params; // Ambil ID pengguna dari parameter navigasi
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRiwayat = async () => {
    try {
      setLoading(true);

      // Fetch pemesanan data
      const { data: pemesananData, error: pemesananError } = await supabase
        .from('pemesanan_tiket')
        .select('*')
        .eq('pengunjung_id_pengunjung', userId);

      if (pemesananError) throw pemesananError;

      // Fetch tiket data for each pemesanan
      const riwayatData = await Promise.all(
        pemesananData.map(async (pemesanan) => {
          const { data: tiketData, error: tiketError } = await supabase
            .from('tiket')
            .select('harga_total, tanggal_berlaku, tipe_tiket_id_tipe')
            .eq('pemesanan_tiket_id_pemesanan', pemesanan.id_pemesanan);

          if (tiketError) throw tiketError;

          // Process tiket data
          const jumlahVIP = tiketData.filter((tiket) => tiket.tipe_tiket_id_tipe === 1).length;
          const jumlahReguler = tiketData.filter((tiket) => tiket.tipe_tiket_id_tipe === 2).length;
          const totalNominal = tiketData.reduce((sum, tiket) => sum + tiket.harga_total, 0);

          return {
            id_pemesanan: pemesanan.id_pemesanan,
            tanggal_pemesanan: pemesanan.tanggal_pemesanan,
            status: pemesanan.status.toLowerCase(),
            totalNominal,
            jumlahVIP,
            jumlahReguler,
            tanggalBerlaku: tiketData[0]?.tanggal_berlaku || null, // Null-safe access
          };
        })
      );

      setRiwayat(riwayatData);
    } catch (error) {
      console.error('Error fetching riwayat:', error.message || error);
      Alert.alert('Error', 'Gagal memuat riwayat pemesanan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRiwayat();
    }, [])
  );

  const handlePress = (item) => {
    const { id_pemesanan, totalNominal, jumlahVIP, jumlahReguler, tanggalBerlaku, status } = item;

    if (status === 'diproses') {
      // Navigasi ke InformasiScreen untuk "Diproses"
      navigation.navigate('InformasiScreen', { pemesananId: id_pemesanan });
    } else if (status === 'sukses') {
      // Navigasi ke LihatTiket untuk "Sukses"
      navigation.navigate('LihatTiket', {
        pemesananId: id_pemesanan,
        totalNominal,
        jumlahVIP,
        jumlahReguler,
        tanggalBerlaku,
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Image
          source={require('../assets/gambar1.png')}
          style={styles.backgroundImage}
        />
        <ActivityIndicator size="large" color="#0000ff" style={styles.spinner} />
        <Text style={styles.loadingText}>Memuat data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {riwayat.map((item) => (
        <TouchableOpacity key={item.id_pemesanan} style={styles.card} onPress={() => handlePress(item)}>
          <View style={styles.header}>
            <Text style={styles.dateText}>{new Date(item.tanggal_pemesanan).toLocaleDateString('id-ID')}</Text>
            <Text style={styles.idText}>No. ID: {item.id_pemesanan}</Text>
          </View>
          <View style={styles.content}>
            {item.jumlahVIP > 0 && <Text style={styles.tiketText}>VIP Dewasa: {item.jumlahVIP}</Text>}
            {item.jumlahReguler > 0 && <Text style={styles.tiketText}>Reguler Dewasa: {item.jumlahReguler}</Text>}
          </View>
          <View
            style={[
              styles.statusContainer,
              item.status === 'sukses' ? styles.successStatus : styles.processStatus,
            ]}
          >
            <Text style={styles.statusText}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  backgroundImage: {
    position: 'absolute',
    width: 200,
    height: 200,
    opacity: 0.3, // Transparansi gambar
  },
  spinner: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#555',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#555',
  },
  idText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  content: {
    marginBottom: 8,
  },
  tiketText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  statusContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  successStatus: {
    backgroundColor: '#d4edda',
  },
  processStatus: {
    backgroundColor: '#f8d7da',
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#155724',
  },
});

export default RiwayatScreen;