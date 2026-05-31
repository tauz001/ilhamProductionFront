import {useLenis} from '~/lib/motion/useLenis';
import {Drawers} from '~/components/layout/Drawers';
import {Footer} from '~/components/layout/Footer';
import {Navbar, MobileMenuDrawer} from '~/components/layout/Navbar';
import {ScrollProgress} from '~/components/layout/ScrollProgress';

interface PageLayoutProps {
  cart: unknown;
  footer: unknown;
  header: unknown;
  isLoggedIn: unknown;
  publicStoreDomain: string;
  children?: React.ReactNode;
}

export function PageLayout({
  children = null,
}: PageLayoutProps) {
  useLenis();

  return (
    <>
      <div className="grain-overlay" aria-hidden />
      <ScrollProgress />
      <Navbar />
      <MobileMenuDrawer />
      <Drawers />
      {/* Keep routes responsible for top padding, to match TanStack layouts (home hero is full-bleed). */}
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
