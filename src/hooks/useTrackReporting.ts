import { useState, useCallback, useMemo } from 'react';
import { useAppStore } from '@/store';
import type { TransportLocation, TrackReportValidationResult, Order } from '@/types';
import {
  buildReportRemark,
  resolveReporterName,
  validateTrackReportData,
  isReportableOrderStatus,
  getTimeSinceLastReportMinutes,
} from '@/utils/trackUtils';

interface UseTrackReportingOptions {
  autoValidate?: boolean;
  showSuccessAnimation?: boolean;
}

interface ReportCommonFields {
  orderId: string;
  location: string;
  remark?: string;
  petStatus?: string;
  latitude?: number;
  longitude?: number;
}

interface SingleReportOptions extends ReportCommonFields {
  address?: string;
  speedKmh?: number;
  headingDeg?: number;
  temperature?: number;
  humidity?: number;
  accuracyM?: number;
  batteryLevel?: number;
  deviceInfo?: string;
}

interface UseTrackReportingReturn {
  isReporting: boolean;
  lastReportTime: Date | null;
  validationResult: TrackReportValidationResult | null;
  reportError: string | null;
  reportSuccess: boolean;
  reportLocation: (
    orderId: string,
    location: string,
    options?: Omit<SingleReportOptions, 'orderId' | 'location'>,
  ) => Promise<TransportLocation | null>;
  batchReportLocations: (
    reports: ReportCommonFields[],
  ) => Promise<TransportLocation[]>;
  validateReport: (orderId: string, location: string) => TrackReportValidationResult;
  clearReportState: () => void;
  canReport: (orderId: string) => boolean;
  getTimeSinceLastReport: (orderId: string) => number;
  getReportCount: (orderId: string) => number;
}

const QUICK_LOCATIONS = [
  { label: '高速服务区', icon: 'Coffee' },
  { label: '收费站', icon: 'MapPin' },
  { label: '加油站', icon: 'Activity' },
  { label: '休息站', icon: 'Bed' },
  { label: '餐厅', icon: 'Utensils' },
];

const PET_STATUS_OPTIONS = [
  { label: '状态良好', icon: 'Heart', color: 'text-green-500', bg: 'bg-green-50' },
  { label: '正在休息', icon: 'Bed', color: 'text-blue-500', bg: 'bg-blue-50' },
  { label: '正在喂食', icon: 'Utensils', color: 'text-amber-500', bg: 'bg-amber-50' },
  { label: '稍显焦虑', icon: 'Activity', color: 'text-orange-500', bg: 'bg-orange-50' },
];

const SUCCESS_ANIMATION_DURATION = 2500;

interface ProcessedReportData {
  locationData: Omit<TransportLocation, 'id' | 'reported_at'>;
  statusLogData: {
    order_id: string;
    status: Order['status'];
    location: string;
    remark: string;
  } | null;
}

