import React, {createContext, useContext, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import {DataService} from '../services/DataService';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({children}) => {
  const [vietlot45Data, setVietlot45Data] = useState(null);
  const [vietlot55Data, setVietlot55Data] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Monitor network connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected);
      if (state.isConnected) {
        // Auto-update when coming back online
        updateDataIfNeeded();
      }
    });

    return unsubscribe;
  }, []);

  // Load data from local storage on app start
  useEffect(() => {
    loadLocalData();
  }, []);

  const loadLocalData = async () => {
    try {
      setIsLoading(true);
      
      // Load cached data
      const [cached45, cached55, lastUpdateTime] = await Promise.all([
        AsyncStorage.getItem('vietlot45_data'),
        AsyncStorage.getItem('vietlot55_data'),
        AsyncStorage.getItem('last_update'),
      ]);

      // Load cached data or fallback to bundled data
      if (cached45) {
        setVietlot45Data(JSON.parse(cached45));
      } else {
        // Load bundled data if no cache exists
        const bundledData45 = DataService.getBundledVietlot45Data();
        setVietlot45Data(bundledData45);
      }

      if (cached55) {
        setVietlot55Data(JSON.parse(cached55));
      } else {
        // Load bundled data if no cache exists
        const bundledData55 = DataService.getBundledVietlot55Data();
        setVietlot55Data(bundledData55);
      }

      if (lastUpdateTime) {
        setLastUpdate(new Date(lastUpdateTime));
      }

      // Try to fetch new data if needed and online
      if (shouldUpdateData(lastUpdateTime)) {
        await updateDataIfNeeded();
      }
    } catch (error) {
      console.error('Error loading local data:', error);
      // Ensure bundled data is loaded even if there's an error
      try {
        const bundledData45 = DataService.getBundledVietlot45Data();
        const bundledData55 = DataService.getBundledVietlot55Data();
        setVietlot45Data(bundledData45);
        setVietlot55Data(bundledData55);
      } catch (bundledError) {
        console.error('Error loading bundled data:', bundledError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const shouldUpdateData = (lastUpdateTime) => {
    if (!lastUpdateTime) return true;
    
    const lastUpdate = new Date(lastUpdateTime);
    const now = new Date();
    const hoursDiff = (now - lastUpdate) / (1000 * 60 * 60);
    
    // Update if data is older than 6 hours
    return hoursDiff > 6;
  };

  const updateDataIfNeeded = async () => {
    if (!isOnline) {
      console.log('❌ Cannot update data - offline');
      return;
    }

    try {
      console.log('🔄 Starting data update process...');
      
      // Fetch new data from the server/API - handle each independently
      const results = await Promise.allSettled([
        DataService.fetchVietlot45Data(),
        DataService.fetchVietlot55Data(),
      ]);

      console.log('📊 Data fetch results:', {
        vietlot45: results[0].status,
        vietlot55: results[1].status,
      });

      // Handle Vietlot 45 data
      if (results[0].status === 'fulfilled' && results[0].value) {
        console.log('✅ Vietlot 45 data received:', {
          draws: results[0].value.draws?.length || 0,
          hasSummary: !!results[0].value.summary,
        });
        setVietlot45Data(results[0].value);
        await AsyncStorage.setItem('vietlot45_data', JSON.stringify(results[0].value));
        console.log('💾 Vietlot 45 data saved to storage');
      } else {
        console.error('❌ Failed to update Vietlot 45 data:', results[0].reason);
      }

      // Handle Vietlot 55 data
      if (results[1].status === 'fulfilled' && results[1].value) {
        console.log('✅ Vietlot 55 data received:', {
          draws: results[1].value.draws?.length || 0,
          hasSummary: !!results[1].value.summary,
        });
        setVietlot55Data(results[1].value);
        await AsyncStorage.setItem('vietlot55_data', JSON.stringify(results[1].value));
        console.log('💾 Vietlot 55 data saved to storage');
      } else {
        console.error('❌ Failed to update Vietlot 55 data:', results[1].reason);
      }

      // Update timestamp if at least one dataset was updated
      if (results[0].status === 'fulfilled' || results[1].status === 'fulfilled') {
        const now = new Date().toISOString();
        setLastUpdate(new Date(now));
        await AsyncStorage.setItem('last_update', now);
        console.log('⏰ Update timestamp saved:', now);
      } else {
        console.log('⚠️ No data was updated successfully');
      }
    } catch (error) {
      console.error('💥 Error updating data:', error);
      // If update fails completely, keep existing cached data
    }
  };

  const forceUpdate = async () => {
    if (!isOnline) {
      throw new Error('No internet connection');
    }
    await updateDataIfNeeded();
  };

  const clearCache = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem('vietlot45_data'),
        AsyncStorage.removeItem('vietlot55_data'),
        AsyncStorage.removeItem('last_update'),
      ]);
      setVietlot45Data(null);
      setVietlot55Data(null);
      setLastUpdate(null);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  };

  const getDataAge = () => {
    if (!lastUpdate) return null;
    
    const now = new Date();
    const diff = now - lastUpdate;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ago`;
    }
    return `${minutes}m ago`;
  };

  const value = {
    vietlot45Data,
    vietlot55Data,
    isLoading,
    isOnline,
    lastUpdate,
    updateDataIfNeeded,
    forceUpdate,
    clearCache,
    getDataAge,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}; 
