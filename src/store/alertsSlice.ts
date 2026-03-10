import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Alert, AlertsState } from '@models/stock';

const initialState: AlertsState = {
  list: [],
};

const alertsSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    addAlert: (
      state,
      action: PayloadAction<{ symbol: string; targetPrice: number }>
    ) => {
      const alert: Alert = {
        id: `${action.payload.symbol}-${Date.now()}`,
        symbol: action.payload.symbol,
        targetPrice: action.payload.targetPrice,
        triggered: false,
        createdAt: Date.now(),
      };
      state.list.push(alert);
    },
    removeAlert: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter((a) => a.id !== action.payload);
    },
    markAlertTriggered: (state, action: PayloadAction<string>) => {
      const alert = state.list.find((a) => a.id === action.payload);
      if (alert) {
        alert.triggered = true;
      }
    },
    resetAlert: (state, action: PayloadAction<string>) => {
      const alert = state.list.find((a) => a.id === action.payload);
      if (alert) {
        alert.triggered = false;
      }
    },
  },
});

export const { addAlert, removeAlert, markAlertTriggered, resetAlert } =
  alertsSlice.actions;
export default alertsSlice.reducer;
