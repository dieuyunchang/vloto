import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Button,
  List,
  Switch,
  Divider,
  Chip,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useData} from '../context/DataContext';

const SettingsScreen = () => {
  const {
    isOnline,
    lastUpdate,
    forceUpdate,
    clearCache,
    getDataAge,
    vietlot45Data,
    vietlot55Data,
  } = useData();

  const [autoUpdate, setAutoUpdate] = useState(true);
  const [notifications, setNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleForceUpdate = async () => {
    try {
      await forceUpdate();
      Alert.alert('Success', 'Data updated successfully!');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update data');
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will remove all cached lottery data. Are you sure?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearCache();
              Alert.alert('Success', 'Cache cleared successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear cache');
            }
          },
        },
      ]
    );
  };

  const getStorageSize = () => {
    let size = 0;
    if (vietlot45Data) {
      size += JSON.stringify(vietlot45Data).length;
    }
    if (vietlot55Data) {
      size += JSON.stringify(vietlot55Data).length;
    }
    return (size / 1024).toFixed(1) + ' KB';
  };

  return (
    <ScrollView style={styles.container}>
      {/* Data Management */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Data Management</Title>
          
          <View style={styles.statusContainer}>
            <Chip 
              icon={isOnline ? 'wifi' : 'wifi-off'}
              mode="outlined"
              style={[styles.statusChip, isOnline ? styles.onlineChip : styles.offlineChip]}
            >
              {isOnline ? 'Online' : 'Offline'}
            </Chip>
            
            {lastUpdate && (
              <Chip 
                icon="update"
                mode="outlined"
                style={styles.statusChip}
              >
                Updated {getDataAge()}
              </Chip>
            )}
          </View>

          <List.Item
            title="Force Update Data"
            description="Manually update lottery data from server"
            left={props => <List.Icon {...props} icon="refresh" />}
            right={props => (
              <Button
                mode="contained"
                onPress={handleForceUpdate}
                disabled={!isOnline}
                style={styles.actionButton}
              >
                Update
              </Button>
            )}
          />

          <List.Item
            title="Clear Cache"
            description="Remove all cached lottery data"
            left={props => <List.Icon {...props} icon="delete" />}
            right={props => (
              <Button
                mode="outlined"
                onPress={handleClearCache}
                style={styles.actionButton}
              >
                Clear
              </Button>
            )}
          />

          <List.Item
            title="Storage Usage"
            description={`Cached data: ${getStorageSize()}`}
            left={props => <List.Icon {...props} icon="storage" />}
          />
        </Card.Content>
      </Card>

      {/* App Preferences */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>App Preferences</Title>
          
          <List.Item
            title="Auto Update"
            description="Automatically update data when online"
            left={props => <List.Icon {...props} icon="sync" />}
            right={props => (
              <Switch
                value={autoUpdate}
                onValueChange={setAutoUpdate}
              />
            )}
          />

          <List.Item
            title="Notifications"
            description="Show notifications for new draws"
            left={props => <List.Icon {...props} icon="notifications" />}
            right={props => (
              <Switch
                value={notifications}
                onValueChange={setNotifications}
              />
            )}
          />

          <List.Item
            title="Dark Mode"
            description="Use dark theme"
            left={props => <List.Icon {...props} icon="dark-mode" />}
            right={props => (
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
              />
            )}
          />
        </Card.Content>
      </Card>

      {/* Data Statistics */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Data Statistics</Title>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {vietlot45Data?.draws?.length || 0}
              </Text>
              <Text style={styles.statLabel}>Mega 6/45 Draws</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {vietlot55Data?.draws?.length || 0}
              </Text>
              <Text style={styles.statLabel}>Mega 6/55 Draws</Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          <List.Item
            title="Data Source"
            description="ketquadientoan.com"
            left={props => <List.Icon {...props} icon="source" />}
          />

          <List.Item
            title="Update Frequency"
            description="Every 6 hours when online"
            left={props => <List.Icon {...props} icon="schedule" />}
          />

          <List.Item
            title="Last Update"
            description={lastUpdate ? lastUpdate.toLocaleString() : 'Never'}
            left={props => <List.Icon {...props} icon="history" />}
          />
        </Card.Content>
      </Card>

      {/* About */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>About VLOTO</Title>
          
          <List.Item
            title="Version"
            description="1.0.0"
            left={props => <List.Icon {...props} icon="info" />}
          />

          <List.Item
            title="Developer"
            description="VLOTO Team"
            left={props => <List.Icon {...props} icon="person" />}
          />

          <List.Item
            title="License"
            description="MIT License"
            left={props => <List.Icon {...props} icon="description" />}
          />

          <View style={styles.aboutText}>
            <Text style={styles.aboutDescription}>
              VLOTO is a Vietnamese lottery number generator with advanced statistical analysis. 
              Generate smart lottery numbers based on historical data and patterns.
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Debug Information */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Debug Information</Title>
          
          <List.Item
            title="Network Status"
            description={isOnline ? 'Connected' : 'Disconnected'}
            left={props => <List.Icon {...props} icon="network-check" />}
          />

          <List.Item
            title="Data Loaded"
            description={`45: ${!!vietlot45Data}, 55: ${!!vietlot55Data}`}
            left={props => <List.Icon {...props} icon="data-usage" />}
          />

          <List.Item
            title="Cache Status"
            description={lastUpdate ? 'Active' : 'Empty'}
            left={props => <List.Icon {...props} icon="cached" />}
          />
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  card: {
    margin: 10,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  statusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 15,
  },
  statusChip: {
    backgroundColor: 'rgba(0, 123, 255, 0.1)',
  },
  onlineChip: {
    borderColor: '#28a745',
  },
  offlineChip: {
    borderColor: '#dc3545',
  },
  actionButton: {
    minWidth: 80,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007bff',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  divider: {
    marginVertical: 10,
  },
  aboutText: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  aboutDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    textAlign: 'center',
  },
});

export default SettingsScreen; 
