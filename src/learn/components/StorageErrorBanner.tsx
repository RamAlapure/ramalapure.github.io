import { useEffect, useState } from 'react';
import { useLearnI18n } from '../context/LearnI18nContext';
import {
  clearLastStorageWriteError,
  getLastStorageWriteError,
} from '../storage/store';

export function StorageErrorBanner() {
  const { tUi } = useLearnI18n();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function checkStorage() {
      const writeError = getLastStorageWriteError();
      setError(writeError);
    }

    checkStorage();
    window.addEventListener('learn-storage-write', checkStorage);
    return () => window.removeEventListener('learn-storage-write', checkStorage);
  }, []);

  if (!error) return null;

  const message =
    error === 'quota' ? tUi('storage.quota') : tUi('storage.unavailable');

  return (
    <div className="learn-storage-banner" role="alert">
      <p>{message}</p>
      <button
        type="button"
        className="learn-btn learn-btn-compact"
        onClick={() => {
          clearLastStorageWriteError();
          setError(null);
        }}
      >
        {tUi('storage.dismiss')}
      </button>
    </div>
  );
}
