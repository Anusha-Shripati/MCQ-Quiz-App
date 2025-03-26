interface LoadingSpinnerProps {
  className?: string;
}

export function LoadingSpinner({ className }: LoadingSpinnerProps) {
  return (
    // <div className={cn("flex items-center justify-center", className)}>
    //   <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
    // </div>
    <div className={`flex items-center justify-center ${className}`}>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
    </div>
  );
} 