import { useTruncatedText } from '@/utils/useTruncatedText';

export const QuestionText = ({
  text,
  wordLimit = 50,
  charLimit = 200,
  className = '',
}: {
  text: string;
  wordLimit?: number;
  charLimit?: number;
  className?: string;
}) => {
  const { isLong, expanded, displayText, toggle } = useTruncatedText(text, {
    wordLimit,
    charLimit,
  });
  return (
    <p
      className={`text-gray-800 dark:text-gray-200 text-sm mb-4 break-all whitespace-pre-wrap overflow-hidden flex-1 ${className}`}
    >
      {displayText}
      {isLong && (
        <button
          className="ml-2 text-blue-600 dark:text-blue-400 underline text-xs font-medium"
          onClick={toggle}
          type="button"
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </p>
  );
};
