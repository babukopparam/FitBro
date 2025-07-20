// src/screens/LogWorkoutScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const API_BASE = "http://192.168.0.110:8000"; // Replace with your actual IP

// Note: Replace with your actual server IP address
// Find your IP with: ipconfig (Windows) or ifconfig (Mac/Linux)

function getAuthHeaders() {
  // For mobile app, we'll use a simple token storage
  // In production, use secure storage like AsyncStorage
  const token = "your-auth-token-here"; // Replace with actual token
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function isTimeBased(entry) {
  return entry && entry.planned_minutes !== null && entry.planned_minutes !== undefined;
}

const LogWorkoutScreen = () => {
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState("");
  const [cycles, setCycles] = useState([]);
  const [selectedCycle, setSelectedCycle] = useState("");
  const [planEntries, setPlanEntries] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load members
  useEffect(() => {
    const loadMembers = async () => {
      try {
        const response = await fetch(`${API_BASE}/members/`, { 
          headers: getAuthHeaders() 
        });
        const data = await response.json();
        setMembers(data);
      } catch (error) {
        Alert.alert('Error', 'Failed to load members. Please check your connection.');
        console.error('Error loading members:', error);
      }
    };
    loadMembers();
  }, []);

  // On member change, update cycles
  useEffect(() => {
    if (!selectedMember) return;
    const member = members.find(m => m.id === Number(selectedMember));
    setCycles(member?.cycles || []);
    setSelectedCycle(member?.cycles?.[0]?.cycle_number || "");
  }, [selectedMember, members]);

  // Load plan entries for selected member/cycle
  useEffect(() => {
    if (!selectedMember || !selectedCycle) return;
    setLoading(true);
    
    const loadPlanEntries = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/workout-plan-entries/?member_id=${selectedMember}&cycle_number=${selectedCycle}`,
          { headers: getAuthHeaders() }
        );
        const data = await response.json();
        setPlanEntries(data);
      } catch (error) {
        Alert.alert('Error', 'Failed to load workout plan');
        console.error('Error loading plan entries:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadPlanEntries();
  }, [selectedMember, selectedCycle]);

  // Load logs for selected member/cycle
  useEffect(() => {
    if (!selectedMember || !selectedCycle) return;
    setLoading(true);
    
    const loadLogs = async () => {
      try {
        const response = await fetch(`${API_BASE}/workout-logs/`, { 
          headers: getAuthHeaders() 
        });
        const data = await response.json();
        const filtered = data.filter(l =>
          l.member_id === Number(selectedMember) &&
          l.cycle_number === Number(selectedCycle)
        );
        setLogs(filtered);
      } catch (error) {
        Alert.alert('Error', 'Failed to load workout logs');
        console.error('Error loading logs:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadLogs();
  }, [selectedMember, selectedCycle]);

  // Combine planEntries with logs for display
  function getDayExerciseRows() {
    const byDay = {};
    planEntries.forEach(entry => {
      if (!byDay[entry.day_number]) byDay[entry.day_number] = [];
      byDay[entry.day_number].push(entry);
    });
    
    const rows = [];
    Object.entries(byDay).sort((a, b) => a[0] - b[0]).forEach(([day, entries]) => {
      entries.forEach(entry => {
        const log = logs.find(l => l.plan_entry_id === entry.id);
        rows.push({
          day: Number(day),
          ...entry,
          log,
        });
      });
    });
    return rows;
  }

  // Handle actual field changes
  const handleActualChange = (rowIdx, field, value) => {
    setLogs(list => {
      const newList = [...list];
      let row = getDayExerciseRows()[rowIdx];
      let log = row.log ? { ...row.log } : {
        plan_entry_id: row.id,
        member_id: row.member_id,
        cycle_number: row.cycle_number,
        day_number: row.day_number,
        exercise_id: row.exercise_id,
      };
      log[field] = value;
      
      const logIdx = list.findIndex(l => l.plan_entry_id === row.id);
      if (logIdx !== -1) newList[logIdx] = log;
      else newList.push(log);
      return newList;
    });
  };

  // Mark as completed
  const handleMarkCompleted = async (rowIdx) => {
    const row = getDayExerciseRows()[rowIdx];
    let log = row.log ? { ...row.log } : {
      plan_entry_id: row.id,
      member_id: row.member_id,
      cycle_number: row.cycle_number,
      day_number: row.day_number,
      exercise_id: row.exercise_id
    };
    
    // Fill actuals from plan if not set
    if (isTimeBased(row)) {
      log.actual_minutes = log.actual_minutes || row.planned_minutes;
    } else {
      log.actual_sets = log.actual_sets || row.planned_sets;
      log.actual_reps = log.actual_reps || row.planned_reps;
      log.actual_weight = log.actual_weight || row.planned_weight;
    }
    log.status = "completed";
    
    try {
      const method = log.id ? "PATCH" : "POST";
      const url = log.id 
        ? `${API_BASE}/workout-logs/${log.id}` 
        : `${API_BASE}/workout-logs/`;
      
      const response = await fetch(url, {
        method,
        headers: { 
          ...getAuthHeaders(), 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify(log)
      });
      
      if (!response.ok) throw new Error("Failed to save log");
      
      Alert.alert('Success', 'Marked as completed!');
      
      // Refresh logs
      const logsResponse = await fetch(`${API_BASE}/workout-logs/`, { 
        headers: getAuthHeaders() 
      });
      const logsData = await logsResponse.json();
      const filtered = logsData.filter(l =>
        l.member_id === Number(selectedMember) &&
        l.cycle_number === Number(selectedCycle)
      );
      setLogs(filtered);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  // Mark as skipped
  const handleSkip = async (rowIdx) => {
    const row = getDayExerciseRows()[rowIdx];
    let log = row.log ? { ...row.log } : {
      plan_entry_id: row.id,
      member_id: row.member_id,
      cycle_number: row.cycle_number,
      day_number: row.day_number,
      exercise_id: row.exercise_id
    };
    log.status = "skipped";
    
    try {
      const method = log.id ? "PATCH" : "POST";
      const url = log.id 
        ? `${API_BASE}/workout-logs/${log.id}` 
        : `${API_BASE}/workout-logs/`;
      
      const response = await fetch(url, {
        method,
        headers: { 
          ...getAuthHeaders(), 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify(log)
      });
      
      if (!response.ok) throw new Error("Failed to skip log");
      
      Alert.alert('Success', 'Marked as skipped.');
      
      // Refresh logs
      const logsResponse = await fetch(`${API_BASE}/workout-logs/`, { 
        headers: getAuthHeaders() 
      });
      const logsData = await logsResponse.json();
      const filtered = logsData.filter(l =>
        l.member_id === Number(selectedMember) &&
        l.cycle_number === Number(selectedCycle)
      );
      setLogs(filtered);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const renderActualFields = (row, rowIdx, isDone) => {
    if (isTimeBased(row)) {
      return (
        <View style={styles.actualFieldsContainer}>
          <View style={styles.plannedChip}>
            <Text style={styles.plannedText}>Planned: {row.planned_minutes} min</Text>
          </View>
          <TextInput
            style={[styles.input, isDone && styles.disabledInput]}
            placeholder="Actual Minutes"
            value={row.log?.actual_minutes?.toString() || ""}
            onChangeText={(text) => handleActualChange(rowIdx, "actual_minutes", text)}
            keyboardType="numeric"
            editable={!isDone}
          />
        </View>
      );
    } else {
      return (
        <View style={styles.actualFieldsContainer}>
          <View style={styles.plannedChip}>
            <Text style={styles.plannedText}>
              Planned: {row.planned_sets} × {row.planned_reps} @ {row.planned_weight} kg
            </Text>
          </View>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.smallInput, isDone && styles.disabledInput]}
              placeholder="Sets"
              value={row.log?.actual_sets?.toString() || ""}
              onChangeText={(text) => handleActualChange(rowIdx, "actual_sets", text)}
              keyboardType="numeric"
              editable={!isDone}
            />
            <TextInput
              style={[styles.smallInput, isDone && styles.disabledInput]}
              placeholder="Reps"
              value={row.log?.actual_reps?.toString() || ""}
              onChangeText={(text) => handleActualChange(rowIdx, "actual_reps", text)}
              keyboardType="numeric"
              editable={!isDone}
            />
            <TextInput
              style={[styles.input, isDone && styles.disabledInput]}
              placeholder="Weight (kg)"
              value={row.log?.actual_weight?.toString() || ""}
              onChangeText={(text) => handleActualChange(rowIdx, "actual_weight", text)}
              keyboardType="numeric"
              editable={!isDone}
            />
          </View>
        </View>
      );
    }
  };

  const rows = getDayExerciseRows();

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Log Workout</Text>
          
          <View style={styles.selectorsContainer}>
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Select Member</Text>
              <Picker
                selectedValue={selectedMember}
                style={styles.picker}
                onValueChange={(value) => setSelectedMember(value)}
              >
                <Picker.Item label="Select Member" value="" />
                {members.map(m => (
                  <Picker.Item key={m.id} label={m.name} value={m.id} />
                ))}
              </Picker>
            </View>
            
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Select Cycle</Text>
              <Picker
                selectedValue={selectedCycle}
                style={styles.picker}
                onValueChange={(value) => setSelectedCycle(value)}
              >
                <Picker.Item label="Select Cycle" value="" />
                {cycles.map(c => (
                  <Picker.Item 
                    key={c.cycle_number} 
                    label={`Cycle ${c.cycle_number}`} 
                    value={c.cycle_number} 
                  />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#667eea" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        )}

        <View style={styles.workoutList}>
          {rows.map((row, idx) => {
            const isCompleted = row.log?.status === "completed";
            const isSkipped = row.log?.status === "skipped";
            
            return (
              <View 
                key={row.id} 
                style={[
                  styles.workoutCard,
                  isCompleted && styles.completedCard,
                  isSkipped && styles.skippedCard
                ]}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.exerciseTitle}>
                    Day {row.day} - {row.exercise_name || row.exercise_id}
                  </Text>
                  <View style={styles.statusContainer}>
                    <View style={styles.workoutChip}>
                      <Text style={styles.workoutText}>
                        {row.workout_name || row.workout_id}
                      </Text>
                    </View>
                    {isCompleted && (
                      <View style={styles.completedChip}>
                        <Ionicons name="checkmark-circle" size={16} color="#fff" />
                        <Text style={styles.completedText}>Completed</Text>
                      </View>
                    )}
                    {isSkipped && (
                      <View style={styles.skippedChip}>
                        <Ionicons name="close-circle" size={16} color="#fff" />
                        <Text style={styles.skippedText}>Skipped</Text>
                      </View>
                    )}
                  </View>
                </View>
                
                {renderActualFields(row, idx, isCompleted || isSkipped)}
                
                {!isCompleted && !isSkipped && (
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={styles.completeButton}
                      onPress={() => handleMarkCompleted(idx)}
                    >
                      <Ionicons name="checkmark" size={20} color="#fff" />
                      <Text style={styles.buttonText}>Complete</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.skipButton}
                      onPress={() => handleSkip(idx)}
                    >
                      <Ionicons name="close" size={20} color="#fff" />
                      <Text style={styles.buttonText}>Skip</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
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
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  selectorsContainer: {
    gap: 15,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  pickerLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    marginLeft: 12,
  },
  picker: {
    height: 50,
    marginTop: -5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  workoutList: {
    padding: 15,
  },
  workoutCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completedCard: {
    opacity: 0.7,
    backgroundColor: '#f8f9fa',
  },
  skippedCard: {
    opacity: 0.7,
    backgroundColor: '#fff5f5',
  },
  cardHeader: {
    marginBottom: 15,
  },
  exerciseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  workoutChip: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  workoutText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '500',
  },
  completedChip: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  completedText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  skippedChip: {
    backgroundColor: '#ff9800',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  skippedText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  plannedChip: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  plannedText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  actualFieldsContainer: {
    marginBottom: 15,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  smallInput: {
    flex: 0.5,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#999',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  completeButton: {
    flex: 1,
    backgroundColor: '#4caf50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  skipButton: {
    flex: 1,
    backgroundColor: '#ff9800',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LogWorkoutScreen;
