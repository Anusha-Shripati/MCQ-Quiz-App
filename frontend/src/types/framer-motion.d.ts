// This file ensures TypeScript recognizes framer-motion components and props

import 'framer-motion';

declare module 'framer-motion' {
  export interface AnimatePresenceProps {
    children: React.ReactNode;
    exitBeforeEnter?: boolean;
    initial?: boolean;
    onExitComplete?: () => void;
  }
}
