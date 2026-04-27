export interface Hospital {
  id: string;
  name: string;
  address?: string;
  created_at: string;
  admin_user_id: string;
}

export interface Doctor {
  id: string;
  name: string;
  email: string;
  specialization?: string;
  doctor_code?: string;
  hospital_id: string;
}

export interface ReportFile {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  report_type?: string;
  uploaded_by_role?: string;
  date_group: string;
  is_private?: boolean;
}

export interface AISummary {
  id?: string;
  patient_id: string;
  date_group: string;
  summary_text: string;
}
