import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.fuelandflex',
  appName: 'Fuel & Flex',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https',
    // For live-reload dev against Lovable preview, uncomment and set url:
    // url: 'https://id-preview--6291e4e1-94af-4f48-ada1-edfc2fb5ec9c.lovable.app',
    // cleartext: true,
  },
  android: {
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#000000',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#000000',
    },
  },
};

export default config;