import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.saeed.app',
  appName: 'Saeed & Sohila',
  webDir: 'dist',
  server: {
    url: 'https://saeed-three.vercel.app',
    cleartext: false
  }
};

export default config;