import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area'; // For scrolling
import { Trash2 } from 'lucide-react'; // Import trash icon
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';

interface QuestionSidebarProps {
    questions: {
        id: number;
        type: string;
        difficulty: string;
        question: string;
    }[];
    selectedQuestion: number;
    setSelectedQuestion: (index: number) => void;
    handleDeleteQuestion: (index: number) => void;
    handleAddQuestion: () => void;
}

const QuestionSidebar: React.FC<QuestionSidebarProps> = ({
    questions,
    selectedQuestion,
    setSelectedQuestion,
    handleDeleteQuestion,
    handleAddQuestion
}) => {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [questionToDelete, setQuestionToDelete] = useState<number | null>(null);

    return (
        <Card className="w-1/4 h-[calc(100vh-8rem)] flex flex-col overflow-hidden shadow-lg bg-white dark:bg-gray-900">
            {/* Header */}
            <CardHeader className="border-b border-gray-200 dark:border-gray-700 p-4 flex flex-row justify-between items-center">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    Questions
                </CardTitle>
                {/* Add Question Button */}
                <Button
                    onClick={handleAddQuestion}
                    className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800"
                >
                    Add Question
                </Button>
            </CardHeader>

            {/* Scrollable List */}
            <CardContent className="flex-1 p-0 overflow-hidden">
                <ScrollArea className="h-full">
                    <ul className="space-y-1 p-2">
                        {questions.map((q, index) => (
                            <li
                                key={q.id}
                                className={`p-3 rounded-lg cursor-pointer flex justify-between items-center transition-all duration-200 ease-in-out ${
                                    selectedQuestion === index
                                        ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-md'
                                        : 'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm'
                                }`}
                                onClick={() => setSelectedQuestion(index)}
                            >
                                <span className="text-sm font-medium">Question {q.id}</span>

                                <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                                    <DialogTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="hover:bg-red-500/10 rounded-full p-2"
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent triggering the li onClick
                                                setQuestionToDelete(index); // Set the question to delete
                                                setIsDeleteModalOpen(true); // Open the modal
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4 text-red-500 hover:text-red-600" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                                                Are you sure?
                                            </DialogTitle>
                                            <DialogDescription className="text-sm text-gray-600 dark:text-gray-400">
                                                This action cannot be undone. This will permanently delete the question.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter>
                                            <Button
                                                variant="outline"
                                                onClick={() => setIsDeleteModalOpen(false)}
                                                className="text-gray-900 dark:text-white"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                onClick={() => {
                                                    if (questionToDelete !== null) {
                                                        handleDeleteQuestion(questionToDelete); // Delete the question
                                                    }
                                                    setIsDeleteModalOpen(false); // Close the modal
                                                }}
                                            >
                                                Delete
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </li>
                        ))}
                    </ul>
                </ScrollArea>
            </CardContent>
        </Card>
    );
};

export default QuestionSidebar;