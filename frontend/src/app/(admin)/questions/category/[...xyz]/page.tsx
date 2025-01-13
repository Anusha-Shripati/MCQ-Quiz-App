"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useTheme } from "next-themes";
import { ArrowLeft } from "lucide-react";

const questionsData = [
  {
    id: 1,
    question: "What is the primary purpose of the virtual DOM in React?",
    options: [
      "To store all components",
      "To directly manipulate the real DOM",
      "To update only the parts of the DOM that have changed",
      "To manage component state",
    ],
    correctAnswer: "To update only the parts of the DOM that have changed",
    difficulty: "Easy",
  },
  {
    id: 2,
    question: "What is the correct syntax to import React in a JavaScript file?",
    options: [
      "import React from 'react';",
      "import { React } from 'react';",
      "include React from 'react';",
      "require('React');",
    ],
    correctAnswer: "import React from 'react';",
    difficulty: "Easy",
  },
  {
    id: 3,
    question: "How do you create context in React?",
    options: [
      "By using React.createContext()",
      "By using React.useContext()",
      "By passing props to child components",
      "By using a Redux store",
    ],
    correctAnswer: "By using React.createContext()",
    difficulty: "Easy",
  },
  {
    id: 4,
    question: "Which hook is used for side effects in functional components?",
    options: ["useState", "useEffect", "useContext", "useReducer"],
    correctAnswer: "useEffect",
    difficulty: "Easy",
  },
  {
    id: 5,
    question: "What is the default port number for a React development server?",
    options: ["3000", "8000", "8080", "5000"],
    correctAnswer: "3000",
    difficulty: "Easy",
  },
  {
    id: 6,
    question: "Which lifecycle method is deprecated in React?",
    options: [
      "componentDidMount",
      "componentWillReceiveProps",
      "componentDidUpdate",
      "componentWillUnmount",
    ],
    correctAnswer: "componentWillReceiveProps",
    difficulty: "Medium",
  },
  {
    id: 7,
    question: "What is a controlled component in React?",
    options: [
      "A component that controls its own state internally",
      "A component that takes its state from props",
      "A component whose form data is controlled by React state",
      "A component that is connected to a Redux store",
    ],
    correctAnswer: "A component whose form data is controlled by React state",
    difficulty: "Medium",
  },
  {
    id: 8,
    question: "How can you improve the performance of a React application?",
    options: [
      "Avoid using hooks",
      "Use memoization techniques like React.memo",
      "Use only class components",
      "Avoid using keys in lists",
    ],
    correctAnswer: "Use memoization techniques like React.memo",
    difficulty: "Medium",
  },
  {
    id: 9,
    question: "What is the difference between state and props in React?",
    options: [
      "State is used to manage data inside a component, props are used to pass data to other components",
      "Props can change within a component, state is immutable",
      "Both are immutable and cannot be modified",
      "State is used in class components only, props are used in functional components",
    ],
    correctAnswer: "State is used to manage data inside a component, props are used to pass data to other components",
    difficulty: "Easy",
  },
  {
    id: 10,
    question: "What is the purpose of the React.Fragment component?",
    options: [
      "To add CSS styles to React components",
      "To group multiple children elements without adding an extra node to the DOM",
      "To manage state for components",
      "To create context in React",
    ],
    correctAnswer: "To group multiple children elements without adding an extra node to the DOM",
    difficulty: "Easy",
  },
  {
    id: 11,
    question: "How does React's key prop help with rendering lists?",
    options: [
      "It helps React identify which items have changed, are added, or removed",
      "It automatically sorts the list",
      "It makes the list immutable",
      "It improves the visual appearance of the list",
    ],
    correctAnswer: "It helps React identify which items have changed, are added, or removed",
    difficulty: "Easy",
  },
  {
    id: 12,
    question: "What is React.StrictMode used for?",
    options: [
      "To enable additional checks and warnings for components",
      "To disable prop types validation",
      "To create strict component hierarchies",
      "To enforce specific coding standards",
    ],
    correctAnswer: "To enable additional checks and warnings for components",
    difficulty: "Medium",
  },
  {
    id: 13,
    question: "Which hook is used to access the DOM in functional components?",
    options: ["useState", "useEffect", "useRef", "useContext"],
    correctAnswer: "useRef",
    difficulty: "Medium",
  },
  {
    id: 14,
    question: "What is the purpose of the React.PureComponent?",
    options: [
      "To always render the component when its state changes",
      "To avoid unnecessary renders by doing a shallow comparison of props and state",
      "To create complex components",
      "To define reusable UI components",
    ],
    correctAnswer: "To avoid unnecessary renders by doing a shallow comparison of props and state",
    difficulty: "Hard",
  },
  {
    id: 15,
    question: "What does lifting state up in React mean?",
    options: [
      "Moving the state from a child component to a parent component to make it shared",
      "Creating state in a Redux store",
      "Sharing state between sibling components directly",
      "Converting state into props",
    ],
    correctAnswer: "Moving the state from a child component to a parent component to make it shared",
    difficulty: "Medium",
  },
];

