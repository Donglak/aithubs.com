import { CheckCircle2, ChevronLeft, ChevronRight, Gift, Mail, X } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { appendSurveyToSheet } from '../services/googleSheets';

type Answer = {
  role?: string;
  goals: string[];
  budget?: string;
  pain?: string;
  name?: string;
  email?: string;
  consent?: boolean;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  /** Được gọi khi submit thành công (để bạn log analytics / close popup / v.v.) */
  onSubmitted?: (payload: Answer) => void;
  /** Endpoint nhận data (ví dụ /api/subscribe). Nếu không truyền, chỉ lưu localStorage */
  submitUrl?: string;
};

const ROLES = ['Student', 'Marketer', 'Developer', 'Founder', 'Creator', 'Other'];

const GOALS = [
  'Discover new tools',
  'Save cost / find deals',
  'Automate workflows',
  'Learn AI quickly',
  'Compare alternatives',
];

const BUDGETS = ['$0', '$1 – $49', '$50 – $199', '$200+'];

const TOTAL_STEPS = 5;

export default function NewsletterPopup({
  isOpen,
  onClose,
  onSubmitted,
  }: Props) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const [answers, setAnswers] = useState<Answer>({
    goals: [],
    consent: false,
  });

  const canNext = useMemo(() => {
    switch (step) {
      case 1:
        return !!answers.role;
      case 2:
        return answers.goals.length > 0;
      case 3:
        return !!answers.budget;
      case 4:
        // pain là optional => luôn Next được
        return true;
      case 5:
        return !!answers.email && !!answers.consent;
      default:
        return true;
    }
  }, [step, answers]);

  if (!isOpen) return null;

  const closeAndReset = () => {
    setStep(1);
    setSubmitting(false);
    setDone(false);
    setAnswers({ goals: [], consent: false });
    onClose();
  };

  const handleToggleGoal = (goal: string) => {
    setAnswers(prev => {
      const isOn = prev.goals.includes(goal);
      return {
        ...prev,
        goals: isOn ? prev.goals.filter(g => g !== goal) : [...prev.goals, goal],
      };
    });
  };

  const next = () => canNext && setStep(s => Math.min(s + 1, TOTAL_STEPS));
  const prev = () => setStep(s => Math.max(s - 1, 1));

  const skipSurvey = () => setStep(5); // nhảy thẳng tới email

  // NewsletterPopup.tsx

