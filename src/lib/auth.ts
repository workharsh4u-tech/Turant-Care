import { supabase } from "@/integrations/supabase/client";

export type AppRole = "patient" | "doctor" | "diagnostic_center" | "hospital_admin";

export async function signUp(email: string, password: string, role: AppRole, fullName: string, extra?: Record<string, string>) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role,
        full_name: fullName,
        ...extra,
      },
    },
  });
  return { data, error };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  
  return data;
}

export async function getPatientByCard(cardNumber: string) {
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("card_number", cardNumber)
    .single();
  return { data, error };
}

export async function getPatientByChip(chipId: string) {
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("chip_id", chipId)
    .single();
  return { data, error };
}

export async function verifyPin(patientId: string, pin: string) {
  const { data, error } = await supabase.rpc("verify_patient_pin", {
    p_patient_id: patientId,
    p_pin: pin,
  });
  return { valid: data === true, error };
}

export async function setPin(pin: string) {
  const { error } = await supabase.rpc("set_patient_pin", { p_pin: pin });
  return { error };
}
