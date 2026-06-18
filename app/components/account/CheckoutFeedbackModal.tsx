import {useMemo, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {LoaderCircle, X} from 'lucide-react';
import {easeSilk} from '~/lib/motion/variants';

type Status = 'idle' | 'submitting' | 'success' | 'error';

export function CheckoutFeedbackModal({open}: {open: boolean}) {
  const [visible, setVisible] = useState(open);
  const [experience, setExperience] = useState<number | null>(null);
  const [recommend, setRecommend] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const average = useMemo(() => {
    const ratings = [experience, recommend].filter(
      (value): value is number => typeof value === 'number',
    );
    return ratings.length
      ? ratings.reduce((sum, value) => sum + value, 0) / ratings.length
      : null;
  }, [experience, recommend]);
  const showMessage = Boolean(
    (experience !== null && experience <= 2) ||
      (recommend !== null && recommend <= 2),
  );

  if (!visible) return null;

  const submit = async () => {
    if (!experience || !recommend || status === 'submitting') return;
    setStatus('submitting');
    setError('');

    try {
      const response = await fetch('/api/order-feedback', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          experienceRating: experience,
          recommendationRating: recommend,
          message: message.trim(),
          source: 'account-profile',
        }),
      });
      const payload = (await response.json()) as {message?: string};

      if (!response.ok) {
        throw new Error(payload.message || 'Could not save feedback.');
      }

      setStatus('success');
    } catch (caught) {
      setStatus('error');
      setError(
        caught instanceof Error
          ? caught.message
          : 'Could not save feedback right now.',
      );
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[95] flex items-end justify-center bg-ink/50 p-0 backdrop-blur-sm sm:items-center sm:p-6"
        initial={{opacity: 0}}
        animate={{opacity: 1}}
        exit={{opacity: 0}}
      >
        <motion.div
          initial={{y: 30, opacity: 0}}
          animate={{y: 0, opacity: 1}}
          exit={{y: 30, opacity: 0}}
          transition={{duration: 0.45, ease: easeSilk}}
          className="w-full border border-border bg-ivory p-5 shadow-soft sm:max-w-xl sm:p-7"
        >
          <div className="flex items-start justify-between gap-5">
            <div>
              <div className="text-4xl" aria-hidden>
                {getFeedbackEmoji(average)}
              </div>
              <p className="mt-4 small-caps text-ink/45">Ordering experience</p>
              <h2 className="mt-2 font-display text-3xl text-ink">
                How was your order?
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setVisible(false)}
              aria-label="Close feedback"
              className="grid h-10 w-10 shrink-0 place-items-center border border-border transition-colors hover:border-ink"
            >
              <X className="h-4 w-4" strokeWidth={1.4} />
            </button>
          </div>

          {status === 'success' ? (
            <div className="mt-8 border border-gold/35 bg-gold/10 p-5">
              <p className="font-serif text-2xl text-ink">Thank you.</p>
              <p className="mt-2 text-sm leading-relaxed text-ink/60">
                Your feedback helps us make the atelier smoother for every
                customer.
              </p>
            </div>
          ) : (
            <>
              <Scale
                label="How was your ordering experience?"
                value={experience}
                onChange={setExperience}
              />
              <Scale
                label="What would you rate us out of 10?"
                value={recommend}
                onChange={setRecommend}
              />

              <AnimatePresence initial={false}>
                {showMessage ? (
                  <motion.label
                    initial={{height: 0, opacity: 0, y: 12}}
                    animate={{height: 'auto', opacity: 1, y: 0}}
                    exit={{height: 0, opacity: 0, y: 12}}
                    transition={{duration: 0.4, ease: easeSilk}}
                    className="mt-5 block overflow-hidden"
                  >
                    <span className="small-caps text-ink/50">
                      What can we do better?
                    </span>
                    <textarea
                      value={message}
                      onChange={(event) => setMessage(event.currentTarget.value)}
                      maxLength={1000}
                      className="mt-2 min-h-28 w-full border border-border bg-ivory p-3 text-sm text-ink placeholder:text-ink/35 focus:border-ink focus:outline-none"
                      placeholder="Tell us what felt difficult."
                    />
                  </motion.label>
                ) : null}
              </AnimatePresence>

              {error ? (
                <p className="mt-5 border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </p>
              ) : null}

              <button
                type="button"
                disabled={!experience || !recommend || status === 'submitting'}
                onClick={() => void submit()}
                className="mt-7 flex h-12 w-full items-center justify-center bg-ink px-6 small-caps text-ivory transition-colors hover:bg-gold disabled:bg-ink/35"
              >
                {status === 'submitting' ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" strokeWidth={1.4} />
                ) : (
                  'Send feedback'
                )}
              </button>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Scale({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: number) => void;
  value: number | null;
}) {
  return (
    <div className="mt-7">
      <p className="text-sm text-ink/65">{label}</p>
      <div className="mt-3 grid grid-cols-10 gap-1.5">
        {Array.from({length: 10}, (_, index) => index + 1).map((number) => (
          <button
            key={number}
            type="button"
            onClick={() => onChange(number)}
            className={`h-9 border text-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-gold hover:bg-gold hover:text-ivory ${
              value === number
                ? 'border-ink bg-ink text-ivory'
                : 'border-border bg-cream/40 text-ink/65'
            }`}
          >
            {number}
          </button>
        ))}
      </div>
    </div>
  );
}

function getFeedbackEmoji(average: number | null) {
  if (average === null) return '🙂';
  if (average <= 2) return '😟';
  if (average <= 5) return '😐';
  if (average <= 8) return '🙂';
  return '🤍';
}
