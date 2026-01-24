
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Month {
  id: string;
  name: string;
  isPinned: boolean;
  cash: number;
  expenses: Expense[];
}

interface Expense {
  id: string;
  name: string;
  amount: number;
  isPinned: boolean;
}

interface Subscription {
  id: string;
  name: string;
  monthlyCost: number;
  isPinned: boolean;
}

interface StorageContextType {
  months: Month[];
  subscriptions: Subscription[];
  cashLabel: string;
  selectedMonthId: string;
  setMonths: (months: Month[]) => void;
  setSubscriptions: (subscriptions: Subscription[]) => void;
  setCashLabel: (label: string) => void;
  setSelectedMonthId: (id: string) => void;
  saveData: () => Promise<void>;
  loadData: () => Promise<void>;
  clearData: () => Promise<void>;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

const STORAGE_KEYS = {
  MONTHS: '@easy_budget_months',
  SUBSCRIPTIONS: '@easy_budget_subscriptions',
  CASH_LABEL: '@easy_budget_cash_label',
  SELECTED_MONTH: '@easy_budget_selected_month',
  LAST_LOGIN: '@easy_budget_last_login',
};

const SESSION_DURATION = 60 * 24 * 60 * 60 * 1000; // 60 days in milliseconds

export function StorageProvider({ children }: { children: ReactNode }) {
  const [months, setMonthsState] = useState<Month[]>([
    {
      id: '1',
      name: 'JAN',
      isPinned: false,
      cash: 0,
      expenses: [],
    },
    {
      id: '2',
      name: 'FEB',
      isPinned: false,
      cash: 0,
      expenses: [],
    },
  ]);

  const [subscriptions, setSubscriptionsState] = useState<Subscription[]>([
    { id: '1', name: 'NETFLIX', monthlyCost: 15, isPinned: true },
    { id: '2', name: 'APPLE CARE', monthlyCost: 14, isPinned: false },
  ]);

  const [cashLabel, setCashLabelState] = useState('BUDGET');
  const [selectedMonthId, setSelectedMonthIdState] = useState('1');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Auto-save whenever data changes (after initial load)
  useEffect(() => {
    if (isLoaded) {
      saveData();
    }
  }, [months, subscriptions, cashLabel, selectedMonthId, isLoaded]);

  const checkSession = async (): Promise<boolean> => {
    try {
      const lastLoginStr = await AsyncStorage.getItem(STORAGE_KEYS.LAST_LOGIN);
      if (!lastLoginStr) return false;

      const lastLogin = parseInt(lastLoginStr, 10);
      const now = Date.now();
      const timeDiff = now - lastLogin;

      return timeDiff < SESSION_DURATION;
    } catch (error) {
      console.error('Error checking session:', error);
      return false;
    }
  };

  const updateLastLogin = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_LOGIN, Date.now().toString());
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  };

  const loadData = async () => {
    try {
      const isSessionValid = await checkSession();
      
      if (!isSessionValid) {
        console.log('Session expired, using default data');
        await updateLastLogin();
        setIsLoaded(true);
        return;
      }

      const [monthsData, subsData, labelData, selectedData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.MONTHS),
        AsyncStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS),
        AsyncStorage.getItem(STORAGE_KEYS.CASH_LABEL),
        AsyncStorage.getItem(STORAGE_KEYS.SELECTED_MONTH),
      ]);

      if (monthsData) {
        setMonthsState(JSON.parse(monthsData));
      }
      if (subsData) {
        setSubscriptionsState(JSON.parse(subsData));
      }
      if (labelData) {
        setCashLabelState(labelData);
      }
      if (selectedData) {
        setSelectedMonthIdState(selectedData);
      }

      await updateLastLogin();
      setIsLoaded(true);
      console.log('Data loaded successfully');
    } catch (error) {
      console.error('Error loading data:', error);
      setIsLoaded(true);
    }
  };

  const saveData = async () => {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.MONTHS, JSON.stringify(months)),
        AsyncStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subscriptions)),
        AsyncStorage.setItem(STORAGE_KEYS.CASH_LABEL, cashLabel),
        AsyncStorage.setItem(STORAGE_KEYS.SELECTED_MONTH, selectedMonthId),
      ]);
      console.log('Data saved successfully');
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const clearData = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.MONTHS),
        AsyncStorage.removeItem(STORAGE_KEYS.SUBSCRIPTIONS),
        AsyncStorage.removeItem(STORAGE_KEYS.CASH_LABEL),
        AsyncStorage.removeItem(STORAGE_KEYS.SELECTED_MONTH),
        AsyncStorage.removeItem(STORAGE_KEYS.LAST_LOGIN),
      ]);
      console.log('Data cleared successfully');
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  };

  const setMonths = (newMonths: Month[]) => {
    setMonthsState(newMonths);
  };

  const setSubscriptions = (newSubs: Subscription[]) => {
    setSubscriptionsState(newSubs);
  };

  const setCashLabel = (label: string) => {
    setCashLabelState(label);
  };

  const setSelectedMonthId = (id: string) => {
    setSelectedMonthIdState(id);
  };

  return (
    <StorageContext.Provider
      value={{
        months,
        subscriptions,
        cashLabel,
        selectedMonthId,
        setMonths,
        setSubscriptions,
        setCashLabel,
        setSelectedMonthId,
        saveData,
        loadData,
        clearData,
      }}
    >
      {children}
    </StorageContext.Provider>
  );
}

export function useStorage() {
  const context = useContext(StorageContext);
  if (context === undefined) {
    throw new Error('useStorage must be used within StorageProvider');
  }
  return context;
}
