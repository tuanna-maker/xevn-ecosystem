import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { NetworkProvider } from './src/context/NetworkContext';
import { RealtimeProvider } from './src/context/RealtimeContext';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NetworkProvider>
          <RealtimeProvider>
            <StatusBar style="light" />
            <RootNavigator />
          </RealtimeProvider>
        </NetworkProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
