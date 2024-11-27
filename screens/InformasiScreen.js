import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../supabase/supabaseConfig';

const InformasiScreen = ({ route, navigation }) => {
  const { pemesananId } = route.params;
  const [pemesananData, setPemesananData] = useState(null);
  const [metodePembayaran, setMetodePembayaran] = useState(null);
  const [totalNominal, setTotalNominal] = useState(0);
  const [tanggalBerlaku, setTanggalBerlaku] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fungsi untuk memuat data dari Supabase
  const fetchData = async () => {
    try {
      setLoading(true);

      // Ambil data pemesanan
      const { data: pemesanan, error: pemesananError } = await supabase
        .from('pemesanan_tiket')
        .select('*')
        .eq('id_pemesanan', pemesananId)
        .single();

      if (pemesananError) throw new Error('Gagal memuat data pemesanan.');

      // Ambil data metode pembayaran
      const { data: metode, error: metodeError } = await supabase
        .from('metode_pembayaran')
        .select('*')
        .eq('id_metode', pemesanan.metode_pembayaran_id_metode)
        .single();

      if (metodeError) throw new Error('Gagal memuat data metode pembayaran.');

      // Ambil data tiket
      const { data: tiketData, error: tiketError } = await supabase
        .from('tiket')
        .select('harga_total, tanggal_berlaku')
        .eq('pemesanan_tiket_id_pemesanan', pemesananId);

      if (tiketError) throw new Error('Gagal memuat data tiket.');

      if (!tiketData || tiketData.length === 0) {
        throw new Error('Tidak ada tiket yang ditemukan untuk pemesanan ini.');
      }

      // Menghitung total nominal dan mengambil tanggal berlaku pertama
      const nominal = tiketData.reduce((sum, tiket) => sum + tiket.harga_total, 0);
      setTotalNominal(nominal);
      setTanggalBerlaku(tiketData[0].tanggal_berlaku);

      setPemesananData(pemesanan);
      setMetodePembayaran(metode);
    } catch (error) {
      console.error('Error fetching data:', error.message);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pemesananId]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Memuat data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Transaksi Berhasil</Text>
        
        {pemesananData && metodePembayaran && (
          <>
            <Text style={styles.detailText}>No. ID: {pemesananId}</Text>
            <Text style={styles.detailText}>Pembayaran ke rekening: {metodePembayaran.nomor_rek_e_wallet}</Text>
            <Text style={styles.detailText}>Nama Pemilik: {metodePembayaran.nama_pemilik}</Text>
            <Text style={styles.detailText}>Nominal: Rp {totalNominal.toLocaleString('id-ID')}</Text>
            <Text style={styles.detailText}>Waktu Pembelian: {new Date().toLocaleString()}</Text>
            <Text style={styles.detailText}>Tanggal Berlaku: {new Date(tanggalBerlaku).toLocaleDateString('id-ID')}</Text>
            <Text style={styles.detailText}>Metode Pembayaran: {metodePembayaran.nama_metode}</Text>
          </>
        )}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('BerandaTabs', { userId: pemesananData.pengunjung_id_pengunjung })}
      >
        <Text style={styles.buttonText}>Kembali ke Menu</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f4f8',
  },
  card: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  detailText: {
    fontSize: 18,
    marginBottom: 10,
    color: '#333',
  },
  button: {
    backgroundColor: '#A0C4FF',
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingText: {
    fontSize: 18,
    color: '#888',
  },
});

export default InformasiScreen;
