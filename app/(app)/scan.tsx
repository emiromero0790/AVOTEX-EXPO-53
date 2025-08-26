import { useEffect, useRef, useState } from "react"; 
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { RotateCw as RotateCwIcon } from "lucide-react-native";

const URL_PREDICT_FILE = "https://tflite-service-630562712876.us-central1.run.app/predict";
const URL_PREDICT_BASE64 = "https://tflite-service-630562712876.us-central1.run.app/predict_base64";

export default function Scan() {
  const [permission, requestPermission] = useCameraPermissions();
  const [type, setType] = useState<CameraType>("back");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<string | null>(null);
  const cameraRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopCapturing = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: true,
        skipProcessing: true,
      });
      setPhotoUri(photo.uri);
      const pred = await sendImageToServer(photo);
      if (pred?.label && pred.score != null) {
        setPrediction(`${pred.label}: ${(pred.score * 100).toFixed(1)}%`);
      } else {
        setPrediction("Respuesta inválida");
      }
    } catch (e) {
      console.error("Error capturando foto:", e);
    }
  };

  const startCapturing = () => {
    stopCapturing();
    intervalRef.current = setInterval(() => {
      takePicture();
    }, 1500);
  };

  const sendImageToServer = async (image: { uri?: string; base64?: string }) => {
    try {
      if (Platform.OS === "web") {
        if (!image.base64) return;
        const base64Pure = image.base64.split(",")[1] ?? image.base64;
        const res = await fetch(URL_PREDICT_BASE64, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: base64Pure }),
        });
        if (!res.ok) return;
        return await res.json();
      } else {
        if (!image.uri) return;
        const fileRes = await fetch(image.uri);
        const blob = await fileRes.blob();
        const formData = new FormData();
        formData.append("file", {
          uri: image.uri,
          name: "photo.jpg",
          type: blob.type || "image/jpeg",
        } as any);
        const res = await fetch(URL_PREDICT_FILE, {
          method: "POST",
          body: formData,
        });
        if (!res.ok) return;
        return await res.json();
      }
    } catch (e) {
      console.error("Error enviando imagen:", e);
    }
  };

  useEffect(() => {
    if (permission?.granted) {
      startCapturing();
    }
    return () => {
      stopCapturing();
    };
  }, [permission?.granted, type]);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Necesitamos acceso a la cámara</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Permitir acceso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleCameraType = () => {
    setType((current) => (current === "back" ? "front" : "back"));
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} type={type} ref={cameraRef} facing={type}>
        <View style={styles.overlay}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Escanear Aguacate</Text>
          </View>
          <View style={styles.controls}>
            <TouchableOpacity style={styles.flipButton} onPress={toggleCameraType}>
              <RotateCwIcon color="#eee" size={28} />
              <Text style={styles.flipText}></Text>
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>

      {prediction && (
        <View style={[styles.predictionContainer, 
          prediction.toLowerCase().includes("sano") ? styles.sano : styles.enfermo]}>
          <Text style={styles.predictionText}>🎯 {prediction}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 20,
  },
  header: {
    paddingTop: 40,
    alignItems: "center",
  },
  headerText: {
    color: "#ffffff",
    fontSize: 24,
    fontFamily: "Poppins-SemiBold",
  },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 40,
  },
  flipButton: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingVertical: 10,
    alignItems: "center",
    gap: 10,
  },
  flipText: {
    color: "#eee",
    fontSize: 16,
    fontFamily: "Poppins-Regular",
  },
  predictionContainer: {
    position: "absolute",
    bottom: 100,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 6,
  },
  predictionText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "Poppins-SemiBold",
  },
  sano: {
    backgroundColor: "#2ecc71", // verde
  },
  enfermo: {
    backgroundColor: "#e74c3c", // rojo
  },
  text: {
    color: "#ffffff",
    fontSize: 18,
    fontFamily: "Poppins-Regular",
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#219bef",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
  },
});
