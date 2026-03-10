import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@store/store';
import { markAlertTriggered } from '@store/alertsSlice';
import { NotificationService } from '@notifications/NotificationService';


export function useAlertChecker(): void {
  const dispatch = useAppDispatch();
  const alerts = useAppSelector((state) => state.alerts.list);
  const prices = useAppSelector((state) => state.watchlist.prices);
  const notifiedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    console.log('entraa')
    alerts.forEach(async (alert) => {
      if (alert.triggered) return;
      if (notifiedRef.current.has(alert.id)) return;

      const currentPrice = prices[alert.symbol];
      if (currentPrice === undefined) return;

      if (currentPrice >= alert.targetPrice) {
        notifiedRef.current.add(alert.id);
        dispatch(markAlertTriggered(alert.id));

        await NotificationService.sendPriceAlert({
          symbol: alert.symbol,
          currentPrice,
          targetPrice: alert.targetPrice,
        });
      }
    });
  }, [prices, alerts, dispatch]);
}