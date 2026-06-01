import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform } from 'react-native';
import { CircuitoModel, Circuito } from '../models/CircuitoModel';
import { RotacionModel } from '../models/RotacionModel';

interface Props {
    alCompletar: () => void;
    alCancelar: () => void;
}

export default function FormularioRotacion({ alCompletar, alCancelar }: Props) {
    const [nombreGrupo, setNombreGrupo] = useState('');
    const [circuitoId, setCircuitoId] = useState('');
    const [maxIntegrantes, setMaxIntegrantes] = useState('5'); // Por defecto 5 para estaciones optimizadas
    const [horaInicio, setHoraInicio] = useState('');
    const [circuitos, setCircuitos] = useState<Circuito[]>([]);
    
    const [cargandoCircuitos, setCargandoCircuitos] = useState(true);
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        const cargarCircuitos = async () => {
            try {
                const data = await CircuitoModel.obtenerCircuitos();
                setCircuitos(data);
                if (data.length > 0) setCircuitoId(data[0].id); // Selecciona el primero por defecto
            } catch (error) {
                console.error(error);
            } finally {
                setCargandoCircuitos(false);
            }
        };
        cargarCircuitos();
    }, []);

    const manejarGuardado = async () => {
        if (!nombreGrupo || !circuitoId || !maxIntegrantes || !horaInicio) {
            Alert.alert("Error", "Todos los campos son obligatorios.");
            return;
        }

        setGuardando(true);
        try {
            await RotacionModel.crearRotacion({
                nombre_grupo: nombreGrupo,
                circuito_id: circuitoId,
                max_integrantes: parseInt(maxIntegrantes),
                hora_inicio: horaInicio
            });
            alCompletar();
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setGuardando(false);
        }
    };

    if (cargandoCircuitos) {
        return <ActivityIndicator size="small" color="#0056b3" style={{ padding: 20 }} />;
    }

    return (
        <View style={styles.tarjeta}>
            <Text style={styles.titulo}>Crear Grupo de Rotación</Text>

            <TextInput 
                style={styles.input} 
                placeholder="Nombre del Grupo (Ej. Grupo A)" 
                value={nombreGrupo} 
                onChangeText={setNombreGrupo} 
            />

            {/* Selector básico compatible con Web y Móvil */}
            <Text style={styles.label}>Asignar Circuito/Estación:</Text>
            <View style={styles.contenedorPicker}>
                <select 
                    value={circuitoId} 
                    onChange={(e) => setCircuitoId(e.target.value)}
                    style={styles.pickerWeb}
                >
                    {circuitos.map(c => (
                        <option key={c.id} value={c.id}>{c.nombre} ({c.tipo})</option>
                    ))}
                </select>
            </View>
            
            <View style={styles.fila}>
                <View style={{ width: '48%' }}>
                    <Text style={styles.label}>Máx. Atletas:</Text>
                    <TextInput 
                        style={styles.input} 
                        keyboardType="numeric" 
                        value={maxIntegrantes} 
                        onChangeText={setMaxIntegrantes} 
                    />
                </View>
                <View style={{ width: '48%' }}>
                    <Text style={styles.label}>Hora de Inicio:</Text>
                    <TextInput 
                        style={styles.input} 
                        placeholder="Ej. 08:30" 
                        value={horaInicio} 
                        onChangeText={setHoraInicio} 
                    />
                </View>
            </View>

            <View style={styles.botones}>
                <TouchableOpacity style={styles.botonGuardar} onPress={manejarGuardado} disabled={guardando}>
                    {guardando ? <ActivityIndicator color="#fff" /> : <Text style={styles.textoBoton}>Inicializar Grupo</Text>}
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
        marginBottom: 25, 
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
            web: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
            android: { elevation: 5 }
        })
    },
    titulo: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#0056b3' },
    label: { fontSize: 14, color: '#666', marginBottom: 5, fontWeight: '600' },
    input: { backgroundColor: '#f0f2f5', padding: 14, borderRadius: 10, marginBottom: 12, fontSize: 16 },
    contenedorPicker: { backgroundColor: '#f0f2f5', borderRadius: 10, marginBottom: 12, overflow: 'hidden' },
    
    // Aquí estaba el error, faltaba la llave de cierre "}" al final
    pickerWeb: { 
        width: '100%', 
        padding: 14, 
        borderWidth: 0, 
        backgroundColor: '#f0f2f5', 
        fontSize: 16,
        ...Platform.select({web: { outlineStyle: 'none'} as any})
    },
    
    fila: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    botones: { marginTop: 10 },
    botonGuardar: { backgroundColor: '#28a745', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
    botonCancelar: { backgroundColor: '#e2e3e5', padding: 15, borderRadius: 10, alignItems: 'center' },
    textoBoton: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    textoBotonSecundario: { color: '#333', fontWeight: 'bold', fontSize: 16 }
});