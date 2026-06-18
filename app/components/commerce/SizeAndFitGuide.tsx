import {useMemo, useState, type FormEvent} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {Ruler, X} from 'lucide-react';
import {
  getProductAudience,
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
  const [result, setResult] = useState<string | null>(null);

  const onFindSize = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const recommendation = recommendProductSize({
      audience,
      bust: numberField(form, 'bust'),
      chest: numberField(form, 'chest'),
      waist: numberField(form, 'waist'),
      hip: numberField(form, 'hip'),
    });

    setResult(recommendation.size);
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
          >
            <motion.div
              initial={{y: 32, opacity: 0}}
              animate={{y: 0, opacity: 1}}
              exit={{y: 32, opacity: 0}}
              transition={{duration: 0.45, ease: easeSilk}}
              className="max-h-[92svh] w-full overflow-y-auto border border-border bg-ivory p-5 shadow-soft sm:max-w-2xl sm:p-7"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="small-caps text-ink/45">
                    {openMode === 'finder' ? 'Find my size' : 'Size chart'}
                  </p>
                  <h2 className="mt-2 font-display text-3xl text-ink">
                    {audience === 'men' ? 'Men fit guide' : 'Women fit guide'}
                  </h2>
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
  onSubmit,
  result,
}: {
  audience: ProductAudience;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  result: string | null;
}) {
  const isMen = audience === 'men';

  return (
    <form onSubmit={onSubmit} className="mt-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <MeasurementInput
          name={isMen ? 'chest' : 'bust'}
          label={isMen ? 'Chest' : 'Bust'}
        />
        <MeasurementInput name="waist" label="Waist" />
        {!isMen ? <MeasurementInput name="hip" label="Hip" /> : null}
      </div>
      <p className="mt-4 text-xs leading-relaxed text-ink/55">
        Use body measurements, not garment measurements. If you prefer extra
        ease, choose the next size up from the recommendation.
      </p>
      <button
        type="submit"
        className="mt-6 h-12 border border-ink bg-ink px-6 small-caps text-ivory transition-colors hover:bg-gold"
      >
        Recommend size
      </button>
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
    </form>
  );
}

function MeasurementInput({label, name}: {label: string; name: string}) {
  return (
    <label className="grid gap-2">
      <span className="small-caps text-ink/50">{label}</span>
      <input
        name={name}
        inputMode="decimal"
        min="1"
        step="0.5"
        placeholder="Inches"
        className="h-12 border border-border bg-ivory px-4 text-sm text-ink placeholder:text-ink/35 focus:border-ink focus:outline-none"
      />
    </label>
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
