export type Role = "ambassador" | "admin";

export type SubmissionType = "poster" | "event" | "social";
export type SubmissionStatus = "pending" | "approved" | "rejected";

export type MaterialType = "poster" | "flyer";
export type RequestStatus = "pending" | "fulfilled" | "cancelled";

export interface Profile {
  id: string;
  full_name: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  shipping_address: string | null;
  school: string | null;
  hometown: string | null;
  instagram_handle: string | null;
  target_areas: string[];
  flyer_events: string[];
  role: Role;
  created_at: string;
}

export interface Submission {
  id: string;
  user_id: string;
  type: SubmissionType;
  status: SubmissionStatus;
  points: number;
  photo_path: string | null;
  notes: string | null;

  // poster
  location_name: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;

  // event
  event_name: string | null;
  venue: string | null;
  flyer_count: number | null;

  // social
  platform: string | null;
  post_url: string | null;

  reviewed_by: string | null;
  reviewed_at: string | null;
  reject_reason: string | null;
  created_at: string;
}

export interface MaterialRequest {
  id: string;
  user_id: string;
  type: MaterialType;
  quantity: number;
  notes: string | null;
  status: RequestStatus;
  created_at: string;
  fulfilled_at: string | null;
  fulfilled_by: string | null;
}

export interface AdminMessage {
  id: string;
  from_user_id: string;
  to_user_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
}

export interface TeamChatMessage {
  id: string;
  user_id: string;
  body: string;
  created_at: string;
}

export interface ProgressRow {
  user_id: string;
  full_name: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  shipping_address: string | null;
  school: string | null;
  hometown: string | null;
  target_areas: string[];
  flyer_events: string[];
  role: Role;
  approved_points: number;
  approved_count: number;
  pending_count: number;
  posters_sent: number;
  flyers_sent: number;
  last_activity: string | null;
}
