import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ReduxProvider } from './src/store/redux/counterSlice';
import { ThemeProvider } from '@contexts/ThemeContext';
import RootNavigator from '@navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <ReduxProvider>
        <ThemeProvider>
          <RootNavigator />
        </ThemeProvider>
      </ReduxProvider>
    </SafeAreaProvider>
  );
}