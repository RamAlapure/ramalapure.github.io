import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityScreen } from '../components/ActivityScreen';
import { HomeScreen } from '../components/HomeScreen';
import { LearnErrorBoundary } from '../components/LearnErrorBoundary';
import { OfflineIndicator } from '../components/OfflineIndicator';
import { ParentPinGate } from '../components/ParentPinGate';
import { ParentScreen } from '../components/ParentScreen';
import { PwaInstallHint } from '../components/PwaInstallHint';
import { ResultScreen } from '../components/ResultScreen';
import { StorageErrorBanner } from '../components/StorageErrorBanner';
import { WelcomeScreen } from '../components/WelcomeScreen';
import { LearnAudioProvider } from '../context/LearnAudioContext';
import { LearnI18nProvider } from '../context/LearnI18nContext';
import { translateSubject, translateUi } from '../i18n/translate';
import { registerLearnPwa } from '../pwa';
import { buildAdaptiveSession, type AdaptiveSessionPlan } from '../curriculum/session';
import { subjects } from '../curriculum/subjects';
import type { Badge } from '../rewards/badges';
import { POINTS_PER_CORRECT } from '../rewards/constants';
import {
  addChildProfile,
  deleteChildProfile,
  emptyStore,
  getActiveProfileId,
  getChildProfiles,
  getProfileSummaries,
  profileNeedsName,
  readStore,
  recordActivityAttempt,
  recordSubjectSession,
  setParentPin,
  switchChildProfile,
  updateChildProfile,
  updateProfileLanguage,
  updateSettings,
} from '../storage/store';
import type { LearnStore } from '../storage/types';
import type { Activity, LearnScreen, SubjectId } from './types';

