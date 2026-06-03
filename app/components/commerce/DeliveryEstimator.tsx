import {useEffect, useState} from 'react';
import {LoaderCircle, MapPin, Truck} from 'lucide-react';

type Estimate = {
  checkedPincode?: string;
  courier?: string;
  etaText?: string;
  codAvailable?: boolean;
  prepaidAvailable?: boolean;
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
};

export function DeliveryEstimator({
  amount,
  className = '',
  compact = false,
}: Props) {
  const [pincode, setPincode] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle',
  );
  const [message, setMessage] = useState('');
  const [estimate, setEstimate] = useState<Estimate | null>(null);

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

      <form onSubmit={checkDelivery} className="mt-4 flex gap-2">
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
