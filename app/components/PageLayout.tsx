import {useEffect, useRef} from 'react';
import {useLocation, useNavigationType} from 'react-router';
import type {HeaderQuery} from 'storefrontapi.generated';
import {AnimatePresence, motion, useReducedMotion} from 'framer-motion';
import {Drawers} from '~/components/layout/Drawers';
import {Footer} from '~/components/layout/Footer';
import {FloatingWhatsApp} from '~/components/layout/FloatingWhatsApp';
import {NavigationProgress} from '~/components/layout/NavigationProgress';
import {Navbar, MobileMenuDrawer} from '~/components/layout/Navbar';
import {ScrollProgress} from '~/components/layout/ScrollProgress';
import {useStore} from '~/lib/commerce/cart-store';
import {useLenis} from '~/lib/motion/useLenis';
import {easeSilk} from '~/lib/motion/variants';

interface PageLayoutProps {
  cart: unknown;
  footer: unknown;
  header: HeaderQuery | null;
  isLoggedIn: unknown;
  publicStoreDomain: string;
  whatsAppUrl?: string;
  children?: React.ReactNode;
}

export function PageLayout({
  children = null,
  header,
  publicStoreDomain,
  whatsAppUrl,
}: PageLayoutProps) {
  const drawer = useStore((state) => state.drawer);
  useLenis(Boolean(drawer));

  useEffect(() => {
    if (!drawer) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [drawer]);

  return (
    <>
      <div className="grain-overlay" aria-hidden />
      <NavigationProgress />
      <RouteScrollReset />
      <ScrollProgress />
      <Navbar header={header} publicStoreDomain={publicStoreDomain} />
      <MobileMenuDrawer />
      <Drawers />
      <PageTransition>{children}</PageTransition>
      <FloatingWhatsApp href={whatsAppUrl} />
      <Footer />
    </>
  );
}

function PageTransition({children}: {children?: React.ReactNode}) {
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();

  return (
    <AnimatePresence initial={false} mode="sync">
      <motion.main
        key={location.pathname}
        className="min-h-screen"
        initial={prefersReducedMotion ? false : {opacity: 0.72, y: 10}}
        animate={{opacity: 1, y: 0}}
        exit={prefersReducedMotion ? {opacity: 1} : {opacity: 0.82, y: -6}}
        transition={{duration: 0.42, ease: easeSilk}}
      >
        {children}
      </motion.main>
    </AnimatePresence>
  );
}

function RouteScrollReset() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const previousPathnameRef = useRef(location.pathname);

  useEffect(() => {
    const pathnameChanged = previousPathnameRef.current !== location.pathname;
    previousPathnameRef.current = location.pathname;

    if (!pathnameChanged || navigationType === 'POP' || location.hash) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const behavior: ScrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';

    const scrollToTop = () => {
      window.dispatchEvent(
        new CustomEvent('ilham:route-scroll-top', {
          detail: {immediate: prefersReducedMotion},
        }),
      );
      window.scrollTo({top: 0, left: 0, behavior});
    };

    scrollToTop();
    const frameId = window.requestAnimationFrame(() => {
      if (prefersReducedMotion) scrollToTop();
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [location.hash, location.pathname, navigationType]);

  return null;
}
