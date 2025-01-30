'use client';

import React, { useState } from 'react';
import CodeEditor from '@/components/CodeEditor';
import * as Select from "@radix-ui/react-select";
import { ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons";
import { FaPlay } from 'react-icons/fa';

const EditorPage: React.FC = () => {
  const [code, setCode] = useState('// Write your code here');
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
    setCode(value || '');
  };

  const handleSubmit = async () => {
    setIsLoading(true); 
    const response = await fetch('/api/code-execution', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language, code }),
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
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900">
      <h1 className="text-3xl font-bold  text-gray-900 dark:text-white">Code Editor</h1>

      <div className="flex gap-6 ">
        {/* Language Selector */}
        <Select.Root onValueChange={handleLanguageChange}>
          <Select.Trigger
            className="flex items-center justify-between px-6 py-3 border rounded-lg bg-white dark:bg-gray-800 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Language"
          >
            <Select.Value placeholder="Select Language" />
            <Select.Icon>
              <ChevronDownIcon className="w-5 h-5 text-gray-500 dark:text-gray-300" />
            </Select.Icon>
          </Select.Trigger>
          <Select.Content className="overflow-hidden bg-white dark:bg-gray-800 rounded-lg shadow-md relative z-10">
            <Select.ScrollUpButton className="flex items-center justify-center h-8 text-gray-500">
              <ChevronUpIcon />
            </Select.ScrollUpButton>
            <Select.Viewport>
              <Select.Item
                value="javascript"
                className="px-6 py-3 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <Select.ItemText>JavaScript</Select.ItemText>
              </Select.Item>
              <Select.Item
                value="python"
                className="px-6 py-3 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <Select.ItemText>Python</Select.ItemText>
              </Select.Item>
              <Select.Item
                value="php"
                className="px-6 py-3 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <Select.ItemText>Php</Select.ItemText>
              </Select.Item>
            </Select.Viewport>
            <Select.ScrollDownButton className="flex items-center justify-center h-8 text-gray-500">
              <ChevronDownIcon />
            </Select.ScrollDownButton>
          </Select.Content>
        </Select.Root>

        {/* Theme Selector */}
        <Select.Root onValueChange={handleThemeChange}>
          <Select.Trigger
            className="flex items-center justify-between px-6 py-3 border rounded-lg bg-white dark:bg-gray-800 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Theme"
          >
            <Select.Value placeholder="Select Theme" />
            <Select.Icon>
              <ChevronDownIcon className="w-5 h-5 text-gray-500 dark:text-gray-300" />
            </Select.Icon>
          </Select.Trigger>
          <Select.Content className="overflow-hidden bg-white dark:bg-gray-800 rounded-lg shadow-md relative z-10">
            <Select.ScrollUpButton className="flex items-center justify-center h-8 text-gray-500">
              <ChevronUpIcon />
            </Select.ScrollUpButton>
            <Select.Viewport>
              <Select.Item
                value="vs-dark"
                className="px-6 py-3 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <Select.ItemText>Dark</Select.ItemText>
              </Select.Item>
              <Select.Item
                value="light"
                className="px-6 py-3 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <Select.ItemText>Light</Select.ItemText>
              </Select.Item>
            </Select.Viewport>
            <Select.ScrollDownButton className="flex items-center justify-center h-8 text-gray-500">
              <ChevronDownIcon />
            </Select.ScrollDownButton>
          </Select.Content>
        </Select.Root>
      </div>

      {/* Code Editor */}
      <div className="mt-6">
        <CodeEditor
          language={language}
          theme={theme}
          value={code}
          onChange={handleCodeChange}
        />
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
