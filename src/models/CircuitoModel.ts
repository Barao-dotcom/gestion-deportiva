import { supabase } from '../config/ConexionBD';

export interface Circuito {
    id: string;
    nombre: string;
    tipo: string;
    series: number;
    repeticiones: number;
    descanso_segundos: number;
}

export class CircuitoModel {
    
    // Obtener todos los circuitos disponibles en la BD
    public static async obtenerCircuitos(): Promise<Circuito[]> {
        const { data, error } = await supabase
            .from('circuitos')
            .select('*')
            .order('nombre', { ascending: true });

        if (error) throw new Error(error.message);
        return data || [];
    }

    // Insertar un nuevo circuito (cumpliendo con la estructura sin videos que acordamos)
    public static async crearCircuito(circuito: Omit<Circuito, 'id'>): Promise<Circuito> {
        const { data, error } = await supabase
            .from('circuitos')
            .insert([circuito])
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data as Circuito;
    }
}