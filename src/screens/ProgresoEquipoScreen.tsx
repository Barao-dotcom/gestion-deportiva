import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { supabase } from '../config/ConexionBD'; // Ajusta la ruta a tu conexión

// Definimos la estructura de los datos que traeremos
interface Rendimiento {
  fecha: string;
  peso_kg: number;
  nivel_fatiga: number;
}

interface AtletaData {
  id: string;
  nombre: string;
  rendimiento: Rendimiento[];
}

export default function ProgresoEquipoScreen() {
  const [equipo, setEquipo] = useState<AtletaData[]>([]);
  const [cargando, setCargando] = useState(true);

  // 1. Obtener la lista de perfiles y su historial de rendimiento
  const cargarProgresoEquipo = async () => {
    setCargando(true);
    try {
      const { data, error } = await supabase
        .from('perfiles')
        .select(`
          id,
          nombre,
          rendimiento ( fecha, peso_kg, nivel_fatiga )
        `)
        // Opcional: .eq('id_rol', ID_DEL_ROL_ATLETA) si tienes los roles mapeados
        .order('nombre', { ascending: true });

      if (error) throw error;
      setEquipo(data as unknown as AtletaData[]);
    } catch (error) {
      console.error("Error al cargar el equipo:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarProgresoEquipo();
  }, []);

  // 2. Motor de Generación de PDF
  const generarPDF = async (atleta: AtletaData) => {
    try {
      // Armamos las filas de la tabla leyendo el historial del atleta
      const filasHistorial = atleta.rendimiento.map(r => `
        <tr>
          <td>${new Date(r.fecha).toLocaleDateString()}</td>
          <td>${r.peso_kg} kg</td>
          <td style="color: ${r.nivel_fatiga >= 8 ? 'red' : 'green'}; font-weight: bold;">
            ${r.nivel_fatiga} / 10
          </td>
        </tr>
      `).join('');

      // Plantilla HTML profesional (Este es el "diseño" de tu PDF)
      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; color: #333; }
              h1 { color: #0056b3; text-align: center; border-bottom: 2px solid #0056b3; padding-bottom: 10px; }
              h2 { color: #444; margin-top: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 12px; text-align: center; }
              th { background-color: #f4f4f4; color: #333; }
              .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #888; }
            </style>
          </head>
          <body>
            <h1>Reporte de Rendimiento Deportivo</h1>
            <h2>Atleta: ${atleta.nombre}</h2>
            <p>Historial de cargas físicas y evolución de fatiga generados por el Sistema de Gestión.</p>
            
            <table>
              <tr>
                <th>Fecha de Registro</th>
                <th>Peso (kg)</th>
                <th>Nivel de Fatiga</th>
              </tr>
              ${filasHistorial.length > 0 ? filasHistorial : '<tr><td colspan="3">Sin registros aún</td></tr>'}
            </table>

            <div class="footer">
              Generado automáticamente por el Sistema de Gestión Deportiva
            </div>
          </body>
        </html>
      `;

      // Convertimos el HTML a un archivo PDF
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      
      // Abrimos la ventana nativa para compartir/guardar el PDF
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });

    } catch (error) {
      Alert.alert('Error', 'No se pudo generar el reporte PDF.');
      console.error(error);
    }
  };

  // 3. Renderizado de la lista
  const renderizarAtleta = ({ item }: { item: AtletaData }) => {
    // Calculamos el promedio de fatiga rápido para mostrarlo en la tarjeta
    const promedioFatiga = item.rendimiento.length > 0 
      ? (item.rendimiento.reduce((acc, curr) => acc + curr.nivel_fatiga, 0) / item.rendimiento.length).toFixed(1)
      : 'N/A';

    return (
      <View style={styles.tarjeta}>
        <View style={styles.infoAtleta}>
          <Text style={styles.nombre}>{item.nombre || 'Atleta Sin Nombre'}</Text>
          <Text style={styles.estadistica}>Fatiga Promedio: <Text style={{fontWeight: 'bold'}}>{promedioFatiga}/10</Text></Text>
          <Text style={styles.estadistica}>Total Registros: {item.rendimiento.length}</Text>
        </View>

        <TouchableOpacity style={styles.botonExportar} onPress={() => generarPDF(item)}>
          <FontAwesome5 name="file-pdf" size={20} color="#fff" />
          <Text style={styles.textoExportar}>Reporte</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (cargando) {
    return <ActivityIndicator size="large" color="#0056b3" style={{ marginTop: 50 }} />;
  }

  return (
    <View style={styles.contenedor}>
      <Text style={styles.tituloSec}>Progreso del Equipo</Text>
      <FlatList
        data={equipo}
        keyExtractor={(item) => item.id}
        renderItem={renderizarAtleta}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#f8f9fa', padding: 16 },
  tituloSec: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 15, textAlign: 'center' },
  tarjeta: { flexDirection: 'row', backgroundColor: '#fff', padding: 16, borderRadius: 10, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, alignItems: 'center', justifyContent: 'space-between', borderLeftWidth: 4, borderLeftColor: '#17a2b8' },
  infoAtleta: { flex: 1 },
  nombre: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  estadistica: { fontSize: 13, color: '#666', marginTop: 2 },
  botonExportar: { backgroundColor: '#dc3545', flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 },
  textoExportar: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
});