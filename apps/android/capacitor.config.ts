import type { CapacitorConfig } from '@capacitor/cli';

/**
 * The app id matches the Windows build's, so the two stores list the same
 * application rather than two that happen to share a name.
 */
const config: CapacitorConfig = {
  appId: 'com.fibonacci0112.cubesolverpro',
  appName: 'Cube Solver Pro',
  webDir: 'dist',
  android: {
    backgroundColor: '#0f1117',
  },
};

export default config;
