import { supabase } from './client';

/**
 * Fetches a single settings object by key.
 * @param key The settings key (e.g., 'branding', 'theme').
 */
export async function fetchSettings<T>(key: string): Promise<T | null> {
  const { data, error } = await supabase
    .from('app_settings')
    .select('settings_value')
    .eq('settings_key', key)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 means 'no rows found'
    console.error(`Error fetching settings for ${key}:`, error);
    return null;
  }

  return (data?.settings_value as T) || null;
}

/**
 * Updates or inserts a settings object by key.
 * NOTE: This relies on the RLS policy allowing authenticated admins/superusers to write.
 * @param key The settings key.
 * @param value The new settings object.
 */
export async function updateSettings<T>(key: string, value: T): Promise<T | null> {
  const { data, error } = await supabase
    .from('app_settings')
    .upsert(
      {
        settings_key: key,
        settings_value: value,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'settings_key' }
    )
    .select('settings_value')
    .single();

  if (error) {
    console.error(`Error updating settings for ${key}:`, error);
    throw new Error(`Failed to save settings: ${error.message}`);
  }

  return (data?.settings_value as T) || null;
}