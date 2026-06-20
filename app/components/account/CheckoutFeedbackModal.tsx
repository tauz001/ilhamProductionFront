import {useEffect, useMemo, useRef, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {LoaderCircle, X} from 'lucide-react';
import {easeSilk, motionDuration} from '~/lib/motion/variants';

type Status = 'idle' | 'submitting' | 'success' | 'error';

export function OrderFeedbackPrompt({orderId}: {orderId: string}) {
  const [open, setOpen] = useState(false);
  const claimedRef = useRef(false);

  useEffect(() => {
    if (claimedRef.current) return;
    claimedRef.current = true;
    const storageKey = `ilham.orderFeedbackPrompted.${orderId}`;

    try {
      if (window.localStorage.getItem(storageKey) === '1') return;
    } catch {
      // Server persistence remains the source of truth when storage is blocked.
    }

    let cancelled = false;
    void postFeedback({action: 'claim-prompt', orderId})
      .then((payload) => {
        if (cancelled) return;
        try {
          window.localStorage.setItem(storageKey, '1');
        } catch {
          // The authenticated endpoint still prevents repeat prompts.
        }
        if (payload.show === true) setOpen(true);
      })
      .catch((error) => {
        console.error('[feedback] Could not claim the order prompt:', error);
      });

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-12 items-center border border-border px-5 small-caps text-[11px] text-ink/65 transition-colors hover:border-gold hover:text-gold"
      >
        Share feedback
      </button>
      <CheckoutFeedbackModal
        open={open}
        orderId={orderId}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

export function CheckoutFeedbackModal({
  onClose,
  open,
  orderId,
}: {
  onClose?: () => void;
  open: boolean;
  orderId: string;
}) {
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

  useEffect(() => {
    if (open) setVisible(true);
  }, [open]);

  if (!visible) return null;

  const close = () => {
    setVisible(false);
    onClose?.();
  };

  const submit = async () => {
    if (!experience || !recommend || status === 'submitting') return;
    setStatus('submitting');
    setError('');

    try {
      await postFeedback({
        action: 'submit',
        experienceRating: experience,
        message: message.trim(),
        orderId,
        recommendationRating: recommend,
        source: 'order-detail',
      });
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
        className="fixed inset-0 z-[95] flex items-end justify-center bg-ink/50 p-0 sm:items-center sm:p-6 sm:backdrop-blur-sm"
        initial={{opacity: 0}}
        animate={{opacity: 1}}
        exit={{opacity: 0}}
        transition={{duration: motionDuration.modal, ease: easeSilk}}
        role="presentation"
        onClick={close}
      >
        <motion.div
          initial={{y: 22, opacity: 0, scale: 0.992}}
          animate={{y: 0, opacity: 1, scale: 1}}
          exit={{y: 16, opacity: 0, scale: 0.995}}
          transition={{duration: motionDuration.modal, ease: easeSilk}}
          className="w-full transform-gpu border border-border bg-ivory p-5 shadow-soft sm:max-w-xl sm:p-7"
          role="dialog"
          aria-modal="true"
          aria-labelledby="order-feedback-title"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-5">
            <div>
              <div className="text-4xl" aria-hidden>
                {getFeedbackSymbol(average)}
              </div>
              <p className="mt-4 small-caps text-ink/45">Ordering experience</p>
              <h2 id="order-feedback-title" className="mt-2 font-display text-3xl text-ink">
                How was your order?
              </h2>
            </div>
            <button
              type="button"
              onClick={close}
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
                Your feedback is now attached to this order for the atelier.
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

function getFeedbackSymbol(average: number | null) {
  if (average === null) return '\u263A';
  if (average <= 2) return '\u2639';
  if (average <= 5) return '\u2022';
  if (average <= 8) return '\u263A';
  return '\u2661';
}

async function postFeedback(payload: Record<string, unknown>) {
  const response = await fetch('/api/order-feedback', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload),
  });
  const data = (await response.json().catch(() => ({}))) as {
    message?: string;
    show?: boolean;
  };

  if (!response.ok) {
    throw new Error(data.message || 'Could not save feedback.');
  }

  return data;
}