export function useTrackReporting(
  options: UseTrackReportingOptions = {},
): UseTrackReportingReturn {
  const { autoValidate = true, showSuccessAnimation = true } = options;

  const {
    orders,
    employees,
    vehicles,
    addOrderStatusLog,
    addTransportLocation,
    batchAddTransportLocations,
    getOrderLocations,
    getCurrentLocation,
  } = useAppStore();

  const [isReporting, setIsReporting] = useState(false);
  const [lastReportTime, setLastReportTime] = useState<Date | null>(null);
  const [validationResult, setValidationResult] =
    useState<TrackReportValidationResult | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);
  const [reportSuccess, setReportSuccess] = useState(false);

  const findOrder = useCallback(
    (orderId: string): Order | undefined => orders.find((o) => o.id === orderId),
    [orders],
  );

  const triggerSuccessState = useCallback(() => {
    if (!showSuccessAnimation) return;
    setReportSuccess(true);
    setTimeout(() => setReportSuccess(false), SUCCESS_ANIMATION_DURATION);
  }, [showSuccessAnimation]);

  const validateReport = useCallback(
    (orderId: string, location: string): TrackReportValidationResult => {
      const order = findOrder(orderId);
      const currentLoc = getCurrentLocation(orderId);
      const result = validateTrackReportData(order, location, currentLoc);
      setValidationResult(result);
      return result;
    },
    [findOrder, getCurrentLocation],
  );

  const canReport = useCallback(
    (orderId: string): boolean => {
      const order = findOrder(orderId);
      return order ? isReportableOrderStatus(order.status) : false;
    },
    [findOrder],
  );

  const getTimeSinceLastReport = useCallback(
    (orderId: string): number => {
      const currentLoc = getCurrentLocation(orderId);
      return getTimeSinceLastReportMinutes(currentLoc);
    },
    [getCurrentLocation],
  );

  const getReportCount = useCallback(
    (orderId: string): number => getOrderLocations(orderId).length,
    [getOrderLocations],
  );

  const clearReportState = useCallback(() => {
    setValidationResult(null);
    setReportError(null);
    setReportSuccess(false);
  }, []);

  const processSingleReport = useCallback(
    (report: SingleReportOptions): ProcessedReportData | null => {
      const {
        orderId,
        location,
        remark,
        petStatus,
        latitude,
        longitude,
        address,
        speedKmh,
        headingDeg,
        temperature,
        humidity,
        accuracyM,
        batteryLevel,
        deviceInfo,
      } = report;

      const order = findOrder(orderId);
      const currentLoc = getCurrentLocation(orderId);

      if (autoValidate) {
        const validation = validateTrackReportData(order, location, currentLoc);
        if (!validation.valid) {
          return null;
        }
      }

      const trimmedLocation = location.trim();
      const finalRemark = buildReportRemark(remark, petStatus);
      const reportedBy = resolveReporterName(order, employees, vehicles);

      const locationData: Omit<TransportLocation, 'id' | 'reported_at'> = {
        order_id: orderId,
        location: trimmedLocation,
        address: address || trimmedLocation,
        remark: finalRemark,
        reported_by: reportedBy,
        latitude,
        longitude,
        speed_kmh: speedKmh,
        heading_deg: headingDeg,
        accuracy_m: accuracyM,
        battery_level: batteryLevel,
        device_info: deviceInfo,
        pet_status: petStatus,
        temperature,
        humidity,
      };

      const statusLogData = order
        ? {
            order_id: orderId,
            status: order.status,
            location: trimmedLocation,
            remark: finalRemark,
          }
        : null;

      return { locationData, statusLogData };
    },
    [autoValidate, findOrder, getCurrentLocation, employees, vehicles],
  );

  const reportLocation = useCallback(
    async (
      orderId: string,
      location: string,
      reportOptions: Omit<SingleReportOptions, 'orderId' | 'location'> = {},
    ): Promise<TransportLocation | null> => {
      setIsReporting(true);
      setReportError(null);
      setReportSuccess(false);

      try {
        const fullReport: SingleReportOptions = {
          orderId,
          location,
          ...reportOptions,
        };

        const order = findOrder(orderId);
        const currentLoc = getCurrentLocation(orderId);

        if (autoValidate) {
          const validation = validateTrackReportData(order, location, currentLoc);
          if (!validation.valid) {
            setReportError(validation.error || '上报验证失败');
            return null;
          }
        }

        const processed = processSingleReport(fullReport);
        if (!processed) {
          setReportError('上报数据处理失败');
          return null;
        }

        if (processed.statusLogData) {
          addOrderStatusLog(processed.statusLogData);
        }

        const newLocation = addTransportLocation(processed.locationData);

        setLastReportTime(new Date());
        triggerSuccessState();

        return newLocation;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '上报失败，请重试';
        setReportError(errorMessage);
        return null;
      } finally {
        setIsReporting(false);
      }
    },
    [
      autoValidate,
      findOrder,
      getCurrentLocation,
      processSingleReport,
      addOrderStatusLog,
      addTransportLocation,
      triggerSuccessState,
    ],
  );

  const batchReportLocations = useCallback(
    async (reports: ReportCommonFields[]): Promise<TransportLocation[]> => {
      setIsReporting(true);
      setReportError(null);

      try {
        const validLocationData: Omit<TransportLocation, 'id' | 'reported_at'>[] = [];
        const statusLogs: Array<{
          order_id: string;
          status: Order['status'];
          location: string;
          remark: string;
        }> = [];

        for (const report of reports) {
          const processed = processSingleReport(report);
          if (!processed) continue;

          validLocationData.push(processed.locationData);
          if (processed.statusLogData) {
            statusLogs.push(processed.statusLogData);
          }
        }

        statusLogs.forEach((log) => addOrderStatusLog(log));

        const newLocations = batchAddTransportLocations(validLocationData);

        if (newLocations.length > 0) {
          setLastReportTime(new Date());
          triggerSuccessState();
        }

        return newLocations;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '批量上报失败，请重试';
        setReportError(errorMessage);
        return [];
      } finally {
        setIsReporting(false);
      }
    },
    [processSingleReport, addOrderStatusLog, batchAddTransportLocations, triggerSuccessState],
  );

  return useMemo(
    () => ({
      isReporting,
      lastReportTime,
      validationResult,
      reportError,
      reportSuccess,
      reportLocation,
      batchReportLocations,
      validateReport,
      clearReportState,
      canReport,
      getTimeSinceLastReport,
      getReportCount,
    }),
    [
      isReporting,
      lastReportTime,
      validationResult,
      reportError,
      reportSuccess,
      reportLocation,
      batchReportLocations,
      validateReport,
      clearReportState,
      canReport,
      getTimeSinceLastReport,
      getReportCount,
    ],
  );
}

export { QUICK_LOCATIONS, PET_STATUS_OPTIONS };
