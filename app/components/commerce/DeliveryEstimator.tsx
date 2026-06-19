import {useEffect, useState} from 'react';
import {Check, LoaderCircle, MapPin, ShoppingBag, Truck} from 'lucide-react';
import {AddToCartButton} from '~/components/AddToCartButton';

type Estimate = {
  checkedPincode?: string;
  courier?: string;
  etaText?: string;
  codAvailable?: boolean;
  prepaidAvailable?: boolean;
  sameDay?: {
    configured: boolean;
    currencyCode: string;
    eligible: boolean;
    fee: number;
    message: string;
    variant?: any;
  };
};

type EstimateResponse = {
  configured: boolean;
  serviceable?: boolean;
  message?: string;
  estimate?: Estimate;
};

type Props = {
  amount?: number;
  className?: string;
  compact?: boolean;
  cartVariantIds?: string[];
  enableSameDayCart?: boolean;
};

export function DeliveryEstimator({
  amount,
  cartVariantIds = [],
  className = '',
  compact = false,
  enableSameDayCart = false,
}: Props) {
  const [pincode, setPincode] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle',
  );
  const [message, setMessage] = useState('');
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const sameDay = estimate?.sameDay;
  const sameDayAlreadyAdded = Boolean(
    sameDay?.variant?.id && cartVariantIds.includes(sameDay.variant.id),
  );

  useEffect(() => {
    try {
      const savedPincode = window.localStorage.getItem('ilham.deliveryPincode');
      if (savedPincode) setPincode(savedPincode);
    } catch {
      // Ignore private browsing/storage restrictions.
    }
  }, []);

  const checkDelivery = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!/^\d{6}$/.test(pincode)) {
      setStatus('error');
      setEstimate(null);
      setMessage('Enter a valid 6-digit pincode.');
      return;
    }

    setStatus('loading');
    setEstimate(null);
    setMessage('');

    try {
      const params = new URLSearchParams({
        pincode,
        amount: String(amount ?? 0),
      });
      const response = await fetch(`/api/delivery-estimate?${params}`);
      const data = (await response.json()) as EstimateResponse;

      try {
        window.localStorage.setItem('ilham.deliveryPincode', pincode);
      } catch {
        // Ignore private browsing/storage restrictions.
      }

      if (!response.ok) {
        throw new Error(data.message || 'Could not check delivery.');
      }

      setStatus('success');
      setEstimate(data.estimate ?? null);

      if (!data.configured) {
        setMessage('Delivery timelines are confirmed at checkout for your pincode.');
      } else if (data.serviceable) {
        setMessage(data.message || 'Delivery is available for this pincode.');
      } else {
        setMessage(
          data.message ||
            'Delivery is not available for this pincode yet. Try another pincode.',
        );
      }
    } catch (error) {
      setStatus('error');
      setMessage(
        error instanceof Error
          ? error.message
          : 'Could not check this pincode right now.',
      );
    }
  };

  return (
    <section className={`border border-border bg-cream/35 p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center border border-border bg-ivory text-gold">
          <MapPin className="h-4 w-4" strokeWidth={1.4} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="small-caps text-ink/45">Delivery estimate</p>
          {!compact && (
            <p className="mt-1 text-sm text-ink/55">
              Check serviceability for your pincode before checkout.
            </p>
          )}
        </div>
      </div>

      <form
        onSubmit={(event) => {
          void checkDelivery(event);
        }}
        className="mt-4 flex gap-2"
      >
        <input
          inputMode="numeric"
          maxLength={6}
          pattern="[0-9]*"
          placeholder="Enter pincode"
          value={pincode}
          onChange={(event) =>
            setPincode(event.currentTarget.value.replace(/\D/g, '').slice(0, 6))
          }
          className="h-11 min-w-0 flex-1 border border-border bg-ivory px-3 text-sm text-ink placeholder:text-ink/35 focus:border-ink focus:outline-none"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="inline-flex h-11 items-center justify-center border border-ink bg-ink px-4 small-caps text-[10px] text-ivory transition-colors hover:bg-gold disabled:bg-ink/35"
        >
          {status === 'loading' ? (
            <LoaderCircle className="h-4 w-4 animate-spin" strokeWidth={1.4} />
          ) : (
            'Check'
          )}
        </button>
      </form>

      {message && (
        <div className="mt-4 border-t border-border pt-4">
          <p
            className={`text-sm ${
              status === 'error' ? 'text-destructive' : 'text-ink/65'
            }`}
          >
            {message}
          </p>
          {estimate?.etaText && (
            <p className="mt-2 flex items-center gap-2 font-serif text-lg text-ink">
              <Truck className="h-4 w-4 text-gold" strokeWidth={1.4} />
              {estimate.etaText}
            </p>
          )}
          {sameDay?.eligible && (
            <div className="mt-3 border border-gold/35 bg-gold/10 px-3 py-3">
              <p className="text-xs leading-relaxed text-ink/70">
                {sameDay.message}
              </p>
              {enableSameDayCart && sameDay.variant ? (
                sameDayAlreadyAdded ? (
                  <p className="mt-3 flex items-center gap-2 small-caps text-[10px] text-gold">
                    <Check className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Same-day add-on is in your bag
                  </p>
                ) : (
                  <AddToCartButton
                    className="mt-3 block w-full"
                    lines={[
                      {
                        merchandiseId: sameDay.variant.id,
                        quantity: 1,
                        selectedVariant: sameDay.variant,
                        attributes: [
                          {
                            key: 'same_day_pincode',
                            value: estimate?.checkedPincode ?? pincode,
                          },
                        ],
                      },
                    ]}
                  >
                    <span className="flex h-10 w-full items-center justify-center gap-2 bg-ink px-4 small-caps text-[10px] text-ivory transition-colors hover:bg-gold">
                      <ShoppingBag className="h-3.5 w-3.5" strokeWidth={1.4} />
                      Add same-day delivery
                    </span>
                  </AddToCartButton>
                )
              ) : null}
            </div>
          )}
          {estimate && (estimate.codAvailable || estimate.prepaidAvailable) && (
            <p className="mt-2 text-xs text-ink/45">
              {estimate.codAvailable ? 'COD eligible' : 'Prepaid only'}
              {estimate.courier ? ` via ${estimate.courier}` : ''}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
