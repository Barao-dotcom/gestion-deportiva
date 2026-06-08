import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '../config/ConexionBD'; // Asegúrate de que esta ruta apunte a tu archivo de conexión real

// Definimos el tipado estricto para las alertas
interface AlertaPreventiva {
  id: string;
  perfil_id: string;
  nivel_fatiga: number;
  mensaje: string;
  fecha_creacion: string;
  perfiles: {
    nombre: string;
  };
}

export const PanelAlertas = () => {
  const [alertas, setAlertas] = useState<AlertaPreventiva[]>([]);

  // Función para consultar las alertas no leídas
  const cargarAlertas = async () => {
    try {
      const { data, error } = await supabase
        .from('alertas_preventivas')
        .select(`
          id, 
          perfil_id, 
          nivel_fatiga, 
          mensaje, 
          fecha_creacion,
          perfiles (nombre)
        `)
        .eq('leida', false)
        .order('fecha_creacion', { ascending: false });

      if (error) throw error;
      
      // Actualizamos el estado con las alertas recibidas
      setAlertas(data as unknown as AlertaPreventiva[]);
    } catch (error) {
      console.error("Error cargando alertas:", error);
    }
  };

  // Función para descartar la alerta una vez que el entrenador la leyó
  const marcarComoLeida = async (idAlerta: string) => {
    try {
      const { error } = await supabase
        .from('alertas_preventivas')
        .update({ leida: true })
        .eq('id', idAlerta);

      if (error) throw error;

      // Recargamos la lista para que la alerta desaparezca de la pantalla
      cargarAlertas();
    } catch (error: any) {
        console.error(error);
      Alert.alert("Error", "No se pudo descartar la alerta.");
    }
  };

  // Escuchamos las alertas al montar el componente
  useEffect(() => {
    cargarAlertas();
  }, []);

  // Si no hay alertas, no renderizamos nada para mantener la pantalla limpia
  if (alertas.length === 0) return null;

  return (
    <View style={styles.contenedorPrincipal}>
      <Text style={styles.tituloSec}>⚠️ Alertas de Sobrecarga</Text>
      
      {alertas.map((alerta) => (
        <View key={alerta.id} style={styles.tarjetaAlerta}>
          <View style={styles.encabezadoTarjeta}>
            <Text style={styles.nombreAtleta}>{alerta.perfiles?.nombre || 'Atleta'}</Text>
            <Text style={styles.indicadorFatiga}>Fatiga: {alerta.nivel_fatiga}/10</Text>
          </View>
          
          <Text style={styles.mensajeAlerta}>{alerta.mensaje}</Text>
          
          <TouchableOpacity 
            style={styles.botonEntendido} 
            onPress={() => marcarComoLeida(alerta.id)}
          >
            <Text style={styles.textoBoton}>Marcar como Atendido</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  contenedorPrincipal: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 20,
  },
  tituloSec: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D32F2F', // Un rojo intenso para indicar precaución
    marginBottom: 8,
  },
  tarjetaAlerta: {
    backgroundColor: '#FFEBEE', // Fondo rojo claro (Material Design)
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#D32F2F',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  encabezadoTarjeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  nombreAtleta: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#B71C1C',
  },
  indicadorFatiga: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#D32F2F',
  },
  mensajeAlerta: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
  },
  botonEntendido: {
    backgroundColor: '#D32F2F',
    paddingVertical: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  textoBoton: {
    color: '#FFF',
    fontWeight: 'bold',
  }
});