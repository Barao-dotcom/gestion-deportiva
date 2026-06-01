import { supabase } from '../config/ConexionBD';

// Interfaz estricta para prevenir errores de variables no definidas
export interface PerfilUsuario {
    id: string;
    id_rol: number;
    nombre: string;
    fecha_actualizacion?: string;
}

export class UsuarioModel {
    
    // Iniciar sesión con API nativa
    public static async iniciarSesion(correo: string, contrasena: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: correo,
            password: contrasena,
        });

        if (error) throw new Error(error.message);
        return data.session;
    }

    // Cerrar sesión de forma segura
    public static async cerrarSesion() {
        const { error } = await supabase.auth.signOut();
        if (error) throw new Error(error.message);
    }

    // Obtener perfil público (resiliente a perfiles faltantes)
    public static async obtenerPerfil(userId: string): Promise<PerfilUsuario | null> {
        const { data, error } = await supabase
            .from('perfiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle(); 

        if (error) throw new Error(error.message);
        return data as PerfilUsuario | null;
    }

    // Obtener todos los perfiles registrados para poder asignarlos a los circuitos
    public static async obtenerTodosLosPerfiles(): Promise<PerfilUsuario[]> {
        const { data, error } = await supabase
            .from('perfiles')
            .select('*')
            .order('nombre', { ascending: true });

        if (error) throw new Error(error.message);
        return data || [];
    }
}