export default function LearnApp() {
  const [screen, setScreen] = useState<LearnScreen | null>(null);
  const [subjectId, setSubjectId] = useState<SubjectId | null>(null);
  const [session, setSession] = useState<Activity[]>([]);
  const [sessionIndex, setSessionIndex] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionPoints, setSessionPoints] = useState(0);
  const [starsEarned, setStarsEarned] = useState(0);
  const [badgeUnlocked, setBadgeUnlocked] = useState<Badge | null>(null);
  const [answerStreak, setAnswerStreak] = useState(0);
  const [activityKey, setActivityKey] = useState(0);
  const [sessionPlan, setSessionPlan] = useState<AdaptiveSessionPlan | null>(null);
  const [store, setStore] = useState<LearnStore>(emptyStore);
  const [parentUnlocked, setParentUnlocked] = useState(false);
  const [welcomePinGate, setWelcomePinGate] = useState(false);
  const [openNewLearner, setOpenNewLearner] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const activityStartedAt = useRef(Date.now());

  useEffect(() => {
    const loaded = readStore();
    setStore(loaded);
    const summaries = getProfileSummaries();
    const soleNamedProfile =
      summaries.length === 1 && summaries[0] && !summaries[0].needsName;
    setScreen(soleNamedProfile ? 'home' : 'welcome');
    registerLearnPwa();
  }, []);

  useEffect(() => {
    activityStartedAt.current = Date.now();
  }, [activityKey, sessionIndex]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen, sessionIndex, activityKey]);

  useEffect(() => {
    if (!bannerMessage) return undefined;
    const timer = window.setTimeout(() => setBannerMessage(null), 4000);
    return () => window.clearTimeout(timer);
  }, [bannerMessage]);

  const language = store.settings.language ?? 'en';

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const subject = useMemo(
    () => subjects.find((item) => item.id === subjectId) ?? null,
    [subjectId],
  );

  const subjectLabel = subject ? translateSubject(language, subject.id) : '';

  const activity = session[sessionIndex] ?? null;

  function handleSettingsChange(settings: Partial<LearnStore['settings']>) {
    if (settings.language && settings.language !== store.settings.language) {
      setStore(updateProfileLanguage(settings.language));
      if (screen === 'activity') {
        setActivityKey((key) => key + 1);
      }
      return;
    }
    setStore(updateSettings(settings));
  }

  function resetSessionState() {
    setSubjectId(null);
    setSession([]);
    setSessionIndex(0);
    setSessionCorrect(0);
    setSessionPoints(0);
    setStarsEarned(0);
    setBadgeUnlocked(null);
    setAnswerStreak(0);
    setSessionPlan(null);
  }

  function beginSession(nextSubjectId: SubjectId) {
    const plan = buildAdaptiveSession(nextSubjectId, readStore());
    if (plan.activities.length === 0) {
      setBannerMessage(translateUi(language, 'home.noActivities'));
      return;
    }

    setSubjectId(nextSubjectId);
    setSessionPlan(plan);
    setSession(plan.activities);
    setSessionIndex(0);
    setSessionCorrect(0);
    setSessionPoints(0);
    setStarsEarned(0);
    setBadgeUnlocked(null);
    setAnswerStreak(0);
    setActivityKey((key) => key + 1);
    setScreen('activity');
  }

  function completeActivity(correct: boolean) {
    if (!subjectId || !activity) return;

    const responseTimeMs = Date.now() - activityStartedAt.current;
    setStore(
      recordActivityAttempt({
        activityId: activity.id,
        subjectId,
        skill: activity.skill,
        correct,
        responseTimeMs,
        completedAt: new Date().toISOString(),
      }),
    );

    if (correct) {
      setSessionPoints((points) => points + POINTS_PER_CORRECT);
      setAnswerStreak((streak) => streak + 1);
    } else {
      setAnswerStreak(0);
    }

    const nextCorrect = sessionCorrect + (correct ? 1 : 0);
    const nextIndex = sessionIndex + 1;
    if (nextIndex < session.length) {
      setSessionCorrect(nextCorrect);
      setSessionIndex(nextIndex);
      setActivityKey((key) => key + 1);
      return;
    }

    setSessionCorrect(nextCorrect);
    const completion = recordSubjectSession(subjectId, nextCorrect, session.length);
    setStore(completion.store);
    setStarsEarned(completion.starsEarned);
    setBadgeUnlocked(completion.badgeUnlocked);
    setScreen('result');
  }

  function goHome() {
    setStore(readStore());
    setScreen('home');
  }

  function goToProfilePicker() {
    resetSessionState();
    setStore(readStore());
    setScreen('welcome');
  }

  function renderScreen() {
    if (!screen) return null;

    switch (screen) {
      case 'welcome':
        return (
          <>
            <WelcomeScreen
              profiles={getProfileSummaries()}
              openNewLearner={openNewLearner}
              onNewLearnerOpened={() => setOpenNewLearner(false)}
              onConfirmProfile={(profileId) => {
                setStore(switchChildProfile(profileId));
              }}
              onSaveName={(profileId, name, avatar) => {
                setStore(switchChildProfile(profileId));
                setStore(updateChildProfile(name, undefined, avatar));
                setScreen('home');
              }}
              onCreateProfile={(name, avatar) => {
                setStore(addChildProfile(name, 'nursery', avatar));
                setScreen('home');
              }}
              onRequestNewLearner={() => {
                if (store.settings.parentPin) {
                  setWelcomePinGate(true);
                  return;
                }
                setParentUnlocked(false);
                setScreen('parent');
              }}
              onComplete={() => setScreen('home')}
            />
            {welcomePinGate ? (
              <div
                className="learn-modal-overlay"
                role="dialog"
                aria-modal="true"
                aria-label={translateUi(language, 'pin.title')}
                onClick={() => setWelcomePinGate(false)}
              >
                <div onClick={(event) => event.stopPropagation()}>
                  <ParentPinGate
                    variant="modal"
                    storedPin={store.settings.parentPin}
                    onUnlock={() => {
                      setWelcomePinGate(false);
                      setOpenNewLearner(true);
                    }}
                    onSetPin={(pin) => setStore((current) => setParentPin(pin, current))}
                    onBack={() => setWelcomePinGate(false)}
                  />
                </div>
              </div>
            ) : null}
          </>
        );
      case 'home':
        return (
          <HomeScreen
            subjects={subjects}
            learnerName={store.profile?.name ?? 'Learner'}
            learnerAvatar={store.profile?.avatar}
            totalPoints={store.rewards.points}
            totalStars={store.rewards.totalStars}
            badges={store.rewards.badges}
            dailyStreak={store.rewards.dailyStreak}
            onSelectSubject={beginSession}
            onSwitchProfile={goToProfilePicker}
            onOpenParent={() => {
              setParentUnlocked(false);
              setScreen('parent');
            }}
          />
        );
      case 'activity':
        if (!activity || !subject) return null;
        return (
          <ActivityScreen
            key={activityKey}
            activity={activity}
            subjectLabel={subjectLabel}
            sessionProgress={{ current: sessionIndex + 1, total: session.length }}
            answerStreak={answerStreak}
            onComplete={completeActivity}
            onBack={() => {
              resetSessionState();
              goHome();
            }}
          />
        );
      case 'result':
        if (!subject) return null;
        return (
          <ResultScreen
            subjectLabel={subjectLabel}
            subjectEmoji={subject.emoji}
            correctCount={sessionCorrect}
            totalCount={session.length}
            starsEarned={starsEarned}
            sessionPoints={sessionPoints}
            sessionFocus={sessionPlan?.reason}
            badgeUnlocked={badgeUnlocked}
            onPlayAgain={() => beginSession(subject.id)}
            onHome={() => {
              resetSessionState();
              goHome();
            }}
          />
        );
      case 'parent':
        if (!parentUnlocked) {
          return (
            <ParentPinGate
              storedPin={store.settings.parentPin}
              onUnlock={() => setParentUnlocked(true)}
              onSetPin={(pin) => setStore((current) => setParentPin(pin, current))}
              onBack={goHome}
            />
          );
        }
        return (
          <ParentScreen
            store={store}
            profiles={getChildProfiles()}
            activeProfileId={getActiveProfileId()}
            canDeleteProfile={getChildProfiles().length > 1}
            onSwitchProfile={(profileId) => {
              resetSessionState();
              const next = switchChildProfile(profileId);
              setStore(next);
              if (profileNeedsName(next.profile?.name)) {
                setParentUnlocked(false);
                setScreen('welcome');
              }
            }}
            onAddProfile={(name, ageGroup, avatar) => {
              resetSessionState();
              const next = addChildProfile(name, ageGroup, avatar);
              setStore(next);
              if (profileNeedsName(next.profile?.name)) {
                setParentUnlocked(false);
                setScreen('welcome');
              }
            }}
            onDeleteProfile={(profileId) => {
              resetSessionState();
              const next = deleteChildProfile(profileId);
              setStore(next);
              setParentUnlocked(false);
              const summaries = getProfileSummaries();
              setScreen(
                summaries.length === 1 && summaries[0] && !summaries[0].needsName
                  ? 'home'
                  : 'welcome',
              );
            }}
            onUpdateProfile={(name, ageGroup, avatar) =>
              setStore(updateChildProfile(name, ageGroup, avatar))
            }
            onUpdateSettings={handleSettingsChange}
            onChangePin={(pin) => setStore(setParentPin(pin))}
            onPracticeSubject={(nextSubjectId) => {
              resetSessionState();
              setParentUnlocked(false);
              beginSession(nextSubjectId);
            }}
            onBack={() => {
              setParentUnlocked(false);
              goHome();
            }}
          />
        );
      default: {
        const unexpected: never = screen;
        throw new Error(`Unhandled learn screen: ${unexpected}`);
      }
    }
  }

  return (
    <LearnI18nProvider settings={store.settings} onSettingsChange={handleSettingsChange}>
      <LearnAudioProvider settings={store.settings} onSettingsChange={handleSettingsChange}>
        <main className="learn-app">
          <OfflineIndicator />
          <StorageErrorBanner />
          {bannerMessage ? (
            <div className="learn-toast-banner" role="status">{bannerMessage}</div>
          ) : null}
          <PwaInstallHint />
          <LearnErrorBoundary
            onReset={() => {
              setParentUnlocked(false);
              goHome();
            }}
          >
            {renderScreen()}
          </LearnErrorBoundary>
        </main>
      </LearnAudioProvider>
    </LearnI18nProvider>
  );
}
