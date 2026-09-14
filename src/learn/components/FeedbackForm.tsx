import { useState, type FormEvent } from 'react';
import { useLearnI18n } from '../context/LearnI18nContext';

type FeedbackCategory = 'bug' | 'feedback' | 'suggestion';
type SubmitStatus = 'idle' | 'sending' | 'success' | 'error';

const ACCESS_KEY = import.meta.env.PUBLIC_WEB3FORMS_ACCESS_KEY;

const CATEGORY_LABEL_KEY: Record<FeedbackCategory, string> = {
  bug: 'parent.feedback.categoryBug',
  feedback: 'parent.feedback.categoryFeedback',
  suggestion: 'parent.feedback.categorySuggestion',
};

export function FeedbackForm() {
  const { tUi } = useLearnI18n();
  const [category, setCategory] = useState<FeedbackCategory>('feedback');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<SubmitStatus>('idle');

  if (!ACCESS_KEY) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    setStatus('sending');

    const formData = new FormData();
    formData.append('access_key', ACCESS_KEY);
    formData.append('subject', `Learning Playground — ${tUi(CATEGORY_LABEL_KEY[category])}`);
    formData.append('from_name', 'Learning Playground Feedback');
    formData.append('category', category);
    formData.append('message', trimmedMessage);
    if (name.trim()) formData.append('name', name.trim());
    if (email.trim()) formData.append('email', email.trim());

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      });
      const data = (await response.json()) as { success?: boolean };
      if (data.success) {
        setName('');
        setEmail('');
        setMessage('');
        setCategory('feedback');
        setStatus('success');
        return;
      }
      setStatus('error');
    } catch {
      setStatus('error');
    }
  }

  return (
    <form className="learn-feedback-form" onSubmit={handleSubmit}>
      <label className="learn-field-label" htmlFor="feedback-category">
        {tUi('parent.feedback.category')}
      </label>
      <select
        id="feedback-category"
        className="learn-text-input"
        value={category}
        onChange={(event) => setCategory(event.target.value as FeedbackCategory)}
        disabled={status === 'sending'}
      >
        <option value="bug">{tUi('parent.feedback.categoryBug')}</option>
        <option value="feedback">{tUi('parent.feedback.categoryFeedback')}</option>
        <option value="suggestion">{tUi('parent.feedback.categorySuggestion')}</option>
      </select>

      <label className="learn-field-label" htmlFor="feedback-name">
        {tUi('parent.feedback.name')}
      </label>
      <input
        id="feedback-name"
        className="learn-text-input"
        type="text"
        name="name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder={tUi('parent.feedback.namePlaceholder')}
        maxLength={64}
        disabled={status === 'sending'}
        autoComplete="name"
      />

      <label className="learn-field-label" htmlFor="feedback-email">
        {tUi('parent.feedback.email')}
      </label>
      <input
        id="feedback-email"
        className="learn-text-input"
        type="email"
        name="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder={tUi('parent.feedback.emailPlaceholder')}
        maxLength={120}
        disabled={status === 'sending'}
        autoComplete="email"
      />

      <label className="learn-field-label" htmlFor="feedback-message">
        {tUi('parent.feedback.message')}
      </label>
      <textarea
        id="feedback-message"
        className="learn-text-input learn-feedback-message"
        name="message"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder={tUi('parent.feedback.messagePlaceholder')}
        rows={4}
        maxLength={2000}
        required
        disabled={status === 'sending'}
      />

      <button
        type="submit"
        className="learn-btn learn-btn-compact"
        disabled={status === 'sending' || !message.trim()}
      >
        {status === 'sending' ? tUi('parent.feedback.sending') : tUi('parent.feedback.submit')}
      </button>

      {status === 'success' ? (
        <p className="learn-subtitle learn-feedback-status is-success" role="status">
          {tUi('parent.feedback.success')}
        </p>
      ) : null}
      {status === 'error' ? (
        <p className="learn-form-error" role="alert">{tUi('parent.feedback.error')}</p>
      ) : null}
    </form>
  );
}
