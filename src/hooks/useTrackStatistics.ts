import { useMemo, useCallback, useEffect, useState, useRef } from 'react';
import { useAppStore } from '@/store';
import type { TrackStatistics, OrderTrackProgress, TransportLocation } from '@/types';
import {
  computeTopDrivers,
  computeTopVehicles,
  computeReportTrend,
  filterLocationsByTimeRange,
  countReportsByDriver,
  countReportsByVehicle,
  getReportFrequencyStatus,
} from '@/utils/trackUtils';

interface UseTrackStatisticsOptions {
  autoRefresh?: boolean;
  refreshIntervalMs?: number;
}

interface UseTrackStatisticsReturn {
  statistics: TrackStatistics;
  allOrderProgress: OrderTrackProgress[];
  getOrderProgress: (orderId: string) => OrderTrackProgress | null;
  getLocationsByTimeRange: (startTime: Date, endTime: Date) => TransportLocation[];
  getDriverReportCount: (driverName: string) => number;
  getVehicleReportCount: (vehicleId: string) => number;
  getTopDrivers: (limit?: number) => Array<{ name: string; count: number }>;
  getTopVehicles: (limit?: number) => Array<{ id: string; plateNumber: string; count: number }>;
  getReportTrend: (hours?: number) => Array<{ time: string; count: number }>;
  getOrdersNeedingAttention: () => OrderTrackProgress[];
  isRefreshing: boolean;
  refresh: () => void;
}

const DEFAULT_REFRESH_INTERVAL = 30000;

export function useTrackStatistics(
  options: UseTrackStatisticsOptions = {},
): UseTrackStatisticsReturn {
  const { autoRefresh = false, refreshIntervalMs = DEFAULT_REFRESH_INTERVAL } = options;

  const {
    vehicles,
    transportLocations,
    orders,
    getTrackStatistics,
    getOrderTrackProgress,
    getAllOrderTrackProgress,
    getLocationsByTimeRange: storeGetLocationsByTimeRange,
    getDriverReportCount: storeGetDriverReportCount,
    getVehicleReportCount: storeGetVehicleReportCount,
  } = useAppStore();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const intervalRef = useRef<number | null>(null);

  const refresh = useCallback(() => {
    setIsRefreshing(true);
    setRefreshVersion((prev) => prev + 1);
    setTimeout(() => setIsRefreshing(false), 300);
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    intervalRef.current = window.setInterval(() => {
      setRefreshVersion((prev) => prev + 1);
    }, refreshIntervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, refreshIntervalMs]);

  const statistics = useMemo<TrackStatistics>(() => {
    void refreshVersion;
    return getTrackStatistics();
  }, [getTrackStatistics, refreshVersion]);

  const allOrderProgress = useMemo<OrderTrackProgress[]>(() => {
    void refreshVersion;
    return getAllOrderTrackProgress();
  }, [getAllOrderTrackProgress, refreshVersion]);

  const getOrderProgress = useCallback(
    (orderId: string): OrderTrackProgress | null => {
      void refreshVersion;
      return getOrderTrackProgress(orderId);
    },
    [getOrderTrackProgress, refreshVersion],
  );

  const getLocationsByTimeRange = useCallback(
    (startTime: Date, endTime: Date): TransportLocation[] => {
      void refreshVersion;
      const result = storeGetLocationsByTimeRange(startTime, endTime);
      return result ?? filterLocationsByTimeRange(transportLocations, startTime, endTime);
    },
    [refreshVersion, storeGetLocationsByTimeRange, transportLocations],
  );

  const getDriverReportCount = useCallback(
    (driverName: string): number => {
      void refreshVersion;
      const storeCount = storeGetDriverReportCount(driverName);
      return storeCount ?? countReportsByDriver(transportLocations, driverName);
    },
    [refreshVersion, storeGetDriverReportCount, transportLocations],
  );

  const getVehicleReportCount = useCallback(
    (vehicleId: string): number => {
      void refreshVersion;
      const storeCount = storeGetVehicleReportCount(vehicleId);
      return storeCount ?? countReportsByVehicle(transportLocations, orders, vehicleId);
    },
    [refreshVersion, storeGetVehicleReportCount, transportLocations, orders],
  );

  const getTopDrivers = useCallback(
    (limit: number = 5): Array<{ name: string; count: number }> => {
      void refreshVersion;
      return computeTopDrivers(transportLocations, limit);
    },
    [refreshVersion, transportLocations],
  );

  const getTopVehicles = useCallback(
    (limit: number = 5): Array<{ id: string; plateNumber: string; count: number }> => {
      void refreshVersion;
      return computeTopVehicles(transportLocations, orders, vehicles, limit);
    },
    [refreshVersion, transportLocations, orders, vehicles],
  );

  const getReportTrend = useCallback(
    (hours: number = 24): Array<{ time: string; count: number }> => {
      void refreshVersion;
      return computeReportTrend(transportLocations, hours);
    },
    [refreshVersion, transportLocations],
  );

  const getOrdersNeedingAttention = useCallback(
    (): OrderTrackProgress[] => {
      void refreshVersion;
      return allOrderProgress.filter((progress) => {
        if (progress.avgIntervalMinutes === 0) return false;
        if (!progress.lastReportAt) return true;

        const timeSinceLastReport =
          (Date.now() - new Date(progress.lastReportAt).getTime()) / (1000 * 60);

        const status = getReportFrequencyStatus(
          progress.avgIntervalMinutes,
          timeSinceLastReport,
        );

        return status === 'overdue';
      });
    },
    [refreshVersion, allOrderProgress],
  );

  return useMemo(
    () => ({
      statistics,
      allOrderProgress,
      getOrderProgress,
      getLocationsByTimeRange,
      getDriverReportCount,
      getVehicleReportCount,
      getTopDrivers,
      getTopVehicles,
      getReportTrend,
      getOrdersNeedingAttention,
      isRefreshing,
      refresh,
    }),
    [
      statistics,
      allOrderProgress,
      getOrderProgress,
      getLocationsByTimeRange,
      getDriverReportCount,
      getVehicleReportCount,
      getTopDrivers,
      getTopVehicles,
      getReportTrend,
      getOrdersNeedingAttention,
      isRefreshing,
      refresh,
    ],
  );
}
