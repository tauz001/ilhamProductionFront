import {Drawers} from '~/components/layout/Drawers';
import {Footer} from '~/components/layout/Footer';
import {FloatingWhatsApp} from '~/components/layout/FloatingWhatsApp';
import {NavigationProgress} from '~/components/layout/NavigationProgress';
import {Navbar, MobileMenuDrawer} from '~/components/layout/Navbar';
import {ScrollProgress} from '~/components/layout/ScrollProgress';
import {useStore} from '~/lib/commerce/cart-store';
import {useLenis} from '~/lib/motion/useLenis';

interface PageLayoutProps {
  cart: unknown;
  footer: unknown;
  header: unknown;
  isLoggedIn: unknown;
  publicStoreDomain: string;
  whatsAppUrl?: string;
  children?: React.ReactNode;
}

export function PageLayout({
  children = null,
  whatsAppUrl,
}: PageLayoutProps) {
  const drawer = useStore((state) => state.drawer);
  useLenis(Boolean(drawer));

  return (
    <>
      <div className="grain-overlay" aria-hidden />
      <NavigationProgress />
      <ScrollProgress />
      <Navbar />
      <MobileMenuDrawer />
      <Drawers />
      {/* Keep routes responsible for top padding, to match TanStack layouts (home hero is full-bleed). */}
      <main className="min-h-screen">{children}</main>
      <FloatingWhatsApp href={whatsAppUrl} />
      <Footer />
    </>
  );
}
