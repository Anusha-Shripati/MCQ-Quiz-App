'use client';

import React, { useState } from 'react';
import CodeEditor from '@/components/CodeEditor';
import { FaPlay } from 'react-icons/fa';
import { FormField } from '@/components/common/form-field';

const EditorPage: React.FC<{ onChange: (value: string) => void; value: string }> = ({
  onChange,
  value,
}) => {
  const [language, setLanguage] = useState('javascript');
  const [theme, setTheme] = useState('vs-dark');
  const [output, setOutput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
  };

  const handleThemeChange = (value: string) => {
    setTheme(value);
  };

  const handleCodeChange = (value: string | undefined) => {
    onChange(value || '');
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    const response = await fetch('/api/code-execution', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language, code: value }),
    });
    const result = await response.json();
    if (result.success) {
      setOutput(result.output);
    } else {
      setOutput(`Error: ${result.error || result.message}`);
    }

    setIsLoading(false);
  };

  return (
    <div className="p-0 space-y-6 ">
      {/* <h1 className="text-3xl font-bold  text-gray-900 dark:text-white">Code Editor</h1> */}

      <div className="flex gap-6 ">
        {/* Language Selector */}
        <FormField
          label="Language"
          type="select"
          parentClassName="w-full"
          className="bg-white border-gray-200 dark:border-gray-600 text-gray-900 "
          value={language}
          onChange={handleLanguageChange}
          placeholder="Language"
          options={[
            { value: 'javascript', label: 'JavaScript' },
            { value: 'python', label: 'Python' },
            { value: 'php', label: 'PHP' },
          ]}
        />

        {/* Theme Selector */}
        <FormField
          label="Theme"
          type="select"
          parentClassName="w-full"
          className="bg-white  border-gray-200  text-gray-900 "
          value={theme}
          onChange={handleThemeChange}
          placeholder="Theme"
          options={[
            { value: 'vs-dark', label: 'Dark' },
            { value: 'light', label: 'Light' },
          ]}
        />
      </div>

      {/* Code Editor */}
      <div className="mt-6">
        <CodeEditor language={language} theme={theme} value={value} onChange={handleCodeChange} />
      </div>

      {/* Submit Code */}
      <div
        onClick={!isLoading ? handleSubmit : undefined}
        className={`flex items-center justify-center w-16 h-16 rounded-full 
          ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'} 
          text-white shadow-md transition-all cursor-pointer`}
      >
        {isLoading ? (
          <svg
            className="animate-spin h-8 w-8"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 0116 0 8 8 0 01-16 0z"
            />
          </svg>
        ) : (
          <FaPlay className="h-8 w-8" />
        )}
      </div>

      {/* Output Section */}
      <div className="mt-6 p-6 border border-gray-300 rounded-lg bg-gray-100 dark:bg-gray-800">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Output</h2>
        <pre className="text-sm text-gray-800 dark:text-gray-100">{output}</pre>
      </div>
    </div>
  );
};

export default EditorPage;
