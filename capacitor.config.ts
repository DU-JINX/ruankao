// author du
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ruankao.quiz',
  appName: '软考题库',
  webDir: 'dist',
  server: {
    url: 'http://106.12.52.251:8081',
    cleartext: true
  }
};

export default config;


