import {useEffect, useState} from 'react';
import {useNavigation} from 'react-router';

const SHOW_DELAY_MS = 140;

export function NavigationProgress() {
  const navigation = useNavigation();
  const [visible, setVisible] = useState(false);
  const pending = navigation.state !== 'idle';

  useEffect(() => {
    if (!pending) {
      setVisible(false);
      return;
    }

    const timer = window.setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [pending]);

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 overflow-hidden transition-opacity duration-200 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="navigation-progress h-full w-2/5 bg-gold" />
    </div>
  );
}
