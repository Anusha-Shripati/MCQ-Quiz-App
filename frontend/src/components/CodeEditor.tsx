import React from 'react';
import Editor from '@monaco-editor/react';

type CodeEditorProps = {
  language: string;
  theme: string;
  value: string;
  onChange: (value: string | undefined) => void;
  readOnly?: boolean;
};

const CodeEditor: React.FC<CodeEditorProps> = ({ language, theme, value, onChange, readOnly = false }) => {
  return (
    <div className="relative">
      <Editor
        height="400px"
        language={language}
        theme={theme}
        value={value}
        onChange={onChange}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          readOnly,
        }}
      />

      {/* Overlay when disabled */}
      {readOnly && (
        <div className="absolute inset-0 bg-transparent cursor-not-allowed z-10" />
      )}
    </div>
  );
}

export default CodeEditor;
