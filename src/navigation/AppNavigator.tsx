import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome5 } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import PerfilScreen from '../screens/PerfilScreen'; // Importamos la nueva pantalla real

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size }) => {
                    let iconName = '';
                    if (route.name === 'Dashboard') {
                        iconName = 'clipboard-list';
                    } else if (route.name === 'Perfil') {
                        iconName = 'user-alt';
                    }
                    return <FontAwesome5 name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#0056b3',
                tabBarInactiveTintColor: 'gray',
                headerStyle: { backgroundColor: '#0056b3' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
            })}
        >
            <Tab.Screen 
                name="Dashboard" 
                component={HomeScreen} 
                options={{ title: 'Circuitos' }} 
            />
            <Tab.Screen 
                name="Perfil" 
                component={PerfilScreen} // Conectamos la pantalla completa aquí
                options={{ title: 'Mi Rendimiento' }} 
            />
        </Tab.Navigator>
    );
}