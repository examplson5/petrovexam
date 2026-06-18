import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const App = () => {
  const [b, setB] = useState(Array(9).fill(null));
  const [x, setX] = useState(true);
  const w = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]
    .find(l => b[l[0]] && b[l[0]] === b[l[1]] && b[l[0]] === b[l[2]])?.[0];
  const winner = w !== undefined ? b[w] : null;
  const draw = !winner && b.every(c => c);

  return (
    <View style={styles.c}>
      <Text style={styles.t}>❌ Крестики-нолики ⭕</Text>
      <Text style={styles.s}>{winner ? `🏆 ${winner} победил!` : draw ? '🤝 Ничья!' : `Ход: ${x ? 'X' : 'O'}`}</Text>
      <View style={styles.board}>
        {b.map((cell, i) => (
          <TouchableOpacity key={i} style={styles.cell} onPress={() => {
            if (cell || winner) return;
            const nb = [...b]; nb[i] = x ? 'X' : 'O'; setB(nb); setX(!x);
          }}>
            <Text style={styles.ct}>{cell}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.r} onPress={() => { setB(Array(9).fill(null)); setX(true); }}>
        <Text style={styles.rt}>🔄 Новая игра</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  c: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5', padding: 20 },
  t: { fontSize: 28, fontWeight: 'bold', marginBottom: 10 },
  s: { fontSize: 22, marginBottom: 20, color: '#333' },
  board: { width: 300, height: 300, flexDirection: 'row', flexWrap: 'wrap', backgroundColor: '#ddd', borderRadius: 8, overflow: 'hidden' },
  cell: { width: 100, height: 100, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd' },
  ct: { fontSize: 48, fontWeight: 'bold', color: '#333' },
  r: { marginTop: 30, paddingVertical: 12, paddingHorizontal: 40, backgroundColor: '#007bff', borderRadius: 8 },
  rt: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default App;