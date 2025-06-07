import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  ScrollView,
  Dimensions
} from 'react-native';
import { WebView } from 'react-native-webview';
import Geolocation from '@react-native-community/geolocation';

const Navigation = () => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [mapUrl, setMapUrl] = useState('https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d114584.73428726542!2d28.04003668356935!3d-26.17145371974277!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1e950c68f0406a51%3A0x238ac9d9b1d34041!2sJohannesburg%2C%20South%20Africa!5e0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getCurrentLocation();
        } else {
          setError('Location permission denied');
        }
      } else {
        getCurrentLocation();
      }
    } catch (err) {
      console.error('Error requesting location permission:', err);
      setError('Error requesting location permission');
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
        updateMapUrl(latitude, longitude);
      },
      error => {
        console.error('Error getting location:', error);
        setError('Unable to get current location');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const updateMapUrl = (lat, lng, dest = '') => {
    if (dest) {
      // If we have a destination, show directions
      const url = `https://www.google.com/maps/embed/v1/directions?origin=${lat},${lng}&destination=${encodeURIComponent(dest)}&mode=driving`;
      setMapUrl(url);
    } else {
      // Just show the location
      const url = `https://www.google.com/maps/embed/v1/place?q=${lat},${lng}&zoom=15`;
      setMapUrl(url);
    }
  };

  const getDirections = () => {
    if (!destination) {
      setError('Please enter a destination');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (currentLocation) {
        updateMapUrl(
          currentLocation.latitude,
          currentLocation.longitude,
          destination
        );
      }
    } catch (err) {
      setError('Error getting directions. Please try again.');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const mapHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body, html { margin: 0; padding: 0; height: 100%; }
          iframe { width: 100%; height: 100%; border: 0; }
        </style>
      </head>
      <body>
        <iframe
          src="${mapUrl}"
          allowfullscreen=""
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
        ></iframe>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Starting point (current location)"
          value={origin}
          onChangeText={setOrigin}
          placeholderTextColor="#666"
          editable={false}
        />
        <TextInput
          style={styles.input}
          placeholder="Where to?"
          value={destination}
          onChangeText={setDestination}
          placeholderTextColor="#666"
        />
        <TouchableOpacity 
          style={styles.button}
          onPress={getDirections}
        >
          <Text style={styles.buttonText}>Get Directions</Text>
        </TouchableOpacity>
      </View>

      {isLoading && (
        <Text style={styles.message}>Getting directions...</Text>
      )}

      {error && (
        <Text style={styles.error}>{error}</Text>
      )}

      <View style={styles.mapContainer}>
        <WebView
          source={{ html: mapHTML }}
          style={styles.map}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView error: ', nativeEvent);
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  inputContainer: {
    padding: 16,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#007AFF',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  message: {
    textAlign: 'center',
    margin: 20,
    fontSize: 16,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    margin: 20,
    fontSize: 16,
  },
  mapContainer: {
    flex: 1,
    marginTop: 16,
  },
  map: {
    flex: 1,
  }
});

export default Navigation; 