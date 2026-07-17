import type {ReactNode} from 'react';
import {Link} from 'react-router';
import {ProductRail} from '~/components/commerce/ProductRail';
import {
  HERO_IMAGE_WIDTHS,
  MOBILE_HERO_IMAGE_WIDTHS,
  shopifyImageUrl,
  shopifySrcSet,
} from '~/lib/commerce/image';
import type {HomepageCampaign} from '~/lib/commerce/homepage-campaigns.server';

export function HomepageCampaignSlot({
  campaign,
}: {
  campaign?: HomepageCampaign | null;
}) {
  if (!campaign) return null;

  const railHeadingId = `homepage-campaign-${campaign.handle}-title`;
  const combinedWithBanner = Boolean(campaign.banner);
  const railSpacing = campaign.banner
    ? 'relative z-10 -mt-5 pb-12 md:-mt-7 md:pb-14'
    : 'py-14 md:py-16';

  return (
    <section
      data-homepage-campaign={campaign.handle}
      className="border-b border-border/60 bg-ivory"
    >
      {campaign.banner ? <CampaignBanner campaign={campaign} /> : null}

      {campaign.rail && campaign.products.length ? (
        <div
          className={`mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-12 ${railSpacing}`}
        >
          <div
            className={`mb-6 flex items-end justify-between gap-6 ${
              combinedWithBanner
                ? 'border border-border bg-ivory/95 px-5 py-4 shadow-[0_16px_40px_rgba(55,43,27,0.08)] backdrop-blur-sm md:px-6'
                : 'border-b border-border pb-4'
            }`}
          >
            <div className="min-w-0">
              {campaign.rail.subtitle ? (
                <p className="small-caps text-[9px] text-ink/45">
                  {campaign.rail.subtitle}
                </p>
              ) : null}
              <h2
                id={railHeadingId}
                className={`${campaign.rail.subtitle ? 'mt-1.5' : ''} font-display text-3xl leading-none text-ink sm:text-4xl md:text-5xl`}
              >
                {campaign.rail.title}
              </h2>
            </div>

            {campaign.rail.linkUrl ? (
              <CampaignLink
                url={campaign.rail.linkUrl}
                className="small-caps story-link shrink-0"
              >
                {campaign.rail.linkLabel} -&gt;
              </CampaignLink>
            ) : null}
          </div>

          <ProductRail
            products={campaign.products}
            labelledBy={railHeadingId}
          />
        </div>
      ) : null}
    </section>
  );
}

function CampaignBanner({campaign}: {campaign: HomepageCampaign}) {
  const banner = campaign.banner;
  if (!banner) return null;

  const hasCopy = Boolean(
    banner.eyebrow || banner.title || banner.subtitle || banner.ctaLabel,
  );
  const lightText = banner.textTheme === 'light';
  const content = (
    <div className="group relative h-[68vw] min-h-[280px] max-h-[420px] overflow-hidden bg-cream md:h-[25vw] md:min-h-[280px] md:max-h-[400px]">
      <picture className="absolute inset-0 block h-full w-full">
        <source
          media="(max-width: 767px)"
          srcSet={shopifySrcSet(
            banner.mobileImage.url,
            MOBILE_HERO_IMAGE_WIDTHS,
          )}
          sizes="100vw"
        />
        <source
          media="(min-width: 768px)"
          srcSet={shopifySrcSet(banner.desktopImage.url, HERO_IMAGE_WIDTHS)}
          sizes="100vw"
        />
        <img
          src={shopifyImageUrl(banner.desktopImage.url, 1600)}
          alt={banner.desktopImage.altText ?? 'ilham campaign'}
          loading="lazy"
          decoding="async"
          width={banner.desktopImage.width ?? undefined}
          height={banner.desktopImage.height ?? undefined}
          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:group-hover:scale-[1.015]"
        />
      </picture>

      {hasCopy ? (
        <>
          <div
            className={`absolute inset-0 ${
              lightText
                ? 'bg-gradient-to-r from-ink/72 via-ink/34 to-transparent'
                : 'bg-gradient-to-r from-ivory/88 via-ivory/52 to-transparent'
            }`}
          />
          <div
            className={`relative z-10 flex h-full max-w-[1500px] items-center px-6 sm:px-10 lg:px-16 ${
              lightText ? 'text-ivory' : 'text-ink'
            }`}
          >
            <div className="max-w-xl">
              {banner.eyebrow ? (
                <p
                  className={`small-caps ${
                    lightText ? 'text-ivory/72' : 'text-ink/55'
                  }`}
                >
                  {banner.eyebrow}
                </p>
              ) : null}
              {banner.title ? (
                <h2 className="mt-3 max-w-lg font-display text-4xl leading-[0.98] sm:text-5xl md:text-6xl">
                  {banner.title}
                </h2>
              ) : null}
              {banner.subtitle ? (
                <p
                  className={`mt-4 max-w-md text-sm leading-relaxed sm:text-base ${
                    lightText ? 'text-ivory/78' : 'text-ink/65'
                  }`}
                >
                  {banner.subtitle}
                </p>
              ) : null}
              {banner.ctaLabel && banner.ctaUrl ? (
                <span
                  className={`mt-6 inline-flex min-h-11 items-center border px-7 small-caps transition-colors ${
                    lightText
                      ? 'border-ivory/65 group-hover:bg-ivory group-hover:text-ink'
                      : 'border-ink/40 group-hover:bg-ink group-hover:text-ivory'
                  }`}
                >
                  {banner.ctaLabel} -&gt;
                </span>
              ) : null}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );

  return banner.ctaUrl ? (
    <CampaignLink
      url={banner.ctaUrl}
      className="block"
      ariaLabel={
        banner.ctaLabel || banner.title || `Explore ${campaign.handle}`
      }
    >
      {content}
    </CampaignLink>
  ) : (
    content
  );
}

function CampaignLink({
  ariaLabel,
  children,
  className,
  url,
}: {
  ariaLabel?: string;
  children: ReactNode;
  className?: string;
  url: string;
}) {
  if (url.startsWith('/')) {
    return (
      <Link
        to={url}
        prefetch="intent"
        className={className}
        aria-label={ariaLabel}
      >
        {children}
      </Link>
    );
  }

  return (
    <a href={url} className={className} aria-label={ariaLabel}>
      {children}
    </a>
  );
}
