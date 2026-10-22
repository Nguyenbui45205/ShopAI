import { create } from 'zustand';
import Geolocation from '@react-native-community/geolocation';
import { PermissionsAndroid, Platform } from 'react-native';

interface GpsState {
  distanceKm: number;
  shipFee: number;
  coordsText: string;
  loading: boolean;
  location: { latitude: number; longitude: number } | null; // Bổ sung biến lưu tọa độ gốc
  fetchRealDeviceGps: () => Promise<void>;
}

const SHOP_WAREHOUSE = { lat: 10.7769, lon: 106.7009 };

function calculateHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (val: number) => (val * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return +(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
}

export const useGpsStore = create<GpsState>((set) => ({
  distanceKm: 5.3, //[cite: 14]
  shipFee: 26500, //[cite: 14]
  coordsText: 'Đang định vị...', //[cite: 14]
  loading: false, //[cite: 14]
  location: null, // Khởi tạo giá trị ban đầu
  
  fetchRealDeviceGps: async () => {
    set({ loading: true });
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION); //[cite: 14]
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) { //[cite: 14]
          // Rớt quyền GPS -> Trả về tọa độ mặc định của khu vực Gò Vấp
          set({ 
            coordsText: 'Gò Vấp (Chưa bật GPS)', 
            distanceKm: 5.4, 
            shipFee: 25000, 
            loading: false,
            location: { latitude: 10.8221, longitude: 106.6868 } 
          });
          return;
        }
      }

      Geolocation.getCurrentPosition(
        position => {
          let { latitude, longitude } = position.coords;
          let label = `GPS: ${latitude.toFixed(3)}, ${longitude.toFixed(3)}`; //[cite: 14]
          
          // Giới hạn vùng địa lý, nếu máy ảo đang ở bên Mỹ thì ép về Gò Vấp[cite: 14]
          if (latitude > 25 || latitude < 8 || longitude < 100) { //[cite: 14]
            latitude = 10.8221; longitude = 106.6868; //[cite: 14]
            label = `Gò Vấp, TP.HCM (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`; //[cite: 14]
          }

          const km = calculateHaversineKm(SHOP_WAREHOUSE.lat, SHOP_WAREHOUSE.lon, latitude, longitude); //[cite: 14]
          const rawFee = km <= 2 ? 12000 : 12000 + Math.round((km - 2) * 4000); //[cite: 14]
          
          set({ 
            coordsText: label, 
            distanceKm: km, 
            shipFee: Math.min(rawFee, 50000), //[cite: 14]
            loading: false,
            location: { latitude, longitude } // Bắn tọa độ gốc lên Store để Checkout màn hình sử dụng
          });
        },
        _error => set({ 
          coordsText: 'Gò Vấp (Fallback)',  //[cite: 14]
          distanceKm: 5.3,  //[cite: 14]
          shipFee: 26500,  //[cite: 14]
          loading: false,
          location: { latitude: 10.8221, longitude: 106.6868 } 
        }),
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 } //[cite: 14]
      );
    } catch {
      set({ loading: false }); //[cite: 14]
    }
  }
}));