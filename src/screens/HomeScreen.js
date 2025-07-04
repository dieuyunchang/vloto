import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import {Card, Title, Paragraph, Button, Chip} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useData} from '../context/DataContext';

const HomeScreen = ({navigation}) => {
  const {
    vietlot45Data,
    vietlot55Data,
    isLoading,
    isOnline,
    lastUpdate,
    forceUpdate,
    getDataAge,
  } = useData();

  const handleRefresh = async () => {
    try {
      await forceUpdate();
    } catch (error) {
      console.error('Failed to update data:', error);
    }
  };

  const getLatestDraw = (data) => {
    if (!data || !data.draws || data.draws.length === 0) return null;
    return data.draws[0];
  };

  const latest45 = getLatestDraw(vietlot45Data);
  const latest55 = getLatestDraw(vietlot55Data);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#007bff" />
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🎰 VLOTO</Text>
          <Text style={styles.headerSubtitle}>Vietnamese Lottery Generator</Text>
          
          {/* Connection Status */}
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
                {getDataAge()}
              </Chip>
            )}
          </View>
        </View>

        {/* Latest Results */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Latest Results</Text>
          
          {/* Mega 6/45 */}
          <Card style={styles.resultCard}>
            <Card.Content>
              <View style={styles.resultHeader}>
                <Icon name="casino" size={24} color="#007bff" />
                <Title style={styles.resultTitle}>Mega 6/45</Title>
              </View>
              
              {latest45 ? (
                <View>
                  <Text style={styles.resultDate}>{latest45.date}</Text>
                  <View style={styles.numbersContainer}>
                    {latest45.numbers.split(' ').map((num, index) => (
                      <View key={index} style={styles.numberBall}>
                        <Text style={styles.numberText}>{num}</Text>
                      </View>
                    ))}
                  </View>
                  <Text style={styles.prizeText}>Prize: {latest45.prize} VND</Text>
                </View>
              ) : (
                <Text style={styles.noDataText}>No data available</Text>
              )}
            </Card.Content>
          </Card>

          {/* Mega 6/55 */}
          <Card style={styles.resultCard}>
            <Card.Content>
              <View style={styles.resultHeader}>
                <Icon name="stars" size={24} color="#667eea" />
                <Title style={styles.resultTitle}>Mega 6/55</Title>
              </View>
              
              {latest55 ? (
                <View>
                  <Text style={styles.resultDate}>{latest55.date}</Text>
                  <View style={styles.numbersContainer}>
                    {latest55.numbers.split(' ').map((num, index) => (
                      <View key={index} style={[styles.numberBall, styles.numberBall55]}>
                        <Text style={styles.numberText}>{num}</Text>
                      </View>
                    ))}
                  </View>
                  <Text style={styles.prizeText}>Prize: {latest55.prize} VND</Text>
                </View>
              ) : (
                <Text style={styles.noDataText}>No data available</Text>
              )}
            </Card.Content>
          </Card>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.actionGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Mega 6/45')}
            >
              <Icon name="casino" size={32} color="#007bff" />
              <Text style={styles.actionTitle}>Generate 6/45</Text>
              <Text style={styles.actionSubtitle}>Smart number selection</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Mega 6/55')}
            >
              <Icon name="stars" size={32} color="#667eea" />
              <Text style={styles.actionTitle}>Generate 6/55</Text>
              <Text style={styles.actionSubtitle}>Advanced analytics</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={handleRefresh}
              disabled={!isOnline}
            >
              <Icon name="refresh" size={32} color={isOnline ? "#28a745" : "#6c757d"} />
              <Text style={[styles.actionTitle, !isOnline && styles.disabledText]}>
                Refresh Data
              </Text>
              <Text style={[styles.actionSubtitle, !isOnline && styles.disabledText]}>
                Update results
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Settings')}
            >
              <Icon name="settings" size={32} color="#6c757d" />
              <Text style={styles.actionTitle}>Settings</Text>
              <Text style={styles.actionSubtitle}>App preferences</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Data Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Statistics</Text>
          
          <Card style={styles.statsCard}>
            <Card.Content>
              <View style={styles.statsRow}>
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
              
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {isLoading ? '...' : (isOnline ? 'Online' : 'Offline')}
                  </Text>
                  <Text style={styles.statLabel}>Status</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {lastUpdate ? getDataAge() : 'Never'}
                  </Text>
                  <Text style={styles.statLabel}>Last Update</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#007bff',
    padding: 20,
    paddingTop: 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e3f2fd',
    textAlign: 'center',
    marginTop: 5,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
    gap: 10,
  },
  statusChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  onlineChip: {
    borderColor: '#28a745',
  },
  offlineChip: {
    borderColor: '#dc3545',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  resultCard: {
    marginBottom: 15,
    elevation: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  resultTitle: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  numbersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  numberBall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberBall55: {
    backgroundColor: '#667eea',
  },
  numberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  prizeText: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: 'bold',
  },
  noDataText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  disabledText: {
    color: '#999',
  },
  statsCard: {
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007bff',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
});

export default HomeScreen; 
