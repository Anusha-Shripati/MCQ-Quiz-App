import { useState, useEffect } from 'react';

/**
 * A hook that detects if the current device is a mobile or tablet
 * @returns Object containing isMobile, isTablet, and isDesktop flags
 */
function useDeviceDetection() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const checkDevice = () => {
      // Get the user agent string
      const userAgent = navigator.userAgent;
      
      // More comprehensive mobile detection patterns
      const mobileRegex = /Android.*Mobile|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|Windows Phone|webOS/i;
      
      // More accurate tablet detection patterns
      const tabletRegex = /iPad|Android(?!.*Mobile)|Tablet|PlayBook|Silk|Kindle|NOOK/i;
      
      // Check if it's a mobile by both UA and screen size
      const isMobileByUA = mobileRegex.test(userAgent);
      const isMobileBySize = window.innerWidth < 768;
      
      // Check if it's a tablet by both UA and screen size
      const isTabletByUA = tabletRegex.test(userAgent);
      const isTabletBySize = 
        (window.innerWidth >= 768 && window.innerWidth <= 1024) && 
        (navigator.maxTouchPoints > 0 || 'ontouchstart' in window);
      
      // Additional iPad detection (modern iPads don't show as iPad in UA)
      const isModernIPad = 
        /Macintosh/.test(userAgent) && 
        navigator.maxTouchPoints > 0 && 
        window.innerWidth <= 1366; // Most iPads max out at 1366px width
      
      // Final determination
      setIsMobile(isMobileByUA || (isMobileBySize && !isTabletByUA && !isModernIPad));
      setIsTablet(isTabletByUA || isTabletBySize || isModernIPad);
      setIsDesktop(!isMobileByUA && !isTabletByUA && !isTabletBySize && !isModernIPad);
      
      console.log('Device detection:', { 
        userAgent,
        isMobile: isMobileByUA || (isMobileBySize && !isTabletByUA && !isModernIPad),
        isTablet: isTabletByUA || isTabletBySize || isModernIPad,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        maxTouchPoints: navigator.maxTouchPoints
      });
    };

    // Check on initial render
    checkDevice();
    
    // Add resize event listener to update the device type when window size changes
    window.addEventListener('resize', checkDevice);
    
    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('resize', checkDevice);
    };
  }, []);

  return { isMobile, isTablet, isDesktop };
}

export default useDeviceDetection; 