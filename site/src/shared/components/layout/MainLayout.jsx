import { Outlet } from 'react-router-dom';
import LoginModal from '../../../features/auth/components/LoginModal.jsx';
import DeleteAccountModal from '../../../features/auth/components/DeleteAccountModal.jsx';
import SkipLink from '../a11y/SkipLink.jsx';
import VLibrasWidget from '../a11y/VLibrasWidget.jsx';
import AccessibilityDrawer from '../a11y/AccessibilityDrawer.jsx';
import ReadingGuide from '../a11y/ReadingGuide.jsx';
import SVGFilters from '../a11y/SVGFilters.jsx';
import AnimatedBackground from './AnimatedBackground.jsx';
import Footer from './Footer.jsx';
import Header from './Header.jsx';

export default function MainLayout() {
  return (
    <>
      <SVGFilters />
      <AnimatedBackground />
      <ReadingGuide />
      <div className="relative z-10 flex min-h-screen flex-col">
        <SkipLink />
        <Header />
        <main id="main-content" className="flex-1 min-h-[calc(100vh-180px)] flex flex-col" tabIndex={-1}>
          <Outlet />
        </main>
        <Footer />
        <VLibrasWidget />
        <AccessibilityDrawer />
        <LoginModal />
        <DeleteAccountModal />
      </div>
    </>
  );
}