// ...
const onSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!canNext || submitting) return;

  setSubmitting(true);
  try {
    const payload = {
      ...answers,
      ua: navigator.userAgent,
      path: location.pathname,
    };

    // 1) Lưu local
    localStorage.setItem('dth_survey_done', '1');
    localStorage.setItem('dth_survey_answers', JSON.stringify(payload));

    // 2) Gửi lên Google Sheets
    await appendSurveyToSheet(payload);

    setDone(true);
    onSubmitted?.(payload);
  } catch (err) {
    console.error('Submit survey failed:', err);
    // TODO: show toast hoặc message cho user
  } finally {
    setSubmitting(false);
  }
};


  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={closeAndReset}
      />
      {/* Modal */}
      <div className="relative w-[92%] max-w-[560px] rounded-2xl overflow-hidden shadow-2xl animate-fadeInUp">
        {/* Header gradient */}
        <div className="bg-gradient-to-br from-primary-500 to-green-500 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Get Exclusive Access</h3>
                <p className="text-white/90 text-sm">
                  Quick 30-second survey → then get pro tips & deals
                </p>
              </div>
            </div>
            <button
              onClick={closeAndReset}
              className="text-white/90 hover:text-white"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="bg-gray-900 text-gray-100 px-6 py-5">
          {/* Progress */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 transition-all"
                style={{ width: `${(Math.min(step, TOTAL_STEPS) / TOTAL_STEPS) * 100}%` }}
              />
            </div>
            <div className="text-xs text-gray-300">
              Step {Math.min(step, TOTAL_STEPS)} / {TOTAL_STEPS}
            </div>
          </div>

          {!done ? (
            <form onSubmit={onSubmit} className="space-y-5">
              {/* Step 1 */}
              {step === 1 && (
                <div>
                  <div className="text-lg font-semibold mb-3">
                    What best describes your role?
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {ROLES.map(role => (
                      <button
                        type="button"
                        key={role}
                        onClick={() => setAnswers(prev => ({ ...prev, role }))}
                        className={`px-3 py-2 rounded-lg border ${
                          answers.role === role
                            ? 'border-primary-500 bg-primary-500/10 text-primary-300'
                            : 'border-gray-700 bg-gray-800 hover:bg-gray-700'
                        } text-sm text-left`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <div>
                  <div className="text-lg font-semibold mb-3">
                    What are you looking to achieve? <span className="text-gray-400 text-sm">(select one or more)</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {GOALS.map(goal => {
                      const active = answers.goals.includes(goal);
                      return (
                        <button
                          type="button"
                          key={goal}
                          onClick={() => handleToggleGoal(goal)}
                          className={`px-3 py-1.5 rounded-full text-xs border ${
                            active
                              ? 'border-primary-500 bg-primary-500/10 text-primary-300'
                              : 'border-gray-700 bg-gray-800 hover:bg-gray-700'
                          }`}
                        >
                          {active ? '✓ ' : ''}{goal}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <div>
                  <div className="text-lg font-semibold mb-3">
                    What is your monthly budget for tools?
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {BUDGETS.map(b => (
                      <button
                        type="button"
                        key={b}
                        onClick={() => setAnswers(prev => ({ ...prev, budget: b }))}
                        className={`px-3 py-2 rounded-lg border text-left ${
                          answers.budget === b
                            ? 'border-primary-500 bg-primary-500/10 text-primary-300'
                            : 'border-gray-700 bg-gray-800 hover:bg-gray-700'
                        } text-sm`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4 */}
              {step === 4 && (
                <div>
                  <div className="text-lg font-semibold mb-3">
                    Your biggest challenge right now? <span className="text-gray-400 text-sm">(optional)</span>
                  </div>
                  <textarea
                    value={answers.pain ?? ''}
                    onChange={(e) =>
                      setAnswers(prev => ({ ...prev, pain: e.target.value }))
                    }
                    placeholder="Tell us briefly so we can tailor recommendations…"
                    className="w-full rounded-lg bg-gray-800 border border-gray-700 focus:border-primary-500 focus:ring-0 text-sm px-3 py-2"
                    rows={3}
                  />
                </div>
              )}

              {/* Step 5 (Email) */}
              {step === 5 && (
                <div>
                  <div className="text-lg font-semibold mb-3">
                    Where should we send the updates?
                  </div>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Your full name (optional)"
                      value={answers.name ?? ''}
                      onChange={(e) =>
                        setAnswers(prev => ({ ...prev, name: e.target.value }))
                      }
                      className="w-full rounded-lg bg-gray-800 border border-gray-700 focus:border-primary-500 focus:ring-0 text-sm px-3 py-2"
                    />
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        required
                        placeholder="your@email.com"
                        value={answers.email ?? ''}
                        onChange={(e) =>
                          setAnswers(prev => ({ ...prev, email: e.target.value }))
                        }
                        className="w-full rounded-lg bg-gray-800 border border-gray-700 focus:border-primary-500 focus:ring-0 text-sm pl-9 pr-3 py-2"
                      />
                    </div>

                    <label className="flex items-center gap-2 text-xs text-gray-300">
                      <input
                        type="checkbox"
                        checked={!!answers.consent}
                        onChange={(e) =>
                          setAnswers(prev => ({ ...prev, consent: e.target.checked }))
                        }
                        className="rounded border-gray-600 text-primary-500 focus:ring-0 bg-gray-800"
                      />
                      I agree to receive occasional emails and accept the Privacy Policy.
                    </label>
                  </div>
                </div>
              )}

              {/* Footer actions */}
              <div className="flex items-center justify-between pt-2">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={prev}
                    className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>
                ) : (
                  <span />
                )}

                <div className="flex items-center gap-2">
                  {step < 5 && (
                    <button
                      type="button"
                      onClick={skipSurvey}
                      className="text-xs text-gray-400 hover:text-gray-200"
                    >
                      Skip survey
                    </button>
                  )}

                  {step < 5 ? (
                    <button
                      type="button"
                      disabled={!canNext}
                      onClick={next}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold ${
                        canNext
                          ? 'bg-primary-600 hover:bg-primary-700 text-white'
                          : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!canNext || submitting}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold ${
                        canNext && !submitting
                          ? 'bg-primary-600 hover:bg-primary-700 text-white'
                          : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {submitting ? 'Submitting…' : 'Get Free Updates'}
                    </button>
                  )}
                </div>
              </div>
            </form>
          ) : (
            <div className="py-8 text-center">
              <div className="mx-auto w-14 h-14 rounded-full bg-green-600/20 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <div className="text-lg font-semibold">Thanks! You’re all set.</div>
              <p className="text-sm text-gray-400 mt-1">
                We’ll send curated tips and exclusive deals to your inbox.
              </p>
              <button
                onClick={closeAndReset}
                className="mt-5 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 hover:bg-gray-700 text-sm"
              >
                Close
              </button>
            </div>
          )}

          {!done && (
            <p className="text-[11px] text-gray-400 mt-4">
              No spam, unsubscribe anytime. We respect your privacy.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
