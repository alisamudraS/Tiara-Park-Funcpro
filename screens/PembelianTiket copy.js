import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { supabase } from '../supabase/supabaseConfig'; // Supabase config

const PembelianTiket = () => {
  const route = useRoute();  // Untuk mengambil parameter dari TiketScreen
  const navigation = useNavigation();

  const { jenisId } = route.params; // Menangkap jenis tiket yang dipilih (1: Dewasa, 2: Anak)

  const [hargaJenis, setHargaJenis] = useState(0);
  const [hargaTipe, setHargaTipe] = useState({ vip: 0, regular: 0 });
  const [jumlahVIP, setJumlahVIP] = useState(0);  // Jumlah tiket VIP
  const [jumlahReguler, setJumlahReguler] = useState(0);  // Jumlah tiket reguler
  const [selectedDate, setSelectedDate] = useState(new Date());  // Tanggal berlaku
  const [showDatePicker, setShowDatePicker] = useState(false);  // Kontrol untuk memilih tanggal
  const [totalHarga, setTotalHarga] = useState(0);  // Total harga
  const [metodePembayaran, setMetodePembayaran] = useState([]);
  const [selectedMetode, setSelectedMetode] = useState(null);

  useEffect(() => {
    // Ambil harga jenis berdasarkan jenis tiket (Dewasa / Anak)
    const fetchHargaJenis = async () => {
      const { data, error } = await supabase
        .from('jenis_tiket')
        .select('*')
        .eq('id_jenis', jenisId)
        .single();

      if (error) {
        console.log('Error fetching harga jenis:', error);
        return;
      }

      setHargaJenis(data.harga_jenis);  // Set harga jenis tiket (Dewasa/Anak)
    };

    // Ambil harga tipe tiket (VIP / Regular)
    const fetchHargaTipe = async () => {
      const { data: tipeData, error } = await supabase
        .from('tipe_tiket')
        .select('*')
        .in('id_tipe', [1, 2]); // Mengambil data tipe tiket berdasarkan id_tipe
    
      if (error) {
        console.log('Error fetching harga tipe tiket:', error);
        return;
      }
    
      // Pastikan id_tipe 1 dipetakan ke VIP dan id_tipe 2 dipetakan ke Regular
      setHargaTipe({
        vip: tipeData.find(tipe => tipe.id_tipe === 1)?.harga_tipe || 0,
        regular: tipeData.find(tipe => tipe.id_tipe === 2)?.harga_tipe || 0
      });
    };
    

    // Ambil metode pembayaran
    const fetchMetodePembayaran = async () => {
      const { data, error } = await supabase.from('metode_pembayaran').select('*');
      if (error) {
        console.log('Error fetching metode pembayaran:', error);
        return;
      }
      setMetodePembayaran(data);
    };

    fetchHargaJenis();
    fetchHargaTipe();
    fetchMetodePembayaran();
  }, [jenisId]);

  // Fungsi untuk mengupdate total harga
  const calculateTotal = () => {
    const hargaRegulerTotal = hargaJenis + hargaTipe.regular;
    const hargaVIPTotal = hargaJenis + hargaTipe.vip;

    const total = (hargaRegulerTotal * jumlahReguler) + (hargaVIPTotal * jumlahVIP);
    setTotalHarga(total);
  };

  const handleJumlahChange = (type, increment) => {
    if (type === 'vip') {
      setJumlahVIP(prev => Math.max(0, prev + (increment ? 1 : -1))); // Mengubah jumlah VIP
    } else if (type === 'reguler') {
      setJumlahReguler(prev => Math.max(0, prev + (increment ? 1 : -1))); // Mengubah jumlah Reguler
    }
  };
  

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
  };

  const handleKonfirmasiPembelian = async () => {
    const tanggalPemesanan = new Date().toISOString().split('T')[0]; // Tanggal pemesanan (tanggal saat ini)
    const tglBerlaku = selectedDate.toISOString().split('T')[0]; // Format YYYY-MM-DD

    const { data: pemesananData, error: pemesananError } = await supabase
      .from('pemesanan_tiket')
      .insert([{
        tanggal_pemesanan: tanggalPemesanan,
        pengunjung_id_pengunjung: 1,  // Simulasi ID pengunjung
        metode_pembayaran_id_metode: selectedMetode,
        status: 'Diproses'
      }]);

    if (pemesananError) {
      console.error('Error inserting pemesanan_tiket:', pemesananError);
      return;
    }

    const pemesananId = pemesananData[0].id_pemesanan;  // Ambil ID pemesanan setelah insert

    const insertTiket = async (tipeId, jumlah, hargaTotal) => {
      for (let i = 0; i < jumlah; i++) {
        await supabase
          .from('tiket')
          .insert([{
            tanggal_berlaku: tglBerlaku,
            harga_total: hargaTotal,
            admin_id_admin: 1,  // Simulasi ID admin
            jenis_tiket_id_jenis: jenisId,
            pemesanan_tiket_id_pemesanan: pemesananId,
            tipe_tiket_id_tipe: tipeId
          }]);
      }
    };

    const hargaRegulerTotal = hargaJenis + hargaTipe.regular;
    const hargaVIPTotal = hargaJenis + hargaTipe.vip;
  
    await insertTiket(2, jumlahReguler, hargaRegulerTotal); // Insert tiket Regular (id_tipe: 2)
    await insertTiket(1, jumlahVIP, hargaVIPTotal);         // Insert tiket VIP (id_tipe: 1)
  
    navigation.navigate('InformasiPembelian', { totalHarga, tglBerlaku, selectedMetode });
  };

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


      {/* Metode Pembayaran */}
      <Text style={styles.title}>Pilih Metode Pembayaran</Text>
      {metodePembayaran.map((metode) => (
        <TouchableOpacity key={metode.id_metode} onPress={() => setSelectedMetode(metode.id_metode)} style={styles.metodeCard}>
          <Text style={styles.metodeText}>{metode.nama_metode}</Text>
        </TouchableOpacity>
      ))}

      {/* Tombol Konfirmasi */}
      <TouchableOpacity onPress={handleKonfirmasiPembelian} style={styles.beliButton}>
        <Text style={styles.beliButtonText}>Beli Sekarang</Text>
      </TouchableOpacity>

      {/* Total Harga */}
      <Text style={styles.totalText}>Total Harga: Rp. {totalHarga.toLocaleString('id-ID')}</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tiketContainer: {
    marginBottom: 20,
  },
  tiketText: {
    fontSize: 18,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    padding: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
    marginHorizontal: 10,
  },
  jumlah: {
    fontSize: 18,
  },
  datePicker: {
    padding: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
    marginBottom: 20,
  },
  dateText: {
    fontSize: 18,
  },
  metodeCard: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 5,
    marginBottom: 10,
  },
  metodeText: {
    fontSize: 18,
  },
  beliButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 5,
  },
  beliButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
});

export default PembelianTiket;
