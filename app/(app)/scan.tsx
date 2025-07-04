import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator, ScrollView } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import { bundleResourceIO, decodeJpeg } from '@tensorflow/tfjs-react-native';
import * as ImagePicker from 'expo-image-picker';

// Clases de clasificación para tu modelo
const CLASSES = ['Sano', 'Enfermo', 'Varicela', 'Hongo'];

export default function PlantDiseaseScanner() {
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<Array<{className: string, probability: number}>>([]);
  const [model, setModel] = useState<tf.LayersModel | null>(null);
  const [isLoading, setIsLoading] = useState({
    model: true,
    classification: false,
    camera: true
  });
  const [history, setHistory] = useState<string[]>([]);
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();

  // 1. Verificar y solicitar permisos
  useEffect(() => {
    const getPermissions = async () => {
      await requestPermission();
      setIsLoading(prev => ({...prev, camera: false}));
    };

    if (!permission?.granted) {
      getPermissions();
    } else {
      setIsLoading(prev => ({...prev, camera: false}));
    }
  }, [permission]);

  // 2. Cargar modelo TensorFlow desde assets

useEffect(() => {
  const loadModel = async () => {
    try {
      setIsLoading(prev => ({ ...prev, model: true }));
      await tf.ready();
      console.log('✅ TensorFlow listo');

      // Usa bundleResourceIO en lugar de Asset.fromModule(...)
      const modelJson = require('../../assets/images/model/model.json');
      const modelWeights = [
        require('../../assets/images/model/group1-shard1of4.bin'),
        require('../../assets/images/model/group1-shard2of4.bin'),
        require('../../assets/images/model/group1-shard3of4.bin'),
        require('../../assets/images/model/group1-shard4of4.bin')
      ];

      const model = await tf.loadLayersModel(bundleResourceIO(modelJson, modelWeights));
      setModel(model);
      console.log('✅ Modelo cargado exitosamente');
      model.summary();
    } catch (error) {
      console.error('❌ Error crítico al cargar el modelo:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, model: false }));
    }
  };

  loadModel();

  return () => {
    if (model) {
      model.dispose();
    }
  };
}, []);



  const uriToFile = async (uri: string, name: string): Promise<File> => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new File([blob], name);
  };

  // 3. Tomar foto con CameraView
  const takePicture = async () => {
    if (cameraRef.current && !isLoading.classification) {
      try {
        setIsLoading(prev => ({...prev, classification: true}));
        setPredictions([]);
        
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
          skipProcessing: true,
          exif: false
        });
        
        if (photo.uri && photo.base64) {
          setImageUri(photo.uri);
          await classifyImage(photo.base64);
          setHistory(prev => [photo.uri, ...prev.slice(0, 3)]);
        }
      } catch (error) {
        console.error('Error tomando foto:', error);
      } finally {
        setIsLoading(prev => ({...prev, classification: false}));
      }
    }
  };

  // 4. Seleccionar imagen de galería
  const pickImage = async () => {
    if (isLoading.classification) return;
    
    try {
      setIsLoading(prev => ({...prev, classification: true}));
      setPredictions([]);
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        base64: true,
        allowsEditing: false
      });

      if (!result.canceled && result.assets[0].uri && result.assets[0].base64) {
        setImageUri(result.assets[0].uri);
        await classifyImage(result.assets[0].base64);
        setHistory(prev => [result.assets[0].uri, ...prev.slice(0, 3)]);
      }
    } catch (error) {
      console.error('Error seleccionando imagen:', error);
    } finally {
      setIsLoading(prev => ({...prev, classification: false}));
    }
  };

  // 5. Clasificar imagen
