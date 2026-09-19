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
import { estimateLearningMinutes } from '../parent/analytics';
import { localDateKey } from '../storage/dates';
import type { Badge } from '../rewards/badges';
import { POINTS_PER_CORRECT } from '../rewards/constants';
import { getLearnPreferences, getSessionLength, isSubjectEnabled } from '../storage/preferences';
import {
  clearSessionDraft,
  readSessionDraft,
  writeSessionDraft,
} from '../storage/session-draft';
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
  resetAll,
  resetProfile,
  setParentPin,
  switchChildProfile,
  updateChildProfile,
  updateLearnPreferences,
  updateProfileLanguage,
  updateSettings,
} from '../storage/store';
import type { LearnStore } from '../storage/types';
import type { Activity, LearnScreen, SubjectId } from './types';

type ParentHubState = {
  tab: 'insights' | 'manage';
  insightsPanel: 'overview' | 'progress' | 'focus';
  managePanel: 'learners' | 'learning' | 'app' | 'privacy' | 'support';
  openAddLearner?: boolean;
};

function parseParentDeepLink(): ParentHubState | null {
  const parent = new URLSearchParams(window.location.search).get('parent');
  if (!parent) return null;

  if (parent === 'manage' || parent === 'learners') {
    return { tab: 'manage', insightsPanel: 'overview', managePanel: 'learners' };
  }
  if (parent === 'learning') {
    return { tab: 'manage', insightsPanel: 'overview', managePanel: 'learning' };
  }
  if (parent === 'privacy') {
    return { tab: 'manage', insightsPanel: 'overview', managePanel: 'privacy' };
  }
  if (parent === 'focus') {
    return { tab: 'insights', insightsPanel: 'focus', managePanel: 'learners' };
  }
  if (parent === 'progress') {
    return { tab: 'insights', insightsPanel: 'progress', managePanel: 'learners' };
  }
  return { tab: 'insights', insightsPanel: 'overview', managePanel: 'learners' };
}

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
  const [parentHubState, setParentHubState] = useState<ParentHubState | null>(null);
  const [parentReturnScreen, setParentReturnScreen] = useState<LearnScreen>('welcome');
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const activityStartedAt = useRef(Date.now());

  useEffect(() => {
    registerLearnPwa();
    const loaded = readStore();
    setStore(loaded);
    const deepLink = parseParentDeepLink();
    if (deepLink) {
      setParentHubState(deepLink);
      const summaries = getProfileSummaries();
      const soleNamedProfile =
        summaries.length === 1 && summaries[0] && !summaries[0].needsName;
      setParentReturnScreen(soleNamedProfile ? 'home' : 'welcome');
      setScreen('parent');
      return;
    }

    const draft = readSessionDraft();
    const profileId = loaded.profile?.id;
    if (draft && profileId && draft.profileId === profileId && draft.session.length > 0) {
      setSubjectId(draft.subjectId);
      setSessionPlan(draft.sessionPlan);
      setSession(draft.session);
      setSessionIndex(draft.sessionIndex);
      setSessionCorrect(draft.sessionCorrect);
      setSessionPoints(draft.sessionPoints);
      setAnswerStreak(draft.answerStreak);
      setActivityKey(draft.activityKey);
      setScreen('activity');
      return;
    }

    const summaries = getProfileSummaries();
    const soleNamedProfile =
      summaries.length === 1 && summaries[0] && !summaries[0].needsName;
    setScreen(soleNamedProfile ? 'home' : 'welcome');
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

  useEffect(() => {
    if (screen !== 'activity' || !subjectId || session.length === 0 || !store.profile?.id) {
      return;
    }

    writeSessionDraft({
      profileId: store.profile.id,
      subjectId,
      session,
      sessionIndex,
      sessionCorrect,
      sessionPoints,
      answerStreak,
      sessionPlan,
      activityKey,
    });
  }, [
    activityKey,
    answerStreak,
    screen,
    session,
    sessionCorrect,
    sessionIndex,
    sessionPlan,
    sessionPoints,
    store.profile?.id,
    subjectId,
  ]);

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
    clearSessionDraft();
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

  function isDailyLimitReached(currentStore: LearnStore): boolean {
    const limit = getLearnPreferences(currentStore).dailyLimitMinutes ?? 0;
    if (limit <= 0) return false;
    const todayResults = currentStore.activityResults ?? [];
    const todayKey = localDateKey();
    const todaysResults = todayResults.filter(
      (result) => localDateKey(new Date(result.completedAt)) === todayKey,
    );
    return estimateLearningMinutes(todaysResults) >= limit;
  }

  function beginSession(nextSubjectId: SubjectId) {
    const current = readStore();
    if (!isSubjectEnabled(current, nextSubjectId)) {
      setBannerMessage(translateUi(language, 'home.subjectDisabled'));
      return;
    }
    if (isDailyLimitReached(current)) {
      setBannerMessage(translateUi(language, 'home.dailyLimit'));
      return;
    }

    const size = getSessionLength(current);
    const plan = buildAdaptiveSession(nextSubjectId, current, size);
    if (plan.activities.length === 0) {
      setBannerMessage(translateUi(language, 'home.noActivities'));
      return;
    }

    setStore(current);
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
    clearSessionDraft();
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

  function openParentHub(state?: ParentHubState, returnTo?: LearnScreen) {
    setParentHubState(state ?? { tab: 'insights', insightsPanel: 'overview', managePanel: 'learners' });
    setParentUnlocked(false);
    setParentReturnScreen(returnTo ?? (screen === 'welcome' ? 'welcome' : 'home'));
    setScreen('parent');
  }

  function leaveParentHub() {
    setParentUnlocked(false);
    setStore(readStore());
    setScreen(parentReturnScreen);
  }

  function renderScreen() {
    if (!screen) return null;

    switch (screen) {
      case 'welcome':
        return (
          <>
            <WelcomeScreen
              profiles={getProfileSummaries()}
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
                openParentHub(
                  { tab: 'manage', insightsPanel: 'overview', managePanel: 'learners', openAddLearner: true },
                  'welcome',
                );
              }}
              onOpenParentHub={() => openParentHub(undefined, 'welcome')}
              onComplete={() => setScreen('home')}
            />
          </>
        );
      case 'home':
        return (
          <HomeScreen
            store={store}
            subjects={subjects}
            learnerName={store.profile?.name ?? 'Learner'}
            learnerAvatar={store.profile?.avatar}
            lastSubject={store.sessions?.lastSubject}
            onSelectSubject={beginSession}
            onOpenParentHub={() => openParentHub()}
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
            earnedBadges={store.rewards?.badges ?? []}
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
              onBack={leaveParentHub}
            />
          );
        }
        return (
          <ParentScreen
            store={store}
            profiles={getChildProfiles()}
            activeProfileId={getActiveProfileId()}
            canDeleteProfile={getChildProfiles().length > 1}
            initialTab={parentHubState?.tab}
            initialInsightsPanel={parentHubState?.insightsPanel}
            initialManagePanel={parentHubState?.managePanel}
            initialOpenAddLearner={parentHubState?.openAddLearner}
            onSwitchProfile={(profileId) => {
              const next = switchChildProfile(profileId);
              setStore(next);
              if (profileNeedsName(next.profile?.name)) {
                setParentUnlocked(false);
                setScreen('welcome');
              }
            }}
            onAddProfile={(name, ageGroup, avatar) => {
              const next = addChildProfile(name, ageGroup, avatar);
              setStore(next);
              if (profileNeedsName(next.profile?.name)) {
                setParentUnlocked(false);
                setScreen('welcome');
              }
            }}
            onDeleteProfile={(profileId) => {
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
            onUpdatePreferences={(preferences) => setStore(updateLearnPreferences(preferences))}
            onChangePin={(pin) => setStore(setParentPin(pin))}
            onResetProfile={() => {
              setStore(resetProfile());
              setBannerMessage(translateUi(language, 'parent.privacy.resetProfileDone'));
            }}
            onResetAll={() => {
              resetSessionState();
              setStore(resetAll());
              setParentUnlocked(false);
              setScreen('welcome');
            }}
            onPracticeSubject={(nextSubjectId) => {
              resetSessionState();
              setParentUnlocked(false);
              beginSession(nextSubjectId);
            }}
            onBack={leaveParentHub}
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
