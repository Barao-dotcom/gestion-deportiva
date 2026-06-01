import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { supabase } from '../config/ConexionBD'; 

export default function LoginScreen() {
    const [correo, setCorreo] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [cargando, setCargando] = useState(false);
    const [esRegistro, setEsRegistro] = useState(false);

    const manejarAutenticacion = async () => {
        if (!correo || !contrasena) {
            Alert.alert("Error", "Por favor llena todos los campos");
            return;
        }

        setCargando(true);
        
        try {
            if (esRegistro) {
                // MODO REGISTRO
                const { error } = await supabase.auth.signUp({
                    email: correo,
                    password: contrasena,
                });
                if (error) throw error;
                Alert.alert("¡Éxito!", "Cuenta creada correctamente. Ya puedes ingresar.");
                setEsRegistro(false); // Regresa a la vista de login normal
            } else {
                // MODO LOGIN
                const { error } = await supabase.auth.signInWithPassword({
                    email: correo,
                    password: contrasena,
                });
                if (error) throw error;
            }
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setCargando(false);
        }
    };

    return (
        <View style={styles.contenedor}>
            <Text style={styles.titulo}>Rendimiento Deportivo</Text>
            <Text style={styles.subtitulo}>{esRegistro ? 'Crea una cuenta nueva' : 'Panel de acceso'}</Text>

            <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                value={correo}
                onChangeText={setCorreo}
                autoCapitalize="none"
                keyboardType="email-address"
            />
            <TextInput
                style={styles.input}
                placeholder="Contraseña"
                value={contrasena}
                onChangeText={setContrasena}
                secureTextEntry
            />

            <TouchableOpacity 
                style={styles.botonPrincipal} 
                onPress={manejarAutenticacion}
                disabled={cargando}
            >
                <Text style={styles.textoBoton}>
                    {cargando ? 'Procesando...' : (esRegistro ? 'Registrarme' : 'Ingresar')}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.botonSecundario} 
                onPress={() => setEsRegistro(!esRegistro)}
            >
                <Text style={styles.textoSecundario}>
                    {esRegistro ? '¿Ya tienes cuenta? Ingresa aquí' : '¿No tienes cuenta? Regístrate'}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    contenedor: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    titulo: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#333',
        marginBottom: 10,
    },
    subtitulo: {
        fontSize: 16,
        textAlign: 'center',
        color: '#666',
        marginBottom: 30,
    },
    input: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    botonPrincipal: {
        backgroundColor: '#0056b3',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    textoBoton: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    botonSecundario: {
        marginTop: 20,
        alignItems: 'center',
    },
    textoSecundario: {
        color: '#0056b3',
        fontSize: 14,
        fontWeight: 'bold',
    }
});