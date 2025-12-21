export type UserRole = 'super_admin' | 'treasurer' | 'secretary' | 'pastor' | 'member';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  membershipNumber?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Member {
  id: string;
  userId?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  dateOfBirth?: Date;
  gender: 'male' | 'female';
  maritalStatus: 'single' | 'married' | 'widowed' | 'divorced';
  address?: string;
  membershipNumber: string;
  baptismDate?: Date;
  spiritualStatus: 'baptized' | 'visitor' | 'child' | 'transferred';
  departmentId?: string;
  occupation?: string;
  employer?: string;
  nextOfKin?: string;
  nextOfKinPhone?: string;
  profilePhoto?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentCategory {
  id: string;
  name: string;
  code: string;
  description?: string;
  targetAmount?: number;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: Date;
}

export interface Payment {
  id: string;
  memberId: string;
  categoryId: string;
  amount: number;
  paymentMethod: 'cash' | 'mpesa' | 'bank_transfer' | 'cheque';
  referenceNumber?: string;
  description?: string;
  receiptUrl?: string;
  paymentDate: Date;
  recordedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  headId?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface SecretariatRecord {
  id: string;
  type: 'minutes' | 'event' | 'correspondence' | 'certificate';
  title: string;
  content?: string;
  date: Date;
  participants?: string[];
  attachments?: string[];
  createdBy: string;
  status: 'draft' | 'approved' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface Pledge {
  id: string;
  memberId: string;
  categoryId: string;
  amount: number;
  startDate: Date;
  endDate: Date;
  frequency: 'one_time' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  status: 'active' | 'completed' | 'cancelled';
  paidAmount: number;
  createdAt: Date;
}

export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  totalContributions: number;
  monthlyContributions: number;
  pendingPledges: number;
  recentPayments: Payment[];
}
