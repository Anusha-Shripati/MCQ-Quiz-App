import React from 'react'
import { TablePaginationProps } from '@/shared/types/app';
import { PaginationControls } from './pagination-controls';
import { FormField } from '../common/form-field';

function Pagination(props: React.PropsWithChildren<TablePaginationProps>) {
    const handleChange = (e: string) => {
        if ('onPerPageChange' in props) {
            props.onPerPageChange(e)
        }
    }
    const handlePageChange = (e: number) => {
        if ('onPageChange' in props) {
            props.onPageChange(e)
        }
    }
    return (
        <div className={`${props.className} `}>
            { props.totalItems == 0 && <div className="flex flex-col items-center justify-center h-[500px]">No data found</div>}
            { props.totalItems > 0 && <div className='animate-in fade-in duration-300'>
                {props.children}
                <div className=" flex flex-col sm:flex-row justify-between items-center mb-4 px-4 mt-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-0">
                        Showing {props.currentPageStart || 0}-{props.currentPageEnd || 0} of {props.totalItems || 0}
                    </div>

                    {/* Items per page selector */}
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Results per page</span>
                        <FormField
                            value={props.itemsPerPage?.toString() || '10'}
                            onChange={handleChange}
                            options={[10, 25, 50, 100]}
                            className="w-[80px]"
                            type='select'
                        />
                    </div>
                </div>
                <PaginationControls
                    currentPage={props.currentPage || 0}
                    totalItems={props.totalItems || 0}
                    itemsPerPage={props.itemsPerPage || 10}
                    onPageChange={handlePageChange}
                />
            </div>}
        </div>
    )
}

export default Pagination