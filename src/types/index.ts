export interface Employee {
  id: string;
  user_id?: string;
  full_name: string;
  father_husband_name: string;
  date_of_birth: string;
  full_address: string;
  mobile_number: string;
  alternate_mobile?: string;
  email?: string;
  aadhar_number: string;
  education: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  photo_url?: string;
  aadhar_url?: string;
  signature_url?: string;
  status: 'pending' | 'active' | 'terminated';
  warning_count: number;
  joined_date: string;
  created_at: string;
}

export interface SurveyRecord {
  id: string;
  employee_id: string;
  survey_date: string;
  survey_count: number;
  created_at: string;
}

export interface PdfSubmission {
  id: string;
  employee_id: string;
  submission_date: string;
  pdf_url: string;
  submitted_at: string;
  is_late: boolean;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  attendance_date: string;
  marked_at: string;
  is_present: boolean;
  is_late: boolean;
  created_at: string;
}

export interface Warning {
  id: string;
  employee_id: string;
  warning_type: 'absence' | 'survey_low' | 'pdf_late' | 'deposit_late' | 'manual' | 'false_info';
  warning_reason: string;
  issued_date: string;
  created_at: string;
}

export interface Deposit {
  id: string;
  employee_id: string;
  amount: number;
  transaction_screenshot_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  deposit_date: string;
  submitted_at: string;
  approved_at?: string;
  created_at: string;
}

export interface TeamMember {
  name: string;
  designation: string;
  mobile: string;
  photo: string;
}

export interface ProfileEditRequest {
  id: string;
  employee_id: string;
  request_type: 'mobile' | 'alternate_mobile' | 'email' | 'address' | 'bank_details' | 'multiple';
  old_data: Record<string, any>;
  new_data: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  requested_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  created_at: string;
}

export interface ProfileChangeHistory {
  id: string;
  employee_id: string;
  field_name: string;
  old_value?: string;
  new_value?: string;
  changed_by: string;
  change_type: 'admin_edit' | 'employee_request_approved' | 'employee_request_rejected';
  changed_at: string;
}

// Swastha Sangini Types
export interface SwasthaApplication {
  id: string;
  application_id: string;
  role: 'applicant' | 'district_coordinator' | 'block_coordinator' | 'panchayat_coordinator';
  
  // Personal Information
  full_name: string;
  father_name: string;
  mother_name: string;
  age: number;
  date_of_registration: string;
  
  // Contact Information
  gmail_id: string;
  whatsapp_number: string;
  facebook_profile?: string;
  
  // Address Information
  full_address: string;
  state: string;
  district: string;
  block_panchayat: string;
  pincode: string;
  
  // Work Information
  bpo_name: string;
  pco_name: string;
  upi_id: string;
  
  // Qualifications
  education: string;
  total_experience?: string;
  ngo_work_experience?: string;
  why_join?: string;
  
  // Documents
  photo_url: string;
  aadhar_front_url: string;
  aadhar_back_url: string;
  
  // Status
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  
  // Metadata
  created_at: string;
  updated_at: string;
}

export interface SwasthaCoordinator {
  id: string;
  application_id: string;
  coordinator_id?: string;
  coordinator_type: 'district' | 'block' | 'panchayat';
  full_name: string;
  state: string;
  district: string;
  block_panchayat?: string;
  pincode?: string;
  mobile_number: string;
  email: string;
  
  // Banking Details
  upi_id?: string;
  bank_name?: string;
  account_number?: string;
  ifsc_code?: string;
  
  // Profile
  photo_url?: string;
  profile_photo_url?: string;
  
  is_active: boolean;
  appointed_date: string;
  created_at: string;
  parent_coordinator_id?: string;
}

export interface SwasthaTeamMessage {
  id: string;
  sender_id: string;
  recipient_id?: string;
  message_type: 'direct' | 'team_broadcast' | 'announcement';
  subject: string;
  message: string;
  is_read: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  created_at: string;
}

export interface SwasthaSettings {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_label: string;
  updated_by?: string;
  updated_at: string;
}

export interface SwasthaResource {
  id: string;
  title: string;
  description?: string;
  resource_type: 'training_material' | 'guideline' | 'policy_document' | 'manual' | 'video' | 'other';
  file_url: string;
  file_size_kb?: number;
  visibility: 'all' | 'district' | 'block' | 'panchayat';
  uploaded_by: string;
  is_active: boolean;
  download_count: number;
  created_at: string;
  updated_at: string;
}

export interface SwasthaAnnouncement {
  id: string;
  title: string;
  message: string;
  announcement_type: 'general' | 'urgent' | 'training' | 'event' | 'policy_update';
  target_audience: 'all' | 'district' | 'block' | 'panchayat';
  target_state?: string;
  target_district?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  is_active: boolean;
  created_by: string;
  created_at: string;
  expires_at?: string;
}

export interface SwasthaReport {
  id: string;
  coordinator_id: string;
  report_type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'special';
  report_period: string;
  total_applications: number;
  approved_count: number;
  rejected_count: number;
  pending_count: number;
  activities_conducted: number;
  beneficiaries_reached: number;
  challenges_faced?: string;
  achievements?: string;
  recommendations?: string;
  report_file_url?: string;
  status: 'draft' | 'submitted' | 'reviewed' | 'approved';
  submitted_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

export interface PanchayatSurvey {
  id: string;
  coordinator_id: string;
  
  // Location
  state: string;
  district: string;
  block_panchayat: string;
  village: string;
  pincode: string;
  
  // Woman Details
  woman_name: string;
  woman_age: number;
  woman_mobile?: string;
  
  // Survey Data
  pad_usage: 'yes_regular' | 'yes_occasional' | 'no_never' | 'prefer_not_say';
  awareness_level: 'very_aware' | 'somewhat_aware' | 'not_aware' | 'need_education';
  
  // Media
  photo_url?: string;
  video_url: string;
  
  // Status
  status: 'submitted' | 'verified' | 'rejected';
  verified_by?: string;
  verified_at?: string;
  rejection_reason?: string;
  
  created_at: string;
  updated_at: string;
}
