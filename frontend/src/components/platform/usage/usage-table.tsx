'use client';

import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import qs from 'query-string';
import { RefreshCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/form/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import Pagination from '@/components/pagination';
import StatusWrapper from '@/components/common/status-wrapper';
import PlatformTable, { PlatformColumn } from '@/components/platform/common/platform-table';
import { api, fetcher, isAxiosError } from '@/lib/api';
import { platformUsageEndpoint } from '@/lib/endpoint';

type TenantStatus = 'active' | 'trial' | 'suspended' | 'expired' | 'cancelled';
type HealthStatus = 'healthy' | 'near_limit' | 'critical' | 'unlimited';
type MetricKey = 'candidates' | 'assessments' | 'questions';

interface UsageMetric {
  current: number;
  limit: number;
  percentage: number;
}

interface TenantUsageRow {
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  tenantStatus: TenantStatus;
  planName: string;
  subscriptionStartsAt: string | null;
  subscriptionEndsAt: string | null;
  lastUpdated: string | null;
  metrics: Partial<Record<MetricKey, UsageMetric>>;
}

const statusColors: Record<TenantStatus, string> = {
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  trial: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  suspended: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  expired: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  cancelled: 'bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300',
};

const healthColors: Record<HealthStatus, string> = {
  healthy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  near_limit: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  unlimited: 'bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300',
};

const getMetricValue = (row: TenantUsageRow, metric: MetricKey): UsageMetric => {
  return row.metrics[metric] || { current: 0, limit: 0, percentage: 0 };
};

const isUnlimitedMetric = (metric: UsageMetric) => metric.limit === -1;

const getIndicatorColor = (metric: UsageMetric) => {
  if (isUnlimitedMetric(metric)) return 'bg-slate-400';
  if (metric.percentage >= 90) return 'bg-red-500';
  if (metric.percentage >= 70) return 'bg-amber-500';
  return 'bg-emerald-500';
};

const getHealthStatus = (
  row: TenantUsageRow,
  resourceFilter: 'all' | MetricKey = 'all'
): HealthStatus => {
  const metrics = (resourceFilter === 'all'
    ? (Object.values(row.metrics) as UsageMetric[])
    : [getMetricValue(row, resourceFilter)]).filter(Boolean);

  if (!metrics.length || metrics.every((metric) => isUnlimitedMetric(metric))) {
    return 'unlimited';
  }

  const maxPercentage = Math.max(...metrics.map((metric) => metric.percentage || 0));

  if (maxPercentage >= 90) return 'critical';
  if (maxPercentage >= 70) return 'near_limit';
  return 'healthy';
};

const formatDate = (date: string | null) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const formatDateTime = (date: string | null) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

function MetricUsageCell({ metric }: { metric: UsageMetric }) {
  if (isUnlimitedMetric(metric)) {
    return (
      <div className="min-w-[180px]">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-slate-900 dark:text-white">{metric.current} / Unlimited</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">No cap</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700">
          <div className="h-2 rounded-full bg-slate-400" style={{ width: '100%' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-[180px]">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-900 dark:text-white">
          {metric.current} / {metric.limit}
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400">{metric.percentage}%</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className={`h-2 rounded-full ${getIndicatorColor(metric)}`}
          style={{ width: `${Math.min(metric.percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

export default function UsageTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [healthFilter, setHealthFilter] = useState('all');
  const [resourceFilter, setResourceFilter] = useState<'all' | MetricKey>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [syncingTenantId, setSyncingTenantId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSearchTerm(params.get('search') || '');
    setStatusFilter(params.get('status') || 'all');
    setPlanFilter(params.get('plan') || 'all');
    setHealthFilter(params.get('health') || 'all');
    setResourceFilter((params.get('resource') as 'all' | MetricKey) || 'all');
    setCurrentPage(Number(params.get('page') || '1'));
    setItemsPerPage(Number(params.get('perPage') || '10'));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const params = new URLSearchParams(window.location.search);
      const nextSearch = params.get('search') || '';
      const nextStatus = params.get('status') || 'all';
      const nextPlan = params.get('plan') || 'all';
      const nextHealth = params.get('health') || 'all';
      const nextResource = (params.get('resource') as 'all' | MetricKey) || 'all';
      const nextPage = Number(params.get('page') || '1');
      const nextPerPage = Number(params.get('perPage') || '10');

      setSearchTerm((current) => (current !== nextSearch ? nextSearch : current));
      setStatusFilter((current) => (current !== nextStatus ? nextStatus : current));
      setPlanFilter((current) => (current !== nextPlan ? nextPlan : current));
      setHealthFilter((current) => (current !== nextHealth ? nextHealth : current));
      setResourceFilter((current) => (current !== nextResource ? nextResource : current));
      setCurrentPage((current) => (current !== nextPage ? nextPage : current));
      setItemsPerPage((current) => (current !== nextPerPage ? nextPerPage : current));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    platformUsageEndpoint.SUMMARY,
    fetcher
  );

  const usageRows: TenantUsageRow[] = data?.data || [];

  const filteredRows = useMemo(() => {
    return usageRows.filter((row) => {
      const searchMatch =
        !searchTerm ||
        row.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.tenantSlug.toLowerCase().includes(searchTerm.toLowerCase());

      const statusMatch = statusFilter === 'all' || row.tenantStatus === statusFilter;
      const planMatch = planFilter === 'all' || row.planName === planFilter;
      const healthStatus = getHealthStatus(row, resourceFilter);
      const healthMatch = healthFilter === 'all' || healthStatus === healthFilter;

      return searchMatch && statusMatch && planMatch && healthMatch;
    });
  }, [usageRows, searchTerm, statusFilter, planFilter, healthFilter, resourceFilter]);

  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRows.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRows, currentPage, itemsPerPage]);

  const updateQueryParams = (params: { page?: string; perPage?: string }) => {
    const newParams = new URLSearchParams(window.location.search);
    if (params.page) newParams.set('page', params.page);
    if (params.perPage) newParams.set('perPage', params.perPage);
    window.history.pushState(null, '', `?${newParams.toString()}`);
  };

  const handlePerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
    updateQueryParams({ page: '1', perPage: value });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateQueryParams({ page: page.toString() });
  };

  const handleSync = async (tenantId: string) => {
    setSyncingTenantId(tenantId);
    try {
      const response = await api.post(`${platformUsageEndpoint.SYNC}/${tenantId}/sync`, {});
      if (response.success) {
        toast.success('Usage synced successfully');
        mutate();
      }
    } catch (syncError) {
      if (isAxiosError(syncError)) {
        toast.error(syncError.response?.data?.message || 'Failed to sync usage');
      } else {
        toast.error('Failed to sync usage');
      }
    } finally {
      setSyncingTenantId(null);
    }
  };

  const columns: PlatformColumn<TenantUsageRow>[] = [
    {
      key: 'tenant',
      header: 'Tenant',
      render: (row) => (
        <div>
          <div className="font-medium text-slate-900 dark:text-white">{row.tenantName}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">{row.tenantSlug}</div>
        </div>
      ),
    },
    {
      key: 'plan',
      header: 'Plan',
      render: (row) => (
        <Badge variant="outline" className="font-medium">
          {row.planName}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge className={statusColors[row.tenantStatus]}>{row.tenantStatus}</Badge>,
    },
    {
      key: 'subscription',
      header: 'Subscription Period',
      render: (row) => (
        <div className="min-w-[160px]">
          <div className="text-slate-900 dark:text-white">{formatDate(row.subscriptionStartsAt)}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            to {formatDate(row.subscriptionEndsAt)}
          </div>
        </div>
      ),
    },
    {
      key: 'candidates',
      header: 'Candidates Usage',
      render: (row) => <MetricUsageCell metric={getMetricValue(row, 'candidates')} />,
    },
    {
      key: 'assessments',
      header: 'Assessments Usage',
      render: (row) => <MetricUsageCell metric={getMetricValue(row, 'assessments')} />,
    },
    {
      key: 'questions',
      header: 'Questions Usage',
      render: (row) => <MetricUsageCell metric={getMetricValue(row, 'questions')} />,
    },
    {
      key: 'health',
      header: 'Overall Health',
      render: (row) => {
        const healthStatus = getHealthStatus(row, resourceFilter);
        return (
          <Badge className={healthColors[healthStatus]}>
            {healthStatus === 'near_limit'
              ? 'Near Limit'
              : healthStatus.charAt(0).toUpperCase() + healthStatus.slice(1)}
          </Badge>
        );
      },
    },
    {
      key: 'updated',
      header: 'Last Updated',
      render: (row) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {formatDateTime(row.lastUpdated)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSync(row.tenantId)}
                disabled={syncingTenantId === row.tenantId}
                className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
              >
                <RefreshCcw
                  className={`h-4 w-4 ${syncingTenantId === row.tenantId ? 'animate-spin' : ''}`}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent sideOffset={4}>
              <p>Sync Usage</p>
            </TooltipContent>
          </Tooltip>
        </div>
      ),
    },
  ];

  const totalItems = filteredRows.length;
  const currentPageStart = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
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
            data={paginatedRows}
            rowKey="tenantId"
            emptyMessage="No tenants matched the selected usage filters"
          />
        </div>
      </Pagination>
    </StatusWrapper>
  );
}
