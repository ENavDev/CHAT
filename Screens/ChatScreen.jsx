import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, Button, TouchableOpacity, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';

const ChatScreen = ({ route }) => {
  const { user } = route.params;
  const [recipients, setRecipients] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [file, setFile] = useState(null);

  useEffect(() => {
    // Simular carga de destinatarios
    setRecipients([
      'user1@example.com',
      'user2@example.com',
      'user3@example.com',
      'luis@gmail.com',
      'ana@gmail.com',
      'jose@example.com',
    ]);
  }, []);

  const handleSendMessage = async () => {
    if (!selectedRecipient || !message) return;

    const msg = {
      id: Date.now().toString(),
      from: user.email,
      to: selectedRecipient,
      content: message,
      file: file ? file.name : null,
      timestamp: new Date().toISOString(),
    };

    // Aquí enviarías el mensaje a tu backend (API + Azure Queue)
    console.log('Enviando mensaje:', msg);

    setMessages((prev) => [...prev, msg]);
    setMessage('');
    setFile(null);
  };

  const handlePickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({});
    if (result.type === 'success') {
      setFile(result);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.recipientsContainer}>
        <Text style={styles.title}>Destinatarios</Text>
        <FlatList
          data={recipients}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.recipientItem, selectedRecipient === item && styles.selected]}
              onPress={() => setSelectedRecipient(item)}>
              <Text>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
      <View style={styles.chatContainer}>
        <Text style={styles.chatTitle}>
          {selectedRecipient ? `Chat con: ${selectedRecipient}` : 'Selecciona un destinatario'}
        </Text>
        <FlatList
          data={messages.filter((m) => m.to === selectedRecipient)}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Text style={styles.messageItem}>
              {item.content} {item.file && `(Adjunto: ${item.file})`}
            </Text>
          )}
        />
        <TextInput
          placeholder="Escribe un mensaje"
          value={message}
          onChangeText={setMessage}
          style={styles.input}
        />
        <View style={styles.buttonRow}>
          <Button title="Adjuntar archivo" onPress={handlePickFile} />
          <Button title="Enviar" onPress={handleSendMessage} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row' },
  recipientsContainer: { width: '35%', padding: 10, borderRightWidth: 1 },
  chatContainer: { flex: 1, padding: 10 },
  title: { fontSize: 18, marginBottom: 10 },
  chatTitle: { fontSize: 16, marginBottom: 10 },
  recipientItem: { padding: 10 },
  selected: { backgroundColor: '#cce5ff' },
  messageItem: { paddingVertical: 5 },
  input: { borderWidth: 1, padding: 8, marginVertical: 10 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
});

export default ChatScreen;
