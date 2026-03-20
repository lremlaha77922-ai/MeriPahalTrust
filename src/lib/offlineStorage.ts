// Offline Storage Utilities using IndexedDB
// For storing surveys offline and syncing when online

const DB_NAME = 'SwasthaSurveyDB';
const DB_VERSION = 1;
const STORE_NAME = 'pendingSurveys';

interface OfflineSurvey {
  id: string;
  coordinatorId: string;
  formData: any;
  photoBlob?: Blob;
  videoBlob: Blob;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  timestamp: number;
  synced: boolean;
}

// Initialize IndexedDB
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        objectStore.createIndex('synced', 'synced', { unique: false });
        objectStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
};

// Save survey offline
export const saveSurveyOffline = async (survey: Omit<OfflineSurvey, 'id' | 'timestamp' | 'synced'>): Promise<string> => {
  const db = await initDB();
  const id = `survey-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const surveyData: OfflineSurvey = {
    id,
    ...survey,
    timestamp: Date.now(),
    synced: false,
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(surveyData);

    request.onsuccess = () => resolve(id);
    request.onerror = () => reject(request.error);
  });
};

// Get all pending (unsynced) surveys
export const getPendingSurveys = async (): Promise<OfflineSurvey[]> => {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('synced');
    const request = index.getAll(false);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Get all surveys (for display)
export const getAllSurveys = async (): Promise<OfflineSurvey[]> => {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Mark survey as synced
export const markAsSynced = async (id: string): Promise<void> => {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const survey = getRequest.result;
      if (survey) {
        survey.synced = true;
        const updateRequest = store.put(survey);
        updateRequest.onsuccess = () => resolve();
        updateRequest.onerror = () => reject(updateRequest.error);
      } else {
        reject(new Error('Survey not found'));
      }
    };

    getRequest.onerror = () => reject(getRequest.error);
  });
};

// Delete synced surveys (cleanup)
export const deleteSyncedSurveys = async (): Promise<void> => {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('synced');
    const request = index.openCursor(true);

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      } else {
        resolve();
      }
    };

    request.onerror = () => reject(request.error);
  });
};

// Delete a specific survey
export const deleteSurvey = async (id: string): Promise<void> => {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// Get current location
export const getCurrentLocation = (): Promise<{ latitude: number; longitude: number; accuracy: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
};

// Check if online
export const isOnline = (): boolean => {
  return navigator.onLine;
};

// Get storage stats
export const getStorageStats = async (): Promise<{ total: number; pending: number; synced: number }> => {
  const allSurveys = await getAllSurveys();
  const pendingSurveys = allSurveys.filter(s => !s.synced);
  
  return {
    total: allSurveys.length,
    pending: pendingSurveys.length,
    synced: allSurveys.length - pendingSurveys.length,
  };
};
