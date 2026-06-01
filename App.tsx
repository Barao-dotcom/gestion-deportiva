import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native'; // Nuevo import
import { AuthProvider, useAuth } from './src/controllers/AuthController';
import LoginScreen from './src/screens/LoginScreen';
import AppNavigator from './src/navigation/AppNavigator'; // Importamos el navegador

const EnrutadorPrincipal = () => {
    const { session, cargando } = useAuth();

    if (cargando) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f6f9' }}>
                <ActivityIndicator size="large" color="#0056b3" />
            </View>
        );
    }

    // Si hay sesión, cargamos el menú con pestañas. Si no, la pantalla de login.
    return session ? (
        <NavigationContainer>
            <AppNavigator />
        </NavigationContainer>
    ) : (
        <LoginScreen />
    );
};

export default function App() {
    return (
        <AuthProvider>
            <EnrutadorPrincipal />
        </AuthProvider>
    );
}