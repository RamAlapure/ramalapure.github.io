import { useEffect, useState } from 'react';
import { useLearnI18n } from '../context/LearnI18nContext';

const DISMISS_KEY = 'learn-pwa-dismiss';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PwaInstallHint() {
  const { tUi } = useLearnI18n();
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  if (!installEvent || dismissed) return null;

  function dismissHint() {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // Ignore storage errors for dismiss preference.
    }
  }

  async function handleInstall() {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === 'accepted') {
      setInstallEvent(null);
      return;
    }
    dismissHint();
  }

  return (
    <div className="learn-install-banner" role="region" aria-label={tUi('install.title')}>
      <p className="learn-install-text">{tUi('install.message')}</p>
      <div className="learn-install-actions">
        <button type="button" className="learn-btn learn-btn-compact" onClick={handleInstall}>
          {tUi('install.action')}
        </button>
        <button
          type="button"
          className="learn-btn learn-btn-secondary learn-btn-compact"
          onClick={dismissHint}
        >
          {tUi('install.dismiss')}
        </button>
      </div>
    </div>
  );
}
