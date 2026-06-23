export type DiscountTicketOffer = {
  code: string;
  endsAt?: string | null;
  summary: string;
  title: string;
  type: 'amount' | 'bxgy' | 'free-shipping' | 'percentage' | 'unknown';
};
