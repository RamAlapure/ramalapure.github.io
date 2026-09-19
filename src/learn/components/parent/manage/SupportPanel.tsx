import { useLearnI18n } from '../../../context/LearnI18nContext';
import { FeedbackForm } from '../../FeedbackForm';

export function SupportPanel() {
  const { tUi } = useLearnI18n();

  return (
    <div className="learn-panel-section">
      <h2 className="learn-section-title">{tUi('parent.feedback.title')}</h2>
      <p className="learn-subtitle">{tUi('parent.feedback.subtitle')}</p>
      <FeedbackForm />
    </div>
  );
}
