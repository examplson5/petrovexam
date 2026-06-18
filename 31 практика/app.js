import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({ handleNotification: async () => ({ shouldShowAlert: true }) });

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => { load(); Notifications.requestPermissionsAsync(); }, []);

  const load = async () => {
    const data = await AsyncStorage.getItem('tasks');
    if (data) setTasks(JSON.parse(data));
  };

  const save = async (newTasks) => {
    setTasks(newTasks);
    await AsyncStorage.setItem('tasks', JSON.stringify(newTasks));
  };

  const add = () => {
    if (!text.trim()) return;
    save([...tasks, { id: Date.now(), text: text.trim(), done: false, deadline: null }]);
    setText('');
  };

  const toggle = (id) => save(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const del = (id) => Alert.alert('Удалить?', '', [{ text: 'Отмена' }, { text: 'Удалить', onPress: () => save(tasks.filter(t => t.id !== id)) }]);

  const setDeadline = (id) => {
    Alert.prompt('⏰ Срок', 'ДД.ММ.ГГГГ', [
      { text: 'Отмена' },
      { text: 'OK', onPress: (date) => {
          const newTasks = tasks.map(t => t.id === id ? { ...t, deadline: date } : t);
          save(newTasks);
          const [d, m, y] = date.split('.');
          const trigger = new Date(y, m - 1, d, 9, 0);
          if (trigger > new Date()) {
            Notifications.scheduleNotificationAsync({
              content: { title: '⏰ Напоминание', body: `Срок: ${tasks.find(t => t.id === id)?.text}` },
              trigger
            });
          }
        }
      }
    ]);
  };

  return (
    <View style={styles.c}>
      <Text style={styles.t}>📋 Список дел</Text>
      <View style={styles.row}>
        <TextInput style={styles.in} value={text} onChangeText={setText} placeholder="Новая задача..." onSubmitEditing={add} />
        <TouchableOpacity style={styles.btn} onPress={add}><Text style={styles.btnT}>+</Text></TouchableOpacity>
      </View>
      <FlatList
        data={tasks}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.task}>
            <TouchableOpacity onPress={() => toggle(item.id)} style={{ flex: 1 }}>
              <Text style={[styles.taskT, item.done && styles.done]}>{item.text}</Text>
              {item.deadline && <Text style={styles.deadline}>📅 {item.deadline}</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setDeadline(item.id)}><Text>⏰</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => del(item.id)}><Text style={styles.del}>✕</Text></TouchableOpacity>
          </View>
        )}
      />
      <Text style={styles.stat}>✅ {tasks.filter(t => t.done).length} / {tasks.length}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  c: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  t: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  row: { flexDirection: 'row', marginBottom: 20 },
  in: { flex: 1, padding: 12, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  btn: { padding: 12, backgroundColor: '#007bff', borderRadius: 8, marginLeft: 10, justifyContent: 'center' },
  btnT: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  task: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#fff', borderRadius: 8, marginBottom: 8 },
  taskT: { fontSize: 16 },
  done: { textDecorationLine: 'line-through', color: '#999' },
  deadline: { fontSize: 12, color: '#dc3545' },
  del: { color: '#dc3545', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  stat: { marginTop: 10, textAlign: 'center', color: '#666' }
});

export default App;