import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, FlatList, Dimensions, ScrollView, Platform } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons'; 
import { useAuth } from '../controllers/AuthController';
import { RendimientoModel, MetricaRendimiento } from '../models/RendimientoModel';

const screenWidth = Dimensions.get('window').width;

export default function PerfilScreen() {
    const { session, perfil, cerrarSesion } = useAuth();
    
    const [peso, setPeso] = useState('');
    const [fatiga, setFatiga] = useState('');
    const [guardando, setGuardando] = useState(false);
    
    const [historial, setHistorial] = useState<MetricaRendimiento[]>([]);
    const [cargandoHistorial, setCargandoHistorial] = useState(true);

    useEffect(() => {
        cargarHistorial();
    }, []);

    const cargarHistorial = async () => {
        if (!session) return;
        setCargandoHistorial(true);
        try {
            const data = await RendimientoModel.obtenerHistorial(session.user.id);
            setHistorial(data);
        } catch (error) {
            console.error(error);
        } finally {
            setCargandoHistorial(false);
        }
    };

    const registrarMetricas = async () => {
        if (!session) return;
        if (!peso || !fatiga) {
            Alert.alert("Error", "Ingresa tu peso y nivel de fatiga.");
            return;
        }

        const fatigaNum = parseInt(fatiga);
        if (fatigaNum < 1 || fatigaNum > 10) {
            Alert.alert("Error", "La fatiga debe ser un número del 1 al 10.");
            return;
        }

        setGuardando(true);
        try {
            await RendimientoModel.registrarMetrica(session.user.id, parseFloat(peso), fatigaNum);
            Alert.alert("Éxito", "Registro guardado correctamente.");
            setPeso('');
            setFatiga('');
            cargarHistorial();
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setGuardando(false);
        }
    };

    // Preparamos datos para el gráfico (últimos 7 días invertidos para orden cronológico)
    const datosGrafico = [...historial].slice(0, 7).reverse();
    const etiquetas = datosGrafico.map(item => {
        const fecha = new Date(item.fecha);
        return `${fecha.getDate()}/${fecha.getMonth() + 1}`;
    });
    const valoresFatiga = datosGrafico.map(item => item.nivel_fatiga);

    return (
        <ScrollView style={styles.contenedor}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.titulo}>Mi Rendimiento</Text>
                    <Text style={styles.subtitulo}>{perfil?.nombre || session?.user.email}</Text>
                </View>
                <TouchableOpacity style={styles.botonSalir} onPress={cerrarSesion}>
                    <FontAwesome5 name="sign-out-alt" size={16} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Gráfico de Fatiga */}
            {historial.length >= 2 && (
                <View style={styles.tarjeta}>
                    <View style={styles.tituloIcono}>
                        <FontAwesome5 name="chart-line" size={18} color="#0056b3" />
                        <Text style={[styles.formTitulo, { marginBottom: 0, marginLeft: 8 }]}>Evolución de Fatiga</Text>
                    </View>
                    <LineChart
                        data={{
                            labels: etiquetas,
                            datasets: [{ data: valoresFatiga }]
                        }}
                        width={screenWidth - 80} // Ajuste para el padding interno
                        height={220}
                        yAxisInterval={1}
                        chartConfig={{
                            backgroundColor: '#ffffff',
                            backgroundGradientFrom: '#ffffff',
                            backgroundGradientTo: '#ffffff',
                            decimalPlaces: 0, 
                            color: (opacity = 1) => `rgba(220, 53, 69, ${opacity})`, 
                            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            style: { borderRadius: 16 },
                            propsForDots: { r: "6", strokeWidth: "2", stroke: "#dc3545" }
                        }}
                        bezier 
                        style={{ marginVertical: 8, borderRadius: 16, alignSelf: 'center' }}
                    />
                </View>
            )}

            {/* Formulario */}
            <View style={styles.tarjeta}>
                <View style={styles.tituloIcono}>
                    <FontAwesome5 name="clipboard-check" size={18} color="#0056b3" />
                    <Text style={[styles.formTitulo, { marginBottom: 0, marginLeft: 8 }]}>Registro Diario</Text>
                </View>
                <View style={styles.filaForm}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={styles.labelInput}>Peso (kg)</Text>
                        <TextInput style={styles.input} placeholder="Ej. 72.5" keyboardType="numeric" value={peso} onChangeText={setPeso} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.labelInput}>Fatiga (1-10)</Text>
                        <TextInput style={styles.input} placeholder="Ej. 6" keyboardType="numeric" value={fatiga} onChangeText={setFatiga} />
                    </View>
                </View>
                <TouchableOpacity style={styles.botonGuardar} onPress={registrarMetricas} disabled={guardando}>
                    {guardando ? <ActivityIndicator color="#fff" /> : <Text style={styles.textoBotonGuardar}>Guardar Hoy</Text>}
                </TouchableOpacity>
            </View>

            {/* Historial */}
            <View style={styles.tituloIcono}>
                <MaterialCommunityIcons name="history" size={22} color="#1a1a1a" />
                <Text style={[styles.historialTitulo, { marginBottom: 0, marginLeft: 8 }]}>Historial de Cargas</Text>
            </View>
            
            {cargandoHistorial ? (
                <ActivityIndicator size="large" color="#0056b3" />
            ) : (
                <FlatList
                    data={historial}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                    ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>No hay registros aún.</Text>}
                    renderItem={({ item }) => (
                        <View style={styles.tarjetaRegistro}>
                            <Text style={styles.textoFecha}>{new Date(item.fecha).toLocaleDateString()}</Text>
                            <View style={styles.filaMetricas}>
                                <View style={styles.metricaIndividual}>
                                    <FontAwesome5 name="weight-hanging" size={14} color="#666" />
                                    <Text style={styles.textoMetrica}>{item.peso_kg} kg</Text>
                                </View>
                                <View style={styles.metricaIndividual}>
                                    <FontAwesome5 name="bolt" size={14} color={item.nivel_fatiga >= 8 ? '#dc3545' : '#e6a817'} />
                                    <Text style={styles.textoMetrica}>{item.nivel_fatiga}/10</Text>
                                </View>
                            </View>
                        </View>
                    )}
                />
            )}
            <View style={{ height: 40 }} /> 
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    contenedor: { flex: 1, padding: 20, backgroundColor: '#f4f6f9' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
    titulo: { fontSize: 26, fontWeight: '800', color: '#1a1a1a' },
    subtitulo: { fontSize: 16, color: '#666', fontStyle: 'italic' },
    botonSalir: { backgroundColor: '#dc3545', padding: 12, borderRadius: 10 },
    
    tarjeta: { 
        backgroundColor: '#fff', 
        padding: 20, 
        borderRadius: 16, 
        marginBottom: 25, 
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8 },
            web: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8 },
            android: { elevation: 5 }
        })
    },
    tituloIcono: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    formTitulo: { fontSize: 18, fontWeight: '700', color: '#0056b3' },
    filaForm: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    labelInput: { fontSize: 13, color: '#666', marginBottom: 5, fontWeight: '600' },
    input: { backgroundColor: '#f0f2f5', padding: 14, borderRadius: 10, fontSize: 16 },
    botonGuardar: { backgroundColor: '#28a745', padding: 15, borderRadius: 10, alignItems: 'center' },
    textoBotonGuardar: { color: '#fff', fontWeight: 'bold', fontSize: 16, textTransform: 'uppercase' },
    
    historialTitulo: { fontSize: 20, fontWeight: '700', color: '#1a1a1a' },
    tarjetaRegistro: { 
        backgroundColor: '#fff', 
        padding: 16, 
        borderRadius: 12, 
        marginBottom: 12, 
        borderLeftWidth: 5, 
        borderLeftColor: '#0056b3',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
            web: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
            android: { elevation: 3 }
        })
    },
    textoFecha: { fontSize: 13, fontWeight: 'bold', color: '#888', marginBottom: 4, textTransform: 'uppercase' },
    filaMetricas: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginTop: 5 },
    metricaIndividual: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
    textoMetrica: { fontSize: 16, color: '#333', fontWeight: '500', marginLeft: 5 }
});