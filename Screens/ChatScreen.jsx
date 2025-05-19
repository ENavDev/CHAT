import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, Button, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { BlobServiceClient } from '@azure/storage-blob';

const AZURE_STORAGE_CONNECTION_STRING = '<TU_CONEXION_AZURE_STORAGE>'; // Pon aquí tu cadena de conexión

const ChatScreen = ({ route }) => {
  const { user } = route.params;
  const [recipients, setRecipients] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setRecipients([
      'user1@example.com',
      'user2@example.com',
      'user3@example.com',
      'luis@gmail.com',
      'ana@gmail.com',
      'jose@example.com',
    ]);
  }, []);

  // Función para subir archivo a Azure Blob Storage
  const uploadFileToAzure = async (file) => {
    try {
      setUploading(true);

      // Crear cliente del servicio
      const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

      // Nombre del contenedor (debe existir en tu cuenta)
      const containerName = 'chat-files';
      const containerClient = blobServiceClient.getContainerClient(containerName);

      // Nombre del blob (archivo)
      const blobName = `${Date.now()}-${file.name}`;

      // Crear blockBlobClient
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      // Obtener datos del archivo
      const response = await fetch(file.uri);
      const fileBlob = await response.blob();

      // Subir blob
      await blockBlobClient.uploadData(fileBlob, {
        blobHTTPHeaders: { blobContentType: file.mimeType || 'application/octet-stream' },
      });

      setUploading(false);
      // URL pública o SAS según configuración de contenedor
      const url = blockBlobClient.url;
      return url;
    } catch (error) {
      setUploading(false);
      Alert.alert('Error', 'No se pudo subir el archivo: ' + error.message);
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (!selectedRecipient) {
      Alert.alert('Error', 'Selecciona un destinatario');
      return;
    }
    if (!message && !file) {
      Alert.alert('Error', 'Escribe un mensaje o adjunta un archivo');
      return;
    }

    let fileUrl = null;
    if (file) {
      try {
        fileUrl = await uploadFileToAzure(file);
      } catch (error) {
        return; // Ya se mostró error en uploadFileToAzure
      }
    }

    const msg = {
      id: Date.now().toString(),
      from: user.email,
      to: selectedRecipient,
      content: message,
      file: fileUrl,
      timestamp: new Date().toISOString(),
    };

    // Aquí enviarías msg a tu backend (API + Azure Queue)
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
            <View style={styles.messageItem}>
              <Text>{item.from}: {item.content}</Text>
              {item.file && (
                <Text style={styles.fileLink} onPress={() => {
                  // Abrir enlace o visor de archivos
                  Alert.alert('Archivo adjunto', item.file);
                }}>
                  (Archivo adjunto)
                </Text>
              )}
            </View>
          )}
        />
        <TextInput
          placeholder="Escribe un mensaje"
          value={message}
          onChangeText={setMessage}
          style={styles.input}
          editable={!uploading}
        />
        <View style={styles.buttonRow}>
          <Button title="Adjuntar archivo" onPress={handlePickFile} disabled={uploading} />
          <Button title={uploading ? "Subiendo..." : "Enviar"} onPress={handleSendMessage} disabled={uploading} />
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
  fileLink: { color: 'blue', textDecorationLine: 'underline' },
  input: { borderWidth: 1, padding: 8, marginVertical: 10 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
});

export default ChatScreen;
