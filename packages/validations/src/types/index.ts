export type UserRole = 'user' | 'admin' | 'sales_rep';

export interface UserProfile {
  avatar_url: string
  email: string
  full_name: string
  credits: number
  ai_trained: boolean
  youtube_connected: boolean
  language: string
  referral_code: string | null
  role?: UserRole
}

export interface AdminDashboardStats {
  totalUsers: number
  totalSalesReps: number
  newUsers30d: number
  activeSubscriptions: number
  publishedBlogs: number
  totalSales: number
  totalRevenue: number
  unreadMails: number
  pendingApplications: number
}

export interface SalesRepDashboardStats {
  totalLinks: number
  confirmedSales: number
  totalInvited: number
  totalCommission: number
  pendingCommission: number
}

export interface BlogPost {
  id: string
  author_id: string
  title: string
  slug: string
  excerpt?: string
  content: string
  cover_image_url?: string
  category: string
  tags: string[]
  status: 'draft' | 'published' | 'archived'
  featured: boolean
  published_at?: string
  created_at: string
  updated_at: string
}

export interface AffiliateLink {
  id: string
  sales_rep_id: string
  code: string
  label?: string
  target_url: string
  commission_rate: number
  click_count: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AffiliateSale {
  id: string
  affiliate_link_id: string
  sales_rep_id: string
  customer_id?: string
  customer_email?: string
  amount: number
  commission: number
  status: 'pending' | 'confirmed' | 'paid' | 'refunded'
  created_at: string
  updated_at: string
  affiliate_links?: { code: string; label: string }
}

export interface InvitedUser {
  id: string
  invited_by: string
  email: string
  status: 'pending' | 'registered' | 'subscribed' | 'expired'
  affiliate_link_id?: string
  registered_user_id?: string
  created_at: string
  updated_at: string
  affiliate_links?: { code: string; label: string }
}

export interface MailMessage {
  id: string
  from_email: string
  from_name?: string
  subject: string
  body: string
  status: 'unread' | 'read' | 'replied' | 'archived'
  replied_at?: string
  replied_by?: string
  created_at: string
}

export interface Activity {
  id: string
  actor_id: string
  action: string
  entity_type: string
  entity_id?: string
  metadata?: Record<string, unknown>
  created_at: string
  profiles?: { full_name: string; email: string; avatar_url?: string }
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export type JobTeam = 'Engineering' | 'AI' | 'Design' | 'Marketing' | 'Business' | string

export const DEV_TEAMS: string[] = ['Engineering', 'AI']

export type JobCategory = 'engineering' | 'ai' | 'design' | 'marketing' | 'business' | 'other'

export interface JobPost {
  id: string
  title: string
  team: JobTeam
  location: string
  type: string
  category: JobCategory
  description: string
  requirements?: string
  status: 'active' | 'inactive' | 'closed'
  created_at: string
  updated_at: string
}

export interface JobApplication {
  id: string
  job_post_id?: string
  position: string
  full_name: string
  email: string
  phone?: string
  linkedin_url: string
  github_url?: string
  portfolio_url?: string
  resume_file_path?: string
  cover_letter_file_path?: string
  experience: string
  problem_solving: string
  status: 'pending' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired'
  notes?: string
  reviewed_by?: string
  reviewed_at?: string
  created_at: string
  updated_at: string
  job_posts?: { title: string; team: string }
}

export interface Script {
  id: string
  title: string
  content?: string
  tone?: string
  language?: string
  status?: string
  credits_consumed?: number
  created_at: string
  updated_at?: string
  user_id?: string
}

export * from "./SubtitleTypes";
export * from "./dubbing";