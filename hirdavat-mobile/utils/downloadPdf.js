import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { tokenStorage } from '../api/axiosClient';

export async function downloadAndSharePdf(url, filename) {
  const token = await tokenStorage.getAccess();
  const destination = new File(Paths.cache, filename);

  const file = await File.downloadFileAsync(url, destination, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    idempotent: true,
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
  }

  return file;
}
