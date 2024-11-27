import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Import screens
import HomeScreen from './screens/HomeScreen';
import BerandaScreen from './screens/BerandaScreen';
import BerandaAdmin from './screens/BerandaAdmin';
import BerandaPemilik from './screens/BerandaPemilik';
import TiketScreen from './screens/TiketScreen';
import RiwayatScreen from './screens/RiwayatScreen';
import ProfilScreen from './screens/ProfilScreen';
import PembelianTiket from './screens/PembelianTiket';
import InformasiScreen from './screens/InformasiScreen';
import LihatTiket from './screens/LihatTiket'; // Import LihatTiket
import './supabase/supabaseConfig';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = ({ route }) => {
  const [activeIcon, setActiveIcon] = useState('Beranda'); // Tab aktif default
  const { userId } = route.params || {}; // Ambil userId dari parameter

  if (!userId) {
    console.error('Error: userId tidak ditemukan di TabNavigator');
    return null; // Hindari error jika userId tidak ditemukan
  }

  const handleTabPress = (tabName) => {
    setActiveIcon(tabName);
  };

  return (
    <Tab.Navigator
      initialRouteName="Beranda"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Beranda') {
            iconName = 'home';
          } else if (route.name === 'Tiket') {
            iconName = 'ticket';
          } else if (route.name === 'Riwayat') {
            iconName = 'view-list';
          } else if (route.name === 'Profil') {
            iconName = 'account';
          }

          return (
            <MaterialCommunityIcons
              name={iconName}
              size={size}
              color={activeIcon === route.name ? '#000' : '#fff'} // Warna hitam untuk ikon aktif
            />
          );
        },
        tabBarStyle: {
          backgroundColor: '#A0C4FF', // Background untuk tab bar
          borderTopLeftRadius: 30, // Rounded corners atas
          borderTopRightRadius: 30, // Rounded corners atas
          height: 60, // Tinggi tab bar
        },
        tabBarLabelStyle: {
          color: activeIcon === route.name ? '#000' : '#fff', // Warna label aktif
        },
      })}
    >
      <Tab.Screen
        name="Beranda"
        component={BerandaScreen}
        initialParams={{ userId }} // Kirim userId ke BerandaScreen
        options={{
          headerStyle: {
            backgroundColor: '#A0C4FF',
            borderBottomLeftRadius: 30,
            borderBottomRightRadius: 30,
            height: 100,
          },
          headerTitleStyle: {
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 24,
            textAlign: 'center',
          },
        }}
        listeners={{
          tabPress: () => handleTabPress('Beranda'),
        }}
      />
      <Tab.Screen
        name="Tiket"
        component={TiketScreen}
        initialParams={{ userId }} // Kirim userId ke TiketScreen
        options={{
          headerStyle: {
            backgroundColor: '#A0C4FF',
            borderBottomLeftRadius: 30,
            borderBottomRightRadius: 30,
            height: 100,
          },
          headerTitleStyle: {
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 24,
            textAlign: 'center',
          },
        }}
        listeners={{
          tabPress: () => handleTabPress('Tiket'),
        }}
      />
      <Tab.Screen
        name="Riwayat"
        component={RiwayatScreen}
        initialParams={{ userId }} // Kirim userId ke RiwayatScreen
        options={{
          headerStyle: {
            backgroundColor: '#A0C4FF',
            borderBottomLeftRadius: 30,
            borderBottomRightRadius: 30,
            height: 100,
          },
          headerTitleStyle: {
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 24,
            textAlign: 'center',
          },
        }}
        listeners={{
          tabPress: () => handleTabPress('Riwayat'),
        }}
      />
      <Tab.Screen
        name="Profil"
        component={ProfilScreen}
        initialParams={{ userId }} // Kirim userId ke ProfilScreen
        options={{
          headerStyle: {
            backgroundColor: '#A0C4FF',
            borderBottomLeftRadius: 30,
            borderBottomRightRadius: 30,
            height: 100,
          },
          headerTitleStyle: {
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 24,
            textAlign: 'center',
          },
        }}
        listeners={{
          tabPress: () => handleTabPress('Profil'),
        }}
      />
    </Tab.Navigator>
  );
};

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen name="BerandaAdmin" component={BerandaAdmin} />
        <Stack.Screen name="BerandaPemilik" component={BerandaPemilik} />
        <Stack.Screen
          name="BerandaTabs"
          component={TabNavigator}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="PembelianTiket"
          component={PembelianTiket}
          options={{
            headerStyle: {
              backgroundColor: '#A0C4FF',
            },
            headerTitleStyle: {
              color: '#fff',
              fontWeight: 'bold',
              fontSize: 24,
              textAlign: 'center',
            },
          }}
        />
        <Stack.Screen
          name="InformasiScreen"
          component={InformasiScreen}
          options={{
            headerStyle: {
              backgroundColor: '#A0C4FF',
            },
            headerTitleStyle: {
              color: '#fff',
              fontWeight: 'bold',
              fontSize: 24,
              textAlign: 'center',
            },
            headerLeft: () => null, // Hilangkan tombol kembali
          }}
        />
        <Stack.Screen
          name="LihatTiket"
          component={LihatTiket}
          options={{
            headerStyle: {
              backgroundColor: '#A0C4FF',
            },
            headerTitleStyle: {
              color: '#fff',
              fontWeight: 'bold',
              fontSize: 24,
              textAlign: 'center',
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
