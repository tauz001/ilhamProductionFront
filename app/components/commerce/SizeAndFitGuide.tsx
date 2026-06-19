import {useMemo, useState, type FormEvent} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {Ruler, X} from 'lucide-react';
import {
  getProductAudience,
  getProductFitNote,
  getSizeChartForProduct,
  recommendProductSize,
  type ProductAudience,
} from '~/lib/commerce/product-guidance';
import {easeSilk} from '~/lib/motion/variants';

type Props = {
  product: any;
  selectedSize?: string | null;
};

export function SizeAndFitGuide({product, selectedSize}: Props) {
  const [openMode, setOpenMode] = useState<'chart' | 'finder' | null>(null);
  const audience = useMemo(() => getProductAudience(product), [product]);
  const chart = useMemo(() => getSizeChartForProduct(product), [product]);
  const fitNote = useMemo(() => getProductFitNote(product), [product]);
  const [result, setResult] = useState<string | null>(null);
  const [noMatch, setNoMatch] = useState(false);

  const onFindSize = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const recommendation = recommendProductSize({
      audience,
      chart,
      bust: numberField(form, 'bust'),
      chest: numberField(form, 'chest'),
      waist: numberField(form, 'waist'),
      hip: numberField(form, 'hip'),
    });

    setResult(recommendation?.size ?? null);
    setNoMatch(!recommendation);
  };

  return (
    <div className="mt-4 border border-border bg-cream/30 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center border border-border bg-ivory text-gold">
            <Ruler className="h-4 w-4" strokeWidth={1.4} />
          </span>
          <div className="min-w-0">
            <p className="small-caps text-ink/50">Size & fit</p>
            <p className="mt-1 text-xs text-ink/55">
              Measurements are in inches with a relaxed handmade fit.
            </p>
          </div>
        </div>
        {selectedSize ? (
          <p className="text-xs italic text-ink/45">Selected size {selectedSize}</p>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setOpenMode('finder')}
          className="h-10 border border-ink bg-ink px-4 small-caps text-[10px] text-ivory transition-colors hover:bg-gold"
        >
          Find my size
        </button>
        <button
          type="button"
          onClick={() => setOpenMode('chart')}
          className="h-10 border border-border px-4 small-caps text-[10px] text-ink/70 transition-colors hover:border-ink hover:text-ink"
        >
          Size chart
        </button>
      </div>

      <AnimatePresence>
        {openMode && (
          <motion.div
            className="fixed inset-0 z-[95] flex items-end justify-center bg-ink/45 p-0 backdrop-blur-sm sm:items-center sm:p-6"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            onClick={() => setOpenMode(null)}
            role="presentation"
          >
            <motion.div
              initial={{y: 32, opacity: 0}}
              animate={{y: 0, opacity: 1}}
              exit={{y: 32, opacity: 0}}
              transition={{duration: 0.45, ease: easeSilk}}
              className="max-h-[92svh] w-full overflow-y-auto border border-border bg-ivory p-5 shadow-soft sm:max-w-2xl sm:p-7"
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="size-guide-title"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="small-caps text-ink/45">
                    {openMode === 'finder' ? 'Find my size' : 'Size chart'}
                  </p>
                  <h2 id="size-guide-title" className="mt-2 font-display text-3xl text-ink">
                    {audience === 'men' ? 'Men fit guide' : 'Women fit guide'}
                  </h2>
                  {fitNote ? (
                    <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink/60">
                      {fitNote}
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => setOpenMode(null)}
                  aria-label="Close size guide"
                  className="grid h-10 w-10 shrink-0 place-items-center border border-border transition-colors hover:border-ink"
                >
                  <X className="h-4 w-4" strokeWidth={1.4} />
                </button>
              </div>

              {openMode === 'finder' ? (
                <FindSizeForm
                  audience={audience}
                  onSubmit={onFindSize}
                  noMatch={noMatch}
                  result={result}
                />
              ) : (
                <SizeChartTable audience={audience} chart={chart} />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FindSizeForm({
  audience,
  noMatch,
  onSubmit,
  result,
}: {
  audience: ProductAudience;
  noMatch: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  result: string | null;
}) {
  const isMen = audience === 'men';

  return (
    <form onSubmit={onSubmit} className="mt-6">
      <div className="grid gap-7 sm:grid-cols-[0.85fr_1.15fr] sm:items-start">
        <MeasurementDiagram audience={audience} />
        <div>
          <div className="grid gap-4">
            <MeasurementInput
              name={isMen ? 'chest' : 'bust'}
              label={isMen ? 'Chest' : 'Bust'}
              hint="Around the fullest part, keeping the tape level."
            />
            <MeasurementInput
              name="waist"
              label="Waist"
              hint="Around your natural waist without pulling tightly."
            />
            {!isMen ? (
              <MeasurementInput
                name="hip"
                label="Hip"
                hint="Around the fullest part of your hips."
              />
            ) : null}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-ink/55">
            Use body measurements in inches over light clothing. Keep one
            finger beneath the tape for a comfortable chikankari fit.
          </p>
          <button
            type="submit"
            className="mt-6 h-12 border border-ink bg-ink px-6 small-caps text-ivory transition-colors hover:bg-gold"
          >
            Recommend size
          </button>
        </div>
      </div>
      <AnimatePresence>
        {result ? (
          <motion.div
            initial={{height: 0, opacity: 0}}
            animate={{height: 'auto', opacity: 1}}
            exit={{height: 0, opacity: 0}}
            transition={{duration: 0.4, ease: easeSilk}}
            className="mt-6 overflow-hidden border border-gold/40 bg-gold/10 p-4"
          >
            <p className="small-caps text-gold">Recommended size</p>
            <p className="mt-1 font-display text-4xl text-ink">{result}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
      {noMatch ? (
        <div className="mt-6 border border-border bg-cream/45 p-4">
          <p className="font-serif text-xl text-ink">Let the atelier help.</p>
          <p className="mt-1 text-sm leading-relaxed text-ink/60">
            Your measurements sit outside this chart. Contact us for a careful
            fit recommendation rather than choosing a size that may feel wrong.
          </p>
        </div>
      ) : null}
    </form>
  );
}

function MeasurementInput({
  hint,
  label,
  name,
}: {
  hint: string;
  label: string;
  name: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="small-caps text-ink/50">{label}</span>
      <input
        name={name}
        inputMode="decimal"
        min="1"
        step="0.5"
        required
        placeholder="Inches"
        className="h-12 border border-border bg-ivory px-4 text-sm text-ink placeholder:text-ink/35 focus:border-ink focus:outline-none"
      />
      <span className="text-[11px] leading-relaxed text-ink/45">{hint}</span>
    </label>
  );
}

function MeasurementDiagram({audience}: {audience: ProductAudience}) {
  const isMen = audience === 'men';

  return (
    <figure className="border border-border bg-cream/35 p-4">
      <svg
        viewBox="0 0 260 360"
        role="img"
        aria-labelledby="measurement-diagram-title measurement-diagram-description"
        className="mx-auto h-auto w-full max-w-[240px] text-ink"
      >
        <title id="measurement-diagram-title">How to take body measurements</title>
        <desc id="measurement-diagram-description">
          A body outline with level tape positions for {isMen ? 'chest and waist' : 'bust, waist, and hips'}.
        </desc>
        <path
          d="M130 30c-18 0-29 13-29 31 0 14 7 24 16 29l-6 18-42 24 17 61-10 132h38l16-92 16 92h38l-10-132 17-61-42-24-6-18c9-5 16-15 16-29 0-18-11-31-29-31Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity="0.55"
        />
        <MeasurementLine y={145} number="1" label={isMen ? 'Chest' : 'Bust'} />
        <MeasurementLine y={205} number="2" label="Waist" />
        {!isMen ? <MeasurementLine y={258} number="3" label="Hip" /> : null}
      </svg>
      <figcaption className="mt-3 text-center text-xs leading-relaxed text-ink/55">
        Keep the measuring tape parallel to the floor and comfortably close to
        the body.
      </figcaption>
    </figure>
  );
}

function MeasurementLine({
  label,
  number,
  y,
}: {
  label: string;
  number: string;
  y: number;
}) {
  return (
    <g>
      <line
        x1="64"
        x2="196"
        y1={y}
        y2={y}
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="5 4"
        className="text-gold"
      />
      <circle cx="47" cy={y} r="13" fill="currentColor" className="text-gold" />
      <text x="47" y={y + 4} textAnchor="middle" className="fill-ivory text-[11px]">
        {number}
      </text>
      <text x="205" y={y + 4} className="fill-ink text-[11px]">
        {label}
      </text>
    </g>
  );
}

function SizeChartTable({
  audience,
  chart,
}: {
  audience: ProductAudience;
  chart: ReturnType<typeof getSizeChartForProduct>;
}) {
  const isMen = audience === 'men';

  return (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full min-w-[520px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border small-caps text-ink/45">
            <th className="py-3 pr-4 font-normal">Size</th>
            <th className="py-3 pr-4 font-normal">{isMen ? 'Chest' : 'Bust'}</th>
            <th className="py-3 pr-4 font-normal">Waist</th>
            {!isMen ? <th className="py-3 pr-4 font-normal">Hip</th> : null}
            {isMen ? <th className="py-3 pr-4 font-normal">Shoulder</th> : null}
          </tr>
        </thead>
        <tbody>
          {chart.map((row) => (
            <tr key={row.size} className="border-b border-border/70">
              <td className="py-3 pr-4 font-serif text-xl">{row.size}</td>
              <td className="py-3 pr-4">{isMen ? row.chest : row.bust}</td>
              <td className="py-3 pr-4">{row.waist}</td>
              {!isMen ? <td className="py-3 pr-4">{row.hip}</td> : null}
              {isMen ? <td className="py-3 pr-4">{row.shoulder}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-4 text-xs leading-relaxed text-ink/55">
        Chikankari pieces are finished by hand, so a small variation is natural.
        If you are between two sizes, choose the larger size for comfort.
      </p>
    </div>
  );
}

function numberField(form: FormData, name: string) {
  const value = Number(form.get(name));
  return Number.isFinite(value) && value > 0 ? value : undefined;
}
