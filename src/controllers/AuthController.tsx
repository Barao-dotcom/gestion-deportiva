import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session } from '@supabase/supabase-js';
import { UsuarioModel, PerfilUsuario } from '../models/UsuarioModel';
import { supabase } from '../config/ConexionBD';

interface AuthContextType {
    session: Session | null;
    perfil: PerfilUsuario | null;
    cargando: boolean;
    iniciarSesion: (correo: string, contrasena: string) => Promise<void>;
    cerrarSesion: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        // Revisar sesión al arrancar
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session) cargarPerfil(session.user.id);
            else setCargando(false);
        });

        // Escuchar cambios de estado en tiempo real
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) {
                cargarPerfil(session.user.id);
            } else {
                setPerfil(null);
                setCargando(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const cargarPerfil = async (userId: string) => {
        try {
            const datosPerfil = await UsuarioModel.obtenerPerfil(userId);
            setPerfil(datosPerfil);
        } catch (error) {
            console.error("Error al cargar perfil:", error);
        } finally {
            setCargando(false);
        }
    };

    const iniciarSesion = async (correo: string, contrasena: string) => {
        await UsuarioModel.iniciarSesion(correo, contrasena);
    };

    const cerrarSesion = async () => {
        await UsuarioModel.cerrarSesion();
    };

    return (
        <AuthContext.Provider value={{ session, perfil, cargando, iniciarSesion, cerrarSesion }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }
    return context;
};