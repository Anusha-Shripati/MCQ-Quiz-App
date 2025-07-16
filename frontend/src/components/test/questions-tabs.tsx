import React from 'react'
import { Button } from '../ui/form/button';

function QuestionTabs({ currentPage, totalPages, setCurrentQuestionIndex }: { currentPage: number, totalPages: number, setCurrentQuestionIndex: (index: number) => void }) {

    const renderPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 7;
        let startPage = Math.max(1, currentPage - 3);
        let endPage = Math.min(totalPages, currentPage + 3);

        if (totalPages > maxVisiblePages) {
            if (currentPage <= 4) {
                endPage = maxVisiblePages;
            } else if (currentPage >= totalPages - 3) {
                startPage = totalPages - maxVisiblePages + 1;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                
                <Button
                    key={i}
                    variant={i === currentPage ? 'default' : 'outline'}
                    onClick={() => setCurrentQuestionIndex(i)}
                    className="mx-1 min-w-[2rem] font-semibold"
                >
                    {i}
                </Button>
            );
        }

        if (totalPages > maxVisiblePages) {
            if (startPage > 1) {
                pages.unshift(
                    <span key="start-ellipsis" className="px-3 py-1">
                        ...
                    </span>
                );
            }
            if (endPage < totalPages) {
                pages.push(
                    <span key="end-ellipsis" className="px-3 py-1">
                        ...
                    </span>
                );
            }
        }

        return pages;
    };
    return (
        <div>
            {renderPageNumbers()}
        </div>
    )
}

export default QuestionTabs
