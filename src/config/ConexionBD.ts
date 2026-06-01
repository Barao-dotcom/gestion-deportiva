import { createClient } from '@supabase/supabase-js';

// 1. Definimos las credenciales de tu proyecto en la nube
const supabaseUrl = 'https://pcekeqwfjttjivltklct.supabase.co';
const supabaseAnonKey = 'sb_publishable_vhw1GykJJYKBQQrdIw3Mfg_U7zz33mM';

// 2. Creamos y exportamos una única instancia del cliente (Patrón Singleton).
// Cualquier parte del sistema que importe 'supabase' usará esta misma conexión,
// manteniendo la aplicación ligera y optimizada.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);