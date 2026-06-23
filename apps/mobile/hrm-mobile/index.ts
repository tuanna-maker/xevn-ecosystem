import 'react-native-gesture-handler';
import './src/bootstrap/vectorIconFontsGuard';
import { registerRootComponent } from 'expo';
import App from './App';
import { preloadVectorIconFonts } from './src/bootstrap/vectorIconFonts';

// Register synchronously — Hermes release schedules "main" before async font preload resolves.
registerRootComponent(App);
void preloadVectorIconFonts();