const classifyImage = async (base64: string) => {
  if (!model) return;

  try {
    const imgBuffer = tf.util.encodeString(base64, 'base64').buffer;
    const raw = new Uint8Array(imgBuffer);
    let imageTensor = decodeJpeg(raw)
      .resizeBilinear([180, 180])
      .expandDims(0)
      .toFloat()
      .div(tf.scalar(255));

    const prediction = model.predict(imageTensor) as tf.Tensor;
    const data = await prediction.data();

    const sorted = Array.from(data)
      .map((prob, idx) => ({
        className: CLASSES[idx] || `Clase ${idx}`,
        probability: prob
      }))
      .sort((a, b) => b.probability - a.probability);

    setPredictions(sorted);
    tf.dispose([imageTensor, prediction]);
  } catch (error) {
    console.error('Error clasificando imagen:', error);
  }
};


  // 6. Volver a la cámara
  const resetScanner = () => {
    setImageUri(null);
    setPredictions([]);
  };

  // 7. Cargar imagen del historial
  const loadFromHistory = async (uri: string) => {
    if (isLoading.classification) return;
    
    try {
      setIsLoading(prev => ({...prev, classification: true}));
      setImageUri(uri);
      setPredictions([]);
      
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64
      });
      
      await classifyImage(base64);
    } catch (error) {
      console.error('Error cargando del historial:', error);
    } finally {
      setIsLoading(prev => ({...prev, classification: false}));
    }
  };

  // Estados de carga
  if (isLoading.model || isLoading.camera) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>
          {isLoading.model ? 'Cargando modelo...' : 'Preparando cámara...'}
        </Text>
      </View>
    );
  }

  // Permisos no otorgados
  if (!permission?.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Necesitamos acceso a la cámara para funcionar</Text>
        <TouchableOpacity 
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.buttonText}>Otorgar Permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Vista principal
  return (
    <View style={styles.container}>
      {!imageUri ? (
        <CameraView 
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
          enableTorch={false}
          enableZoomGesture
          barcodeScannerSettings={{
            barcodeTypes: [],
          }}
        >
          <View style={styles.controls}>
            <TouchableOpacity 
              style={styles.flipButton}
              onPress={() => setFacing(current => current === 'back' ? 'front' : 'back')}
            >
              <Text style={styles.controlButtonText}>🔄</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.captureButton}
              onPress={takePicture}
              disabled={isLoading.classification}
            >
              <View style={[styles.captureButtonInner, isLoading.classification && styles.captureButtonDisabled]}>
                <Text style={styles.captureButtonText}>📸</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.galleryButton}
              onPress={pickImage}
              disabled={isLoading.classification}
            >
              <Text style={styles.controlButtonText}>📁</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      ) : (
        <ScrollView style={styles.resultsContainer}>
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
          
          {isLoading.classification ? (
            <View style={styles.loadingIndicator}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.loadingText}>Analizando imagen...</Text>
            </View>
          ) : (
            <View style={styles.resultsSection}>
              <Text style={styles.resultsTitle}>Resultados del Análisis</Text>
              
              {predictions.map((item, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.resultItem,
                    index === 0 && styles.bestResult
                  ]}
                >
                  <Text style={styles.resultClassName}>{item.className}</Text>
                  <View style={styles.probabilityBarContainer}>
                    <View style={[
                      styles.probabilityBar,
                      { width: `${item.probability * 100}%` }
                    ]} />
                    <Text style={styles.resultProbability}>
                      {(item.probability * 100).toFixed(1)}%
                    </Text>
                  </View>
                  {index === 0 && (
                    <Text style={styles.bestGuessLabel}>Mejor coincidencia</Text>
                  )}
                </View>
              ))}
            </View>
          )}
          
          <TouchableOpacity
            style={styles.backButton}
            onPress={resetScanner}
            disabled={isLoading.classification}
          >
            <Text style={styles.buttonText}>Volver a Escanear</Text>
          </TouchableOpacity>
          
          {history.length > 0 && (
            <View style={styles.historySection}>
              <Text style={styles.historyTitle}>Análisis Recientes</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {history.map((uri, index) => (
                  <TouchableOpacity
                    key={`${uri}-${index}`}
                    style={styles.historyImageContainer}
                    onPress={() => loadFromHistory(uri)}
                  >
                    <Image 
                      source={{ uri }} 
                      style={styles.historyImage}
                    />
                    {imageUri === uri && (
                      <View style={styles.currentSelectionIndicator} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#333',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  permissionText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  permissionButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    elevation: 3,
  },
  camera: {
    flex: 1,
    aspectRatio: 9/16,
  },
  controls: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  flipButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    alignSelf: 'center',
  },
  captureButtonInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  captureButtonDisabled: {
    backgroundColor: '#ccc',
  },
  galleryButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonText: {
    fontSize: 24,
    color: '#fff',
  },
  captureButtonText: {
    fontSize: 30,
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  previewImage: {
    width: '100%',
    height: 350,
    resizeMode: 'contain',
    backgroundColor: '#000',
  },
  loadingIndicator: {
    padding: 30,
    alignItems: 'center',
  },
  resultsSection: {
    padding: 20,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  resultItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
  },
  bestResult: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  resultClassName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  probabilityBarContainer: {
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    marginBottom: 8,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  probabilityBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  resultProbability: {
    position: 'absolute',
    right: 10,
    color: '#333',
    fontWeight: 'bold',
  },
  bestGuessLabel: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'right',
  },
  backButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    margin: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  historySection: {
    padding: 20,
    paddingTop: 0,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  historyImageContainer: {
    marginRight: 15,
    alignItems: 'center',
  },
  historyImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  currentSelectionIndicator: {
    position: 'absolute',
    bottom: -5,
    width: 20,
    height: 5,
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
});