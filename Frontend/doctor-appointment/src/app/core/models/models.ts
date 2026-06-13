export interface LoginRequest {
  email: string;
  password: string;
  role: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: string;
  age?: number;
  gender?: string;
  phoneNumber?: string;
}

export interface AuthResponse {
  token: string;
  name: string;
  email: string;
  role: string;
  userId: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}

export interface Doctor {
  id: string;
  userId: string;
  name: string;
  email: string;
  specialization: string;
  experience: number;
  hospitalId?: string;
  hospitalName?: string;
  hospitalLocation?: string;
  availabilitySchedule: string;
  city?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
}

export interface CreateDoctor {
  name: string;
  email: string;
  password: string;
  specialization: string;
  experience: number;
  hospitalId?: string;
  availabilitySchedule: string;
  city?: string;
  state?: string;
}

export interface UpdateDoctor {
  name: string;
  email: string;
  specialization: string;
  experience: number;
  hospitalId?: string;
  availabilitySchedule: string;
  city?: string;
  state?: string;
}

export interface Patient {
  id: string;
  userId: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  medicalHistory: string;
}

export interface Hospital {
  id: string;
  name: string;
  city: string;
  state: string;
  country: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
  doctorCount?: number;
}

export interface CreateHospital {
  name: string;
  city: string;
  state: string;
  country: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientUserId: string;
  patientName: string;
  doctorId: string;
  doctorUserId: string;
  doctorName: string;
  specialization: string;
  appointmentDate: Date;
  status: number;
  notes: string;
  payment?: PaymentInfo;
}

export interface PaymentInfo {
  id: string;
  amount: number;
  paymentMethod: string;
  status: string;
  transactionId: string;
  paymentDetail: string;
  createdAt: Date;
}

export interface CreateAppointment {
  doctorId: string;
  appointmentDate: Date;
  notes: string;
  paymentMethod: number;
  amount: number;
  paymentDetail: string;
}

export interface ChatContact {
  userId: string;
  name: string;
  role: string;
  appointmentId: string;
  specialization: string;
  canChat: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  message: string;
  timestamp: Date;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  phoneNumber?: string;
  age?: number;
  gender?: string;
  specialization?: string;
  experience?: number;
  availabilitySchedule?: string;
  medicalHistory?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  phoneNumber?: string;
  age?: number;
  gender?: string;
  specialization?: string;
  experience?: number;
  availabilitySchedule?: string;
  medicalHistory?: string;
}

export interface Feedback {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  rating: number;
  comment: string;
  tags: string[];
  isAnonymous: boolean;
  sentiment: string;
  isFlagged: boolean;
  moderationStatus: string;
  createdAt: Date;
}

export interface CreateFeedback {
  appointmentId: string;
  rating: number;
  comment: string;
  tags: string[];
  isAnonymous: boolean;
}

export interface DoctorRatingSummary {
  doctorId: string;
  doctorName: string;
  specialization: string;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { [key: number]: number };
  sentimentSummary: SentimentSummary;
  topKeywords: string[];
  feedbacks: Feedback[];
}

export interface SentimentSummary {
  positive: number;
  neutral: number;
  negative: number;
}

export interface AdminFeedbackAnalytics {
  totalReviews: number;
  platformAverageRating: number;
  uniqueDoctorsRated: number;
  uniquePatientsReviewed: number;
  sentimentSummary: SentimentSummary;
  flaggedReviews: number;
  topDoctors: DoctorPerformance[];
  lowRatedDoctors: DoctorPerformance[];
  ratingDistribution: { [key: number]: number };
  monthlyTrends: MonthlyTrend[];
  topKeywords: string[];
  recentFeedbacks: Feedback[];
  flaggedFeedbacks: Feedback[];
}

export interface DoctorPerformance {
  doctorId: string;
  doctorName: string;
  averageRating: number;
  reviewCount: number;
}

export interface MonthlyTrend {
  month: string;
  reviewCount: number;
  averageRating: number;
}
