import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';

const MensajesApp = () => {
  const [activeSection, setActiveSection] = useState('enviar');
  const [message, setMessage] = useState('');
  const [recipients, setRecipients] = useState('');
  const [file, setFile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({});
    if (result.type === 'success') setFile(result);
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch('http://192.168.1.XX:3000/api/messages');
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async () => {
    const formData = new FormData();
    formData.append('message', message);
    formData.append('recipients', recipients);
    if (file) {
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: '*/*',
      });
    }

    try {
      const response = await fetch('http://192.168.1.10:3000/api/message', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        Alert.alert('Error', 'No se pudo enviar el mensaje');
        return;
      }

      Alert.alert('Éxito', 'Mensaje enviado correctamente');
      setMessage('');
      setRecipients('');
      setFile(null);
      // Opcional: puedes recargar los mensajes aquí
      // fetchMessages();
    } catch (err) {
      Alert.alert('Error', 'No se pudo conectar con el servidor');
      console.error(err);
    }
  };

  const deleteMessage = async id => {
    Alert.alert('Confirmar', '¿Eliminar este mensaje?', [
      { text: 'Cancelar' },
      {
        text: 'Eliminar',
        onPress: async () => {
          await fetch(`/api/messages/${id}`, { method: 'DELETE' });
          fetchMessages();
        },
      },
    ]);
  };

  const searchByRecipient = async () => {
    const res = await fetch(`/api/messages/recipient/${searchQuery}`);
    const data = await res.json();
    setSearchResults(data);
  };

  useEffect(() => {
    if (activeSection === 'todos') fetchMessages();
  }, [activeSection]);

  const renderMessage = ({ item }) => (
    <View style={styles.messageCard}>
      <Text><Text style={styles.bold}>{item.recipients}:</Text> {item.message}</Text>
      {item.fileUrl && (
        <Text style={styles.fileLink} onPress={() => Linking.openURL(item.fileUrl)}>
          [Archivo]
        </Text>
      )}
      <TouchableOpacity onPress={() => deleteMessage(item._id)}>
        <Text style={styles.delete}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => setActiveSection('enviar')}
        >
          <Text style={styles.navButtonText}>Enviar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => setActiveSection('todos')}
        >
          <Text style={styles.navButtonText}>Todos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => setActiveSection('buscar')}
        >
          <Text style={styles.navButtonText}>Destinatarios</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {activeSection === 'enviar' && (
          <View>
            <Text style={styles.title}>Enviar Mensaje</Text>
            <TextInput
              placeholder="Mensaje"
              value={message}
              onChangeText={setMessage}
              style={styles.input}
            />
            <TextInput
              placeholder="Destinatario"
              value={recipients}
              onChangeText={setRecipients}
              style={styles.input}
            />
            <View style={styles.actionButton}>
              <Button title="Seleccionar archivo" onPress={pickFile} />
            </View>
            {file && <Text style={styles.fileName}>{file.name}</Text>}
            <View style={styles.actionButton}>
              <Button title="Enviar" onPress={sendMessage} />
            </View>
          </View>
        )}

        {activeSection === 'todos' && (
          <View>
            <Text style={styles.title}>Todos los Mensajes</Text>
            <FlatList
              data={messages}
              renderItem={renderMessage}
              keyExtractor={item => item._id}
            />
          </View>
        )}

        {activeSection === 'buscar' && (
          <View>
            <Text style={styles.title}>Buscar por destinatario</Text>
            <TextInput
              placeholder="Destinatario"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.input}
            />
            <Button title="Buscar" onPress={searchByRecipient} />
            <FlatList
              data={searchResults}
              renderItem={renderMessage}
              keyExtractor={item => item._id}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6fb' },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: '#4f8cff',
    borderBottomWidth: 1,
    borderBottomColor: '#e3eaf5',
  },
  navButton: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 12,
    marginVertical: 4,
  },
  navButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  actionButton: {
    marginVertical: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    marginBottom: 12,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    padding: 10,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  messageCard: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    borderColor: '#e3eaf5',
    borderWidth: 1,
  },
  fileLink: {
    color: '#4f8cff',
    marginTop: 6,
  },
  delete: {
    color: '#e74c3c',
    fontSize: 18,
    marginTop: 6,
  },
  bold: {
    fontWeight: 'bold',
  },
  fileName: {
    marginTop: 5,
    fontStyle: 'italic',
  },
});

export default MensajesApp;
