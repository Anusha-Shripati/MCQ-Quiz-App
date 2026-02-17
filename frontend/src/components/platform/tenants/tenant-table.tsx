'use client';

import { useEffect, useState, useMemo } from 'react';
import useSWR from 'swr';
import { fetcher, isAxiosError } from '@/lib/api';
import { platformTenantEndpoint } from '@/lib/endpoint';
import { Edit, Trash2, Power } from 'lucide-react';
import { Button } from '@/components/ui/form/button';
import toast from 'react-hot-toast';
import TenantForm from './tenant-form';
import { DeleteDialog } from '@/components/common/delete-dialog';
import { api } from '@/lib/api';
import PlatformTable, { PlatformColumn } from '@/components/platform/common/platform-table';
import StatusWrapper from '@/components/common/status-wrapper';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import Pagination from '@/components/pagination';
import qs from 'query-string';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  admin_email: string;
  admin_name: string;
  status: 'active' | 'trial' | 'suspended' | 'expired' | 'cancelled';
  plan: {
    id: string;
    name: string;
    price: number;
  };
  trial_ends_at?: string;
  subscription_ends_at?: string;
  created_at: string;
}

const statusColors = {
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  trial: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  suspended: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  expired: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  cancelled: 'bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300',
};

export default function TenantTable() {
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [deletingTenant, setDeletingTenant] = useState<Tenant | null>(null);
  const [suspendingTenant, setSuspendingTenant] = useState<Tenant | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [suspendOpen, setSuspendOpen] = useState(false);
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
    data: tenants,
    error,
    isLoading,
    mutate,
    isValidating,
  } = useSWR(`${platformTenantEndpoint.LIST}?${cleanedQuery}`, fetcher);

  const handleToggleStatus = async (tenant: Tenant) => {
    if (tenant.status === 'active') {
      setSuspendingTenant(tenant);
      setSuspendOpen(true);
    } else {
      await updateStatus(tenant, 'active');
    }
  };

  const updateStatus = async (tenant: Tenant, newStatus: string) => {
    try {
      const res = await api.put(`${platformTenantEndpoint.STATUS}/${tenant.id}/status`, { status: newStatus });
      if (res.success) {
        toast.success(`Tenant ${newStatus === 'active' ? 'activated' : 'suspended'} successfully`);
        mutate();
      }
    } catch (error: any) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to update tenant status');
      } else {
        toast.error('Failed to update tenant status');
      }
    }
  };

  const handleSuspend = async () => {
    if (!suspendingTenant) return;
    await updateStatus(suspendingTenant, 'suspended');
    setSuspendOpen(false);
    setSuspendingTenant(null);
  };

  const onDelete = (tenant: Tenant) => {
    setDeletingTenant(tenant);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingTenant) return;

    try {
      const res = await api.delete(`${platformTenantEndpoint.DELETE}/${deletingTenant.id}`);
      if (res.success) {
        toast.success('Tenant deleted successfully');
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

  const columns: PlatformColumn<Tenant>[] = [
    {
      key: 'name',
      header: 'Tenant',
      render: (tenant) => (
        <div>
          <div className="font-medium text-slate-900 dark:text-white">{tenant.name}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">{tenant.slug}</div>
        </div>
      ),
    },
    {
      key: 'admin',
      header: 'Admin',
      render: (tenant) => (
        <div>
          <div className="text-slate-900 dark:text-white">{tenant.admin_name}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">{tenant.admin_email}</div>
        </div>
      ),
    },
    {
      key: 'plan',
      header: 'Plan',
      render: (tenant) => (
        <Badge variant="outline" className="font-medium">
          {tenant.plan.name}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (tenant) => (
        <div>
          <Badge className={statusColors[tenant.status]}>
            {tenant.status}
          </Badge>
        </div>
      ),
    },
    {
      key: 'trial_ends',
      header: 'Trial Ends',
      render: (tenant) => {
        if (!tenant.trial_ends_at) return <span className="text-slate-400">-</span>;
        const date = new Date(tenant.trial_ends_at);
        return (
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        );
      },
    },
    {
      key: 'subscription_ends',
      header: 'Subscription Ends',
      render: (tenant) => {
        if (!tenant.subscription_ends_at) return <span className="text-slate-400">-</span>;
        const date = new Date(tenant.subscription_ends_at);
        return (
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (tenant) => (
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingTenant(tenant)}
                className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent sideOffset={4}>
              <p>Edit Tenant</p>
            </TooltipContent>
          </Tooltip>

          {/* <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleToggleStatus(tenant)}
                className={tenant.status === 'active' ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50' : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'}
              >
                <Power className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent sideOffset={4}>
              <p>{tenant.status === 'active' ? 'Suspend Tenant' : 'Activate Tenant'}</p>
            </TooltipContent>
          </Tooltip> */}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(tenant)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent sideOffset={4}>
              <p>Delete Tenant</p>
            </TooltipContent>
          </Tooltip>
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

  const totalItems = tenants?.data?.total || 0;
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
            data={tenants?.data?.list || []}
            rowKey="id"
            emptyMessage="No tenants found"
          />
        </div>
      </Pagination>

      {editingTenant && (
        <TenantForm
          isOpen={!!editingTenant}
          onClose={() => {
            setEditingTenant(null);
            mutate();
          }}
          tenant={editingTenant}
        />
      )}

      <DeleteDialog
        onDelete={handleDelete}
        setOpen={setDeleteOpen}
        isOpen={deleteOpen}
        title="Delete Tenant"
        description="This action cannot be undone. This will permanently delete the tenant and all associated data."
      />

      <Dialog open={suspendOpen} onOpenChange={setSuspendOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Suspend Tenant
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to suspend "{suspendingTenant?.name}"? This will prevent the tenant from accessing their account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendOpen(false)} className="text-gray-900 dark:text-white">
              Cancel
            </Button>
            <Button onClick={handleSuspend} className="bg-orange-600 hover:bg-orange-700">
              Suspend
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </StatusWrapper>
  );
}
