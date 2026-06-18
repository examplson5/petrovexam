import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';

const Stack = createNativeStackNavigator();

// Данные
const items = [
  { id: 1, title: 'iPhone 15', desc: 'Флагманский смартфон Apple', price: '99 990 ₽' },
  { id: 2, title: 'Samsung S24', desc: 'Флагман Samsung с AI', price: '89 990 ₽' },
  { id: 3, title: 'Google Pixel 8', desc: 'Камера с AI обработкой', price: '79 990 ₽' },
  { id: 4, title: 'Xiaomi Mi 14', desc: 'Доступный флагман', price: '69 990 ₽' }
];

// Главный экран
const HomeScreen = ({ navigation }) => (
  <View style={styles.container}>
    <Text style={styles.title}>📱 Товары</Text>
    <FlatList
      data={items}
      keyExtractor={item => item.id.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity 
          style={styles.item}
          onPress={() => navigation.navigate('Details', { item })}
        >
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemPrice}>{item.price}</Text>
        </TouchableOpacity>
      )}
    />
  </View>
);

// Экран деталей
const DetailsScreen = ({ route }) => {
  const { item } = route.params;
  return (
    <View style={styles.container}>
      <Text style={styles.detailTitle}>{item.title}</Text>
      <Text style={styles.detailPrice}>{item.price}</Text>
      <Text style={styles.detailDesc}>{item.desc}</Text>
    </View>
  );
};

// Приложение
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Главная' }} />
        <Stack.Screen name="Details" component={DetailsScreen} options={{ title: 'Детали' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  item: { padding: 15, backgroundColor: '#fff', borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
  itemTitle: { fontSize: 18, fontWeight: 'bold' },
  itemPrice: { fontSize: 14, color: '#007bff', marginTop: 5 },
  detailTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 10 },
  detailPrice: { fontSize: 22, color: '#007bff', marginBottom: 15 },
  detailDesc: { fontSize: 16, color: '#666' }
});