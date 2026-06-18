import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

const API_KEY = 'ваш_ключ_newsapi'; // Получить на newsapi.org
const URL = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${API_KEY}`;

const App = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch(URL)
      .then(res => res.json())
      .then(data => setNews(data.articles || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const searchNews = () => {
    setLoading(true);
    fetch(`https://newsapi.org/v2/everything?q=${search}&apiKey=${API_KEY}`)
      .then(res => res.json())
      .then(data => setNews(data.articles || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📰 Новости</Text>
      
      <View style={styles.search}>
        <TextInput style={styles.input} placeholder="Поиск..." value={search} onChangeText={setSearch} onSubmitEditing={searchNews} />
        <TouchableOpacity style={styles.btn} onPress={searchNews}><Text style={styles.btnText}>🔍</Text></TouchableOpacity>
      </View>

      <FlatList
        data={news}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => WebBrowser.openBrowserAsync(item.url)}>
            {item.urlToImage && <Image source={{ uri: item.urlToImage }} style={styles.image} />}
            <Text style={styles.titleText}>{item.title}</Text>
            <Text style={styles.source}>{item.source?.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  search: { flexDirection: 'row', marginBottom: 15, gap: 10 },
  input: { flex: 1, padding: 12, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  btn: { padding: 12, backgroundColor: '#007bff', borderRadius: 8, justifyContent: 'center' },
  btnText: { color: '#fff', fontSize: 20 },
  card: { backgroundColor: '#fff', borderRadius: 8, marginBottom: 10, padding: 10, borderWidth: 1, borderColor: '#eee' },
  image: { width: '100%', height: 150, borderRadius: 8, marginBottom: 8 },
  titleText: { fontSize: 16, fontWeight: 'bold' },
  source: { fontSize: 12, color: '#666', marginTop: 4 }
});

export default App;