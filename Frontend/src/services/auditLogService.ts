import { apiRequest } from './apiErrorHandler';

interface AuditLog {
  id: number;
  timestamp: string;
  userId: string;
  userEmail: string;
  action: string;
  entityType: string;
  entityId?: number;
  details?: string;
}

interface AuditLogFilters {
  action?: string;
  entityType?: string;
  entityId?: number;
  userEmail?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

interface AuditLogResponse {
  logs: AuditLog[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface AuditStats {
  totalLogs: number;
  todayLogs: number;
  weekLogs: number;
  monthLogs: number;
  topActions: Array<{ action: string; count: number }>;
  topUsers: Array<{ userEmail: string; count: number }>;
}

export type { AuditLog, AuditLogFilters, AuditLogResponse, AuditStats };

export const auditLogService = {
  async getAuditLogs(filters: AuditLogFilters = {}): Promise<AuditLogResponse> {
    const searchParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== 'undefined') {
        searchParams.append(key, value.toString());
      }
    });

    const response = await apiRequest(`/api/auditlog?${searchParams.toString()}`, {
      method: 'GET'
    }, 'Błąd podczas pobierania logów audit');

    return response.json();
  },

  async getAuditStats(): Promise<AuditStats> {
    const response = await apiRequest('/api/auditlog/stats', {
      method: 'GET'
    }, 'Błąd podczas pobierania statystyk logów');

    return response.json();
  }
};