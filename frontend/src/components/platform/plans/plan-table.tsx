'use client';

import { useEffect, useState, useMemo } from 'react';
import useSWR from 'swr';
import { fetcher, isAxiosError } from '@/lib/api';
import { platformPlanEndpoint } from '@/lib/endpoint';
import { Plan } from '@/store/platformPlanStore';
import { Edit, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/form/button';
import toast from 'react-hot-toast';
import PlanForm from './plan-form';
import { DeleteDialog } from '@/components/common/delete-dialog';
import { api } from '@/lib/api';
import PlatformTable, { PlatformColumn } from '@/components/platform/common/platform-table';
import StatusWrapper from '@/components/common/status-wrapper';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import Pagination from '@/components/pagination';
import qs from 'query-string';

export default function PlanTable() {
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<Plan | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const search = params.get('search') || '';
    const page = params.get('page') || '1';
    const perPage = params.get('perPage') || '10';
    setSearchTerm(search);
    setCurrentPage(Number(page));
    setItemsPerPage(Number(perPage));
  }, []);

  const queryObj = useMemo(
    () => ({
      page: currentPage,
      limit: itemsPerPage,
      search: searchTerm,
    }),
    [currentPage, itemsPerPage, searchTerm]
  );

  const cleanedQuery = useMemo(
    () => qs.stringify(queryObj, { skipNull: true, skipEmptyString: true }),
    [queryObj]
  );

  const {
    data: plans,
    error,
    isLoading,
    mutate,
    isValidating,
  } = useSWR(`${platformPlanEndpoint.LIST}?${cleanedQuery}`, fetcher);

  const handleToggleActive = async (plan: Plan) => {
    try {
      const res = await api.put(`${platformPlanEndpoint.TOGGLE}/${plan.id}/toggle`, {});
      if (res.success) {
        toast.success(`Plan ${res.data.is_active ? 'activated' : 'deactivated'} successfully`);
        mutate();
      }
    } catch (error: any) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to toggle plan status');
      } else {
        toast.error('Failed to toggle plan status');
      }
    }
  };

  const onDelete = (plan: Plan) => {
    setDeletingPlan(plan);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingPlan) return;

    try {
      const res = await api.delete(`${platformPlanEndpoint.DELETE}/${deletingPlan.id}`);
      if (res.success) {
        toast.success('Plan deleted successfully');
      }
      mutate();
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response.data.message || 'An unexpected error occurred');
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  };

  const columns: PlatformColumn<Plan>[] = [
    {
      key: 'name',
      header: 'Plan Name',
      render: (plan) => (
        <div>
          <div className="font-medium text-slate-900 dark:text-white">{plan.name}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">{plan.description}</div>
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      render: (plan) => (
        <span className="text-slate-900 dark:text-white font-semibold">${plan.price}/mo</span>
      ),
    },
    {
      key: 'limits',
      header: 'Limits',
      render: (plan) => (
        <div className="text-sm space-y-1">
          <div className="text-slate-600 dark:text-slate-400">
            Candidates: {plan.limits.candidates === -1 ? '∞' : plan.limits.candidates}
          </div>
          <div className="text-slate-600 dark:text-slate-400">
            Assessments: {plan.limits.assessments === -1 ? '∞' : plan.limits.assessments}
          </div>
        </div>
      ),
    },
    {
      key: 'tenants',
      header: 'Tenants',
      render: (plan) => (
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <Users className="h-4 w-4" />
          <span>{plan._count?.tenants || 0}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (plan) => (
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Switch checked={plan.is_active} onCheckedChange={() => handleToggleActive(plan)} />
            </div>
          </TooltipTrigger>
          <TooltipContent sideOffset={4}>
            <p>{plan.is_active ? 'Deactivate Plan' : 'Activate Plan'}</p>
          </TooltipContent>
        </Tooltip>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (plan) => (
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingPlan(plan)}
                className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent sideOffset={4}>
              <p>Edit Plan</p>
            </TooltipContent>
          </Tooltip>

          {(plan._count?.tenants || 0) > 0 ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-grey-600 hover:text-red-700 hover:bg-red-50"
                    disabled
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent sideOffset={4}>
                <p>Cannot delete plan with active tenants</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(plan)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={4}>
                <p>Delete Plan</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  const handlePerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
    updateQueryParams({ page: '1', perPage: value });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateQueryParams({ page: page.toString() });
  };

  const updateQueryParams = (params: { page?: string; perPage?: string }) => {
    const newParams = new URLSearchParams(window.location.search);
    if (params.page) newParams.set('page', params.page);
    if (params.perPage) newParams.set('perPage', params.perPage);
    window.history.pushState(null, '', `?${newParams.toString()}`);
  };

  const totalItems = plans?.data?.total || 0;
  const currentPageStart = (currentPage - 1) * itemsPerPage + 1;
  const currentPageEnd = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <StatusWrapper
      loading={isLoading || isValidating}
      error={error}
      className="min-h-[83vh] flex"
      reset={mutate}
    >
      <Pagination
        className="flex-grow"
        currentPageStart={currentPageStart}
        currentPageEnd={currentPageEnd}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPerPageChange={handlePerPageChange}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      >
        <div className="flex-1 overflow-hidden">
          <PlatformTable
            columns={columns}
            data={plans?.data?.list || []}
            rowKey="id"
            emptyMessage="No plans found"
          />
        </div>
      </Pagination>

      {editingPlan && (
        <PlanForm
          isOpen={!!editingPlan}
          onClose={() => {
            setEditingPlan(null);
            mutate();
          }}
          plan={editingPlan}
        />
      )}

      <DeleteDialog
        onDelete={handleDelete}
        setOpen={setDeleteOpen}
        isOpen={deleteOpen}
        title="Delete Plan"
        description="This action cannot be undone. This will permanently delete the plan."
      />
    </StatusWrapper>
  );
}
