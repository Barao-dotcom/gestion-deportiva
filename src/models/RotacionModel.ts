import { supabase } from '../config/ConexionBD';

// Interfaz que mapea exactamente tu tabla 'rotaciones'
export interface Rotacion {
    id: string;
    circuito_id: string;
    nombre_grupo: string;
    max_integrantes: number;
    hora_inicio: string;
}

// Interfaz para cuando consultemos las rotaciones incluyendo el nombre del circuito
export interface RotacionDetallada extends Rotacion {
    circuitos: {
        nombre: string;
        tipo: string;
    } | null;
}

export class RotacionModel {

    // 1. Obtener todas las rotaciones junto con los datos del circuito asignado
    public static async obtenerRotaciones(): Promise<RotacionDetallada[]> {
        const { data, error } = await supabase
            .from('rotaciones')
            .select(`
                id,
                circuito_id,
                nombre_grupo,
                max_integrantes,
                hora_inicio,
                circuitos (
                    nombre,
                    tipo
                )
            `)
            .order('hora_inicio', { ascending: true });

        if (error) throw new Error(error.message);
        return data as unknown as RotacionDetallada[];
    }

    // 2. Crear un nuevo grupo de rotación
    public static async crearRotacion(rotacion: Omit<Rotacion, 'id'>): Promise<Rotacion> {
        const { data, error } = await supabase
            .from('rotaciones')
            .insert([rotacion])
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data as Rotacion;
    }

    // 3. Asignar un atleta a un grupo (Verificando antes el límite de max_integrantes)
    public static async asignarAtleta(rotacionId: string, perfilId: string, maxIntegrantes: number): Promise<void> {
        // Primero contamos cuántos atletas ya están en este grupo
        const { count, error: countError } = await supabase
            .from('rotacion_atletas')
            .select('*', { count: 'exact', head: true })
            .eq('rotacion_id', rotacionId);

        if (countError) throw new Error(countError.message);

        // Validamos el límite de capacidad para cumplir con la regla de grupos optimizados (ej. 5 personas)
        if (count !== null && count >= maxIntegrantes) {
            throw new Error(`El grupo ya ha alcanzado el límite máximo de ${maxIntegrantes} integrantes.`);
        }

        // Si hay espacio, lo registramos en la tabla puente
        const { error } = await supabase
            .from('rotacion_atletas')
            .insert([{ rotacion_id: rotacionId, perfil_id: perfilId }]);

        if (error) throw new Error(error.message);
    }

    // 4. Obtener la lista de atletas asignados a una rotación específica
    public static async obtenerAtletasDeRotacion(rotacionId: string) {
        const { data, error } = await supabase
            .from('rotacion_atletas')
            .select(`
                id,
                perfiles (
                    id,
                    nombre
                )
            `)
            .eq('rotacion_id', rotacionId);

        if (error) throw new Error(error.message);
        return data || [];
    }

    // 5. Quitar a un atleta de una rotación (liberar espacio en el grupo)
    public static async removerAtleta(rotacionId: string, perfilId: string): Promise<void> {
        const { error } = await supabase
            .from('rotacion_atletas')
            .delete()
            .eq('rotacion_id', rotacionId)
            .eq('perfil_id', perfilId);

        if (error) throw new Error(error.message);
    }
}