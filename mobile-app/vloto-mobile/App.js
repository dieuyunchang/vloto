import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Provider as PaperProvider} from 'react-native-paper';
import {Ionicons} from '@expo/vector-icons';

import HomeScreen from './src/screens/HomeScreen';
import Vietlot45Screen from './src/screens/Vietlot45Screen';
import Vietlot55Screen from './src/screens/Vietlot55Screen';
import SettingsScreen from './src/screens/SettingsScreen';
import {DataProvider} from './src/context/DataContext';

const Tab = createBottomTabNavigator();

const theme = {
  colors: {
    primary: '#007bff',
    accent: '#667eea',
    background: '#f8f9fa',
    surface: '#ffffff',
    text: '#333333',
  },
};

function App() {
  return (
    <PaperProvider theme={theme}>
      <DataProvider>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({route}) => ({
              tabBarIcon: ({focused, color, size}) => {
                let iconName;
                switch (route.name) {
                  case 'Home':
                    iconName = focused ? 'home' : 'home-outline';
                    break;
                  case 'Mega 6/45':
                    iconName = focused ? 'dice' : 'dice-outline';
                    break;
                  case 'Mega 6/55':
                    iconName = focused ? 'star' : 'star-outline';
                    break;
                  case 'Settings':
                    iconName = focused ? 'settings' : 'settings-outline';
                    break;
                  default:
                    iconName = 'help-circle';
                }
                return <Ionicons name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: '#007bff',
              tabBarInactiveTintColor: 'gray',
              headerStyle: {
                backgroundColor: '#007bff',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            })}>
            <Tab.Screen 
              name="Home" 
              component={HomeScreen}
              options={{
                title: '🎰 VLOTO',
              }}
            />
            <Tab.Screen 
              name="Mega 6/45" 
              component={Vietlot45Screen}
              options={{
                title: 'Mega 6/45',
              }}
            />
            <Tab.Screen 
              name="Mega 6/55" 
              component={Vietlot55Screen}
              options={{
                title: 'Mega 6/55',
              }}
            />
            <Tab.Screen 
              name="Settings" 
              component={SettingsScreen}
              options={{
                title: 'Settings',
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </DataProvider>
    </PaperProvider>
  );
}

export default App; 
