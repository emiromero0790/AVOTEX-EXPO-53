import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Camera, Map, ChartLine as LineChart, Leaf, Sun, Droplets, Calendar } from 'lucide-react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import * as Location from 'expo-location';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

const getWeatherEmoji = (temp: number) => {
  if (temp < 5) return '🌨️';
  if (temp < 15) return '🌧️';
  if (temp < 25) return '⛅';
  if (temp < 32) return '🌤️';
  return '🌩️';
};

const formatDate = (date: Date) => {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
};

const formatTime12h = (date: Date) => {
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
};

export default function Home() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold
  });

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [temperature, setTemperature] = useState<number | null>(null);
  const [humidity, setHumidity] = useState<number | null>(null);
  const [weatherDescription, setWeatherDescription] = useState<string | null>(null);
  const [dateTime, setDateTime] = useState<{ date: string; time: string }>({ date: '', time: '' });
  const [municipioEstado, setMunicipioEstado] = useState<string>('');

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);

        const places = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        if (places.length > 0) {
          const place = places[0];
          const municipio = place.city || place.subregion || place.region || '';
          const estado = place.region || '';
          setMunicipioEstado(`${municipio}, ${estado}`);
        }
      }
    })();
  }, []);

  useEffect(() => {
    if (location) {
      const fetchWeather = async () => {
        try {
          const { latitude, longitude } = location.coords;
          const API_KEY = '02a20e008e6564743d58753851aea172';
          const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&lang=es&appid=${API_KEY}`
          );

          setTemperature(response.data.main.temp);
          setHumidity(response.data.main.humidity);
          setWeatherDescription(response.data.weather[0].description);
        } catch (error) {
          console.error('Error al obtener clima:', error);
        }
      };
      fetchWeather();
    }
  }, [location]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setDateTime({
        date: formatDate(now),
        time: formatTime12h(now),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const navigateTo = (route: string) => router.push(route);

  if (!fontsLoaded) return null;

  return (
    <LinearGradient colors={['#e0f7ec', '#ffffff']} style={styles.gradientBackground}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Animated.View entering={FadeInDown.delay(200).duration(1000)}>
            <Text style={styles.welcomeText}>Bienvenido a</Text>
            <Text style={styles.title}>AvoTex 🥑</Text>
          </Animated.View>

          {municipioEstado.length > 0 && (
            <Text style={styles.municipioEstado}>📍{municipioEstado} {dateTime.time} {dateTime.date}</Text>
          )}

          <Animated.View entering={FadeInDown.delay(400).duration(1000)} style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Sun color="#50c878" size={24} />
              <Text style={styles.statValue}>
                {temperature !== null ? `${getWeatherEmoji(temperature)} ${temperature.toFixed(1)}°C` : '...'}
              </Text>
              <Text style={styles.statLabel}>Temperatura</Text>
            </View>
            <View style={styles.statCard}>
              <Droplets color="#4fbcff" size={24} />
              <Text style={styles.statValue}>
                {humidity !== null ? `${humidity}%` : '...'}
              </Text>
              <Text style={styles.statLabel}>Humedad</Text>
            </View>
            <View style={styles.statCard}>
              <Leaf color="#50c878" size={24} />
              <Text style={{ fontSize: 11, fontFamily: 'Poppins_600SemiBold' }}>
                Huerta sin escanear
              </Text>
              <Text style={styles.statLabel}>Salud</Text>
            </View>
          </Animated.View>

          {location && (
            <MapView
              style={{ width: '100%', height: 180, borderRadius: 12, marginTop: 20 }}
              initialRegion={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
            >
              {/* OpenStreetMap tiles */}
              <UrlTile
                urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                maximumZ={19}
                flipY={false}
              />
              <Marker
                coordinate={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                }}
                title="Tu ubicación"
              />
            </MapView>
          )}
        </View>

        <Animated.View entering={FadeInUp.delay(600).duration(1000)} style={styles.grid}>
          <TouchableOpacity style={styles.mainCard} onPress={() => navigateTo('/scan')}>
            <LinearGradient colors={['#4fbcff', '#2e8bc0']} style={styles.cardGradient}>
              <View style={styles.cardIconContainer}>
                <Camera color="#ffffff" size={25} />
              </View>
              <Text style={styles.cardTitle}>Escanear</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.secondaryCardsContainer}>
            <TouchableOpacity style={[styles.secondaryCard, { marginBottom: 16 }]} onPress={() => navigateTo('/mapping')}>
              <LinearGradient colors={['#50c878', '#2e8b57']} style={styles.cardGradient}>
                <View style={styles.cardIconContainer}>
                  <Map color="#ffffff" size={25} />
                </View>
                <Text style={styles.secondaryCardTitle}>Mapeo</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.secondaryCard, { marginBottom: 16 }]} onPress={() => navigateTo('/results')}>
              <LinearGradient colors={['#ffaa4f', '#ff8c00']} style={styles.cardGradient}>
                <View style={styles.cardIconContainer}>
                  <LineChart color="#ffffff" size={25} />
                </View>
                <Text style={styles.secondaryCardTitle}>Resultados</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryCard} onPress={() => navigateTo('/agenda')}>
              <LinearGradient colors={['#9c27b0', '#7b1fa2']} style={styles.cardGradient}>
                <View style={styles.cardIconContainer}>
                  <Calendar color="#ffffff" size={25} />
                </View>
                <Text style={styles.secondaryCardTitle}>Agenda</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Poppins_400Regular',
  },
  title: {
    fontSize: 32,
    fontFamily: 'Poppins_700Bold',
    color: '#2a2a2a',
    marginTop: -5,
  },
  municipioEstado: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: '#2a2a2a',
    marginTop: 0,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 16,
    elevation: 5,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#2a2a2a',
    marginTop: 2,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: '#666',
  },
  grid: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 16,
  },
  mainCard: {
    flex: 1,
    height: 270,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 8,
  },
  secondaryCardsContainer: {
    flex: 1,
  },
  secondaryCard: {
    flex: 1,
    height: 130,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 8,
  },
  cardGradient: {
    flex: 1,
    padding: 24,
  },
  cardIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
    color: '#ffffff',
    marginTop: 8,
  },
  secondaryCardTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#ffffff',
    marginTop: 4,
  },
});
