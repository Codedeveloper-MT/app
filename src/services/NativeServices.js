import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { Share } from '@capacitor/share';
import { Toast } from '@capacitor/toast';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Network } from '@capacitor/network';
import { StatusBar } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { App } from '@capacitor/app';

class NativeServices {
  constructor() {
    this.isNative = Capacitor.isNativePlatform();
    this.initializeApp();
  }

  async initializeApp() {
    if (this.isNative) {
      // Hide the splash screen
      await SplashScreen.hide();
      
      // Set status bar style
      await StatusBar.setStyle({ style: 'dark' });
      
      // Listen for app state changes
      App.addListener('appStateChange', ({ isActive }) => {
        console.log('App state changed. Is active?', isActive);
      });

      // Listen for network changes
      Network.addListener('networkStatusChange', status => {
        console.log('Network status changed', status);
      });
    }
  }

  // Camera functions
  async takePicture() {
    if (!this.isNative) {
      return this.getWebCamera();
    }

    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      });
      
      return image.webPath;
    } catch (error) {
      console.error('Camera error:', error);
      throw error;
    }
  }

  async getWebCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment'
        }
      });
      return stream;
    } catch (error) {
      console.error('Web camera error:', error);
      throw error;
    }
  }

  // Location functions
  async getCurrentPosition() {
    try {
      const coordinates = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 5000
      });
      
      return coordinates;
    } catch (error) {
      console.error('Location error:', error);
      throw error;
    }
  }

  async watchPosition(callback) {
    try {
      const watchId = await Geolocation.watchPosition({
        enableHighAccuracy: true,
        timeout: 5000
      }, callback);
      
      return watchId;
    } catch (error) {
      console.error('Watch position error:', error);
      throw error;
    }
  }

  clearWatch(watchId) {
    Geolocation.clearWatch({ id: watchId });
  }

  // Sharing functions
  async shareLocation(latitude, longitude, address) {
    if (!this.isNative) {
      return this.webShare(latitude, longitude, address);
    }

    try {
      await Share.share({
        title: 'My Location',
        text: `My current location: ${address}`,
        url: `https://www.google.com/maps?q=${latitude},${longitude}`,
        dialogTitle: 'Share your location'
      });
    } catch (error) {
      console.error('Share error:', error);
      throw error;
    }
  }

  async webShare(latitude, longitude, address) {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Location',
          text: `My current location: ${address}`,
          url: `https://www.google.com/maps?q=${latitude},${longitude}`
        });
      } catch (error) {
        console.error('Web share error:', error);
        throw error;
      }
    } else {
      throw new Error('Web Share API not supported');
    }
  }

  // Feedback functions
  async showToast(message, duration = 'short') {
    if (this.isNative) {
      await Toast.show({
        text: message,
        duration: duration
      });
    } else {
      // Fallback for web
      alert(message);
    }
  }

  async vibrate(style = 'medium') {
    if (this.isNative) {
      switch (style) {
        case 'light':
          await Haptics.impact({ style: ImpactStyle.Light });
          break;
        case 'medium':
          await Haptics.impact({ style: ImpactStyle.Medium });
          break;
        case 'heavy':
          await Haptics.impact({ style: ImpactStyle.Heavy });
          break;
      }
    } else if ('vibrate' in navigator) {
      navigator.vibrate(200);
    }
  }

  // Network functions
  async getNetworkStatus() {
    if (this.isNative) {
      return await Network.getStatus();
    } else {
      return {
        connected: navigator.onLine,
        connectionType: navigator.onLine ? 'wifi' : 'none'
      };
    }
  }

  // App lifecycle functions
  async exitApp() {
    if (this.isNative) {
      await App.exitApp();
    }
  }

  async minimizeApp() {
    if (this.isNative) {
      await App.minimizeApp();
    }
  }
}

export const nativeServices = new NativeServices(); 