import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },

  // Auth
  { path: 'auth/login', loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'auth/register', loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent) },

  // Admin
  {
    path: 'admin/dashboard',
    loadComponent: () => import('./admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [roleGuard('Admin')]
  },
  {
    path: 'admin/manage-doctors',
    loadComponent: () => import('./admin/manage-doctors/manage-doctors.component').then(m => m.ManageDoctorsComponent),
    canActivate: [roleGuard('Admin')]
  },
  {
    path: 'admin/manage-hospitals',
    loadComponent: () => import('./admin/manage-hospitals/manage-hospitals.component').then(m => m.ManageHospitalsComponent),
    canActivate: [roleGuard('Admin')]
  },
  {
    path: 'admin/appointments',
    loadComponent: () => import('./admin/view-appointments/view-appointments.component').then(m => m.ViewAppointmentsComponent),
    canActivate: [roleGuard('Admin')]
  },
  {
    path: 'admin/manage-users',
    loadComponent: () => import('./admin/manage-users/manage-users.component').then(m => m.ManageUsersComponent),
    canActivate: [roleGuard('Admin')]
  },
  {
    path: 'admin/feedback',
    loadComponent: () => import('./admin/feedback/admin-feedback.component').then(m => m.AdminFeedbackComponent),
    canActivate: [roleGuard('Admin')]
  },
  {
    path: 'admin/profile',
    loadComponent: () => import('./shared/components/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [roleGuard('Admin')]
  },

  // Doctor
  {
    path: 'doctor/dashboard',
    loadComponent: () => import('./doctor/dashboard/doctor-dashboard.component').then(m => m.DoctorDashboardComponent),
    canActivate: [roleGuard('Doctor')]
  },
  {
    path: 'doctor/chat',
    loadComponent: () => import('./shared/components/chat/chat.component').then(m => m.ChatComponent),
    canActivate: [roleGuard('Doctor')]
  },
  {
    path: 'doctor/feedback',
    loadComponent: () => import('./doctor/feedback/doctor-feedback.component').then(m => m.DoctorFeedbackComponent),
    canActivate: [roleGuard('Doctor')]
  },
  {
    path: 'doctor/video-call',
    loadComponent: () => import('./shared/components/video-call/video-call.component').then(m => m.VideoCallComponent),
    canActivate: [roleGuard('Doctor')]
  },
  {
    path: 'doctor/profile',
    loadComponent: () => import('./shared/components/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [roleGuard('Doctor')]
  },

  // Patient
  {
    path: 'patient/dashboard',
    loadComponent: () => import('./patient/dashboard/patient-dashboard.component').then(m => m.PatientDashboardComponent),
    canActivate: [roleGuard('Patient')]
  },
  {
    path: 'patient/search-doctors',
    loadComponent: () => import('./patient/search-doctors/search-doctors.component').then(m => m.SearchDoctorsComponent),
    canActivate: [roleGuard('Patient')]
  },
  {
    path: 'patient/book-appointment',
    loadComponent: () => import('./patient/book-appointment/book-appointment.component').then(m => m.BookAppointmentComponent),
    canActivate: [roleGuard('Patient')]
  },
  {
    path: 'patient/chat',
    loadComponent: () => import('./shared/components/chat/chat.component').then(m => m.ChatComponent),
    canActivate: [roleGuard('Patient')]
  },
  {
    path: 'patient/feedback',
    loadComponent: () => import('./patient/feedback/patient-feedback.component').then(m => m.PatientFeedbackComponent),
    canActivate: [roleGuard('Patient')]
  },
  {
    path: 'patient/video-call',
    loadComponent: () => import('./shared/components/video-call/video-call.component').then(m => m.VideoCallComponent),
    canActivate: [roleGuard('Patient')]
  },
  {
    path: 'patient/profile',
    loadComponent: () => import('./shared/components/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [roleGuard('Patient')]
  },

  { path: '**', redirectTo: '/auth/login' }
];
