import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../controllers/AuthController';
import { CircuitoModel, Circuito } from '../models/CircuitoModel';
import { RotacionModel, RotacionDetallada } from '../models/RotacionModel';
import FormularioCircuito from './FormularioCircuito';
import FormularioRotacion from './FormularioRotacion';
import ModalAsignacion from './ModalAsignancion';
import { PanelAlertas } from '../components/PanelAlertas';

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
    }, [vistaActiva]);

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

    // --- FUNCIÓN LIMPIA PARA RENDERIZAR EL CONTENIDO PRINCIPAL ---
    const renderizarContenido = () => {
        if (mostrarFormulario) {
            return vistaActiva === 'circuitos' ? (
                <FormularioCircuito alCompletar={cargarDatos} alCancelar={() => setMostrarFormulario(false)} />
            ) : (
                <FormularioRotacion alCompletar={cargarDatos} alCancelar={() => setMostrarFormulario(false)} />
            );
        }

        if (cargando) {
            return <ActivityIndicator size="large" color="#0056b3" style={{ marginTop: 40 }} />;
        }

        if (vistaActiva === 'circuitos') {
            return (
                <FlatList
                    data={circuitos}
                    keyExtractor={(item) => item.id}
                    renderItem={renderizarCircuito}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={<Text style={styles.textoVacio}>No hay circuitos registrados.</Text>}
                />
            );
        }

        return (
            <FlatList
                data={rotaciones}
                keyExtractor={(item) => item.id}
                renderItem={renderizarRotacion}
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={<Text style={styles.textoVacio}>No hay grupos de rotación registrados.</Text>}
            />
        );
    };

    // --- RETURN PRINCIPAL DE LA PANTALLA ---
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

            {/* Panel de Alertas Inteligente */}
            {!mostrarFormulario && (
                <PanelAlertas />
            )}

            {/* Pestañas de Navegación */}
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

            {/* Llamamos al contenido dinámico */}
            {renderizarContenido()}

            {/* Modal de asignación siempre al final del View */}
            <ModalAsignacion 
                visible={!!rotacionSeleccionada} 
                rotacion={rotacionSeleccionada} 
                alCerrar={() => setRotacionSeleccionada(null)} 
            />
        </View>
    );
}

const styles = StyleSheet.create({
    contenedor: { flex: 1, backgroundColor: '#f8f9fa', paddingHorizontal: 16 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 15, paddingHorizontal: 5 },
    textoInfo: { fontSize: 16, fontWeight: '600', color: '#333' },
    botonCrear: { flexDirection: 'row', backgroundColor: '#0056b3', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, alignItems: 'center' },
    textoBotonCrear: { color: '#fff', fontWeight: 'bold', marginLeft: 5 },
    contenedorPestañas: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 8, marginBottom: 15, padding: 4, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
    pestaña: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 6 },
    pestañaActiva: { backgroundColor: '#0056b3' },
    textoPestaña: { fontWeight: 'bold', color: '#666' },
    textoPestañaActiva: { color: '#fff' },
    tarjeta: { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#0056b3', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
    encabezadoTarjeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    tituloTarjeta: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    detalleTarjeta: { fontSize: 14, color: '#555', marginBottom: 10 },
    filaMetricas: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 },
    metrica: { flexDirection: 'row', alignItems: 'center' },
    textoMetrica: { marginLeft: 6, fontSize: 12, color: '#666' },
    textoVacio: { textAlign: 'center', color: '#888', marginTop: 20, fontStyle: 'italic' }
});