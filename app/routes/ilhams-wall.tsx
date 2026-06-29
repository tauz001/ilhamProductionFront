import {useState} from 'react';
import {
  data,
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
} from 'react-router';
import type {Route} from './+types/ilhams-wall';
import {
  Camera,
  CheckCircle,
  Heart,
  Image as ImageIcon,
  PenLine,
} from 'lucide-react';
import {ChikanMotif} from '~/components/editorial/ChikanMotif';
import {
  readIlhamsWallReviews,
  loadEligibleReviewItems,
  submitIlhamsWallReview,
  type EligibleReviewItem,
  type IlhamsWallReview,
} from '~/lib/commerce/ilhams-wall.server';
import {
  CARD_IMAGE_WIDTHS,
  shopifyImageUrl,
  shopifySrcSet,
} from '~/lib/commerce/image';
import {breadcrumbJsonLd, seoMeta} from '~/lib/seo';
import {JsonLd} from '~/components/seo/JsonLd';

export const meta: Route.MetaFunction = () => {
  return seoMeta({
    title: "ilham's wall - customer stories",
    description:
      'A handmade wall of verified ilham customer notes, photos, and moments with Lucknowi chikankari.',
    path: '/ilhams-wall',
  });
};

export async function loader({context, request}: Route.LoaderArgs) {
  const url = new URL(request.url);
  const after = url.searchParams.get('after');
  const [wall, eligibility] = await Promise.all([
    readIlhamsWallReviews({
      after,
      env: context.env,
    }),
    loadEligibleReviewItems({customerAccount: context.customerAccount}),
  ]);

  return {
    eligibility,
    wall,
  };
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
    const result = await submitIlhamsWallReview({
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

export default function IlhamsWall() {
  const {eligibility, wall} = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const hasReviews = wall.reviews.length > 0;

  return (
    <div className="overflow-hidden bg-[#f7f0e4] pt-32 text-ink md:pt-40">
      <section className="relative mx-auto max-w-[1500px] px-4 pb-12 text-center sm:px-6 lg:px-12">
        <WallPattern />
        <div className="relative">
          <p className="small-caps text-gold">Verified customer notes</p>
          <h1 className="mx-auto mt-5 max-w-4xl text-balance font-display text-6xl leading-none md:text-8xl">
            ilham&apos;s wall
          </h1>
          <p className="mx-auto mt-6 max-w-2xl font-serif text-xl leading-relaxed text-ink/62 md:text-2xl">
            Real moments from customers, kept like little notes on a quiet
            atelier wall.
          </p>
          <ChikanMotif className="mx-auto mt-9 h-7 w-48 text-gold" />
        </div>
      </section>

      <section className="relative border-y border-ink/10 bg-[#f4eadb]">
        <WallPattern />
        <div className="relative mx-auto max-w-[1500px] px-4 py-14 sm:px-6 md:py-20 lg:px-12">
          {wall.unavailableReason ? (
            <div className="mx-auto mb-10 max-w-2xl border border-gold/25 bg-ivory/80 p-5 text-center text-sm text-ink/62">
              {wall.unavailableReason}
            </div>
          ) : null}

          {hasReviews ? (
            <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {wall.reviews.map((review) => (
                <StickyReviewNote key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <EmptyWall />
          )}

          {wall.hasNextPage && wall.endCursor ? (
            <div className="mt-14 flex justify-center">
              <Link
                to={`/ilhams-wall?after=${encodeURIComponent(wall.endCursor)}`}
                className="border border-ink px-8 py-4 small-caps text-[11px] transition-colors hover:bg-ink hover:text-ivory"
              >
                More notes
              </Link>
            </div>
          ) : null}
        </div>
      </section>

      <section className="mx-auto grid max-w-[1300px] gap-10 px-4 py-20 sm:px-6 md:grid-cols-[0.9fr_1.1fr] md:py-28 lg:px-12">
        <div>
          <p className="small-caps text-ink/45">Share yours</p>
          <h2 className="mt-5 text-balance font-display text-5xl leading-none md:text-7xl">
            A note from your piece.
          </h2>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-ink/62">
            Verified delivered customers can leave one short wall note. Names
            are kept privacy-friendly and every note waits for approval.
          </p>
        </div>

        <ReviewSubmissionPanel
          actionData={actionData}
          eligibility={eligibility}
        />
      </section>

      <JsonLd
        data={breadcrumbJsonLd([
          {name: 'Home', url: '/'},
          {name: "ilham's wall", url: '/ilhams-wall'},
        ])}
      />
    </div>
  );
}

function StickyReviewNote({review}: {review: IlhamsWallReview}) {
  const style = getNoteStyle(getReviewVisualSeed(review));
  const photo = review.photo?.url ? review.photo : null;
  const hasPhoto = Boolean(photo);
  const centerNote = !hasPhoto && review.note.length <= 70;
  return (
    <article
      className="group relative mx-auto flex min-h-[260px] w-full max-w-[22rem] flex-col justify-between overflow-visible border border-black/[0.05] p-5 shadow-[0_18px_35px_rgba(57,42,24,0.13)] transition-transform duration-500 hover:-translate-y-1"
      style={{
        background: style.background,
        transform: `rotate(${style.rotation}deg)`,
      }}
    >
      <span
        aria-hidden
        className="absolute top-3 z-10 h-7 border border-white/35 bg-white/50 shadow-[0_4px_12px_rgba(78,56,31,0.1)] backdrop-blur-[1px]"
        style={{
          left: `${style.tapeLeft}%`,
          opacity: style.tapeOpacity,
          transform: `translate(-50%, -54%) rotate(${style.tapeRotation}deg)`,
          width: `${style.tapeWidth}px`,
        }}
      />

      {photo ? (
        <div className="mb-4 overflow-hidden border border-ink/10 bg-ivory/45">
          <img
            alt={photo.altText ?? review.productTitle}
            className="aspect-[4/3] w-full object-cover"
            decoding="async"
            height={photo.height ?? undefined}
            loading="lazy"
            sizes="(min-width: 1280px) 22vw, (min-width: 768px) 33vw, 90vw"
            src={shopifyImageUrl(photo.url, 520)}
            srcSet={shopifySrcSet(photo.url, CARD_IMAGE_WIDTHS)}
            width={photo.width ?? undefined}
          />
        </div>
      ) : null}

      <div
        className={
          centerNote
            ? 'flex flex-1 items-center py-8'
            : hasPhoto
              ? ''
              : 'pt-5'
        }
      >
        <p className="font-serif text-2xl leading-snug text-ink/82">
          &ldquo;{review.note}&rdquo;
        </p>
      </div>

      <div className="mt-7 space-y-2">
        <div className="flex items-center justify-between gap-4 border-t border-ink/10 pt-4">
          <p className="small-caps text-[10px] text-ink/45">
            {review.customerName}
          </p>
          <time className="text-[11px] text-ink/42" dateTime={review.date}>
            {formatReviewDate(review.date)}
          </time>
        </div>
        <Link
          className="block truncate text-[11px] italic text-ink/45 transition-colors hover:text-gold"
          to={review.productUrl}
        >
          {review.productTitle}
        </Link>
      </div>
    </article>
  );
}

function ReviewSubmissionPanel({
  actionData,
  eligibility,
}: {
  actionData?: {message?: string; submitted?: boolean};
  eligibility: {
    customerDisplayName?: string | null;
    isLoggedIn: boolean;
    items: EligibleReviewItem[];
  };
}) {
  if (!eligibility.isLoggedIn) {
    return (
      <div className="border border-border bg-ivory/75 p-7 shadow-[0_18px_45px_rgba(57,42,24,0.08)]">
        <Heart className="h-5 w-5 text-gold" strokeWidth={1.4} />
        <h3 className="mt-5 font-serif text-3xl">Sign in to share.</h3>
        <p className="mt-3 text-sm leading-relaxed text-ink/60">
          The wall only accepts notes from verified customer orders.
        </p>
        <Link
          to="/account/login"
          className="mt-7 inline-flex border border-ink px-7 py-3 small-caps text-[10px] transition-colors hover:bg-ink hover:text-ivory"
        >
          Sign in
        </Link>
      </div>
    );
  }

  if (!eligibility.items.length) {
    return (
      <div className="border border-border bg-ivory/75 p-7 shadow-[0_18px_45px_rgba(57,42,24,0.08)]">
        <CheckCircle className="h-5 w-5 text-gold" strokeWidth={1.4} />
        <h3 className="mt-5 font-serif text-3xl">No delivered pieces yet.</h3>
        <p className="mt-3 text-sm leading-relaxed text-ink/60">
          Once an order is fulfilled or delivered, eligible pieces will appear
          here for a wall note.
        </p>
      </div>
    );
  }

  return (
    <WallReviewForm actionData={actionData} items={eligibility.items} />
  );
}

function WallReviewForm({
  actionData,
  items,
}: {
  actionData?: {message?: string; submitted?: boolean};
  items: EligibleReviewItem[];
}) {
  const navigation = useNavigation();
  const [note, setNote] = useState('');
  const [photoStatus, setPhotoStatus] = useState<string | null>(null);
  const submitting = navigation.state === 'submitting';

  return (
    <Form
      className="border border-border bg-ivory/85 p-5 shadow-[0_18px_45px_rgba(57,42,24,0.08)] sm:p-7"
      encType="multipart/form-data"
      method="post"
    >
      <div>
        <label className="small-caps block text-ink/45" htmlFor="reviewTarget">
          Delivered piece
        </label>
        <select
          className="mt-2 h-12 w-full border border-border bg-transparent px-3 text-sm outline-none transition-colors focus:border-ink"
          id="reviewTarget"
          name="reviewTarget"
          required
        >
          {items.map((item) => (
            <option
              key={`${item.orderId}-${item.lineItemId}`}
              value={item.targetValue}
            >
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between gap-4">
          <label className="small-caps block text-ink/45" htmlFor="note">
            Your note
          </label>
          <span className="text-[11px] text-ink/38">{note.length}/120</span>
        </div>
        <textarea
          className="mt-2 min-h-28 w-full resize-none border border-border bg-transparent p-4 font-serif text-2xl leading-snug outline-none transition-colors placeholder:text-ink/25 focus:border-ink"
          id="note"
          maxLength={120}
          name="note"
          onChange={(event) => setNote(event.currentTarget.value)}
          placeholder="The fabric felt like a memory..."
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
            void preparePhoto(event.currentTarget, setPhotoStatus);
          }}
          type="file"
        />
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
        className="mt-7 flex h-12 w-full items-center justify-center gap-2 bg-ink px-6 small-caps text-ivory transition-colors hover:bg-gold disabled:bg-ink/40"
        disabled={submitting}
        type="submit"
      >
        <PenLine className="h-3.5 w-3.5" strokeWidth={1.4} />
        {submitting ? 'Saving note' : 'Send for approval'}
      </button>

      {actionData?.message ? (
        <p
          className={`mt-4 text-sm ${
            actionData.submitted ? 'text-gold' : 'text-ink/60'
          }`}
        >
          {actionData.message}
        </p>
      ) : null}
    </Form>
  );
}

function EmptyWall() {
  return (
    <div className="mx-auto max-w-xl border border-ink/10 bg-ivory/75 p-8 text-center shadow-[0_18px_45px_rgba(57,42,24,0.08)]">
      <p className="small-caps text-gold">The first notes are coming</p>
      <h2 className="mt-4 font-display text-5xl">A quiet wall, for now.</h2>
      <p className="mt-5 text-sm leading-relaxed text-ink/60">
        Approved customer notes will appear here as soft handmade slips after
        the atelier reviews them.
      </p>
    </div>
  );
}

function WallPattern() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-[0.085]"
      style={{
        backgroundImage:
          'url("data:image/svg+xml,%3Csvg width=\'120\' height=\'120\' viewBox=\'0 0 120 120\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' stroke=\'%238a6b3f\' stroke-width=\'1\' opacity=\'.42\'%3E%3Cpath d=\'M60 22c13 16 13 60 0 76C47 82 47 38 60 22Z\'/%3E%3Cpath d=\'M22 60c16-13 60-13 76 0-16 13-60 13-76 0Z\'/%3E%3Cpath d=\'M38 38c14 2 42 30 44 44-14-2-42-30-44-44Z\'/%3E%3Cpath d=\'M82 38c-2 14-30 42-44 44 2-14 30-42 44-44Z\'/%3E%3Ccircle cx=\'60\' cy=\'60\' r=\'6\'/%3E%3C/g%3E%3C/svg%3E")',
        backgroundSize: '150px 150px',
      }}
    />
  );
}

function getReviewVisualSeed(review: IlhamsWallReview) {
  return getTextSeed(`${review.id}:${review.styleSeed}`);
}

function getTextSeed(value: string) {
  let hash = 0;
  for (const char of value) {
    hash = (hash * 33 + char.charCodeAt(0)) % 104729;
  }
  return Math.abs(hash || 1);
}

function getNoteStyle(seed: number) {
  const backgrounds = [
    '#f5d7cf',
    '#f2df9f',
    '#cfe4da',
    '#d9d5ee',
    '#f0cbd7',
    '#cfe0ed',
    '#ecd4ae',
    '#d7e0bf',
    '#f1d7bd',
    '#d6e3d5',
  ];
  const normalizedSeed = Math.abs(seed || 1);
  const background = backgrounds[normalizedSeed % backgrounds.length];
  const rotation = (((normalizedSeed * 7) % 11) - 5) * 0.5;
  const tapeLeft = 35 + ((normalizedSeed * 13) % 31);
  const tapeRotation = (((normalizedSeed * 17) % 11) - 5) * 0.65;
  const tapeWidth = 74 + ((normalizedSeed * 19) % 48);
  const tapeOpacity = 0.44 + (((normalizedSeed * 23) % 12) / 100);

  return {
    background,
    rotation,
    tapeLeft,
    tapeOpacity,
    tapeRotation,
    tapeWidth,
  };
}

function formatReviewDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
  }).format(date);
}

async function preparePhoto(
  input: HTMLInputElement,
  setStatus: (status: string | null) => void,
) {
  const file = input.files?.[0];
  if (!file) {
    setStatus(null);
    return;
  }

  if (!file.type.startsWith('image/')) {
    setStatus('Please choose an image file.');
    return;
  }

  try {
    const compressed = await compressImageToWebp(file);
    if (
      !compressed ||
      compressed.size >= file.size ||
      typeof DataTransfer === 'undefined'
    ) {
      setStatus(`${file.name} ready.`);
      return;
    }

    const transfer = new DataTransfer();
    transfer.items.add(compressed);
    input.files = transfer.files;
    setStatus('Photo compressed and ready.');
  } catch {
    setStatus(`${file.name} ready.`);
  }
}

async function compressImageToWebp(file: File) {
  if (typeof createImageBitmap === 'undefined') return null;

  const bitmap = await createImageBitmap(file);
  const maxWidth = 1280;
  const scale = Math.min(1, maxWidth / bitmap.width);
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/webp', 0.82),
  );
  if (!blob) return null;

  return new File([blob], 'ilham-wall-photo.webp', {type: 'image/webp'});
}
