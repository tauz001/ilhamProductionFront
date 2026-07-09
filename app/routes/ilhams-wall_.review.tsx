import {useEffect, useState} from 'react';
import {
  data,
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
} from 'react-router';
import type {Route} from './+types/ilhams-wall_.review';
import {
  Camera,
  CheckCircle,
  Image as ImageIcon,
  Send,
  ShieldCheck,
} from 'lucide-react';
import {ChikanMotif} from '~/components/editorial/ChikanMotif';
import {JsonLd} from '~/components/seo/JsonLd';
import {
  loadIlhamsWallInvite,
  submitIlhamsWallInviteReview,
} from '~/lib/commerce/ilhams-wall.server';
import {
  prepareWallPhoto,
  type WallPhotoPreview,
} from '~/lib/commerce/wall-photo';
import {breadcrumbJsonLd, seoMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = () => {
  return seoMeta({
    title: "Share a note for ilham's wall",
    description:
      "A private invite page for sharing a short customer note with ilham's wall.",
    noIndex: true,
    path: '/ilhams-wall/review',
  });
};

export async function loader({context, request}: Route.LoaderArgs) {
  const url = new URL(request.url);
  const token = url.searchParams.get('invite');
  const state = await loadIlhamsWallInvite({
    customerAccount: context.customerAccount,
    env: context.env,
    token,
  });

  return {state, token};
}

export async function action({context, request}: Route.ActionArgs) {
  if (request.method !== 'POST') {
    return data(
      {message: 'Use POST to share a wall note.', submitted: false},
      {status: 405},
    );
  }

  try {
    const formData = await request.formData();
    const result = await submitIlhamsWallInviteReview({
      customerAccount: context.customerAccount,
      env: context.env,
      formData,
    });

    return data(
      {message: result.message, submitted: result.submitted},
      {status: result.status},
    );
  } catch (error) {
    return data(
      {
        message:
          error instanceof Error
            ? error.message
            : 'Could not save your wall note just now.',
        submitted: false,
      },
      {status: 400},
    );
  }
}

export default function IlhamsWallInviteReview() {
  const {state, token} = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  const inviteToken = state.invite?.token ?? token ?? '';
  const invite = state.status === 'ready' ? state.invite : null;
  const submitted = Boolean(actionData?.submitted);
  const alreadySent = state.status === 'used';

  useEffect(() => {
    if (!submitted && !alreadySent) return;

    const timeout = window.setTimeout(
      () => {
        void navigate('/', {replace: true});
      },
      submitted ? 2800 : 1800,
    );

    return () => window.clearTimeout(timeout);
  }, [alreadySent, navigate, submitted]);

  return (
    <div className="relative overflow-hidden bg-[#f7f0e4] pt-32 text-ink md:pt-40">
      <WallPattern />
      <FlightAnimationStyles />
      <section className="relative mx-auto max-w-[1200px] px-4 pb-16 text-center sm:px-6 lg:px-12">
        <p className="small-caps text-gold">Private review invite</p>
        <h1 className="mx-auto mt-5 max-w-4xl text-balance font-display text-5xl leading-none md:text-8xl">
          A note for ilham&apos;s wall.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl font-serif text-xl leading-relaxed text-ink/62 md:text-2xl">
          Share a small memory from your piece. It appears publicly only after
          atelier approval.
        </p>
        <ChikanMotif className="mx-auto mt-9 h-7 w-48 text-gold" />
      </section>

      <section className="relative mx-auto grid max-w-[1180px] gap-8 px-4 pb-24 sm:px-6 md:grid-cols-[0.9fr_1.1fr] lg:px-12">
        <InviteContextCard state={state} />
        {submitted ? (
          <InviteSubmittedJourney message={actionData?.message} />
        ) : alreadySent ? (
          <InviteAlreadySent />
        ) : invite ? (
          <InviteReviewForm
            actionData={actionData}
            customerDisplayName={state.customerDisplayName}
            invite={invite}
            token={inviteToken}
          />
        ) : (
          <InviteUnavailable message={state.message} />
        )}
      </section>

      <JsonLd
        data={breadcrumbJsonLd([
          {name: 'Home', url: '/'},
          {name: "ilham's wall", url: '/ilhams-wall'},
          {name: 'Share note', url: '/ilhams-wall/review'},
        ])}
      />
    </div>
  );
}

function InviteContextCard({
  state,
}: {
  state: Awaited<ReturnType<typeof loadIlhamsWallInvite>>;
}) {
  const invite = state.invite;

  return (
    <aside className="relative border border-ink/10 bg-ivory/80 p-7 shadow-[0_20px_55px_rgba(57,42,24,0.08)]">
      <ShieldCheck className="h-5 w-5 text-gold" strokeWidth={1.35} />
      <p className="mt-5 small-caps text-ink/45">What this link does</p>
      <h2 className="mt-4 font-serif text-3xl leading-tight">
        It creates one pending review note.
      </h2>
      <p className="mt-4 text-sm leading-relaxed text-ink/60">
        This page does not publish instantly and does not require login. If you
        are signed in, we can use your account name; otherwise the invite name
        is used.
      </p>

      {invite ? (
        <div className="mt-8 space-y-4 border-t border-ink/10 pt-6 text-sm">
          <InviteFact label="Piece" value={invite.productTitle} />
          <InviteFact
            label="Name shown"
            value={state.customerDisplayName || 'Privacy-friendly customer'}
          />
          {invite.source ? <InviteFact label="Source" value={invite.source} /> : null}
          {invite.orderName !== 'Invite' ? (
            <InviteFact label="Reference" value={invite.orderName} />
          ) : null}
        </div>
      ) : (
        <p className="mt-7 border-t border-ink/10 pt-6 text-sm text-ink/55">
          Use the exact review invite link sent by ilham.
        </p>
      )}

      <Link
        className="mt-8 inline-flex small-caps text-[10px] text-gold transition-colors hover:text-ink"
        to="/ilhams-wall"
      >
        View ilham&apos;s wall
      </Link>
    </aside>
  );
}

function InviteFact({label, value}: {label: string; value: string}) {
  return (
    <div>
      <p className="small-caps text-[10px] text-ink/38">{label}</p>
      <p className="mt-1 font-serif text-xl leading-snug text-ink/78">{value}</p>
    </div>
  );
}

function InviteUnavailable({message}: {message: string}) {
  return (
    <div className="border border-border bg-ivory/85 p-7 shadow-[0_20px_55px_rgba(57,42,24,0.08)]">
      <CheckCircle className="h-5 w-5 text-gold" strokeWidth={1.35} />
      <h2 className="mt-5 font-serif text-3xl">This link is not ready.</h2>
      <p className="mt-3 text-sm leading-relaxed text-ink/60">{message}</p>
      <Link
        to="/contact"
        className="mt-7 inline-flex border border-ink px-7 py-3 small-caps text-[10px] transition-colors hover:bg-ink hover:text-ivory"
      >
        Contact ilham
      </Link>
    </div>
  );
}

function InviteAlreadySent() {
  return (
    <div className="relative overflow-hidden border border-gold/25 bg-ink p-7 text-ivory shadow-[0_20px_55px_rgba(57,42,24,0.16)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(190,143,74,0.28),transparent_58%)]" />
      <div className="relative">
        <Send
          className="h-6 w-6 text-gold"
          strokeWidth={1.35}
          style={{animation: 'wallPlaneDrift 1600ms ease-in-out infinite'}}
        />
        <h2 className="mt-5 font-serif text-4xl">Your note has reached us.</h2>
        <p className="mt-3 text-sm leading-relaxed text-ivory/68">
          This private link has already been used. We&apos;re taking you back to
          the atelier.
        </p>
      </div>
    </div>
  );
}

function InviteSubmittedJourney({message}: {message?: string}) {
  return (
    <div className="relative min-h-[26rem] overflow-hidden border border-gold/25 bg-ink p-7 text-center text-ivory shadow-[0_24px_65px_rgba(57,42,24,0.18)] sm:p-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(190,143,74,0.25),transparent_55%)]" />
      <div className="absolute left-1/2 top-16 h-px w-40 -translate-x-1/2 bg-gradient-to-r from-transparent via-gold/45 to-transparent" />
      <div className="relative mx-auto flex h-28 w-28 items-center justify-center">
        <span className="absolute h-24 w-24 rounded-full border border-gold/20" />
        <span className="absolute h-16 w-16 rounded-full bg-gold/10 blur-sm" />
        <Send
          className="relative h-9 w-9 text-gold"
          strokeWidth={1.35}
          style={{animation: 'wallPlaneLaunchSuccess 1800ms ease-out both'}}
        />
      </div>
      <p className="relative mt-3 small-caps text-gold">Sent for approval</p>
      <h2 className="relative mx-auto mt-4 max-w-md font-serif text-4xl leading-tight sm:text-5xl">
        Your note is on its way.
      </h2>
      <p className="relative mx-auto mt-5 max-w-md text-sm leading-relaxed text-ivory/68">
        {message ||
          'Your note is waiting for atelier approval. Thank you for sharing it.'}
      </p>
      <p className="relative mt-8 small-caps text-[10px] text-ivory/45">
        Returning home
      </p>
    </div>
  );
}

function InviteReviewForm({
  actionData,
  customerDisplayName,
  invite,
  token,
}: {
  actionData?: {message?: string; submitted?: boolean};
  customerDisplayName?: string | null;
  invite: NonNullable<Awaited<ReturnType<typeof loadIlhamsWallInvite>>['invite']>;
  token: string;
}) {
  const navigation = useNavigation();
  const [note, setNote] = useState('');
  const [photoPreview, setPhotoPreview] = useState<WallPhotoPreview | null>(
    null,
  );
  const [photoStatus, setPhotoStatus] = useState<string | null>(null);
  const submitting = navigation.state === 'submitting';

  useEffect(() => {
    return () => {
      if (photoPreview?.url) URL.revokeObjectURL(photoPreview.url);
    };
  }, [photoPreview?.url]);

  if (actionData?.submitted) {
    return (
      <div className="border border-border bg-ivory/85 p-7 text-center shadow-[0_20px_55px_rgba(57,42,24,0.08)]">
        <CheckCircle className="mx-auto h-6 w-6 text-gold" strokeWidth={1.35} />
        <h2 className="mt-5 font-serif text-4xl">Your note is with us.</h2>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-ink/60">
          {actionData.message}
        </p>
        <Link
          to="/ilhams-wall"
          className="mt-7 inline-flex border border-ink px-7 py-3 small-caps text-[10px] transition-colors hover:bg-ink hover:text-ivory"
        >
          View wall
        </Link>
      </div>
    );
  }

  return (
    <Form
      className="border border-border bg-ivory/85 p-5 shadow-[0_20px_55px_rgba(57,42,24,0.08)] sm:p-7"
      encType="multipart/form-data"
      method="post"
    >
      <input name="invite" type="hidden" value={token} />

      <div className="rounded-none border border-gold/20 bg-cream/45 p-4">
        <p className="small-caps text-[10px] text-ink/45">Reviewing</p>
        <p className="mt-2 font-serif text-2xl leading-snug">
          {invite.productTitle}
        </p>
        <p className="mt-2 text-xs text-ink/45">
          Name shown:{' '}
          <span className="text-ink/62">
            {customerDisplayName || 'Privacy-friendly customer'}
          </span>
        </p>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between gap-4">
          <label className="small-caps block text-ink/45" htmlFor="note">
            Your note
          </label>
          <span className="text-[11px] text-ink/38">{note.length}/120</span>
        </div>
        <textarea
          className="mt-2 min-h-32 w-full resize-none border border-border bg-transparent p-4 font-serif text-2xl leading-snug outline-none transition-colors placeholder:text-ink/25 focus:border-ink"
          id="note"
          maxLength={120}
          name="note"
          onChange={(event) => setNote(event.currentTarget.value)}
          placeholder="It felt handmade in the most beautiful way..."
          required
          value={note}
        />
      </div>

      <div className="mt-6">
        <label
          className="flex cursor-pointer items-center justify-between gap-4 border border-dashed border-ink/20 bg-cream/45 p-4 transition-colors hover:border-gold/60"
          htmlFor="photo"
        >
          <span className="flex items-center gap-3">
            <ImageIcon className="h-4 w-4 text-gold" strokeWidth={1.4} />
            <span>
              <span className="block small-caps text-[10px] text-ink/50">
                One optional photo
              </span>
              <span className="text-xs text-ink/45">
                JPG, PNG, or WebP. We compress in your browser when possible.
              </span>
            </span>
          </span>
          <Camera className="h-4 w-4 text-ink/35" strokeWidth={1.4} />
        </label>
        <input
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          id="photo"
          name="photo"
          onChange={(event) => {
            void prepareWallPhoto(
              event.currentTarget,
              setPhotoStatus,
              setPhotoPreview,
            );
          }}
          type="file"
        />
        {photoPreview ? <PhotoPreview preview={photoPreview} /> : null}
        {photoStatus ? (
          <p className="mt-2 text-xs italic text-ink/45">{photoStatus}</p>
        ) : null}
      </div>

      <label className="mt-6 flex items-start gap-3 text-xs leading-relaxed text-ink/55">
        <input
          className="mt-1 accent-[oklch(0.62_0.11_75)]"
          name="consent"
          required
          type="checkbox"
          value="yes"
        />
        <span>
          I allow ilham to show this note and photo on the website after review.
        </span>
      </label>

      <button
        className={`relative mt-7 flex h-12 w-full items-center justify-center gap-2 overflow-hidden px-6 small-caps text-ivory transition-colors disabled:cursor-wait ${
          submitting ? 'bg-gold text-ink' : 'bg-ink hover:bg-gold'
        }`}
        disabled={submitting}
        type="submit"
      >
        <span
          aria-hidden
          className={`absolute inset-0 ${
            submitting
              ? 'bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.24),transparent)]'
              : ''
          }`}
          style={
            submitting
              ? {animation: 'wallButtonSheen 1100ms ease-in-out infinite'}
              : undefined
          }
        />
        <Send
          className="relative h-3.5 w-3.5"
          strokeWidth={1.45}
          style={
            submitting
              ? {animation: 'wallPlaneLaunchButton 1200ms ease-out both'}
              : undefined
          }
        />
        <span className="relative">
          {submitting ? 'Sending to atelier' : 'Send for approval'}
        </span>
      </button>

      {actionData?.message ? (
        <p className="mt-4 text-sm text-ink/60">{actionData.message}</p>
      ) : null}
    </Form>
  );
}

function PhotoPreview({preview}: {preview: WallPhotoPreview}) {
  return (
    <div className="mt-3 flex items-center gap-3 border border-ink/10 bg-ivory/70 p-2.5 shadow-[0_8px_20px_rgba(57,42,24,0.06)]">
      <img
        alt=""
        className="h-16 w-14 flex-none object-cover"
        src={preview.url}
      />
      <div className="min-w-0">
        <p className="truncate text-xs text-ink/65">{preview.name}</p>
        <p className="mt-1 small-caps text-[9px] text-gold">
          {formatFileSize(preview.size)} ready
        </p>
      </div>
    </div>
  );
}

function formatFileSize(size: number) {
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function FlightAnimationStyles() {
  return (
    <style>
      {`
        @keyframes wallPlaneLaunchButton {
          0% { opacity: 1; transform: translate3d(0, 0, 0) scale(1) rotate(0deg); }
          38% { opacity: 1; transform: translate3d(8px, -6px, 0) scale(1.35) rotate(8deg); }
          100% { opacity: 0; transform: translate3d(76px, -44px, 0) scale(2.7) rotate(18deg); }
        }

        @keyframes wallButtonSheen {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(120%); }
        }

        @keyframes wallPlaneLaunchSuccess {
          0% { opacity: 0; transform: translate3d(-22px, 26px, 0) scale(0.65) rotate(-16deg); }
          18% { opacity: 1; }
          72% { opacity: 1; transform: translate3d(18px, -16px, 0) scale(1.35) rotate(10deg); }
          100% { opacity: 0; transform: translate3d(78px, -64px, 0) scale(2.15) rotate(18deg); }
        }

        @keyframes wallPlaneDrift {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
          50% { transform: translate3d(10px, -8px, 0) rotate(8deg); }
        }
      `}
    </style>
  );
}

function WallPattern() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-[0.075]"
      style={{
        backgroundImage:
          'url("data:image/svg+xml,%3Csvg width=\'120\' height=\'120\' viewBox=\'0 0 120 120\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' stroke=\'%238a6b3f\' stroke-width=\'1\' opacity=\'.42\'%3E%3Cpath d=\'M60 22c13 16 13 60 0 76C47 82 47 38 60 22Z\'/%3E%3Cpath d=\'M22 60c16-13 60-13 76 0-16 13-60 13-76 0Z\'/%3E%3Cpath d=\'M38 38c14 2 42 30 44 44-14-2-42-30-44-44Z\'/%3E%3Cpath d=\'M82 38c-2 14-30 42-44 44 2-14 30-42 44-44Z\'/%3E%3Ccircle cx=\'60\' cy=\'60\' r=\'6\'/%3E%3C/g%3E%3C/svg%3E")',
        backgroundSize: '150px 150px',
      }}
    />
  );
}
