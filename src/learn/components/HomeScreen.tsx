import { useState } from 'react';
import type { Subject, SubjectId } from '../app/types';
import { useLearnI18n } from '../context/LearnI18nContext';
import { getPracticeRecommendations, getSubjectSkillViews, getActivitiesToday, getStarsToday } from '../parent/analytics';
import { getDailyGoal, getEnabledSubjects } from '../storage/preferences';
import { DEFAULT_LEARNER_NAME } from '../storage/store';
import { learnerAvatarEmoji, type LearnerAvatar } from '../storage/profile-avatar';
import type { LearnStore } from '../storage/types';
import { GrownUpSettingsSheet } from './GrownUpSettingsSheet';

interface HomeScreenProps {
  store: LearnStore;
  subjects: Subject[];
  learnerName: string;
  learnerAvatar?: LearnerAvatar;
  lastSubject?: SubjectId;
  onSelectSubject: (subjectId: SubjectId) => void;
  onOpenParentHub: () => void;
}

function masteryDots(stars: number): boolean[] {
  return Array.from({ length: 5 }, (_, index) => index < stars);
}

export function HomeScreen({
  store,
  subjects,
  learnerName,
  learnerAvatar,
  lastSubject,
  onSelectSubject,
  onOpenParentHub,
}: HomeScreenProps) {
  const { language, tUi, tUiDigits, tSubject } = useLearnI18n();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const displayName =
    learnerName === DEFAULT_LEARNER_NAME ? tUi('profile.defaultName') : learnerName;
  const dailyGoal = getDailyGoal(store);
  const activitiesToday = getActivitiesToday(store);
  const starsToday = getStarsToday(store);
  const remaining = Math.max(0, dailyGoal - activitiesToday);
  const goalProgress = Math.min(100, Math.round((activitiesToday / dailyGoal) * 100));
  const ringRadius = 40;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (goalProgress / 100) * ringCircumference;
  const enabledSubjects = getEnabledSubjects(store);
  const visibleSubjects = subjects.filter((subject) => enabledSubjects.includes(subject.id));
  const subjectViews = getSubjectSkillViews(store, language);
  const recommendations = getPracticeRecommendations(store, language);
  const suggestedId = recommendations[0]?.subjectId;
  const continueSubject = lastSubject ? subjects.find((subject) => subject.id === lastSubject) : null;

  return (
    <>
      <header className="learn-header learn-child-header">
        <h1 className="learn-title learn-home-greeting">
          <span className="learn-home-avatar" aria-hidden="true">
            {learnerAvatarEmoji(learnerAvatar)}
          </span>
          {tUi('home.greeting', { name: displayName })}
        </h1>
        <button
          type="button"
          className="learn-gear-btn"
          aria-label={tUi('settings.grownUpTitle')}
          onClick={() => setSettingsOpen(true)}
        >
          ⚙︎
        </button>
      </header>

      {settingsOpen ? (
        <GrownUpSettingsSheet
          onClose={() => setSettingsOpen(false)}
          onOpenParentHub={() => {
            setSettingsOpen(false);
            onOpenParentHub();
          }}
        />
      ) : null}

      <section className="learn-goal-card" aria-label={tUi('home.goalAria', { current: activitiesToday, goal: dailyGoal })}>
        <svg className="learn-goal-ring" viewBox="0 0 100 100" role="img" aria-hidden="true">
          <circle className="learn-goal-track" cx="50" cy="50" r={ringRadius} />
          <circle
            className="learn-goal-fill"
            cx="50"
            cy="50"
            r={ringRadius}
            strokeDasharray={ringCircumference}
            strokeDashoffset={ringOffset}
          />
          <text x="50" y="57" textAnchor="middle">{activitiesToday}/{dailyGoal}</text>
        </svg>
        <div>
          <strong>{tUi('home.goalTitle')}</strong>
          <p className="learn-subtitle">
            {remaining > 0
              ? tUiDigits('home.goalRemaining', { count: remaining })
              : tUi('home.goalComplete')}
          </p>
          <div className="learn-stars-today" aria-label={tUiDigits('home.starsTodayAria', { count: starsToday })}>
            {Array.from({ length: 5 }, (_, index) => (
              <span key={index}>{index < starsToday ? '⭐' : '☆'}</span>
            ))}
          </div>
        </div>
      </section>

      {continueSubject ? (
        <button
          type="button"
          className="learn-continue-card"
          onClick={() => onSelectSubject(continueSubject.id)}
        >
          <span className="learn-continue-emoji" aria-hidden="true">{continueSubject.emoji}</span>
          <span className="learn-continue-copy">
            <strong>{tUi('home.keepGoing')}</strong>
            <span className="learn-subtitle">
              {tSubject(continueSubject.id)} · {tUi('home.continueHint')}
            </span>
          </span>
        </button>
      ) : null}

      <div className="learn-grid">
        {visibleSubjects.map((subject) => {
          const stars = subjectViews.find((view) => view.subjectId === subject.id)?.stars ?? 0;
          const isSuggested = subject.id === suggestedId;
          return (
            <button
              key={subject.id}
              type="button"
              className={`learn-card ${isSuggested ? 'is-suggested' : ''}`.trim()}
              onClick={() => onSelectSubject(subject.id)}
            >
              {isSuggested ? <span className="learn-card-tag">{tUi('home.tryNext')}</span> : null}
              <span className="learn-card-emoji" aria-hidden="true">{subject.emoji}</span>
              <span className="learn-card-label">{tSubject(subject.id)}</span>
              <span className="learn-mastery-dots" aria-hidden="true">
                {masteryDots(stars).map((on, index) => (
                  <i key={index} className={on ? 'is-on' : ''} />
                ))}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}
