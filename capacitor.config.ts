import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vigilentaids.app',
  appName: 'VigilentAids',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  android: {
    buildOptions: {
      keystorePath: 'release.keystore',
      keystoreAlias: 'release',
    }
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#2563eb",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      spinnerColor: "#ffffff",
    },
    Camera: {
      presentationStyle: 'fullscreen'
    },
    Geolocation: {
      permissions: {
        android: {
          geolocation: {
            alias: "location",
            required: true
          }
        }
      }
    }
  }
}

export default config;
