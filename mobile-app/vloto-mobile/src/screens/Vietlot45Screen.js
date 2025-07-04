import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Button,
  Chip,
  ActivityIndicator,
  Divider,
} from 'react-native-paper';
import {Ionicons} from '@expo/vector-icons';
import {useData} from '../context/DataContext';
import {LotteryGenerator} from '../utils/LotteryGenerator';

const Vietlot45Screen = () => {
  const {vietlot45Data, isLoading} = useData();
  const [generatedNumbers, setGeneratedNumbers] = useState([]);
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [generationStrategy, setGenerationStrategy] = useState('smart');
  const [multipleGroups, setMultipleGroups] = useState([]);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const strategies = [
    {key: 'smart', label: 'Smart', icon: 'bulb'},
    {key: 'hot', label: 'Hot Numbers', icon: 'flame'},
    {key: 'cold', label: 'Cold Numbers', icon: 'snow'},
    {key: 'balanced', label: 'Balanced', icon: 'scale'},
    {key: 'random', label: 'Random', icon: 'shuffle'},
  ];

  const generateNumbers = (strategy = generationStrategy) => {
    if (!vietlot45Data) {
      Alert.alert('No Data', 'Lottery data is not available. Please check your connection.');
      return;
    }

    let numbers;
    switch (strategy) {
      case 'hot':
        numbers = LotteryGenerator.generateByFrequency(vietlot45Data, 45, 6, 'hot');
        break;
      case 'cold':
        numbers = LotteryGenerator.generateByFrequency(vietlot45Data, 45, 6, 'cold');
        break;
      case 'balanced':
        numbers = LotteryGenerator.generateByFrequency(vietlot45Data, 45, 6, 'balanced');
        break;
      case 'random':
        numbers = LotteryGenerator.generateRandomNumbers(45, 6);
        break;
      case 'smart':
      default:
        numbers = LotteryGenerator.generateSmartNumbers(vietlot45Data, 45, 6);
        break;
    }

    setGeneratedNumbers(numbers);
    setShowAnalysis(true);
  };

  const generateMultiple = () => {
    if (!vietlot45Data) {
      Alert.alert('No Data', 'Lottery data is not available. Please check your connection.');
      return;
    }

    const groups = LotteryGenerator.generateMultipleGroups(
      vietlot45Data,
      45,
      6,
      5,
      generationStrategy
    );
    setMultipleGroups(groups);
  };

  const toggleNumberSelection = (number) => {
    if (selectedNumbers.includes(number)) {
      setSelectedNumbers(selectedNumbers.filter(n => n !== number));
    } else if (selectedNumbers.length < 6) {
      setSelectedNumbers([...selectedNumbers, number].sort((a, b) => a - b));
    }
  };

  const clearSelection = () => {
    setSelectedNumbers([]);
  };

  const analyzeSelection = () => {
    if (selectedNumbers.length !== 6) {
      Alert.alert('Invalid Selection', 'Please select exactly 6 numbers.');
      return;
    }

    setGeneratedNumbers(selectedNumbers);
    setShowAnalysis(true);
  };

  const getNumberColor = (number) => {
    if (!vietlot45Data || !vietlot45Data.summary) return '#FFD700';
    
    const frequencyClass = LotteryGenerator.getNumberFrequencyClass(
      number,
      vietlot45Data.summary,
      45
    );
    
    const colors = LotteryGenerator.getFrequencyColors(45);
    return colors[frequencyClass] || '#FFD700';
  };

  const renderNumberGrid = () => {
    const numbers = Array.from({length: 45}, (_, i) => i + 1);
    
    return (
      <View style={styles.numberGrid}>
        {numbers.map(number => (
          <TouchableOpacity
            key={number}
            style={[
              styles.numberButton,
              selectedNumbers.includes(number) && styles.selectedNumber,
              {backgroundColor: getNumberColor(number)},
            ]}
            onPress={() => toggleNumberSelection(number)}
          >
            <Text style={[
              styles.numberButtonText,
              selectedNumbers.includes(number) && styles.selectedNumberText,
            ]}>
              {number}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderAnalysis = () => {
    if (!showAnalysis || generatedNumbers.length === 0) return null;

    const analysis = LotteryGenerator.analyzeNumbers(
      generatedNumbers,
      vietlot45Data,
      45
    );

    if (!analysis) return null;

    return (
      <Card style={styles.analysisCard}>
        <Card.Content>
          <Title style={styles.analysisTitle}>Number Analysis</Title>
          
          <View style={styles.generatedNumbersContainer}>
            {generatedNumbers.map((number, index) => (
              <View
                key={index}
                style={[
                  styles.generatedNumber,
                  {backgroundColor: getNumberColor(number)},
                ]}
              >
                <Text style={styles.generatedNumberText}>{number}</Text>
              </View>
            ))}
          </View>

          <View style={styles.analysisStats}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Total Appearances:</Text>
              <Text style={styles.statValue}>{analysis.totalAppearances}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Average Frequency:</Text>
              <Text style={styles.statValue}>{analysis.averageFrequency.toFixed(1)}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Hot Numbers:</Text>
              <Text style={styles.statValue}>{analysis.hotNumbers}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Medium Numbers:</Text>
              <Text style={styles.statValue}>{analysis.mediumNumbers}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Cold Numbers:</Text>
              <Text style={styles.statValue}>{analysis.coldNumbers}</Text>
            </View>
          </View>

          <View style={styles.frequencyDetails}>
            <Text style={styles.frequencyTitle}>Frequency Details:</Text>
            {analysis.frequencies.map((item, index) => (
              <View key={index} style={styles.frequencyItem}>
                <View style={[
                  styles.frequencyNumber,
                  {backgroundColor: getNumberColor(item.number)},
                ]}>
                  <Text style={styles.frequencyNumberText}>{item.number}</Text>
                </View>
                <Text style={styles.frequencyText}>
                  {item.frequency} times ({item.percentage}%) - {item.class}
                </Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading lottery data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Strategy Selection */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Generation Strategy</Title>
          <View style={styles.strategyContainer}>
            {strategies.map(strategy => (
              <Chip
                key={strategy.key}
                mode={generationStrategy === strategy.key ? 'flat' : 'outlined'}
                selected={generationStrategy === strategy.key}
                onPress={() => setGenerationStrategy(strategy.key)}
                style={styles.strategyChip}
                icon={strategy.icon}
              >
                {strategy.label}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Generation Buttons */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Generate Numbers</Title>
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={() => generateNumbers()}
              style={styles.generateButton}
              icon="dice"
            >
              Generate Single Set
            </Button>
            <Button
              mode="contained"
              onPress={generateMultiple}
              style={styles.generateButton}
              icon="copy"
            >
              Generate 5 Sets
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Manual Selection */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Manual Selection</Title>
          <Text style={styles.selectionInfo}>
            Selected: {selectedNumbers.length}/6 numbers
          </Text>
          <View style={styles.selectionButtons}>
            <Button
              mode="outlined"
              onPress={clearSelection}
              style={styles.selectionButton}
              icon="close"
            >
              Clear
            </Button>
            <Button
              mode="contained"
              onPress={analyzeSelection}
              style={styles.selectionButton}
              icon="analytics"
              disabled={selectedNumbers.length !== 6}
            >
              Analyze
            </Button>
          </View>
          {renderNumberGrid()}
        </Card.Content>
      </Card>

      {/* Analysis Results */}
      {renderAnalysis()}

      {/* Multiple Groups */}
      {multipleGroups.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Generated Sets</Title>
            {multipleGroups.map((group, index) => (
              <View key={index} style={styles.groupContainer}>
                <Text style={styles.groupTitle}>Set {group.id}</Text>
                <View style={styles.groupNumbers}>
                  {group.numbers.map((number, numIndex) => (
                    <View
                      key={numIndex}
                      style={[
                        styles.groupNumber,
                        {backgroundColor: getNumberColor(number)},
                      ]}
                    >
                      <Text style={styles.groupNumberText}>{number}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Legend */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Frequency Legend</Title>
          <View style={styles.legendContainer}>
            {Object.entries(LotteryGenerator.getFrequencyColors(45)).map(([key, color]) => (
              <View key={key} style={styles.legendItem}>
                <View style={[styles.legendColor, {backgroundColor: color}]} />
                <Text style={styles.legendText}>{key}</Text>
              </View>
            ))}
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
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
  strategyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  strategyChip: {
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  generateButton: {
    flex: 1,
  },
  selectionInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  selectionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  selectionButton: {
    flex: 1,
  },
  numberGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  numberButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
  },
  numberButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  selectedNumber: {
    borderWidth: 3,
    borderColor: '#000',
  },
  selectedNumberText: {
    color: '#000',
  },
  analysisCard: {
    margin: 10,
    elevation: 2,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  generatedNumbersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 15,
    justifyContent: 'center',
  },
  generatedNumber: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  generatedNumberText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  analysisStats: {
    marginBottom: 15,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  frequencyDetails: {
    marginTop: 10,
  },
  frequencyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  frequencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  frequencyNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  frequencyNumberText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  frequencyText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  groupContainer: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  groupNumbers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  groupNumber: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupNumberText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
});

export default Vietlot45Screen; 
