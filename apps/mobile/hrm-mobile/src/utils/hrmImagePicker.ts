import { Alert, Linking, Platform } from 'react-native';
import type * as ImagePickerTypes from 'expo-image-picker';

export type HrmImagePickerModule = typeof ImagePickerTypes;

export type HrmPickedImage = {
  uri: string;
  fileName: string;
  mimeType: string;
  byteSize?: number;
};

let cachedModule: HrmImagePickerModule | null | undefined;

/**
 * Load expo-image-picker on demand (not at app boot — avoids crash when native shell lacks module).
 * Uses require() for Hermes release reliability vs dynamic import().
 */
export function loadHrmImagePicker(): HrmImagePickerModule | null {
  if (cachedModule !== undefined) return cachedModule;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cachedModule = require('expo-image-picker') as HrmImagePickerModule;
    return cachedModule;
  } catch {
    cachedModule = null;
    return null;
  }
}

/** Android 13+ system photo picker does not require READ_MEDIA_IMAGES before launch. */
export function shouldRequestMediaLibraryPermission(): boolean {
  if (Platform.OS === 'ios') return true;
  if (Platform.OS === 'android') {
    const api = typeof Platform.Version === 'number' ? Platform.Version : parseInt(String(Platform.Version), 10);
    return Number.isFinite(api) && api < 33;
  }
  return true;
}

export async function ensureMediaLibraryPermission(
  ImagePicker: HrmImagePickerModule,
): Promise<boolean> {
  if (!shouldRequestMediaLibraryPermission()) return true;

  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (perm.granted) return true;

  if (perm.canAskAgain === false) {
    Alert.alert(
      'Quyền truy cập',
      'Cần quyền thư viện ảnh để chọn avatar. Mở Cài đặt để cấp quyền.',
      [
        { text: 'Huỷ', style: 'cancel' },
        { text: 'Cài đặt', onPress: () => void Linking.openSettings() },
      ],
    );
    return false;
  }

  Alert.alert('Quyền truy cập', 'Cần quyền thư viện ảnh để chọn avatar.');
  return false;
}

export async function pickHrmImageFromLibrary(): Promise<HrmPickedImage | null> {
  const ImagePicker = loadHrmImagePicker();
  if (!ImagePicker) {
    Alert.alert('Lỗi', 'Chức năng chọn ảnh chưa sẵn sàng trên bản cài này.');
    return null;
  }

  try {
    const permitted = await ensureMediaLibraryPermission(ImagePicker);
    if (!permitted) return null;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (result.canceled || !result.assets?.[0]) {
      const pending = await ImagePicker.getPendingResultAsync();
      const recovered = pending?.[0];
      if (
        recovered &&
        !('code' in recovered) &&
        !recovered.canceled &&
        recovered.assets?.[0]
      ) {
        return mapAsset(recovered.assets[0]);
      }
      return null;
    }

    return mapAsset(result.assets[0]);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Không mở được thư viện ảnh.';
    Alert.alert('Lỗi', message);
    return null;
  }
}

function mapAsset(asset: ImagePickerTypes.ImagePickerAsset): HrmPickedImage {
  return {
    uri: asset.uri,
    fileName: asset.fileName ?? `avatar-${Date.now()}.jpg`,
    mimeType: asset.mimeType ?? 'image/jpeg',
    byteSize: asset.fileSize,
  };
}
