export interface Student {
  id: string;
  rollNumber: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  year: string;
  hostelName: string;
  roomNumber: string;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
}

export interface AttendanceItem {
  subject: string;
  attended: number;
  total: number;
  percentage: number;
}

export interface Attendance {
  studentId: string;
  totalClasses: number;
  attendedClasses: number;
  percentage: number;
  trend: { month: string; rate: number }[];
  subjects: AttendanceItem[];
}

export interface FeePayment {
  id: string;
  amountPaid: number;
  date: string;
  paymentMethod: string;
  status: string;
}

export interface Fee {
  studentId: string;
  totalFees: number;
  paidAmount: number;
  remainingAmount: number;
  installments: number;
  dueDate: string;
  paymentHistory: FeePayment[];
}

export interface Hostel {
  studentId: string;
  hostelName: string;
  roomNumber: string;
  roomType: string;
  hostelFeeStatus: 'Paid' | 'Pending' | 'Due';
  dueDate: string;
  monthlyRent: number;
}

export interface Scholarship {
  id: string;
  name: string;
  description: string;
  eligibleCriteria: string;
  appliedDate?: string;
  status: 'Eligible' | 'Applied' | 'Approved' | 'Rejected' | 'Processing';
  paymentStatus: 'Paid' | 'Processing' | 'Unpaid' | 'N/A';
  amount: number;
  deadline: string;
}

export interface Fine {
  id: string;
  studentId: string;
  amount: number;
  reason: string;
  date: string;
  paymentStatus: 'Pending' | 'Paid';
}

export interface CampusNotification {
  id: string;
  studentId: string;
  title: string;
  message: string;
  type: 'attendance' | 'fee' | 'hostel' | 'scholarship' | 'fine' | 'policy' | 'general';
  date: string;
  read: boolean;
  emailSent: boolean;
}

export interface PolicyDocument {
  id: string;
  title: string;
  category: string;
  uploadDate: string;
  content: string; // Plain text or concatenated chunks
  pages: { pageNum: number; text: string }[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  message: string;
  timestamp: string;
}

export interface AuthState {
  token: string | null;
  user: {
    id: string;
    rollNumber?: string;
    name: string;
    email: string;
    role: 'student' | 'admin';
  } | null;
}
