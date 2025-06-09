import { useEffect, useState } from 'react';

export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;

  const checkMobile = () => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const mobileDevices = /android|webos|iphone|ipad|ipod|blackberry|windows phone/i;
    const smallScreen = window.innerWidth < 768 || window.innerHeight < 768;

    return mobileDevices.test(userAgent) || smallScreen;
  };

  return checkMobile();
};

export const useMobileDetect = (): boolean => {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(isMobileDevice());
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);

  return isMobile;
};
