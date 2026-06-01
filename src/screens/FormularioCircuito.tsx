import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform } from 'react-native';
import { CircuitoModel } from '../models/CircuitoModel';

interface Props {
    alCompletar: () => void;
    alCancelar: () => void;
}

export default function FormularioCircuito({ alCompletar, alCancelar }: Props) {
    const [nombre, setNombre] = useState('');
    const [tipo, setTipo] = useState('');
    const [series, setSeries] = useState('');
    const [repeticiones, setRepeticiones] = useState('');
    const [descanso, setDescanso] = useState('60');
    const [guardando, setGuardando] = useState(false);

    const manejarGuardado = async () => {
        if (!nombre || !tipo || !series || !repeticiones) {
            Alert.alert("Error", "Todos los campos principales son obligatorios.");
            return;
        }

        setGuardando(true);
        try {
            await CircuitoModel.crearCircuito({
                nombre,
                tipo,
                series: parseInt(series),
                repeticiones: parseInt(repeticiones),
                descanso_segundos: parseInt(descanso)
            });
            alCompletar();
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setGuardando(false);
        }
    };

    return (
        <View style={styles.tarjeta}>
            <Text style={styles.titulo}>Nuevo Circuito</Text>

            <TextInput style={styles.input} placeholder="Nombre (Ej. Circuito de Potencia)" value={nombre} onChangeText={setNombre} />
            <TextInput style={styles.input} placeholder="Tipo (Ej. Arranque Explosivo)" value={tipo} onChangeText={setTipo} />
            
            <View style={styles.fila}>
                <TextInput style={[styles.input, styles.inputMitad]} placeholder="Series" keyboardType="numeric" value={series} onChangeText={setSeries} />
                <TextInput style={[styles.input, styles.inputMitad]} placeholder="Repeticiones" keyboardType="numeric" value={repeticiones} onChangeText={setRepeticiones} />
            </View>
            
            <TextInput style={styles.input} placeholder="Descanso (segundos)" keyboardType="numeric" value={descanso} onChangeText={setDescanso} />

            <View style={styles.botones}>
                <TouchableOpacity style={styles.botonGuardar} onPress={manejarGuardado} disabled={guardando}>
                    {guardando ? <ActivityIndicator color="#fff" /> : <Text style={styles.textoBoton}>Guardar Circuito</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={styles.botonCancelar} onPress={alCancelar}>
                    <Text style={styles.textoBotonSecundario}>Cancelar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    tarjeta: { 
        backgroundColor: '#fff', 
        padding: 20, 
        borderRadius: 16, 
        marginBottom: 20, 
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
            web: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
            android: { elevation: 5 }
        })
    },
    titulo: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#0056b3' },
    input: { backgroundColor: '#f0f2f5', padding: 14, borderRadius: 10, marginBottom: 12, fontSize: 16 },
    fila: { flexDirection: 'row', justifyContent: 'space-between' },
    inputMitad: { width: '48%' },
    botones: { marginTop: 10 },
    botonGuardar: { backgroundColor: '#28a745', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
    botonCancelar: { backgroundColor: '#e2e3e5', padding: 15, borderRadius: 10, alignItems: 'center' },
    textoBoton: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    textoBotonSecundario: { color: '#333', fontWeight: 'bold', fontSize: 16 }
});