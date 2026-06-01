import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Alert, Platform } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { RotacionModel, RotacionDetallada } from '../models/RotacionModel';
import { UsuarioModel, PerfilUsuario } from '../models/UsuarioModel';

interface Props {
    visible: boolean;
    rotacion: RotacionDetallada | null;
    alCerrar: () => void;
}

export default function ModalAsignacion({ visible, rotacion, alCerrar }: Props) {
    const [atletasDisponibles, setAtletasDisponibles] = useState<PerfilUsuario[]>([]);
    const [atletasAsignados, setAtletasAsignados] = useState<any[]>([]);
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        if (visible && rotacion) {
            cargarDatos();
        }
    }, [visible, rotacion]);

    const cargarDatos = async () => {
        setCargando(true);
        try {
            const disponibles = await UsuarioModel.obtenerTodosLosPerfiles();
            const asignados = await RotacionModel.obtenerAtletasDeRotacion(rotacion!.id);
            
            setAtletasDisponibles(disponibles);
            setAtletasAsignados(asignados);
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setCargando(false);
        }
    };

    const manejarAsignacion = async (perfilId: string) => {
        if (!rotacion) return;
        try {
            await RotacionModel.asignarAtleta(rotacion.id, perfilId, rotacion.max_integrantes);
            cargarDatos(); // Refrescar las listas
        } catch (error: any) {
            Alert.alert("Aviso de Capacidad", error.message);
        }
    };

    const manejarRemocion = async (perfilId: string) => {
        if (!rotacion) return;
        try {
            await RotacionModel.removerAtleta(rotacion.id, perfilId);
            cargarDatos();
        } catch (error: any) {
            Alert.alert("Error", error.message);
        }
    };

    // Filtramos para que en la lista de "disponibles" no salgan los que ya están en el grupo
    const disponiblesFiltrados = atletasDisponibles.filter(
        (a) => !atletasAsignados.some((asig) => asig.perfiles.id === a.id)
    );

    if (!rotacion) return null;

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View style={styles.fondoModal}>
                <View style={styles.contenedorModal}>
                    <View style={styles.header}>
                        <Text style={styles.titulo}>{rotacion.nombre_grupo}</Text>
                        <TouchableOpacity onPress={alCerrar} style={styles.botonCerrar}>
                            <FontAwesome5 name="times" size={20} color="#666" />
                        </TouchableOpacity>
                    </View>
                    
                    <Text style={styles.subtitulo}>Cupo: {atletasAsignados.length} / {rotacion.max_integrantes}</Text>

                    {cargando ? (
                        <ActivityIndicator size="large" color="#0056b3" style={{ marginVertical: 20 }} />
                    ) : (
                        <View style={{ flex: 1 }}>
                            <Text style={styles.seccionTitulo}>En este grupo:</Text>
                            <FlatList
                                data={atletasAsignados}
                                keyExtractor={(item) => item.id}
                                style={{ maxHeight: 150, marginBottom: 15 }}
                                renderItem={({ item }) => (
                                    <View style={styles.filaAtleta}>
                                        <Text style={styles.nombreAtleta}>{item.perfiles.nombre}</Text>
                                        <TouchableOpacity onPress={() => manejarRemocion(item.perfiles.id)} style={styles.botonQuitar}>
                                            <FontAwesome5 name="user-minus" size={14} color="#dc3545" />
                                        </TouchableOpacity>
                                    </View>
                                )}
                                ListEmptyComponent={<Text style={styles.textoVacio}>Grupo vacío</Text>}
                            />

                            <Text style={styles.seccionTitulo}>Atletas disponibles:</Text>
                            <FlatList
                                data={disponiblesFiltrados}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <View style={styles.filaAtleta}>
                                        <Text style={styles.nombreAtleta}>{item.nombre}</Text>
                                        <TouchableOpacity onPress={() => manejarAsignacion(item.id)} style={styles.botonAgregar}>
                                            <FontAwesome5 name="user-plus" size={14} color="#28a745" />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            />
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    fondoModal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    contenedorModal: { 
        backgroundColor: '#fff', 
        height: '80%', 
        borderTopLeftRadius: 25, 
        borderTopRightRadius: 25, 
        padding: 20,
        ...Platform.select({
            web: { width: 400, height: 600, alignSelf: 'center', marginTop: 60, borderRadius: 20 } as any
        })
    },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 15, marginBottom: 10 },
    titulo: { fontSize: 22, fontWeight: 'bold', color: '#1a1a1a' },
    botonCerrar: { padding: 5 },
    subtitulo: { fontSize: 16, color: '#0056b3', fontWeight: 'bold', marginBottom: 15 },
    seccionTitulo: { fontSize: 16, fontWeight: 'bold', color: '#666', marginBottom: 10 },
    filaAtleta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9f9f9', padding: 12, borderRadius: 8, marginBottom: 8 },
    nombreAtleta: { fontSize: 16, color: '#333', fontWeight: '500' },
    botonAgregar: { backgroundColor: '#e6f4ea', padding: 10, borderRadius: 8 },
    botonQuitar: { backgroundColor: '#fce8e6', padding: 10, borderRadius: 8 },
    textoVacio: { fontStyle: 'italic', color: '#888', textAlign: 'center', padding: 10 }
});