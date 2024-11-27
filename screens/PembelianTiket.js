import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { supabase } from '../supabase/supabaseConfig';

const PembelianTiket = () => {
  const route = useRoute();
  const navigation = useNavigation();

  const { jenisId, id_pengunjung } = route.params;

  const [hargaJenis, setHargaJenis] = useState(0);
  const [hargaTipe, setHargaTipe] = useState({ vip: 0, regular: 0 });
  const [jumlahVIP, setJumlahVIP] = useState(0);
  const [jumlahReguler, setJumlahReguler] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [totalHarga, setTotalHarga] = useState(0);
  const [metodePembayaran, setMetodePembayaran] = useState([]);
  const [selectedMetode, setSelectedMetode] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [jenisResponse, tipeResponse, metodeResponse] = await Promise.all([
          supabase.from('jenis_tiket').select('harga_jenis').eq('id_jenis', jenisId).single(),
          supabase.from('tipe_tiket').select('*').in('id_tipe', [1, 2]),
          supabase.from('metode_pembayaran').select('*'),
        ]);

        if (jenisResponse.error) throw new Error('Gagal memuat data jenis tiket.');
        if (tipeResponse.error) throw new Error('Gagal memuat data tipe tiket.');
        if (metodeResponse.error) throw new Error('Gagal memuat data metode pembayaran.');

        setHargaJenis(jenisResponse.data.harga_jenis || 0);

        const regular = tipeResponse.data.find((tipe) => tipe.id_tipe === 2)?.harga_tipe || 0;
        const vip = tipeResponse.data.find((tipe) => tipe.id_tipe === 1)?.harga_tipe || 0;
        setHargaTipe({ regular, vip });

        setMetodePembayaran(metodeResponse.data);
      } catch (error) {
        console.error(error.message);
        Alert.alert('Error', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jenisId]);

  const calculateTotal = () => {
    const total = (hargaJenis + hargaTipe.regular) * jumlahReguler + (hargaJenis + hargaTipe.vip) * jumlahVIP;
    setTotalHarga(total);
  };

  const handleJumlahChange = (type, increment) => {
    if (type === 'vip') {
      setJumlahVIP((prev) => Math.max(0, prev + (increment ? 1 : -1)));
    } else if (type === 'reguler') {
      setJumlahReguler((prev) => Math.max(0, prev + (increment ? 1 : -1)));
    }
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleKonfirmasiPembelian = async () => {
    if (!selectedMetode) {
      Alert.alert('Error', 'Pilih metode pembayaran terlebih dahulu.');
      return;
    }

    const tanggalPemesanan = new Date().toISOString().split('T')[0];
    const tglBerlaku = selectedDate.toISOString().split('T')[0];

    try {
      setLoading(true);

      const { data: pemesananData, error: pemesananError } = await supabase
        .from('pemesanan_tiket')
        .insert({
          tanggal_pemesanan: tanggalPemesanan,
          pengunjung_id_pengunjung: id_pengunjung,
          metode_pembayaran_id_metode: selectedMetode,
          status: 'Diproses',
        })
        .select();

      if (pemesananError) throw new Error('Gagal membuat pemesanan.');

      const pemesananId = pemesananData[0]?.id_pemesanan;

      const tiketPromises = [];
      for (let i = 0; i < jumlahVIP; i++) {
        tiketPromises.push(
          supabase.from('tiket').insert({
            tanggal_berlaku: tglBerlaku,
            harga_total: hargaJenis + hargaTipe.vip,
            admin_id_admin: 1,
            jenis_tiket_id_jenis: jenisId,
            pemesanan_tiket_id_pemesanan: pemesananId,
            tipe_tiket_id_tipe: 1,
          })
        );
      }
      for (let i = 0; i < jumlahReguler; i++) {
        tiketPromises.push(
          supabase.from('tiket').insert({
            tanggal_berlaku: tglBerlaku,
            harga_total: hargaJenis + hargaTipe.regular,
            admin_id_admin: 1,
            jenis_tiket_id_jenis: jenisId,
            pemesanan_tiket_id_pemesanan: pemesananId,
            tipe_tiket_id_tipe: 2,
          })
        );
      }

      const tiketResults = await Promise.all(tiketPromises);

      tiketResults.forEach(({ error }, index) => {
        if (error) {
          console.error(`Error inserting tiket ke-${index + 1}:`, error);
        }
      });

      navigation.navigate('InformasiScreen', { pemesananId, totalHarga, tglBerlaku, selectedMetode });
    } catch (error) {
      console.error(error.message);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Pembelian Tiket</Text>

      {/* Tanggal Berlaku */}
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePicker}>
        <Text style={styles.dateText}>
          {selectedDate.toISOString().split('T')[0]} {/* Format: YYYY-MM-DD */}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="calendar"
          onChange={handleDateChange}
        />
      )}

      {/* Harga Tiket VIP */}
      <View style={styles.tiketContainer}>
        <Text style={styles.tiketText}>VIP - Rp. {(hargaJenis + hargaTipe.vip).toLocaleString('id-ID')}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={() => handleJumlahChange('vip', false)} style={styles.button}>
            <MaterialCommunityIcons name="minus" size={30} color="#000" />
          </TouchableOpacity>
          <Text style={styles.jumlah}>{jumlahVIP}</Text>
          <TouchableOpacity onPress={() => handleJumlahChange('vip', true)} style={styles.button}>
            <MaterialCommunityIcons name="plus" size={30} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Harga Tiket Reguler */}
      <View style={styles.tiketContainer}>
        <Text style={styles.tiketText}>Reguler - Rp. {(hargaJenis + hargaTipe.regular).toLocaleString('id-ID')}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={() => handleJumlahChange('reguler', false)} style={styles.button}>
            <MaterialCommunityIcons name="minus" size={30} color="#000" />
          </TouchableOpacity>
          <Text style={styles.jumlah}>{jumlahReguler}</Text>
          <TouchableOpacity onPress={() => handleJumlahChange('reguler', true)} style={styles.button}>
            <MaterialCommunityIcons name="plus" size={30} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Pilihan Metode Pembayaran */}
      <Text style={styles.label}>Pilih Metode Pembayaran:</Text>
      {metodePembayaran.map(metode => (
        <TouchableOpacity
          key={metode.id_metode}
          style={[
            styles.metodePembayaran,
            selectedMetode === metode.id_metode && styles.selectedMetode
          ]}
          onPress={() => setSelectedMetode(metode.id_metode)}
        >
          <Text>{metode.nama_metode}</Text>
        </TouchableOpacity>
      ))}

      {/* Total Harga */}
      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Total: Rp. {totalHarga.toLocaleString('id-ID')}</Text>
        <TouchableOpacity onPress={calculateTotal} style={styles.kalkulasiButton}>
          <Text style={styles.kalkulasiText}>Hitung Total</Text>
        </TouchableOpacity>
      </View>

      {/* Konfirmasi */}
      <TouchableOpacity onPress={handleKonfirmasiPembelian} style={styles.konfirmasiButton}>
        <Text style={styles.konfirmasiText}>Konfirmasi Pembelian</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  datePicker: { padding: 10, borderWidth: 1, borderRadius: 5, marginBottom: 16 },
  dateText: { fontSize: 16 },
  tiketContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  tiketText: { fontSize: 16, fontWeight: 'bold' },
  buttonContainer: { flexDirection: 'row', alignItems: 'center' },
  button: { padding: 10, backgroundColor: '#f0f0f0', borderRadius: 5 },
  jumlah: { marginHorizontal: 10, fontSize: 16 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  metodePembayaran: { padding: 10, borderWidth: 1, borderRadius: 5, marginBottom: 8 },
  selectedMetode: { backgroundColor: '#d0e8ff' },
  totalContainer: { marginTop: 16, marginBottom: 16 },
  totalText: { fontSize: 16, fontWeight: 'bold' },
  kalkulasiButton: { padding: 10, backgroundColor: '#f0f0f0', borderRadius: 5 },
  kalkulasiText: { fontSize: 16, textAlign: 'center' },
  konfirmasiButton: { padding: 15, backgroundColor: '#4caf50', borderRadius: 5 },
  konfirmasiText: { color: '#fff', fontSize: 16, textAlign: 'center' },
});

export default PembelianTiket;
