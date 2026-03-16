'use client';

import { useEffect, useState, useMemo } from 'react';
import useSWR from 'swr';
import { fetcher, isAxiosError } from '@/lib/api';
import { tenantRequestEndpoint } from '@/lib/endpoint';
import { CheckCircle, XCircle, Clock, Loader2, RotateCcw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/form/button';
import toast from 'react-hot-toast';
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
import { Textarea } from '@/components/ui/form/textarea';

interface TenantRequest {
  id: string;
  organization_name: string;
  slug: string;
  admin_name: string;
  admin_email: string;
  status: 'pending' | 'processing' | 'approved' | 'rejected';
  requested_plan?: {
    id: string;
    name: string;
    price: number;
  };
  rejection_reason?: string;
  created_at: string;
  reviewed_at?: string;
  reviewed_admin?: {
    name: string;
    email: string;
  };
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

const statusIcons = {
  pending: Clock,
  processing: Loader2,
  approved: CheckCircle,
  rejected: XCircle,
};

export default function TenantRequestTable() {
  const [approvingRequest, setApprovingRequest] = useState<TenantRequest | null>(null);
  const [rejectingRequest, setRejectingRequest] = useState<TenantRequest | null>(null);
  const [reapprovingRequest, setReapprovingRequest] = useState<TenantRequest | null>(null);
  const [deletingRequest, setDeletingRequest] = useState<TenantRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // Default to 'all'
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [resetToPendingOpen, setResetToPendingOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [reasonDialogOpen, setReasonDialogOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const search = params.get('search') || '';
    const status = params.get('status') || 'all'; // Default to 'all' when no status param
    const page = params.get('page') || '1';
    const perPage = params.get('perPage') || '10';
    setSearchTerm(search);
    setStatusFilter(status);
    setCurrentPage(Number(page));
    setItemsPerPage(Number(perPage));
  }, []);

  // Listen to URL changes
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const search = params.get('search') || '';
      const status = params.get('status') || 'all'; // Default to 'all' when no status param
      setSearchTerm(search);
      setStatusFilter(status);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Watch for URL changes from header component
  useEffect(() => {
    const interval = setInterval(() => {
      const params = new URLSearchParams(window.location.search);
      const search = params.get('search') || '';
      const status = params.get('status') || 'all'; // Default to 'all' when no status param
      
      if (search !== searchTerm || status !== statusFilter) {
        setSearchTerm(search);
        setStatusFilter(status);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [searchTerm, statusFilter]);

  const queryObj = useMemo(
    () => ({
      page: currentPage,
      limit: itemsPerPage,
      ...(searchTerm ? { search: searchTerm } : {}),
      ...(statusFilter && statusFilter !== 'all' ? { status: statusFilter } : {}),
    }),
    [currentPage, itemsPerPage, searchTerm, statusFilter]
  );

  const cleanedQuery = useMemo(
    () => qs.stringify(queryObj, { skipNull: true, skipEmptyString: true }),
    [queryObj]
  );

  const {
    data: requests,
    error,
    isLoading,
    mutate,
    isValidating,
  } = useSWR(`${tenantRequestEndpoint.ADMIN_LIST}?${cleanedQuery}`, fetcher);

  const handleApprove = (request: TenantRequest) => {
    setApprovingRequest(request);
    setApproveOpen(true);
  };

  const handleReject = (request: TenantRequest) => {
    setRejectingRequest(request);
    setRejectionReason('');
    setRejectOpen(true);
  };

  const handleResetToPending = (request: TenantRequest) => {
    setReapprovingRequest(request);
    setResetToPendingOpen(true);
  };

  const handleDelete = (request: TenantRequest) => {
    setDeletingRequest(request);
    setDeleteOpen(true);
  };

  const confirmApprove = async () => {
    if (!approvingRequest) return;

    try {
      const res = await api.post(`${tenantRequestEndpoint.ADMIN_APPROVE}/${approvingRequest.id}/approve`, {});
      if (res.success) {
        toast.success('Request approved and tenant provisioned successfully');
        mutate();
      }
    } catch (error: any) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to approve request');
      } else {
        toast.error('Failed to approve request');
      }
    } finally {
      setApproveOpen(false);
      setApprovingRequest(null);
    }
  };

  const confirmReject = async () => {
    if (!rejectingRequest || !rejectionReason.trim() || rejectionReason.trim().length < 10 || rejectionReason.trim().length > 500) return;

    try {
      const res = await api.post(`${tenantRequestEndpoint.ADMIN_REJECT}/${rejectingRequest.id}/reject`, {
        reason: rejectionReason.trim()
      });
      if (res.success) {
        toast.success('Request rejected successfully');
        mutate();
      }
    } catch (error: any) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to reject request');
      } else {
        toast.error('Failed to reject request');
      }
    } finally {
      setRejectOpen(false);
      setRejectingRequest(null);
      setRejectionReason('');
    }
  };

  const confirmResetToPending = async () => {
    if (!reapprovingRequest) return;

    try {
      const res = await api.post(`${tenantRequestEndpoint.ADMIN_RESET_TO_PENDING}/${reapprovingRequest.id}/reset-to-pending`, {});
      if (res.success) {
        toast.success('Request reset to pending status successfully');
        mutate();
      }
    } catch (error: any) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to reset request to pending');
      } else {
        toast.error('Failed to reset request to pending');
      }
    } finally {
      setResetToPendingOpen(false);
      setReapprovingRequest(null);
    }
  };

  const confirmDelete = async () => {
    if (!deletingRequest) return;

    try {
      const res = await api.delete(`${tenantRequestEndpoint.ADMIN_DELETE}/${deletingRequest.id}`);
      if (res.success) {
        toast.success('Request deleted successfully');
        mutate();
      }
    } catch (error: any) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to delete request');
      } else {
        toast.error('Failed to delete request');
      }
    } finally {
      setDeleteOpen(false);
      setDeletingRequest(null);
    }
  };

  const columns: PlatformColumn<TenantRequest>[] = [
    {
      key: 'organization',
      header: 'Organization',
      render: (request) => (
        <div>
          <div className="font-medium text-slate-900 dark:text-white">{request.organization_name}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">{request.slug}.lr-mcq.com</div>
        </div>
      ),
    },
    {
      key: 'admin',
      header: 'Admin Contact',
      render: (request) => (
        <div>
          <div className="text-slate-900 dark:text-white">{request.admin_name}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">{request.admin_email}</div>
        </div>
      ),
    },
    {
      key: 'plan',
      header: 'Requested Plan',
      render: (request) => (
        <Badge variant="outline" className="font-medium">
          {request.requested_plan?.name || 'Free'}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (request) => {
        const StatusIcon = statusIcons[request.status];
        return (
          <div className="flex items-center gap-2">
            {/* <StatusIcon className={`h-4 w-4 ${request.status === 'processing' ? 'animate-spin' : ''}`} /> */}
            <Badge className={statusColors[request.status]}>
              {request.status}
            </Badge>
          </div>
        );
      },
    },
    {
      key: 'created_at',
      header: 'Requested',
      render: (request) => {
        const date = new Date(request.created_at);
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
      render: (request) => (
        <div className="flex items-center gap-2">
          {request.status === 'pending' && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleApprove(request)}
                    className="h-10 w-10 rounded-md flex items-center justify-center text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                  >
                    <CheckCircle className="h-5 w-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent sideOffset={4}>
                  <p>Approve Request</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleReject(request)}
                    className="h-10 w-10 rounded-md flex items-center justify-center text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent sideOffset={4}>
                  <p>Reject Request</p>
                </TooltipContent>
              </Tooltip>
            </>
          )}
          
          {(request.status === 'rejected' || request.status === 'approved') && (
            <>

             <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleDelete(request)}
                    className="h-10 w-10 rounded-md flex items-center justify-center text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent sideOffset={4}>
                  <p>Delete Request</p>
                </TooltipContent>
              </Tooltip>

              {request.status === 'rejected' && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleResetToPending(request)}
                      className="h-10 w-10 rounded-md flex items-center justify-center text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                    >
                      <RotateCcw className="h-5 w-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={4}>
                    <p>Reset to Pending</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {request.status === 'rejected' && request.rejection_reason && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedReason(request.rejection_reason!);
                    setReasonDialogOpen(true);
                  }}
                  className="px-2 h-6 text-xs text-white hover:text-red-700 hover:bg-red-50 bg-red-500"
                >
                  View Reason
                </Button>
              )}
            </>
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

  const totalItems = requests?.data?.total || 0;
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
            data={requests?.data?.list || []}
            rowKey="id"
            emptyMessage="No tenant requests found"
          />
        </div>
      </Pagination>

      {/* Approve Dialog */}
      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Approve Tenant Request
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to approve the request for "{approvingRequest?.organization_name}"? 
              This will create a new tenant and provision their workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-emerald-800 dark:text-emerald-200 mb-2">
                What will happen:
              </h4>
              <ul className="text-xs text-emerald-700 dark:text-emerald-300 space-y-1">
                <li>• Create database for {approvingRequest?.slug}</li>
                <li>• Run database migrations</li>
                <li>• Seed default data and admin user</li>
                <li>• Send confirmation email to admin</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveOpen(false)} className="text-gray-900 dark:text-white">
              Cancel
            </Button>
            <Button onClick={confirmApprove} className="bg-emerald-600 hover:bg-emerald-700">
              Approve & Provision
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Reject Tenant Request
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600 dark:text-gray-400">
              Please provide a reason for rejecting "{rejectingRequest?.organization_name}" request.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label htmlFor="rejection-reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rejection Reason *
            </label>
            <Textarea
              id="rejection-reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please explain why this request is being rejected..."
              className="min-h-[100px]"
              maxLength={500}
              required
            />
            {rejectionReason.length > 0 && rejectionReason.length < 10 && (
              <p className="text-sm text-red-500 mt-1">
                Reason must be at least 10 characters long ({rejectionReason.length}/10)
              </p>
            )}
            {rejectionReason.length > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                {rejectionReason.length}/500 characters
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)} className="text-gray-900 dark:text-white">
              Cancel
            </Button>
            <Button 
              onClick={confirmReject} 
              disabled={!rejectionReason.trim() || rejectionReason.trim().length < 10 || rejectionReason.trim().length > 500}
              className="bg-red-600 hover:bg-red-700 text-white disabled:bg-red-300 disabled:cursor-not-allowed"
            >
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Reason Dialog */}
      <Dialog open={reasonDialogOpen} onOpenChange={setReasonDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Rejection Reason
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">{selectedReason}</p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={() => setReasonDialogOpen(false)} 
              className="bg-slate-600 hover:bg-slate-700 text-white"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset to Pending Dialog */}
      <Dialog open={resetToPendingOpen} onOpenChange={setResetToPendingOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Reset Request to Pending
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to reset the request for "{reapprovingRequest?.organization_name}" back to pending status? 
              This will allow the request to be reviewed and approved again.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                What will happen:
              </h4>
              <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Request status will change to "pending"</li>
                <li>• Rejection reason will be cleared</li>
                <li>• Request can be approved normally</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetToPendingOpen(false)} className="text-gray-900 dark:text-white">
              Cancel
            </Button>
            <Button onClick={confirmResetToPending} className="bg-blue-600 hover:bg-blue-700">
              Reset to Pending
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Delete Tenant Request
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to permanently delete the {deletingRequest?.status} request for "{deletingRequest?.organization_name}"? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                ⚠️ Warning:
              </h4>
              <ul className="text-xs text-red-700 dark:text-red-300 space-y-1">
                <li>• This will permanently delete the request record</li>
                {deletingRequest?.status === 'rejected' && (
                  <li>• The organization will need to submit a new request</li>
                )}
                {deletingRequest?.status === 'approved' && (
                  <li>• The tenant organization will continue to exist</li>
                )}
                <li>• This action cannot be reversed</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)} className="text-gray-900 dark:text-white">
              Cancel
            </Button>
            <Button onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Delete Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </StatusWrapper>
  );
}