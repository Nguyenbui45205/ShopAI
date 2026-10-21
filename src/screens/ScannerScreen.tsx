import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  PermissionsAndroid,
  Vibration,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/RootNavigator';
import { MOCK_PRODUCTS } from '@services/api';
import { useTheme } from '@contexts/ThemeContext';
import { useCartStore } from '@services/useCartStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Scanner'>;

export default function ScannerScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const setScannedBarcode = useCartStore(state => state.setScannedBarcode);
  const [hasPermission, setHasPermission] = useState<boolean>(false);

  useEffect(() => {
    const requestCamPermission = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Quyền sử dụng Camera',
            message: 'ShopAI cần quyền Camera để quét mã vạch sản phẩm.',
            buttonPositive: 'Cho phép',
            buttonNegative: 'Hủy',
          }
        );
        setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
      } else {
        setHasPermission(true);
      }
    };
    requestCamPermission();
  }, []);

  const handleScanSuccess = (barcode: string) => {
    Vibration.vibrate(60);
    setScannedBarcode(barcode);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#000' }]}>
      <View style={styles.cameraFrame}>
        <View style={[styles.scanBox, { borderColor: colors.primary }]} />
        <Text style={styles.hint}>
          {hasPermission
            ? 'Camera sẵn sàng · Đưa mã Barcode vào khung ngắm'
            : 'Đang chờ cấp quyền Camera (Bạn vẫn có thể chọn mã giả lập bên dưới)'}
        </Text>
      </View>

      <View style={[styles.simPanel, { backgroundColor: colors.surface }]}>
        <Text style={[styles.simTitle, { color: colors.text }]}>
          Giả lập Quét Barcode (Hỗ trợ test trên Máy ảo):
        </Text>
        {MOCK_PRODUCTS.map(p => (
          <Pressable
            key={p.barcode}
            style={[styles.simBtn, { borderColor: colors.primary }]}
            onPress={() => handleScanSuccess(p.barcode)}
          >
            <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 13 }}>
              Quét mã [{p.barcode}] - {p.name}
            </Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  cameraFrame: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  scanBox: { width: 220, height: 130, borderWidth: 3, borderRadius: 12 },
  hint: { color: '#FFF', marginTop: 14, fontSize: 13, textAlign: 'center' },
  simPanel: { padding: 16, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  simTitle: { fontWeight: 'bold', marginBottom: 10, fontSize: 14 },
  simBtn: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
    alignItems: 'center',
  },
});
