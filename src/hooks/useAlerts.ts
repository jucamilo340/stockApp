import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@store/store';
import { markAlertTriggered, resetAlert } from '@store/alertsSlice';
import { NotificationService } from '@notifications/NotificationService';


export function useAlertChecker(): void {
  const dispatch = useAppDispatch();
  const alerts = useAppSelector((state) => state.alerts.list);
  const prices = useAppSelector((state) => state.watchlist.prices);

  useEffect(() => {
    alerts.forEach((alert) => {
      const currentPrice = prices[alert.symbol];
      if (currentPrice === undefined) return;

      if (currentPrice < alert.targetPrice) {
        if (alert.triggered) {
          dispatch(resetAlert(alert.id));
        }
        return;
      }

      if (!alert.triggered) {
        dispatch(markAlertTriggered(alert.id));
        void NotificationService.sendPriceAlert({
          symbol: alert.symbol,
          currentPrice,
          targetPrice: alert.targetPrice,
        });
      }
    });
  }, [prices, alerts, dispatch]);
}
