import {
  CreditCard,
  Headphones,
  RefreshCw,
  ShieldCheck,
  Truck,
  WalletCards,
} from 'lucide-react';
import {DeliveryEstimator} from '~/components/commerce/DeliveryEstimator';

type Props = {
  priceAmount?: string | number | null;
};

export function ProductAssurancePanel({priceAmount}: Props) {
  const amount = Number(priceAmount ?? 0);

  return (
    <section className="mt-8 space-y-4">
      <div className="border border-border bg-cream/35 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="small-caps text-ink/45">Payment options</p>
            <p className="mt-1 font-serif text-2xl text-ink">
              Flexible ways to complete your order
            </p>
          </div>
          <WalletCards className="h-5 w-5 shrink-0 text-gold" strokeWidth={1.4} />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <PaymentTile
            icon={<CreditCard className="h-4 w-4" strokeWidth={1.4} />}
            title="EMI plans"
            text="Shown at checkout when your selected payment method supports EMI."
          />
          <PaymentTile
            icon={<ShieldCheck className="h-4 w-4" strokeWidth={1.4} />}
            title="Prepaid offers"
            text="Eligible prepaid offers are applied in checkout before payment."
          />
        </div>
      </div>

      <DeliveryEstimator amount={Number.isFinite(amount) ? amount : undefined} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <AssuranceItem
          icon={<CreditCard className="h-5 w-5" strokeWidth={1.4} />}
          label="COD"
          text="Eligible pincodes"
        />
        <AssuranceItem
          icon={<RefreshCw className="h-5 w-5" strokeWidth={1.4} />}
          label="14 days"
          text="Return or exchange"
        />
        <AssuranceItem
          icon={<Truck className="h-5 w-5" strokeWidth={1.4} />}
          label="Shipping"
          text="Calculated at checkout"
        />
        <AssuranceItem
          icon={<Headphones className="h-5 w-5" strokeWidth={1.4} />}
          label="Support"
          text="Atelier assistance"
        />
      </div>
    </section>
  );
}

function PaymentTile({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-3 border border-border bg-ivory p-3">
      <span className="mt-0.5 text-gold">{icon}</span>
      <div>
        <p className="font-serif text-lg leading-tight text-ink">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-ink/55">{text}</p>
      </div>
    </div>
  );
}

function AssuranceItem({
  icon,
  label,
  text,
}: {
  icon: React.ReactNode;
  label: string;
  text: string;
}) {
  return (
    <div className="border border-border bg-cream/25 p-3 text-center">
      <div className="mx-auto grid h-10 w-10 place-items-center text-gold">
        {icon}
      </div>
      <p className="mt-2 small-caps text-[10px] text-ink">{label}</p>
      <p className="mt-1 text-xs leading-snug text-ink/50">{text}</p>
    </div>
  );
}
