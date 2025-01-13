"use client";
import { useState } from "react";

import { Select, SelectContent, SelectTrigger, SelectItem } from "../ui/select";

interface LanguageScoreSelect {
  languages: string[];
  scores: string[];
}

export default function LanguageScoreSelect({
  languages,
  scores,
}: LanguageScoreSelect) {
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const [selectedScore, setSelectedScore] = useState(scores[0]);

  return (
    <div className="flex space-x-4">
      <Select
        value={selectedLanguage}
        onValueChange={(value) => setSelectedLanguage(value)}
      >
        <SelectTrigger className="flex items-center space-x-2 text-xs px-2 py-1 border border-gray-300 rounded-md">
          <span>{selectedLanguage}</span>
        </SelectTrigger>
        <SelectContent>
          {languages.map((language) => (
            <SelectItem
              key={language}
              className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded-md"
              value={language}
            >
              {language}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedScore}
        onValueChange={(value) => setSelectedScore(value)}
      >
        <SelectTrigger className="flex items-center space-x-2 text-xs px-2 py-1 border border-gray-300 rounded-md">
          <span>{selectedScore}</span>
        </SelectTrigger>
        <SelectContent>
          {scores.map((score) => (
            <SelectItem
              key={score}
              className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded-md"
              value={score}
            >
              {score}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
