import { useState } from 'react';
import type { SubjectId } from '../app/types';
import { useLearnI18n } from '../context/LearnI18nContext';
import { learnerAvatarEmoji, type LearnerAvatar } from '../storage/profile-avatar';
import { DEFAULT_LEARNER_NAME, type AgeGroup } from '../storage/store';
import type { ChildProfile, LearnSettings, LearnStore } from '../storage/types';
import { FocusPanel } from './parent/insights/FocusPanel';
import { OverviewPanel } from './parent/insights/OverviewPanel';
import { ProgressPanel } from './parent/insights/ProgressPanel';
import type { AnalyticsRange } from '../parent/analytics';
import { AppAudioPanel } from './parent/manage/AppAudioPanel';
import { LearnersPanel } from './parent/manage/LearnersPanel';
import { LearningSetupPanel } from './parent/manage/LearningSetupPanel';
import { PrivacyPanel } from './parent/manage/PrivacyPanel';
import { SupportPanel } from './parent/manage/SupportPanel';

interface ParentScreenProps {
  store: LearnStore;
  profiles: ChildProfile[];
  activeProfileId: string;
  canDeleteProfile: boolean;
  onSwitchProfile: (profileId: string) => void;
  onAddProfile: (name: string, ageGroup: AgeGroup, avatar: LearnerAvatar) => void;
  onDeleteProfile: (profileId: string) => void;
  onUpdateProfile: (name: string, ageGroup?: AgeGroup, avatar?: LearnerAvatar) => void;
  onUpdateSettings: (settings: Partial<LearnSettings>) => void;
  onUpdatePreferences: (preferences: Partial<LearnStore['preferences']>) => void;
  onChangePin: (pin: string) => void;
  onResetProfile: () => void;
  onResetAll: () => void;
  onPracticeSubject: (subjectId: SubjectId) => void;
  onBack: () => void;
  initialTab?: ParentTab;
  initialInsightsPanel?: InsightsPanel;
  initialManagePanel?: ManagePanel;
  initialOpenAddLearner?: boolean;
}

type ParentTab = 'insights' | 'manage';
type InsightsPanel = 'overview' | 'progress' | 'focus';
type ManagePanel = 'learners' | 'learning' | 'app' | 'privacy' | 'support';

const INSIGHTS_PANELS: InsightsPanel[] = ['overview', 'progress', 'focus'];
const MANAGE_PANELS: ManagePanel[] = ['learners', 'learning', 'app', 'privacy', 'support'];
const RANGE_OPTIONS: AnalyticsRange[] = ['today', '7d'];

function profileDisplayName(name: string, defaultName: string): string {
  return name === DEFAULT_LEARNER_NAME ? defaultName : name;
}

