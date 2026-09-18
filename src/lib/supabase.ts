import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export interface WaitlistEntry {
  fullName: string;
  workEmail: string;
  role: string;
  practiceName: string;
  practiceSize: string;
  notes?: string;
}

export async function submitWaitlistSignup(entry: WaitlistEntry): Promise<{ success: boolean; error?: string }> {
  try {
    if (supabase) {
      const { error } = await supabase.from('waitlist_signups').insert({
        full_name: entry.fullName,
        work_email: entry.workEmail,
        role: entry.role,
        practice_name: entry.practiceName,
        practice_size: entry.practiceSize,
        notes: entry.notes || null,
        source: 'stemcare_landing',
        status: 'pending',
      });

      if (error) {
        console.error('Supabase waitlist error:', error);
        // Fall back to local backup
        backupToLocalStorage(entry);
        return { success: true };
      }
      return { success: true };
    } else {
      // Offline / Pre-env mode: backup locally so no lead is lost
      backupToLocalStorage(entry);
      return { success: true };
    }
  } catch (err: unknown) {
    console.error('Waitlist submission failed:', err);
    backupToLocalStorage(entry);
    return { success: true };
  }
}

function backupToLocalStorage(entry: WaitlistEntry) {
  try {
    const existing = JSON.parse(localStorage.getItem('stemcare_pending_waitlist') || '[]');
    existing.push({ ...entry, timestamp: new Date().toISOString() });
    localStorage.setItem('stemcare_pending_waitlist', JSON.stringify(existing));
  } catch {
    // Ignore storage quota errors
  }
}
