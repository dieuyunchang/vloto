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

      if (cached45) {
        setVietlot45Data(JSON.parse(cached45));
      }
      if (cached55) {
        setVietlot55Data(JSON.parse(cached55));
      }
      if (lastUpdateTime) {
        setLastUpdate(new Date(lastUpdateTime));
      }

      // If no cached data or data is old, try to fetch new data
      if (!cached45 || !cached55 || shouldUpdateData(lastUpdateTime)) {
        await updateDataIfNeeded();
      }
    } catch (error) {
      console.error('Error loading local data:', error);
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
    if (!isOnline) return;

    try {
      console.log('Updating lottery data...');
      
      // Fetch new data from the server/API
      const [newData45, newData55] = await Promise.all([
        DataService.fetchVietlot45Data(),
        DataService.fetchVietlot55Data(),
      ]);

      if (newData45) {
        setVietlot45Data(newData45);
        await AsyncStorage.setItem('vietlot45_data', JSON.stringify(newData45));
      }

      if (newData55) {
        setVietlot55Data(newData55);
        await AsyncStorage.setItem('vietlot55_data', JSON.stringify(newData55));
      }

      const now = new Date().toISOString();
      setLastUpdate(new Date(now));
      await AsyncStorage.setItem('last_update', now);

      console.log('Data updated successfully');
    } catch (error) {
      console.error('Error updating data:', error);
      // If update fails, use cached data
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
