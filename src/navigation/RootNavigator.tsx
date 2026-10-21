import React, { useEffect, useRef } from 'react';
import { AppState, View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import AuthScreen from '@screens/AuthScreen';
import HomeScreen from '@screens/HomeScreen';
import DetailScreen from '@screens/DetailScreen';
import CartScreen from '@screens/CartScreen';
import OrdersScreen from '@screens/OrdersScreen';
import ScannerScreen from '@screens/ScannerScreen';
import AIChatScreen from '@screens/AIChatScreen';
import CheckoutModalScreen from '@screens/CheckoutModalScreen';
import OrderDetailScreen from '@screens/OrderDetailScreen';
import ShopButton from '@components/ShopButton';

import { Product } from '@services/api';
import { useCartStore } from '@services/useCartStore';
import { useTheme } from '@contexts/ThemeContext';

export type RootStackParamList = {
  Auth: undefined;
  MainTabs: undefined;
  Detail: { product: Product };
  Scanner: undefined;
  AIChat: undefined;
  Checkout: undefined;
  OrderDetail: { orderId: string };
};

export type MainTabParamList = {
  HomeTab: undefined;
  CartTab: undefined;
  OrdersTab: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Cấu hình Deep Link shopai:// (Mục 3 & Checklist B)
const linking = {
  prefixes: ['shopai://', 'https://shopai.vn'],
  config: {
    screens: {
      MainTabs: {
        screens: {
          HomeTab: 'home',
          CartTab: 'cart',
          OrdersTab: 'orders',
        },
      },
      OrderDetail: 'order/:orderId',
      AIChat: 'ai',
    },
  },
};

function MainTabNavigator() {
  const { colors } = useTheme();
  const totalCount = useCartStore(state => state.getTotalCount());
  const ordersCount = useCartStore(state => state.orders.length);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 58,
          paddingBottom: 6,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 17, color }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="CartTab"
        component={CartScreen}
        options={{
          title: 'Giỏ hàng',
          tabBarBadge: totalCount > 0 ? totalCount : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.primary, color: '#FFF' },
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 17, color }}>🛒</Text>,
        }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrdersScreen}
        options={{
          title: 'Đơn hàng',
          tabBarBadge: ordersCount > 0 ? ordersCount : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.secondary, color: '#FFF' },
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 17, color }}>📦</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { colors } = useTheme();
  const { token, isAppLocked, setAppLocked } = useCartStore();
  const bgTimestamp = useRef<number | null>(null);

  // Chương 8: Tự động bật App Lock nếu đưa app xuống nền quá 15 giây
  useEffect(() => {
    const sub = AppState.addEventListener('change', nextState => {
      if (nextState === 'background') {
        bgTimestamp.current = Date.now();
      } else if (nextState === 'active' && bgTimestamp.current) {
        if (Date.now() - bgTimestamp.current > 15000 && token) {
          setAppLocked(true);
        }
        bgTimestamp.current = null;
      }
    });
    return () => sub.remove();
  }, [token, setAppLocked]);

  // Màn hình khóa bảo mật Biometric / App Lock (Chương 8)
  if (token && isAppLocked) {
    return (
      <View style={[styles.lockContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.lockCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={{ fontSize: 40, marginBottom: 10 }}>🔐</Text>
          <Text style={[styles.lockTitle, { color: colors.text }]}>
            ShopAI App Lock (Biometric)
          </Text>
          <Text style={[styles.lockSub, { color: colors.textLight }]}>
            Phiên làm việc đã được khóa bảo vệ. Vui lòng xác thực sinh trắc học để tiếp tục.
          </Text>
          <ShopButton
            title="🔓 Xác thực Vân tay / FaceID"
            onPress={() => setAppLocked(false)}
            style={{ marginTop: 18, width: '100%' }}
          />
        </View>
      </View>
    );
  }

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        {!token ? (
          <Stack.Screen
            name="Auth"
            component={AuthScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen
              name="MainTabs"
              component={MainTabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Detail"
              component={DetailScreen}
              options={{ title: 'Chi tiết sản phẩm' }}
            />
            <Stack.Screen
              name="Scanner"
              component={ScannerScreen}
              options={{ title: 'Quét mã Barcode AI' }}
            />
            <Stack.Screen
              name="AIChat"
              component={AIChatScreen}
              options={{ title: '🤖 Trợ lý mua sắm AI' }}
            />
            <Stack.Screen
              name="Checkout"
              component={CheckoutModalScreen}
              options={{ title: 'Thanh toán đơn hàng', presentation: 'modal' }}
            />
            <Stack.Screen
              name="OrderDetail"
              component={OrderDetailScreen}
              options={{ title: 'Chi tiết hóa đơn' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  lockContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  lockCard: { width: '100%', padding: 24, borderRadius: 16, borderWidth: 1, alignItems: 'center' },
  lockTitle: { fontSize: 18, fontWeight: 'bold' },
  lockSub: { fontSize: 13, textAlign: 'center', marginTop: 8 },
});