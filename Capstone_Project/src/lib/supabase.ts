import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const isPlaceholderUrl =
  !supabaseUrl || supabaseUrl.includes('your-supabase-project-url') || supabaseUrl.includes('<your');
const isPlaceholderKey =
  !supabaseAnonKey ||
  supabaseAnonKey.includes('your-anon-public-key') ||
  supabaseAnonKey.includes('<your');

export const supabaseConfigError = !supabaseUrl
  ? 'Missing VITE_SUPABASE_URL. Add your Supabase project URL to the .env file.'
  : isPlaceholderUrl
  ? 'VITE_SUPABASE_URL is using the placeholder value. Replace it with your actual Supabase URL.'
  : !supabaseAnonKey
  ? 'Missing VITE_SUPABASE_ANON_KEY. Add your Supabase anon key to the .env file.'
  : isPlaceholderKey
  ? 'VITE_SUPABASE_ANON_KEY is using the placeholder value. Replace it with your actual Supabase anon key.'
  : null;

export const hasSupabaseEnv = !supabaseConfigError;

export const supabase = hasSupabaseEnv
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: false,
      },
    })
  : null;

export function getSupabaseClient() {
  if (!supabase) {
    throw new Error(
      supabaseConfigError ||
        'Supabase client is not configured correctly. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
    );
  }
  return supabase;
}

export type DocumentStatus = 'uploading' | 'processing' | 'ready' | 'error';

export interface DocumentRecord {
  id: string;
  name: string;
  size: number;
  content_type: string;
  status: DocumentStatus;
  page_count: number;
  chunk_count: number;
  error_message: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface DocumentChunk {
  id: string;
  document_id: string;
  chunk_index: number;
  content: string;
  page_number: number;
  token_count: number;
  created_at: string;
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface CitationSource {
  document_id: string;
  document_name: string;
  page: number;
  chunk_index: number;
  similarity: number;
}

export interface MessageRecord {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  sources: CitationSource[];
  created_at: string;
}
