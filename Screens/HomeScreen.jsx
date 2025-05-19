import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

 const  HomeScreen=({ navigation })=> {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido al chat</Text>
      <Button title="Ir al Chat" onPress={() => navigation.navigate('Chat')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, alignItems: 'center', justifyContent: 'center'
  },
  title: {
    fontSize: 24, fontWeight: 'bold', marginBottom: 20
  }
});
export default HomeScreen;