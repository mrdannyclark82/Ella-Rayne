import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Capacitor } from '@capacitor/core';

/**
 * Initialize Capacitor plugins for native platforms
 */
export const initializeCapacitor = async (): Promise<void> => {
  if (!Capacitor.isNativePlatform()) {
    return; // Only run on native platforms
  }

  try {
    // Configure status bar
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#000000' });

    // Hide splash screen after app is ready
    await SplashScreen.hide();
  } catch (error) {
    console.warn('Error initializing Capacitor plugins:', error);
  }
};
