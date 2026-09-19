import { useEffect, useState } from 'react';
import { useLearnI18n } from '../context/LearnI18nContext';
import { isValidPin, PIN_LENGTH, verifyParentPin } from '../parent/pin';

interface ParentPinGateProps {
  storedPin?: string;
  variant?: 'page' | 'modal';
  onUnlock: () => void;
  onSetPin: (pin: string) => void;
  onBack: () => void;
}

export function ParentPinGate({
  storedPin,
  variant = 'page',
  onUnlock,
  onSetPin,
  onBack,
}: ParentPinGateProps) {
  const { tUi } = useLearnI18n();
  const isSetup = !storedPin;
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');

  function handleDigit(digit: string) {
    setError('');
    if (isSetup) {
      if (pin.length < PIN_LENGTH) {
        setPin((value) => value + digit);
        return;
      }
      if (confirmPin.length < PIN_LENGTH) {
        setConfirmPin((value) => value + digit);
      }
      return;
    }

    if (pin.length < PIN_LENGTH) {
      setPin((value) => value + digit);
    }
  }

  function handleBackspace() {
    setError('');
    if (isSetup && confirmPin.length > 0) {
      setConfirmPin((value) => value.slice(0, -1));
      return;
    }
    setPin((value) => value.slice(0, -1));
  }

  function handleSubmit() {
    if (isSetup) {
      if (!isValidPin(pin) || !isValidPin(confirmPin)) {
        setError(tUi('pin.invalid'));
        return;
      }
      if (pin !== confirmPin) {
        setError(tUi('pin.mismatch'));
        setPin('');
        setConfirmPin('');
        return;
      }
      onSetPin(pin);
      onUnlock();
      return;
    }

    if (!verifyParentPin(storedPin, pin)) {
      setError(tUi('pin.incorrect'));
      setPin('');
      return;
    }
    onUnlock();
  }

  const activeValue = isSetup && pin.length === PIN_LENGTH ? confirmPin : pin;
  const canSubmit = isSetup
    ? isValidPin(pin) && isValidPin(confirmPin)
    : pin.length === PIN_LENGTH;

  useEffect(() => {
    function isTypingInField(target: EventTarget | null): boolean {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTypingInField(event.target)) return;

      if (/^[0-9]$/.test(event.key)) {
        event.preventDefault();
        handleDigit(event.key);
        return;
      }

      switch (event.key) {
        case 'Backspace':
        case 'Delete':
          event.preventDefault();
          handleBackspace();
          return;
        case 'Enter':
          event.preventDefault();
          if (canSubmit) handleSubmit();
          return;
        case 'Escape':
          event.preventDefault();
          onBack();
          return;
        default:
          return;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canSubmit, confirmPin, isSetup, onBack, pin, storedPin]);

  const subtitle = isSetup
    ? tUi('pin.setupSubtitle')
    : variant === 'modal'
      ? tUi('pin.newLearnerSubtitle')
      : tUi('pin.enterSubtitle');

  const pinPad = (
    <section className="learn-pin-panel">
      <p className="learn-pin-label">
        {isSetup
          ? pin.length < PIN_LENGTH
            ? tUi('pin.choose')
            : tUi('pin.confirm')
          : tUi('pin.enter')}
      </p>
      <div className="learn-pin-display" aria-live="polite">
        {Array.from({ length: PIN_LENGTH }, (_, index) => (
          <span
            key={index}
            className={`learn-pin-dot ${index < activeValue.length ? 'is-filled' : ''}`.trim()}
          />
        ))}
      </div>

      <p className="learn-pin-keyboard-hint">{tUi('pin.keyboardHint')}</p>
      {error ? <p className="learn-pin-error" role="alert">{error}</p> : null}

      <div className="learn-pin-pad">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', '✓'].map((key) => (
          <button
            key={key}
            type="button"
            className={`learn-pin-key ${key === '✓' ? 'is-action' : ''}`.trim()}
            aria-label={
              key === '⌫' ? tUi('pin.backspace') : key === '✓' ? tUi('pin.submit') : key
            }
            onClick={() => {
              if (key === '⌫') handleBackspace();
              else if (key === '✓') handleSubmit();
              else handleDigit(key);
            }}
            disabled={key === '✓' && !canSubmit}
          >
            {key}
          </button>
        ))}
      </div>
    </section>
  );

  if (variant === 'modal') {
    return (
      <div className="learn-pin-dialog">
        <header className="learn-pin-dialog-header">
          <div>
            <h2 className="learn-pin-dialog-title">🔒 {tUi('pin.title')}</h2>
            <p className="learn-pin-dialog-subtitle">{subtitle}</p>
          </div>
          <button
            type="button"
            className="learn-icon-btn learn-pin-dialog-close"
            aria-label={tUi('pin.cancel')}
            onClick={onBack}
          >
            ✕
          </button>
        </header>
        {pinPad}
      </div>
    );
  }

  return (
    <>
      <header className="learn-header">
        <div>
          <h1 className="learn-title">🔒 {tUi('pin.title')}</h1>
          <p className="learn-subtitle">{subtitle}</p>
        </div>
        <button type="button" className="learn-icon-btn" aria-label={tUi('nav.backHome')} onClick={onBack}>
          ←
        </button>
      </header>
      {pinPad}
    </>
  );
}
