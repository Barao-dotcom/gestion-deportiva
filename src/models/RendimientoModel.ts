import { supabase } from '../config/ConexionBD';

export interface MetricaRendimiento {
    id: string;
    perfil_id: string;
    fecha: string;
    peso_kg: number;
    nivel_fatiga: number;
}

export class RendimientoModel {
    
    public static async obtenerHistorial(userId: string): Promise<MetricaRendimiento[]> {
        const { data, error } = await supabase
            .from('rendimiento')
            .select('*')
            .eq('perfil_id', userId)
            .order('fecha', { ascending: false });

        if (error) throw new Error(error.message);
        return data || [];
    }

    public static async registrarMetrica(userId: string, peso: number, fatiga: number): Promise<void> {
        const { error } = await supabase
            .from('rendimiento')
            .insert([{
                perfil_id: userId,
                peso_kg: peso,
                nivel_fatiga: fatiga
            }]);

        if (error) throw new Error(error.message);
    }
}