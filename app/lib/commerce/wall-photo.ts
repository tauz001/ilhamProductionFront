export type WallPhotoPreview = {
  name: string;
  size: number;
  url: string;
};

export async function prepareWallPhoto(
  input: HTMLInputElement,
  setStatus: (status: string | null) => void,
  setPreview?: (preview: WallPhotoPreview | null) => void,
) {
  const file = input.files?.[0];
  if (!file) {
    setStatus(null);
    setPreview?.(null);
    return;
  }

  if (!file.type.startsWith('image/')) {
    setStatus('Please choose an image file.');
    setPreview?.(null);
    return;
  }

  try {
    const compressed = await compressImageToWebp(file);
    if (
      !compressed ||
      compressed.size >= file.size ||
        typeof DataTransfer === 'undefined'
    ) {
      setStatus(`${file.name} ready.`);
      setPreview?.(createPreview(file));
      return;
    }

    const transfer = new DataTransfer();
    transfer.items.add(compressed);
    input.files = transfer.files;
    setStatus('Photo compressed and ready.');
    setPreview?.(createPreview(compressed));
  } catch {
    setStatus(`${file.name} ready.`);
    setPreview?.(createPreview(file));
  }
}

function createPreview(file: File): WallPhotoPreview {
  return {
    name: file.name,
    size: file.size,
    url: URL.createObjectURL(file),
  };
}

async function compressImageToWebp(file: File) {
  if (typeof createImageBitmap === 'undefined') return null;

  const bitmap = await createImageBitmap(file);
  const maxWidth = 1280;
  const scale = Math.min(1, maxWidth / bitmap.width);
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/webp', 0.82),
  );
  if (!blob) return null;

  return new File([blob], 'ilham-wall-photo.webp', {type: 'image/webp'});
}
