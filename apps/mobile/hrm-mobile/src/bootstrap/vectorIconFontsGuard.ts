/**
 * Must import before @expo/vector-icons mounts — @expo/vector-icons calls
 * Font.loadAsync in componentDidMount without .catch (RN red snackbar on Hermes patch APK).
 */
import * as Font from 'expo-font';
import type { FontSource } from 'expo-font';

const originalLoadAsync = Font.loadAsync.bind(Font);

const safeLoadAsync = (fontMap: Record<string, FontSource>) =>
  originalLoadAsync(fontMap).catch(() => ({} as Record<string, FontSource>));

try {
  const desc = Object.getOwnPropertyDescriptor(Font, 'loadAsync');
  if (desc?.configurable === false) {
    (Font as { loadAsync: typeof safeLoadAsync }).loadAsync = safeLoadAsync;
  } else {
    Object.defineProperty(Font, 'loadAsync', {
      value: safeLoadAsync,
      writable: true,
      configurable: true,
    });
  }
} catch {
  (Font as { loadAsync: typeof safeLoadAsync }).loadAsync = safeLoadAsync;
}
