import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  const handleLogin = async () => {
    try {
      const response = await fetch(
        'https://682811826b7628c529121356.mockapi.io/Messages/getMessages/Users'
      );

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }

      const users = await response.json();
      console.log('Usuarios recibidos:', users);

      const user = users.find(
        (u) => u.email === email && u.password === password
      );

      console.log('Usuario encontrado:', user);

      if (user) {
        Alert.alert('Bienvenido', `Hola ${user.name}`);
        navigation.navigate('Chat', { user }); 
      } else {
        Alert.alert('Error', 'Credenciales inválidas');
      }
    } catch (error) {
      console.error('Error en login:', error);
      Alert.alert('Error', 'Hubo un problema al conectarse al servidor');
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>Iniciar sesión</Text>
      <TextInput
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{ borderBottomWidth: 1, marginBottom: 20, paddingVertical: 8 }}
      />
      <TextInput
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderBottomWidth: 1, marginBottom: 20, paddingVertical: 8 }}
      />
      <Button title="Entrar" onPress={handleLogin} />
    </View>
  );
};

export default LoginScreen;
