import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../supabase/supabaseConfig';

const HomeScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation();

  const handleAuth = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (isLoginMode) {
        // Logika Login
        const { data: userPengunjung, error: pengunjungError } = await supabase
          .from('pengunjung')
          .select('*')
          .eq('email', email)
          .eq('pasword_pengunjung', password)
          .single();

        if (userPengunjung) {
          console.log(`Logged in as Pengunjung, ID: ${userPengunjung.id_pengunjung}`);
          navigation.navigate('BerandaTabs', { username: userPengunjung.nama_pengunjung, userId: userPengunjung.id_pengunjung });
          return;
        }

        setError('Email atau password salah.');
      } else {
        // Logika Register
        const { data: existingUser, error: checkError } = await supabase
          .from('pengunjung')
          .select('*')
          .eq('email', email)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          throw new Error('Terjadi kesalahan saat memeriksa email.');
        }

        if (existingUser) {
          Alert.alert(
            'Email Sudah Terdaftar',
            `Email ${email} sudah digunakan oleh pengguna: ${existingUser.nama_pengunjung}. Apakah Anda ingin login?`,
            [
              { text: 'Batal' },
              {
                text: 'Ya',
                onPress: () => {
                  setIsLoginMode(true);
                  setUsername(existingUser.nama_pengunjung);
                  setPhone(existingUser.no_hp);
                  setPassword('');
                },
              },
            ]
          );
          return;
        }

        const { data: newUser, error: insertError } = await supabase
          .from('pengunjung')
          .insert({
            nama_pengunjung: username,
            no_hp: phone,
            email,
            pasword_pengunjung: password,
          })
          .select();

        if (insertError) {
          throw new Error('Terjadi kesalahan saat mendaftarkan pengguna.');
        }

        Alert.alert('Registrasi Berhasil', `Akun untuk ${newUser[0].nama_pengunjung} berhasil dibuat.`);
        setIsLoginMode(true);
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan, coba lagi.');
    } finally {
      setLoading(false);
    }
  }, [isLoginMode, username, email, phone, password, navigation]);

  useEffect(() => {
    console.log(isLoginMode ? 'Mode Login' : 'Mode Daftar');
  }, [isLoginMode]);

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image source={require('../assets/gambar1.png')} style={styles.logo} />

      {/* Toggle Login/Sign-Up */}
      <View style={styles.toggleContainer}>
        <Text
          style={[styles.toggleText, !isLoginMode && styles.activeText]}
          onPress={() => setIsLoginMode(false)}
        >
          Sign Up
        </Text>
        <Text
          style={[styles.toggleText, isLoginMode && styles.activeText]}
          onPress={() => setIsLoginMode(true)}
        >
          Log In
        </Text>
      </View>

      {/* Input Fields */}
      {!isLoginMode && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            style={styles.input}
            placeholder="Nomor HP"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </>
      )}
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.showPasswordButton}>
          <Image
            source={
              showPassword
                ? require('../assets/buka.png') // Gambar untuk mata terbuka
                : require('../assets/tutup.png') // Gambar untuk mata tertutup
            }
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>

      {/* Button */}
      <TouchableOpacity
        style={[styles.button, (!email || !password) && styles.buttonDisabled]}
        onPress={handleAuth}
        disabled={!email || !password || loading}
      >
        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>{isLoginMode ? 'Login' : 'Daftar'}</Text>}
      </TouchableOpacity>
      {error && <Text style={styles.error}>{error}</Text>}
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
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  toggleText: {
    fontSize: 18,
    color: 'gray',
    fontWeight: 'bold',
    paddingHorizontal: 10,
  },
  activeText: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 20,
    width: '100%',
    borderRadius: 5,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  showPasswordButton: {
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 25,
    height: 25,
  },
  button: {
    backgroundColor: 'blue',
    paddingVertical: 10,
    alignItems: 'center',
    width: '100%',
    borderRadius: 5,
  },
  buttonDisabled: {
    backgroundColor: 'lightgray',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginTop: 10,
  },
});

export default HomeScreen;
