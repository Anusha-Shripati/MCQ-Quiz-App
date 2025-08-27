import { useState, useMemo } from 'react';

interface UseTruncatedTextOptions {
  wordLimit?: number;
  charLimit?: number;
}

export const useTruncatedText = (
  text: string,
  { wordLimit = 50, charLimit = 200 }: UseTruncatedTextOptions = {}
) => {
  const [expanded, setExpanded] = useState(false);

  const { isLong, displayText } = useMemo(() => {
    const hasSpaces = text.includes(' ');
    const words = hasSpaces ? text.split(' ') : [];
    const tooManyWords = hasSpaces && words.length > wordLimit;
    const tooManyChars = text.length > charLimit;
    const isLong = tooManyWords || tooManyChars;

    let truncatedText = text;

    if (!expanded && isLong) {
      if (hasSpaces) {
        const slicedWords = words.slice(0, wordLimit).join(' ');
        truncatedText =
          slicedWords.length > charLimit
            ? slicedWords.slice(0, charLimit) + '...'
            : slicedWords + '...';
      } else {
        truncatedText = text.slice(0, charLimit) + '...';
      }
    }

    return { isLong, displayText: truncatedText };
  }, [text, expanded, wordLimit, charLimit]);

  const toggle = () => setExpanded(prev => !prev);

  return { isLong, expanded, displayText, toggle };
};
