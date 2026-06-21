import {useState} from 'react';
import {
  data,
  Form,
  Link,
  useActionData,
  useNavigation,
} from 'react-router';
import type {Route} from './+types/track-order';
import {
  AlertCircle,
  ArrowRight,
  Check,
  Clock3,
  ExternalLink,
  MapPin,
  PackageCheck,
  RefreshCw,
  Search,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import {ChikanMotif} from '~/components/editorial/ChikanMotif';
import {privatePageMeta} from '~/lib/seo';
import {
  lookupShipment,
  TrackingLookupError,
  type OrderTrackingEnv,
  type ShipmentTracking,
  type TrackingLookupMode,
  type TrackingStage,
} from '~/lib/commerce/order-tracking.server';

type ActionData =
  | {
      ok: true;
      mode: TrackingLookupMode;
      reference: string;
      email: string;
      tracking: ShipmentTracking;
    }
  | {
      ok: false;
      mode: TrackingLookupMode;
      reference: string;
      email: string;
      error: string;
    };

const lookupAttempts = new Map<
  string,
  {count: number; resetAt: number}
>();

export const meta: Route.MetaFunction = () =>
  privatePageMeta(
    'Track Your Order - ilham',
    'Track an ilham shipment securely using its AWB or your order number and email.',
    '/track-order',
  );

export async function action({request, context}: Route.ActionArgs) {
  const rateLimit = consumeLookupAttempt(request);
  if (!rateLimit.allowed) {
    return trackingData<ActionData>(
      {
        ok: false,
        mode: 'awb',
        reference: '',
        email: '',
        error: 'Too many tracking checks. Please wait a moment and try again.',
      },
      429,
      {'Retry-After': String(rateLimit.retryAfter)},
    );
  }

  const formData = await request.formData();
  const mode = formData.get('mode') === 'order' ? 'order' : 'awb';
  const reference = String(formData.get('reference') ?? '')
    .trim()
    .slice(0, 40);
  const email = String(formData.get('email') ?? '')
    .trim()
    .slice(0, 160);

  try {
    const tracking = await lookupShipment({
      mode,
      reference,
      email,
      env: context.env as unknown as OrderTrackingEnv,
    });
    return trackingData<ActionData>({
      ok: true,
      mode,
      reference,
      email,
      tracking,
    });
  } catch (error) {
    if (error instanceof TrackingLookupError) {
      return trackingData<ActionData>(
        {ok: false, mode, reference, email, error: error.message},
        error.status,
      );
    }

    console.error('[order-tracking] Unexpected lookup failure:', error);
    return trackingData<ActionData>(
      {
        ok: false,
        mode,
        reference,
        email,
        error: 'Live tracking is temporarily unavailable. Please try again.',
      },
      502,
    );
  }
}

export default function TrackOrderPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [mode, setMode] = useState<TrackingLookupMode>(
    actionData?.mode ?? 'awb',
  );
  const submitting = navigation.state === 'submitting';

  return (
    <main className="min-h-screen bg-ivory pb-28 pt-28 text-ink md:pb-40 md:pt-36">
      <section className="mx-auto max-w-[1320px] px-6 lg:px-12">
        <header className="grid gap-10 border-b border-border pb-14 lg:grid-cols-[1fr_0.8fr] lg:items-end lg:pb-20">
          <div>
            <p className="small-caps text-ink/45">From our hands to yours</p>
            <h1 className="mt-5 max-w-4xl text-balance font-display text-6xl leading-[0.94] md:text-8xl">
              Track your <em className="font-serif italic">order.</em>
            </h1>
          </div>
          <div className="lg:border-l lg:border-border lg:pl-10">
            <p className="max-w-xl font-serif text-xl leading-relaxed text-ink/65 md:text-2xl">
              Follow the latest carrier movement using your AWB, or securely
              match an ilham order with the email used at checkout.
            </p>
            <div className="mt-6 flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-ink/45">
              <ShieldCheck className="h-4 w-4 text-gold" strokeWidth={1.4} />
              Live data, private by design
            </div>
          </div>
        </header>

        <div className="grid gap-12 py-14 lg:grid-cols-[420px_1fr] lg:gap-20 lg:py-20">
          <aside>
            <TrackingForm
              actionData={actionData}
              mode={mode}
              setMode={setMode}
              submitting={submitting}
            />
          </aside>

          <section aria-live="polite" aria-busy={submitting}>
            {submitting ? (
              <TrackingSkeleton />
            ) : actionData?.ok ? (
              <TrackingResult tracking={actionData.tracking} />
            ) : actionData?.error ? (
              <TrackingErrorState message={actionData.error} />
            ) : (
              <TrackingWelcome />
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

function TrackingForm({
  actionData,
  mode,
  setMode,
  submitting,
}: {
  actionData?: ActionData;
  mode: TrackingLookupMode;
  setMode: (mode: TrackingLookupMode) => void;
  submitting: boolean;
}) {
  return (
    <div className="border border-border bg-cream/45 p-5 sm:p-7">
      <p className="small-caps text-ink/45">Find your shipment</p>
      <div className="mt-5 grid grid-cols-2 border border-border bg-ivory p-1">
        <ModeButton
          active={mode === 'awb'}
          label="AWB number"
          onClick={() => setMode('awb')}
        />
        <ModeButton
          active={mode === 'order'}
          label="Order number"
          onClick={() => setMode('order')}
        />
      </div>

      <Form method="post" className="mt-7 space-y-6">
        <input type="hidden" name="mode" value={mode} />
        <label className="block" htmlFor="tracking-reference">
          <span className="small-caps text-[10px] text-ink/50">
            {mode === 'awb' ? 'AWB / tracking number' : 'ilham order number'}
          </span>
          <input
            key={mode}
            id="tracking-reference"
            name="reference"
            type="text"
            inputMode={mode === 'awb' ? 'numeric' : 'text'}
            autoComplete="off"
            required
            defaultValue={actionData?.mode === mode ? actionData.reference : ''}
            placeholder={mode === 'awb' ? 'e.g. 19041424751540' : 'e.g. #1024'}
            className="mt-2 h-14 w-full border border-border bg-ivory px-4 font-serif text-xl outline-none transition-colors placeholder:text-ink/25 focus:border-ink"
          />
        </label>

        {mode === 'order' ? (
          <label className="block" htmlFor="tracking-email">
            <span className="small-caps text-[10px] text-ink/50">
              Order email
            </span>
            <input
              id="tracking-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              defaultValue={
                actionData?.mode === 'order' ? actionData.email : ''
              }
              placeholder="you@example.com"
              className="mt-2 h-14 w-full border border-border bg-ivory px-4 font-serif text-xl outline-none transition-colors placeholder:text-ink/25 focus:border-ink"
            />
            <span className="mt-2 block text-xs leading-relaxed text-ink/45">
              We use this only to verify that the order belongs to you.
            </span>
          </label>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="flex h-14 w-full items-center justify-center gap-3 bg-ink px-6 small-caps text-ivory transition-colors hover:bg-gold disabled:cursor-wait disabled:bg-ink/55"
        >
          {submitting ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" strokeWidth={1.4} />
              Checking live status
            </>
          ) : (
            <>
              Track order
              <ArrowRight className="h-4 w-4" strokeWidth={1.4} />
            </>
          )}
        </button>
      </Form>

      <div className="mt-6 border-t border-border pt-5 text-xs leading-relaxed text-ink/45">
        Tracking results never display your address, phone, payment details, or
        email. Need help?{' '}
        <Link to="/contact" className="story-link text-brown">
          Contact the atelier
        </Link>
        .
      </div>
    </div>
  );
}

function ModeButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`h-10 text-[10px] uppercase tracking-[0.2em] transition-colors ${
        active ? 'bg-ink text-ivory' : 'text-ink/55 hover:text-ink'
      }`}
    >
      {label}
    </button>
  );
}

function TrackingResult({tracking}: {tracking: ShipmentTracking}) {
  return (
    <div className="border border-border bg-ivory shadow-soft">
      <div className="border-b border-border p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 bg-gold/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-brown">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                Live status
              </span>
              {tracking.orderName ? (
                <span className="small-caps text-[10px] text-ink/40">
                  {tracking.orderName}
                </span>
              ) : null}
            </div>
            <h2 className="mt-5 text-balance font-display text-4xl leading-tight sm:text-6xl">
              {formatStatus(tracking.currentStatus)}
            </h2>
            <p className="mt-3 text-sm text-ink/50">
              Checked {formatTrackingDate(tracking.checkedAt)}
            </p>
          </div>

          {tracking.trackingUrl ? (
            <a
              href={tracking.trackingUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 border border-ink px-4 small-caps text-[10px] transition-colors hover:bg-ink hover:text-ivory"
            >
              Carrier page
              <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.4} />
            </a>
          ) : null}
        </div>

        <TrackingFacts tracking={tracking} />
      </div>

      <div className="p-6 sm:p-8">
        <ShipmentProgress stage={tracking.stage} />
        <div className="mt-10 border-t border-border pt-8 sm:mt-14 sm:pt-10">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="small-caps text-ink/45">Carrier movement</p>
              <h3 className="mt-2 font-display text-3xl sm:text-4xl">
                Journey so far
              </h3>
            </div>
            <span className="hidden text-xs text-ink/40 sm:block">
              Latest first
            </span>
          </div>
          <TrackingTimeline tracking={tracking} />
        </div>
      </div>
    </div>
  );
}

function TrackingFacts({tracking}: {tracking: ShipmentTracking}) {
  const facts = [
    {label: 'AWB', value: tracking.awb},
    {label: 'Courier', value: tracking.courier},
    {label: 'Expected', value: formatEta(tracking.eta)},
  ].filter((fact) => fact.value);

  if (!facts.length) return null;
  return (
    <dl className="mt-7 grid gap-4 border-t border-border pt-6 sm:grid-cols-3">
      {facts.map((fact) => (
        <div key={fact.label}>
          <dt className="small-caps text-[9px] text-ink/40">{fact.label}</dt>
          <dd className="mt-2 break-words font-serif text-lg text-ink/75">
            {fact.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

const progressSteps = [
  {stage: 'confirmed', label: 'Confirmed', icon: PackageCheck},
  {stage: 'processing', label: 'Preparing', icon: Clock3},
  {stage: 'in_transit', label: 'In transit', icon: Truck},
  {stage: 'out_for_delivery', label: 'Out for delivery', icon: MapPin},
  {stage: 'delivered', label: 'Delivered', icon: Check},
] as const;

function ShipmentProgress({stage}: {stage: TrackingStage}) {
  const activeIndex = Math.max(
    0,
    progressSteps.findIndex((step) => step.stage === stage),
  );
  const exception = stage === 'exception';

  return (
    <div>
      {exception ? (
        <div className="mb-7 flex items-start gap-3 border border-brown/30 bg-brown/5 p-4 text-brown">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.4} />
          <p className="text-sm leading-relaxed">
            This shipment needs attention. Check the latest carrier event below
            or contact the atelier for help.
          </p>
        </div>
      ) : null}
      <ol className="grid grid-cols-5">
        {progressSteps.map((step, index) => {
          const reached = !exception && index <= activeIndex;
          const Icon = step.icon;
          return (
            <li key={step.stage} className="relative text-center">
              {index > 0 ? (
                <span
                  aria-hidden
                  className={`absolute right-1/2 top-5 h-px w-full ${
                    reached ? 'bg-gold' : 'bg-border'
                  }`}
                />
              ) : null}
              <span
                className={`relative mx-auto grid h-10 w-10 place-items-center rounded-full border ${
                  reached
                    ? 'border-gold bg-gold text-ivory'
                    : 'border-border bg-ivory text-ink/30'
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={1.4} />
              </span>
              <span
                className={`mt-3 block text-[8px] uppercase tracking-[0.12em] sm:text-[10px] sm:tracking-[0.18em] ${
                  reached ? 'text-ink' : 'text-ink/35'
                }`}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function TrackingTimeline({tracking}: {tracking: ShipmentTracking}) {
  return (
    <ol className="mt-8">
      {tracking.events.map((event, index) => (
        <li
          key={`${event.happenedAt ?? 'event'}-${event.status}-${event.location ?? ''}`}
          className="relative grid grid-cols-[24px_1fr] gap-4 pb-8 last:pb-0"
        >
          {index < tracking.events.length - 1 ? (
            <span
              aria-hidden
              className="absolute bottom-0 left-[11px] top-6 w-px bg-border"
            />
          ) : null}
          <span
            aria-hidden
            className={`relative mt-1.5 h-3 w-3 justify-self-center rounded-full border-2 ${
              index === 0
                ? 'border-gold bg-gold'
                : 'border-border bg-ivory'
            }`}
          />
          <div className="min-w-0">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-5">
              <h4 className="font-serif text-xl text-ink sm:text-2xl">
                {formatStatus(event.status)}
              </h4>
              {event.happenedAt ? (
                <time className="shrink-0 text-xs text-ink/40">
                  {formatTrackingDate(event.happenedAt)}
                </time>
              ) : null}
            </div>
            {event.detail ? (
              <p className="mt-2 text-sm leading-relaxed text-ink/60">
                {event.detail}
              </p>
            ) : null}
            {event.location ? (
              <p className="mt-2 flex items-center gap-2 text-xs text-ink/45">
                <MapPin className="h-3.5 w-3.5 text-gold" strokeWidth={1.4} />
                {event.location}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

function TrackingWelcome() {
  return (
    <div className="grid min-h-[520px] place-items-center border border-dashed border-border bg-cream/20 px-6 py-16 text-center">
      <div className="max-w-lg">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-gold/40 bg-gold/5 text-gold">
          <Search className="h-6 w-6" strokeWidth={1.2} />
        </span>
        <h2 className="mt-7 font-display text-4xl sm:text-5xl">
          Your journey appears here.
        </h2>
        <p className="mx-auto mt-5 max-w-md font-serif text-xl italic leading-relaxed text-ink/55">
          Every update comes directly from Shopify fulfillment and the carrier,
          without revealing your private order details.
        </p>
        <ChikanMotif className="mx-auto mt-9 h-6 w-40 text-gold/60" />
      </div>
    </div>
  );
}

function TrackingErrorState({message}: {message: string}) {
  return (
    <div className="grid min-h-[420px] place-items-center border border-border bg-cream/25 px-6 py-14 text-center">
      <div className="max-w-md">
        <AlertCircle
          className="mx-auto h-8 w-8 text-brown"
          strokeWidth={1.2}
        />
        <p className="mt-6 small-caps text-brown">Tracking unavailable</p>
        <h2 className="mt-4 font-display text-4xl">Let us try that again.</h2>
        <p className="mt-5 leading-relaxed text-ink/60">{message}</p>
      </div>
    </div>
  );
}

function TrackingSkeleton() {
  return (
    <div className="min-h-[520px] border border-border bg-ivory p-6 sm:p-8">
      <div className="h-5 w-28 skeleton-luxury" />
      <div className="mt-6 h-14 w-3/5 skeleton-luxury" />
      <div className="mt-9 grid grid-cols-3 gap-5 border-t border-border pt-6">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-12 skeleton-luxury" />
        ))}
      </div>
      <div className="mt-14 h-px bg-border" />
      <div className="mt-10 space-y-7">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-16 skeleton-luxury" />
        ))}
      </div>
    </div>
  );
}

function formatStatus(value: string) {
  return value
    .replace(/[_-]+/g, ' ')
    .toLowerCase()
    .replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());
}

function formatEta(value?: string | null) {
  if (!value) return null;
  const date = parseTrackingDate(value);
  return date
    ? new Intl.DateTimeFormat('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(date)
    : value;
}

function formatTrackingDate(value: string) {
  const date = parseTrackingDate(value);
  if (!date) return value;
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function parseTrackingDate(value: string) {
  const normalized = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(value)
    ? value.replace(' ', 'T')
    : value;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

function consumeLookupAttempt(request: Request) {
  const forwarded = request.headers.get('CF-Connecting-IP') ??
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim();
  if (!forwarded) return {allowed: true, retryAfter: 0};

  const now = Date.now();
  if (lookupAttempts.size > 1000) {
    for (const [key, bucket] of lookupAttempts) {
      if (bucket.resetAt <= now) lookupAttempts.delete(key);
    }
  }
  const existing = lookupAttempts.get(forwarded);
  if (!existing || existing.resetAt <= now) {
    lookupAttempts.set(forwarded, {count: 1, resetAt: now + 60_000});
    return {allowed: true, retryAfter: 0};
  }
  if (existing.count >= 15) {
    return {
      allowed: false,
      retryAfter: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }
  existing.count += 1;
  return {allowed: true, retryAfter: 0};
}

function trackingData<T>(
  value: T,
  status = 200,
  extraHeaders: Record<string, string> = {},
) {
  return data(value, {
    status,
    headers: {
      'Cache-Control': 'private, no-store, max-age=0',
      'X-Robots-Tag': 'noindex, nofollow, noarchive',
      ...extraHeaders,
    },
  });
}
