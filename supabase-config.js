// CONFIGURAÇÃO DO SUPABASE
const supabaseUrl = 'https://csxqrqmskgljjxnfjkee.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzeHFycW1za2dsamp4bmZqa2VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MDU4MDQsImV4cCI6MjA4ODM4MTgwNH0.Bq_ZLDGlMELoQYDnHEjG8gVDIO41bL6-QG_5BlAzx8s';

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
