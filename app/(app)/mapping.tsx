import { ScrollView, View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';

export default function Mapping() {
  const sampleMap = [
    '#4CAF50', '#4CAF50', '#FFC107', '#4CAF50',
    '#FFC107', '#4CAF50', '#F44336', '#4CAF50',
    '#4CAF50', '#4CAF50', '#FFC107', '#4CAF50',
    '#4CAF50', '#F44336', '#4CAF50', '#4CAF50',
  ];

  const getAnimatedBlinkStyle = () => {
    const opacity = useSharedValue(1);

    useEffect(() => {
      opacity.value = withRepeat(withTiming(0.3, { duration: 500 }), -1, true);
    }, []);

    return useAnimatedStyle(() => ({
      opacity: opacity.value,
    }));
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={true}>
      <View style={styles.container}>
        <Text style={styles.title}>Mapeo de Cultivo</Text>

        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapText}>Mapa del cultivo</Text>
          <Text style={styles.mapDescription}>
            Zonas saludables, alerta y listas para extraer
          </Text>

          <View style={styles.grid}>
            {sampleMap.map((color, index) => {
              const isWarning = color === '#F44336';
              const isReady = color === '#FFC107';

              if (isWarning) {
                const animatedStyle = getAnimatedBlinkStyle();
                return (
                  <View key={index} style={{ position: 'relative' }}>
                    <Animated.View style={[styles.cell, { backgroundColor: color }, animatedStyle]} />
                  </View>
                );
              }

              return (
                <View key={index} style={{ position: 'relative' }}>
                  <View style={[styles.cell, { backgroundColor: color }]} />
                  {isReady && (
                    <Text style={styles.emojiOverlay}>🥑</Text>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Leyenda</Text>

          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.legendText}>Saludable</Text>
          </View>

          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FFC107' }]} />
            <Text style={styles.legendText}>Listo para cosecha</Text>
          </View>

          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#F44336' }]} />
            <Text style={styles.legendText}>Alerta</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
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
  mapPlaceholder: {
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  mapText: {
    fontSize: 24,
    color: '#7c8a93',
    fontFamily: 'Poppins-SemiBold',
  },
  mapDescription: {
    fontSize: 16,
    color: '#7c8a93',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  grid: {
    width: 200,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  cell: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  emojiOverlay: {
    position: 'absolute',
    top: -8,
    right: -8,
    fontSize: 18,
  },
  legend: {
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    padding: 20,
  },
  legendTitle: {
    fontSize: 18,
    color: '#3b1260',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  legendDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  legendText: {
    fontSize: 16,
    color: '#000000',
    fontFamily: 'Poppins-Regular',
  },
});
