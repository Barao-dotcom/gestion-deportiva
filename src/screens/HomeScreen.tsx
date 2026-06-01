import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Platform } from 'react-native';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../controllers/AuthController';
import { CircuitoModel, Circuito } from '../models/CircuitoModel';
import { RotacionModel, RotacionDetallada } from '../models/RotacionModel';
import FormularioCircuito from './FormularioCircuito';
import FormularioRotacion from './FormularioRotacion';
import ModalAsignacion from './ModalAsignancion';

export default function HomeScreen() {
    const { session, perfil } = useAuth();
    
    // Estados de navegación interna
    const [vistaActiva, setVistaActiva] = useState<'circuitos' | 'rotaciones'>('circuitos');
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [rotacionSeleccionada, setRotacionSeleccionada] = useState<RotacionDetallada | null>(null);
    // Estados de datos
    const [circuitos, setCircuitos] = useState<Circuito[]>([]);
    const [rotaciones, setRotaciones] = useState<RotacionDetallada[]>([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        cargarDatos();
    }, [vistaActiva]); // Se recarga cada vez que cambias de pestaña

    const cargarDatos = async () => {
        setCargando(true);
        setMostrarFormulario(false);
        try {
            if (vistaActiva === 'circuitos') {
                const data = await CircuitoModel.obtenerCircuitos();
                setCircuitos(data);
            } else {
                const data = await RotacionModel.obtenerRotaciones();
                setRotaciones(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setCargando(false);
        }
    };

    // --- RENDERIZADO DE TARJETAS ---
    const renderizarCircuito = ({ item }: { item: Circuito }) => (
        <View style={styles.tarjeta}>
            <View style={styles.encabezadoTarjeta}>
                <Text style={styles.tituloTarjeta}>{item.nombre}</Text>
                <FontAwesome5 name="running" size={18} color="#0056b3" />
            </View>
            <Text style={styles.detalleTarjeta}><Text style={{ fontWeight: 'bold' }}>Enfoque:</Text> {item.tipo}</Text>
            <View style={styles.filaMetricas}>
                <View style={styles.metrica}><FontAwesome5 name="redo" size={12} color="#888" /><Text style={styles.textoMetrica}>{item.series} Series</Text></View>
                <View style={styles.metrica}><FontAwesome5 name="hashtag" size={12} color="#888" /><Text style={styles.textoMetrica}>{item.repeticiones} Reps</Text></View>
                <View style={styles.metrica}><FontAwesome5 name="stopwatch" size={12} color="#888" /><Text style={styles.textoMetrica}>{item.descanso_segundos}s Descanso</Text></View>
            </View>
        </View>
    );

    const renderizarRotacion = ({ item }: { item: RotacionDetallada }) => (
    <TouchableOpacity 
        style={[styles.tarjeta, { borderLeftColor: '#28a745' }]}
        onPress={() => setRotacionSeleccionada(item)}
    >
        {/* El interior se queda exactamente igual */}
        <View style={styles.encabezadoTarjeta}>
            <Text style={styles.tituloTarjeta}>{item.nombre_grupo}</Text>
            <MaterialCommunityIcons name="account-group" size={20} color="#28a745" />
        </View>
        <Text style={styles.detalleTarjeta}><Text style={{ fontWeight: 'bold' }}>Estación:</Text> {item.circuitos?.nombre || 'Circuito Eliminado'}</Text>
        <View style={styles.filaMetricas}>
            <View style={styles.metrica}><FontAwesome5 name="clock" size={12} color="#888" /><Text style={styles.textoMetrica}>{item.hora_inicio}</Text></View>
            <View style={styles.metrica}><FontAwesome5 name="users" size={12} color="#888" /><Text style={styles.textoMetrica}>Límite: {item.max_integrantes}</Text></View>
        </View>
    </TouchableOpacity>
    );

    return (
        <View style={styles.contenedor}>
            {/* Cabecera con Info del Usuario y Botón Nuevo */}
            <View style={styles.infoRow}>
                <Text style={styles.textoInfo}>
                    <FontAwesome5 name="user-check" size={14} color="#28a745" />  {perfil?.nombre || session?.user.email}
                </Text>
                
                {!mostrarFormulario && (
                    <TouchableOpacity style={styles.botonCrear} onPress={() => setMostrarFormulario(true)}>
                        <FontAwesome5 name="plus" size={14} color="#fff" />
                        <Text style={styles.textoBotonCrear}> Nuevo</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Pestañas de Navegación (Solo se muestran si no hay un formulario abierto) */}
            {!mostrarFormulario && (
                <View style={styles.contenedorPestañas}>
                    <TouchableOpacity 
                        style={[styles.pestaña, vistaActiva === 'circuitos' && styles.pestañaActiva]} 
                        onPress={() => setVistaActiva('circuitos')}
                    >
                        <Text style={[styles.textoPestaña, vistaActiva === 'circuitos' && styles.textoPestañaActiva]}>Circuitos</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.pestaña, vistaActiva === 'rotaciones' && styles.pestañaActiva]} 
                        onPress={() => setVistaActiva('rotaciones')}
                    >
                        <Text style={[styles.textoPestaña, vistaActiva === 'rotaciones' && styles.textoPestañaActiva]}>Grupos y Rotaciones</Text>
                    </TouchableOpacity>
                </View>
            )}

{/* Contenido Dinámico */}
            {mostrarFormulario ? (
                vistaActiva === 'circuitos' ? (
                    <FormularioCircuito alCompletar={cargarDatos} alCancelar={() => setMostrarFormulario(false)} />
                ) : (
                    <FormularioRotacion alCompletar={cargarDatos} alCancelar={() => setMostrarFormulario(false)} />
                )
            ) : cargando ? (
                <ActivityIndicator size="large" color="#0056b3" style={{ marginTop: 40 }} />
            ) : vistaActiva === 'circuitos' ? (
                <FlatList
                    data={circuitos}
                    keyExtractor={(item) => item.id}
                    renderItem={renderizarCircuito}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={<Text style={styles.textoVacio}>No hay circuitos registrados.</Text>}
                />
            ) : (
                <FlatList
                    data={rotaciones}
                    keyExtractor={(item) => item.id}
                    renderItem={renderizarRotacion}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={<Text style={styles.textoVacio}>No hay grupos de rotación registrados.</Text>}
                />
            )}
                <ModalAsignacion 
                    visible={!!rotacionSeleccionada} 
                    rotacion={rotacionSeleccionada} 
                alCerrar={() => setRotacionSeleccionada(null)} 
                />
        </View>
    );
}

const styles = StyleSheet.create({
    contenedor: { flex: 1, padding: 20, backgroundColor: '#f4f6f9' },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    textoInfo: { fontSize: 16, color: '#333', fontWeight: '600' },
    botonCrear: { flexDirection: 'row', backgroundColor: '#0056b3', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
    textoBotonCrear: { color: '#fff', fontWeight: 'bold', marginLeft: 5 },
    
    // Pestañas
    contenedorPestañas: { flexDirection: 'row', backgroundColor: '#e2e3e5', borderRadius: 10, padding: 4, marginBottom: 20 },
    pestaña: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
    pestañaActiva: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
    textoPestaña: { fontSize: 15, fontWeight: '600', color: '#666' },
    textoPestañaActiva: { color: '#0056b3', fontWeight: 'bold' },

    textoVacio: { textAlign: 'center', color: '#666', marginTop: 40, fontStyle: 'italic' },
    
    // Tarjetas Generales
    tarjeta: { 
        backgroundColor: '#fff', 
        padding: 16, 
        borderRadius: 12, 
        marginBottom: 15, 
        borderLeftWidth: 4,
        borderLeftColor: '#0056b3',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
            web: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
            android: { elevation: 3 }
        })
    },
    encabezadoTarjeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
    tituloTarjeta: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    detalleTarjeta: { fontSize: 15, color: '#666', marginBottom: 12 },
    filaMetricas: { flexDirection: 'row', justifyContent: 'flex-start', borderTopWidth: 1, borderTopColor: '#f0f2f5', paddingTop: 10 },
    metrica: { flexDirection: 'row', alignItems: 'center', marginRight: 15 },
    textoMetrica: { fontSize: 13, color: '#666', marginLeft: 4, fontWeight: '500' }
});