/**
 * Compresses an image file to be under a target size (default 4.7MB).
 * Returns the compressed image as a Base64 string.
 */
export const compressImage = (file: File, targetSizeMB: number = 4.7): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Initial resizing if extremely large (e.g. > 4000px) to save memory/time
                const MAX_DIMENSION = 3000;
                if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
                    if (width > height) {
                        height = Math.round((height * MAX_DIMENSION) / width);
                        width = MAX_DIMENSION;
                    } else {
                        width = Math.round((width * MAX_DIMENSION) / height);
                        height = MAX_DIMENSION;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Canvas context not available'));
                    return;
                }
                ctx.drawImage(img, 0, 0, width, height);

                // Binary search/Iterative approach to find quality
                let minQuality = 0.1;
                let maxQuality = 0.95; // Start slightly below 1 to ensure some compression
                let quality = 0.8;
                let dataUrl = '';

                // Target size in bytes
                const targetBytes = targetSizeMB * 1024 * 1024;

                // Simple iteration to find acceptable quality
                // We limit iterations to avoid performance issues
                for (let i = 0; i < 5; i++) {
                    dataUrl = canvas.toDataURL(file.type, quality);

                    // Estimate size (base64 length * 0.75 is approx binary size)
                    // Heuristic: remove metadata overhead from base64 string
                    const base64Len = dataUrl.length - (dataUrl.indexOf(',') + 1);
                    const sizeInBytes = (base64Len * 3) / 4; // approximate

                    if (sizeInBytes <= targetBytes) {
                        // If it fits, we try to get closer to the limit if we are too far (optional)
                        // For now, if it fits, we are good, but maybe we compressed too much?
                        // Let's settle for "under limit" as the primary goal.
                        // Ideally we want close to 4.7MB, so maybe we increase minQuality?
                        // But simple approach: if it fits, check if we can improve quality.

                        if (sizeInBytes > targetBytes * 0.9) {
                            // Close enough (within 90% of target)
                            break;
                        }

                        // It's too small, try higher quality
                        minQuality = quality;
                    } else {
                        // Too big, try lower quality
                        maxQuality = quality;
                    }
                    quality = (minQuality + maxQuality) / 2;
                }

                resolve(dataUrl);
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};
