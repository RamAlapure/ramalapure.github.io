import { useEffect, useState } from 'react';
import { useLearnI18n } from '../context/LearnI18nContext';

export function OfflineIndicator() {
  const { tUi } = useLearnI18n();
  const [online, setOnline] = useState(true);

  useEffect(() => {
    function handleOnline() {
      setOnline(true);
    }

    function handleOffline() {
      setOnline(false);
    }

    setOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (online) return null;

  return (
    <div className="learn-offline-banner" role="status" aria-live="polite">
      {tUi('offline.message')}
    </div>
  );
}
