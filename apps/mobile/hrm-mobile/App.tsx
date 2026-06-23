import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import { Platform, StatusBar as RNStatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SplashIntro } from './src/components/brand/SplashIntro';
import { AppErrorBoundary } from './src/components/app/AppErrorBoundary';
import { AuthProvider } from './src/context/AuthContext';
import { NetworkProvider } from './src/context/NetworkContext';
import { RealtimeProvider } from './src/context/RealtimeContext';
import { useQaLoginDeepLink } from './src/hooks/useQaLoginDeepLink';
import { RootNavigator } from './src/navigation/RootNavigator';

function QaLoginDeepLinkBridge() {
  useQaLoginDeepLink();
  return null;
}

export default function App() {
  const [introDone, setIntroDone] = useState(false);
  const onIntroFinish = useCallback(() => setIntroDone(true), []);
  const [resetKey, setResetKey] = useState(0);
  const onRetry = useCallback(() => {
    setIntroDone(false);
    setResetKey((k) => k + 1);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
      <AppErrorBoundary resetKey={resetKey} onRetry={onRetry}>
        <AuthProvider key={resetKey}>
          <QaLoginDeepLinkBridge />
          <NetworkProvider>
            <RealtimeProvider>
              <StatusBar style={introDone ? 'dark' : 'light'} translucent={Platform.OS === 'android'} />
              {Platform.OS === 'android' ? (
                <RNStatusBar
                  translucent
                  backgroundColor="transparent"
                  barStyle={introDone ? 'dark-content' : 'light-content'}
                />
              ) : null}
              <RootNavigator />
              {!introDone ? <SplashIntro onFinish={onIntroFinish} /> : null}
            </RealtimeProvider>
          </NetworkProvider>
        </AuthProvider>
      </AppErrorBoundary>
    </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
