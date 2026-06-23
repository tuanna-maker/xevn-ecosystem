import * as Font from 'expo-font';
import ioniconsFont from '../../assets/fonts/Ionicons.ttf';

/** App-local font — stable Metro asset id (avoids OneDrive absolute paths in release bundle). */
const IONICONS_FONT = ioniconsFont;

let preloadPromise: Promise<void> | null = null;

/** Preload ionicons before tab icons mount; never throws (RN unhandled-rejection safe). */
export function preloadVectorIconFonts(): Promise<void> {
  if (!preloadPromise) {
    preloadPromise = Font.loadAsync({ ionicons: IONICONS_FONT })
      .then(() => undefined)
      .catch(() => undefined);
  }
  return preloadPromise;
}

export function isVectorIconFontsReady(): boolean {
  return Font.isLoaded('ionicons');
}
