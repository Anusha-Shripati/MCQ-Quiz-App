import React from 'react';
import { TablePaginationProps } from '@/shared/types/app';
import { PaginationControls } from './pagination-controls';
import { FormField } from '../common/form-field';

function Pagination(props: React.PropsWithChildren<TablePaginationProps>) {
  const handleChange = (e: string) => {
    if ('onPerPageChange' in props) {
      props.onPerPageChange(e);
    }
  };
  const handlePageChange = (e: number) => {
    if ('onPageChange' in props) {
      props.onPageChange(e);
    }
  };
  return (
    <div className={`${props.className} `}>
        <div className="animate-in flex flex-col justify-between fade-in duration-300 h-full">
          <div className='flex-grow'>
            {props.children}
          </div>
          <div>
            <div className=" flex flex-col sm:flex-row justify-between items-center px-4 mt-4">
              <PaginationControls
                currentPage={props.currentPage || 0}
                totalItems={props.totalItems || 0}
                itemsPerPage={props.itemsPerPage || 10}
                onPageChange={handlePageChange}
              />
              <div className='flex items-center gap-2'>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-0">
                  Showing {props.currentPageStart || 0}-{props.currentPageEnd || 0} of{' '}
                  {props.totalItems || 0}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Results per page</span>
                  <FormField
                    value={props.itemsPerPage?.toString() || '10'}
                    onChange={handleChange}
                    options={[10, 25, 50, 100]}
                    className="w-[80px]"
                    type="select"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}

export default Pagination;
