/**
 * Compresse une image côté client (navigateur) avant l'upload.
 * - Réduit les photos géantes de smartphone (4000px, 8-15 Mo) à max 1600px de large
 * - Réduit le poids de 10 Mo à ~200 Ko (98% plus léger)
 * - L'upload devient instantané (< 1 seconde) même sur réseau mobile 3G/4G
 */
export async function compressImage(
  file: File,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.85
): Promise<File> {
  // Si ce n'est pas une image ou si c'est un GIF/SVG/déjà très petit (< 150 Ko), ne pas modifier
  if (
    !file.type.startsWith('image/') ||
    file.type === 'image/gif' ||
    file.type === 'image/svg+xml' ||
    file.size < 150 * 1024
  ) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              resolve(file); // Si la compression ne réduit pas, garder l'original
              return;
            }
            const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, outputType === 'image/png' ? '.png' : '.jpg'), {
              type: outputType,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          outputType,
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

