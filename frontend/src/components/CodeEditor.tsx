import React from 'react';
import Editor from '@monaco-editor/react';

type CodeEditorProps = {
  language: string;
  theme: string;
  value: string;
  onChange: (value: string | undefined) => void;
};

const CodeEditor: React.FC<CodeEditorProps> = ({ language, theme, value, onChange }) => {
  return (
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
      }}
    />
  );
};

export default CodeEditor;
