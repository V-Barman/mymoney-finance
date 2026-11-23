async function downloadAndroidPackage(
  path: string,
  filename: string,
  mimeType: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const response = await fetch(path, { cache: 'no-store' });
    if (!response.ok) {
      return {
        ok: false,
        error: `${filename} not found on this host (HTTP ${response.status}). Make sure you are opening the latest preview or have re-shared the app.`,
      };
    }

    const buffer = await response.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // Verify ZIP/APK/AAB magic header ("PK" -> 0x50, 0x4B)
    if (bytes.length < 10000 || bytes[0] !== 0x50 || bytes[1] !== 0x4b) {
      return {
        ok: false,
        error: `This URL returned a webpage instead of ${filename}. Please open the latest preview inside AI Studio and tap Download from inside the app.`,
      };
    }

    const blob = new Blob([buffer], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 10000);

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : `Unable to download ${filename}.`,
    };
  }
}

export function downloadAndroidApk(): Promise<{ ok: boolean; error?: string }> {
  return downloadAndroidPackage(
    '/MyMoney.apk',
    'MyMoney.apk',
    'application/vnd.android.package-archive'
  );
}

export function downloadAndroidBundle(): Promise<{ ok: boolean; error?: string }> {
  return downloadAndroidPackage(
    '/MyMoney.aab',
    'MyMoney.aab',
    'application/octet-stream'
  );
}
