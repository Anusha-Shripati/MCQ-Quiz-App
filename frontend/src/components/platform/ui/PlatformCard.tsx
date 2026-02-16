import * as React from 'react';
import { cn } from '@/lib/utils';

const PlatformCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-xl border shadow',
        className
      )}
      style={{
        backgroundColor: 'var(--platform-surface)',
        borderColor: 'var(--platform-border)',
        color: 'var(--platform-text-primary)'
      }}
      {...props}
    />
  )
);
PlatformCard.displayName = 'PlatformCard';

const PlatformCardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  )
);
PlatformCardHeader.displayName = 'PlatformCardHeader';

const PlatformCardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('font-semibold leading-none tracking-tight', className)}
      style={{ color: 'var(--platform-text-primary)' }}
      {...props}
    />
  )
);
PlatformCardTitle.displayName = 'PlatformCardTitle';

const PlatformCardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div 
      ref={ref} 
      className={cn('text-sm', className)} 
      style={{ color: 'var(--platform-text-secondary)' }}
      {...props} 
    />
  )
);
PlatformCardDescription.displayName = 'PlatformCardDescription';

const PlatformCardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
);
PlatformCardContent.displayName = 'PlatformCardContent';

const PlatformCardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
  )
);
PlatformCardFooter.displayName = 'PlatformCardFooter';

export { PlatformCard, PlatformCardHeader, PlatformCardFooter, PlatformCardTitle, PlatformCardDescription, PlatformCardContent };
