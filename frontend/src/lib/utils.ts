import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { toast } from 'react-hot-toast';
import { api } from './api';

let activeToastId: string | null = null;

export function showSingleToast(message: string, duration = 2000) {
  if (!activeToastId) {
    activeToastId = toast.error(message);
    setTimeout(() => {
      activeToastId = null;
    }, duration);
  }
}
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getShadePerInterviewsCount(
  count: number,
  tailwindColor: string,
  defaultColor: string = 'gray',
  theme: string = 'light' // Default to "light" theme
) {
  if (count <= 0) {
    return `bg-${defaultColor}-${theme === 'dark' ? '800' : '100'
      } text-${defaultColor}-${theme === 'dark' ? '400' : '700'}`;
  }

  const lightModeShades = {
    bg: [100, 200, 300, 400, 500],
    text: [800, 800, 900, 900, 900],
  };

  const darkModeShades = {
    bg: [700, 600, 500, 400, 300], // Darker for backgrounds in dark mode
    text: [100, 200, 300, 400, 500], // Lighter for text in dark mode
  };

  const { bg: bgShades, text: textShades } = theme === 'dark' ? darkModeShades : lightModeShades;

  const thresholds = [1, 3, 5, 10];

  let index = thresholds.findIndex((threshold) => count < threshold);
  if (index === -1) {
    index = thresholds.length; // Use the last shade if count exceeds all thresholds
  }

  index = Math.min(index, bgShades.length - 1);

  return `bg-${tailwindColor}-${bgShades[index]} text-${tailwindColor}-${textShades[index]}`;
}

export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${day}-${month}-${year}`;
};

export const isValidUUID = (id: string): boolean => {
  return (
    typeof id === 'string' &&
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
      id
    )
  );
};
/**
 * Opens the IndexedDB database for storing videos.
 * @returns {Promise<IDBDatabase>} A promise that resolves to the database instance.
 */
function openVideoDB(examId: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(examId, 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('videos')) {
        db.createObjectStore('videos'); // Create an object store for videos
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function saveVideoToIndexedDB(
  blob: Blob,
  key = 'recordedVideo',
  examId: string
): Promise<void> {
  try {
    const db = await openVideoDB(examId);
    const tx = db.transaction('videos', 'readwrite');
    const store = tx.objectStore('videos');
    store.put(blob, key); // Save the blob with the specified key

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => {
        db.close();
        resolve();
      };

      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  } catch (error) {
    console.error('Error saving video to IndexedDB:', error);
    throw error;
  }
}
export async function deleteVideoFromIndexedDB(
  key = 'recordedVideo',
  examId: string
): Promise<void> {
  try {
    const db = await openVideoDB(examId);
    
    return new Promise((resolve, reject) => {
      const tx = db.transaction('videos', 'readwrite');
      const store = tx.objectStore('videos');
      const request = store.delete(key);
      
      request.onsuccess = () => {
        db.close();
        resolve();
      };

      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Error deleting video from IndexedDB:', error);
    throw error;
  }
}

export async function loadVideoFromIndexedDB(
  key = 'recordedVideo',
  examId: string,
  signal?: AbortSignal
): Promise<Blob | null> {
  try {
    const db = await openVideoDB(examId);
    return new Promise((resolve, reject) => {
      if (signal?.aborted) return reject(new DOMException('Aborted', 'AbortError'));

      signal?.addEventListener('abort', () => {
        request.onerror = null;
        request.onsuccess = null;
        reject(new DOMException('Aborted', 'AbortError'));
      });

      const tx = db.transaction('videos', 'readonly');
      const store = tx.objectStore('videos');
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result || null);
        db.close();
      };

      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Error loading video from IndexedDB:', error);
    throw error;
  }
}

export const dataURLtoBlob = (dataURL: string) => {
  const arr = dataURL.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : '';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new Blob([u8arr], { type: mime });
};
export const roundOff = (number: number, decimal: number = 2): number => {
  return Number(number.toFixed(decimal));
};

export const formatTestDuration = (startDate: string, endDate: string): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const diffMs = Math.abs(end.getTime() - start.getTime());
  const totalMinutes = roundOff(diffMs / (1000 * 60), 0);

  return `${totalMinutes} minutes`;
};

export const uploadFileInChunks = async (file: Blob, chunkSize: number = 5 * 1024 * 1024, examId: string = ''): Promise<{ UploadId: string, fileName: string, parts: { ETag: string, PartNumber: number }[] }> => {
  const totalChunks = Math.ceil(file.size / chunkSize);
  const fileName = String(Date.now())
  let UploadId;
  const parts = [];
  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize;
    const end = start + chunkSize;
    const chunk = file.slice(start, end)
    const formData = new FormData();
    formData.append('chunk', chunk);
    formData.append('filename', fileName);
    formData.append('index', String(i));
    formData.append('totalChunks', String(totalChunks));
    if (UploadId) {
      formData.append('UploadId', UploadId);
    }

    if (examId) formData.append('examId', examId);

    const response = await api.post(`/upload/chunk?chunkFolder=${fileName}`, formData);
    UploadId = response.data.UploadId
    if (UploadId) {
      parts.push({ ETag: JSON.parse(response.data.ETag as string), PartNumber: i + 1 })
    }
  }
  return { UploadId, fileName, parts }
}
