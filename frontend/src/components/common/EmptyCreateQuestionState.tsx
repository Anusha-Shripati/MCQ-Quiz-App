import React from 'react';
import { FileText } from 'lucide-react'; // Example icon
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;  
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col h-96 items-center justify-center p-8 text-center">
      <FileText className="h-12 w-12 text-gray-400 mb-4" /> {/* Example icon */}
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{description}</p>
      {actionText && onAction && (
        <Button className="mt-6" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;