export function ParentScreen({
  store,
  profiles,
  activeProfileId,
  canDeleteProfile,
  onSwitchProfile,
  onAddProfile,
  onDeleteProfile,
  onUpdateProfile,
  onUpdateSettings,
  onUpdatePreferences,
  onChangePin,
  onResetProfile,
  onResetAll,
  onPracticeSubject,
  onBack,
  initialTab = 'insights',
  initialInsightsPanel = 'overview',
  initialManagePanel = 'learners',
  initialOpenAddLearner = false,
}: ParentScreenProps) {
  const { tUi } = useLearnI18n();
  const defaultName = tUi('profile.defaultName');
  const settings = store.settings ?? {
    soundEnabled: true,
    slowSpeech: false,
    highContrast: false,
    language: 'en',
  };
  const [tab, setTab] = useState<ParentTab>(initialTab);
  const [insightsPanel, setInsightsPanel] = useState<InsightsPanel>(initialInsightsPanel);
  const [managePanel, setManagePanel] = useState<ManagePanel>(initialManagePanel);
  const [range, setRange] = useState<AnalyticsRange>('7d');
  const [openAddLearner, setOpenAddLearner] = useState(initialOpenAddLearner);

  return (
    <>
      <header className="learn-header">
        <div>
          <h1 className="learn-title">{tUi('parent.hub')}</h1>
          <p className="learn-subtitle">
            {tab === 'insights' ? tUi('parent.insightsHint') : tUi('parent.manageHint')}
          </p>
        </div>
        <button type="button" className="learn-icon-btn" aria-label={tUi('nav.backHome')} onClick={onBack}>
          ←
        </button>
      </header>

      <section className="learn-panel learn-parent-panel">
        <div className="learn-profile-switcher" role="group" aria-label={tUi('parent.profiles')}>
          {profiles.map((profile) => (
            <button
              key={profile.id}
              type="button"
              className={`learn-profile-chip ${profile.id === activeProfileId ? 'is-active' : ''}`.trim()}
              aria-pressed={profile.id === activeProfileId}
              onClick={() => onSwitchProfile(profile.id)}
            >
              {learnerAvatarEmoji(profile.avatar)} {profileDisplayName(profile.name, defaultName)}
            </button>
          ))}
        </div>

        <div className="learn-parent-tabs" role="tablist" aria-label={tUi('parent.hub')}>
          <button
            type="button"
            role="tab"
            id="parent-tab-insights"
            aria-selected={tab === 'insights'}
            aria-controls="parent-panel-insights"
            className={`learn-parent-tab ${tab === 'insights' ? 'is-active' : ''}`.trim()}
            onClick={() => setTab('insights')}
          >
            {tUi('parent.tabInsights')}
          </button>
          <button
            type="button"
            role="tab"
            id="parent-tab-manage"
            aria-selected={tab === 'manage'}
            aria-controls="parent-panel-manage"
            className={`learn-parent-tab ${tab === 'manage' ? 'is-active' : ''}`.trim()}
            onClick={() => setTab('manage')}
          >
            {tUi('parent.tabManage')}
          </button>
        </div>

        {tab === 'insights' ? (
          <div
            className="learn-parent-tabpanel"
            role="tabpanel"
            id="parent-panel-insights"
            aria-labelledby="parent-tab-insights"
          >
            <div className="learn-parent-subtabs">
              {INSIGHTS_PANELS.map((panel) => (
                <button
                  key={panel}
                  type="button"
                  className={`learn-parent-subtab ${insightsPanel === panel ? 'is-active' : ''}`.trim()}
                  aria-pressed={insightsPanel === panel}
                  onClick={() => setInsightsPanel(panel)}
                >
                  {tUi(`parent.insights.${panel}`)}
                </button>
              ))}
            </div>

            {insightsPanel === 'overview' ? (
              <div className="learn-range-chips" role="group" aria-label={tUi('parent.range')}>
                {RANGE_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`learn-profile-chip ${range === option ? 'is-active' : ''}`.trim()}
                    aria-pressed={range === option}
                    onClick={() => setRange(option)}
                  >
                    {tUi(`parent.range.${option}`)}
                  </button>
                ))}
              </div>
            ) : null}

            {insightsPanel === 'overview' ? <OverviewPanel store={store} range={range} /> : null}
            {insightsPanel === 'progress' ? <ProgressPanel store={store} /> : null}
            {insightsPanel === 'focus' ? (
              <FocusPanel store={store} onPracticeSubject={onPracticeSubject} />
            ) : null}
          </div>
        ) : (
          <div
            className="learn-parent-tabpanel"
            role="tabpanel"
            id="parent-panel-manage"
            aria-labelledby="parent-tab-manage"
          >
            <div className="learn-parent-subtabs">
              {MANAGE_PANELS.map((panel) => (
                <button
                  key={panel}
                  type="button"
                  className={`learn-parent-subtab ${managePanel === panel ? 'is-active' : ''}`.trim()}
                  aria-pressed={managePanel === panel}
                  onClick={() => setManagePanel(panel)}
                >
                  {tUi(`parent.manage.${panel}`)}
                </button>
              ))}
            </div>

            {managePanel === 'learners' ? (
              <LearnersPanel
                store={store}
                activeProfileId={activeProfileId}
                canDeleteProfile={canDeleteProfile}
                startInAddMode={openAddLearner}
                onAddModeConsumed={() => setOpenAddLearner(false)}
                onAddProfile={onAddProfile}
                onDeleteProfile={onDeleteProfile}
                onUpdateProfile={onUpdateProfile}
              />
            ) : null}
            {managePanel === 'learning' ? (
              <LearningSetupPanel store={store} onUpdatePreferences={onUpdatePreferences} />
            ) : null}
            {managePanel === 'app' ? (
              <AppAudioPanel settings={settings} onUpdateSettings={onUpdateSettings} />
            ) : null}
            {managePanel === 'privacy' ? (
              <PrivacyPanel
                settings={settings}
                onChangePin={onChangePin}
                onExport={() => undefined}
                onResetProfile={onResetProfile}
                onResetAll={onResetAll}
              />
            ) : null}
            {managePanel === 'support' ? <SupportPanel /> : null}
          </div>
        )}
      </section>
    </>
  );
}
