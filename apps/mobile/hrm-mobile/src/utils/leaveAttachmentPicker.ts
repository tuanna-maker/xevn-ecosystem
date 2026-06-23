import { Alert } from 'react-native';
import { pickHrmImageFromLibrary } from './hrmImagePicker';
import type { LeaveAttachmentDraft } from './leaveAttachment';

type DocumentPickerModule = {
  getDocumentAsync: (opts: {
    type?: string | string[];
    copyToCacheDirectory?: boolean;
    multiple?: boolean;
  }) => Promise<{
    canceled: boolean;
    assets?: Array<{
      uri: string;
      name?: string;
      mimeType?: string;
      size?: number;
    }>;
  }>;
};

function loadDocumentPicker(): DocumentPickerModule | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-document-picker') as DocumentPickerModule;
  } catch {
    return null;
  }
}

export async function pickLeaveAttachmentImage(): Promise<LeaveAttachmentDraft | null> {
  const picked = await pickHrmImageFromLibrary();
  if (!picked) return null;
  return {
    uri: picked.uri,
    fileName: picked.fileName,
    mimeType: picked.mimeType,
    byteSize: picked.byteSize,
  };
}

export async function pickLeaveAttachmentPdf(): Promise<LeaveAttachmentDraft | null> {
  const DocumentPicker = loadDocumentPicker();
  if (!DocumentPicker) {
    Alert.alert('Chưa hỗ trợ PDF', 'Bản cập nhật sắp tới — tạm thời chọn ảnh giấy tờ.');
    return null;
  }

  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/pdf',
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (result.canceled || !result.assets?.length) return null;

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    fileName: asset.name?.trim() || 'giay-nghi.pdf',
    mimeType: asset.mimeType?.trim() || 'application/pdf',
    byteSize: asset.size,
  };
}

export async function promptLeaveAttachmentPick(): Promise<LeaveAttachmentDraft | null> {
  return new Promise((resolve) => {
    Alert.alert('Đính kèm giấy tờ', 'Chọn ảnh hoặc PDF giấy nghỉ y tế.', [
      { text: 'Huỷ', style: 'cancel', onPress: () => resolve(null) },
      {
        text: 'Ảnh',
        onPress: () => {
          void (async () => {
            resolve(await pickLeaveAttachmentImage());
          })();
        },
      },
      {
        text: 'PDF',
        onPress: () => {
          void (async () => {
            resolve(await pickLeaveAttachmentPdf());
          })();
        },
      },
    ]);
  });
}
