import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ChartBar as BarChart3, TrendingUp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold } from '@expo-google-fonts/poppins';

export default function ResultsScreen() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(255, 170, 79, 0.15)', 'transparent']}
        style={styles.gradient}
      />
      <View style={styles.header}>
        <Text style={styles.title}>Resultados</Text>
        <Text style={styles.subtitle}>Historial de análisis</Text>
      </View>
      <ScrollView style={styles.scrollView}>
        <View style={styles.chartPlaceholder}>
          <BarChart3 color="#ffaa4f" size={60} />
          <Text style={styles.placeholderText}>Estadísticas de Salud</Text>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statTitle}>Sector A</Text>
              <TrendingUp color="#50c878" size={16} />
            </View>
            <Text style={styles.statValue}>92%</Text>
            <Text style={styles.statLabel}>Salud promedio</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statTitle}>Sector B</Text>
              <TrendingUp color="#50c878" size={16} />
            </View>
            <Text style={styles.statValue}>87%</Text>
            <Text style={styles.statLabel}>Salud promedio</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statTitle}>Sector C</Text>
              <TrendingUp color="#ffaa4f" size={16} />
            </View>
            <Text style={styles.statValue}>78%</Text>
            <Text style={styles.statLabel}>Salud promedio</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 300,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#66bb6a',
    marginTop: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: '#666',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  chartPlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 170, 79, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 170, 79, 0.3)',
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: '#ffaa4f',
    marginTop: 16,
  },
  statsContainer: {
    marginBottom: 40,
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: '#2a2a2a',
  },
  statValue: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 32,
    color: '#2a2a2a',
  },
  statLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});