import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
    return `bg-${defaultColor}-${
      theme === 'dark' ? '800' : '100'
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

export const isValidUUID=(id:string): boolean =>{
  return typeof id === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(id);
}
/**
 * Opens the IndexedDB database for storing videos.
 * @returns {Promise<IDBDatabase>} A promise that resolves to the database instance.
 */
function openVideoDB(examId:string): Promise<IDBDatabase> {
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

export async function saveVideoToIndexedDB(blob: Blob, key = 'recordedVideo',examId:string): Promise<void> {
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

export async function loadVideoFromIndexedDB(key = 'recordedVideo',examId:string,signal?: AbortSignal): Promise<Blob | null> {
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