const CategoryPage = () => {
  const { xyz } = useParams();
  const { theme,
    //  setTheme 
    } = useTheme();
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState(questionsData);

  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 5;

  const handleFilterChange = (difficulty: string) => {
    let updatedDifficulties: string[];

    if (difficulty === "Select All") {
      updatedDifficulties =
        selectedDifficulties.length === 3 ? [] : ["Easy", "Medium", "Hard"];
    } else {
      updatedDifficulties = selectedDifficulties.includes(difficulty)
        ? selectedDifficulties.filter((d) => d !== difficulty)
        : [...selectedDifficulties, difficulty];
    }

    setSelectedDifficulties(updatedDifficulties);

    const newFilteredQuestions = updatedDifficulties.length
      ? questionsData.filter((question) =>
        updatedDifficulties.includes(question.difficulty)
      )
      : questionsData;

    setFilteredQuestions(newFilteredQuestions);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = filteredQuestions.slice(
    indexOfFirstQuestion,
    indexOfLastQuestion
  );

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);

  return (
    <div className={`p-6 flex justify-center min-h-screen ${theme === "dark" ? "bg-gray-900" : "bg-gray-100"}`}>
      <div className={`w-full max-w-6xl ${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"} shadow-lg rounded-lg p-6 mx-auto md:w-11/12 sm:w-full`}>
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className={`${theme === "dark" ? "text-blue-400 hover:text-blue-600" : "text-blue-600 hover:text-blue-800"}`}
          >
            <ArrowLeft className="h-4 w-4"/>
          </Button>
          <div
            className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"} ml-4`}
          >
             {xyz}
          </div>

        </div>

        <div className="flex flex-col mb-6 sm:flex-row items-start sm:items-center justify-between sm:space-x-6 space-y-4 sm:space-y-0">
          <h2 className="text-xl font-semibold">{`Questions List (${filteredQuestions.length})`}</h2>

          <div className="flex items-center space-x-4">
            {["Select All", "Easy", "Medium", "Hard"].map((difficulty) => (
              <div
                key={difficulty}
                className={`flex items-center space-x-2 ${theme === "dark" ? "text-gray-200" : "text-gray-800"
                  }`}
              >
                <Checkbox
                  checked={
                    difficulty === "Select All"
                      ? selectedDifficulties.length === 3
                      : selectedDifficulties.includes(difficulty)
                  }
                  onCheckedChange={() => handleFilterChange(difficulty)}
                  className={`${theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-gray-200"
                    : "bg-gray-200 border-gray-300 text-gray-800"
                    }`}
                />
                <span
                  className={`${theme === "dark" ? "hover:text-gray-400" : "hover:text-gray-600"
                    }`}
                >
                  {difficulty}
                </span>
              </div>
            ))}
          </div>

        </div>

        <div className="w-full">
          {currentQuestions.map((question) => (
            <Card key={question.id} className={`${theme === "dark" ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-800"} mb-4 p-4 shadow-sm`}>
              <div className="text-lg font-semibold mb-2">
                {question.id}. {question.question}
              </div>
              <ul className="space-y-2">
                {question.options.map((option, index) => (
                  <li
                    key={index}
                    className={`p-2 rounded-md text-sm md:text-base ${option === question.correctAnswer
                      ? theme === "dark"
                        ? "bg-green-800 text-green-100"
                        : "bg-green-100 text-green-800"
                      : theme === "dark"
                        ? "bg-gray-800 text-gray-400"
                        : "bg-gray-100 text-gray-800"
                      }`}
                  >
                    {String.fromCharCode(65 + index)}. {option}
                  </li>
                ))}
              </ul>
              <div className="flex justify-between items-center mt-4 text-sm">
                <div className="space-x-4">
                  <Button variant="link" className="text-blue-500 hover:underline">
                    Edit
                  </Button>
                  <Button variant="link" className="text-red-500 hover:underline">
                    Delete
                  </Button>
                </div>
                <Badge className={`${theme === "dark" ? "bg-gray-600 text-gray-200" : "bg-gray-200 text-gray-800"} py-1 px-3`}>
                  {question.difficulty}
                </Badge>
              </div>
            </Card>
          ))}
        </div>

        <div className="flex justify-center mt-6 space-x-4">
          <Pagination
            currentPage={currentPage}
            onPageChange={paginate}
            totalPages={totalPages}
          />
        </div>

    
      </div>
    </div>
  );
};

export default CategoryPage;



interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (pageNumber: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex space-x-2">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className={`px-3 py-1 border rounded-md ${currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "text-blue-600"
          }`}
      >
        Prev
      </button>
      {pageNumbers.map((number) => (
        <button
          key={number}
          onClick={() => onPageChange(number)}
          className={`px-3 py-1 border rounded-md ${number === currentPage
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-800"
            }`}
        >
          {number}
        </button>
      ))}
      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className={`px-3 py-1 border rounded-md ${currentPage === totalPages ? "text-gray-400 cursor-not-allowed" : "text-blue-600"
          }`}
      >
        Next
      </button>
    </div>
  );
};
