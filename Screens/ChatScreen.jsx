import React, { useState } from 'react';
import { View, TextInput, Button, FlatList, Text, TouchableOpacity } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import useChatStore from '../Stores/useChatStore';

const ChatScreen =()=> {
  const { messages, sendMessage } = useChatStore();
  const [input, setInput] = useState('');
  const [file, setFile] = useState(null);

  const handleSend = () => {
    const message = {
      id: Date.now().toString(),
      text: input,
      from: 'yo',
      to: ['usuario_destino'],
      file,
      fileUrl: file ? file.uri : null,
    };

    sendMessage(message);
    setInput('');
    setFile(null);

    // Simula una respuesta automática
    setTimeout(() => {
      sendMessage({
        id: (Date.now() + 1).toString(),
        text: 'Respuesta automática',
        from: 'otro_usuario',
        to: ['yo'],
      });
    }, 1000);
  };

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({});
    if (!result.canceled) setFile(result.assets[0]);
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ marginVertical: 4 }}>
            <Text>{item.from}: {item.text}</Text>
            {item.fileUrl && (
              <Text style={{ color: 'blue' }}>📎 Archivo adjunto</Text>
            )}
          </View>
        )}
      />

      <TextInput
        value={input}
        onChangeText={setInput}
        placeholder="Escribe..."
        style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, marginVertical: 8 }}
      />

      <TouchableOpacity onPress={pickFile} style={{ marginBottom: 8 }}>
        <Text style={{ color: 'blue' }}>
          {file ? 'Archivo seleccionado ✔' : 'Adjuntar archivo'}
        </Text>
      </TouchableOpacity>

      <Button title="Enviar" onPress={handleSend} />
    </View>
  );
}
export default ChatScreen;      