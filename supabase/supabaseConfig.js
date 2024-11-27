// supabaseConfig.js
import { createClient } from '@supabase/supabase-js';

// Supabase Project URL dan API Key yang Anda dapatkan
const SUPABASE_URL = 'https://jdhgigrlgfkelqikffaw.supabase.co';  // Ganti dengan URL yang benar
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkaGdpZ3JsZ2ZrZWxxaWtmZmF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEyNDc3NzAsImV4cCI6MjA0NjgyMzc3MH0.0Oj6ALlSR4PNgc9LX4vsPEoMLkcxt5OXK_lI4HI5Dgw';  // Ganti dengan API Key Anda

// Membuat klien Supabase untuk berinteraksi dengan database
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
