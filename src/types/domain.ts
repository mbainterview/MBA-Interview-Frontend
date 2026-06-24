import type { ListParams } from "./api";

// ═════════════════════════════════════════════════════════════════════════════
// Auth
// ═════════════════════════════════════════════════════════════════════════════

export interface TokenPairResponse {
  access_token: string;
  refresh_token: string;
  expires_in?: string;
}

export interface AuthMessageResponse {
  message: string;
}

export interface OnboardingState {
  step:
    | "welcome"
    | "profile"
    | "resume"
    | "schools"
    | "goals"
    | "diagnostic"
    | "done";
  completed: boolean;
  completedAt: string | null;
}

export interface UserMe {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isEmailVerified?: boolean;
  avatarUrl?: string;
  onboarding: OnboardingState;
}

export interface AuthSession {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  expiresAt: string;
  createdAt: string;
}

// ═════════════════════════════════════════════════════════════════════════════
// Profile
// ═════════════════════════════════════════════════════════════════════════════

export interface EducationEntry {
  school: string;
  degree: string;
  major?: string;
  gpa?: string;
  graduationYear?: string;
}

export interface WorkEntry {
  company: string;
  title: string;
  startDate: string;
  endDate?: string;
  responsibilities?: string[];
}

export interface ParsedResume {
  name: string | null;
  education: Array<{
    school: string | null;
    degree: string | null;
    major: string | null;
    gpa: string | null;
    graduationYear: string | null;
  }>;
  work: Array<{
    company: string | null;
    title: string | null;
    startDate: string | null;
    endDate: string | null;
    bullets: string[];
  }>;
  skills: string[];
  certifications: string[];
  narrativeSummary: string | null;
}

export type InterviewGoal =
  | "improve_confidence"
  | "improve_structure"
  | "school_specific"
  | "kira_essay";

export type AiFeedbackLevel = "beginner" | "advanced";

export type OnboardingStep =
  | "welcome"
  | "profile"
  | "resume"
  | "schools"
  | "goals"
  | "diagnostic"
  | "done";

export interface UserProfile {
  id: string;
  userId: string;
  phone?: string;
  linkedInUrl?: string;
  gmatScore?: string;
  yearsOfExperience?: number;
  careerGoals?: string;
  leadershipRoles?: string;
  extracurriculars?: string;
  educationHistory?: EducationEntry[];
  workHistory?: WorkEntry[];
  targetSchoolIds?: string[];
  resumeS3Key?: string;
  resumeParseStatus?:
    | "none"
    | "queued"
    | "processing"
    | "complete"
    | "failed";
  parsedResume?: ParsedResume;
  onboardingStep: OnboardingStep;
  onboardingCompletedAt?: string | null;
  interviewGoals?: InterviewGoal[];
  aiFeedbackLevel?: AiFeedbackLevel;
  country?: string;
  timezone?: string;
  highestEducation?: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfilePayload {
  phone?: string;
  linkedInUrl?: string;
  gmatScore?: string;
  yearsOfExperience?: number;
  careerGoals?: string;
  leadershipRoles?: string;
  extracurriculars?: string;
  educationHistory?: EducationEntry[];
  workHistory?: WorkEntry[];
  targetSchoolIds?: string[];
  interviewGoals?: InterviewGoal[];
  aiFeedbackLevel?: AiFeedbackLevel;
  country?: string;
  timezone?: string;
  highestEducation?: string;
}

// ═════════════════════════════════════════════════════════════════════════════
// Schools
// ═════════════════════════════════════════════════════════════════════════════

export interface School {
  id: string;
  name: string;
  abbreviation: string;
  description?: string;
  location?: string;
  isActive: boolean;
  interviewConfig?: Record<string, unknown>;
  rubric?: Record<string, unknown>;
}

export type QuestionCategory =
  | "behavioral"
  | "situational"
  | "goals_motivation"
  | "leadership"
  | "teamwork"
  | "school_specific"
  | "kira_video";

export type QuestionDifficulty = "easy" | "medium" | "hard";

export interface Question {
  id: string;
  text: string;
  category: QuestionCategory;
  difficulty: QuestionDifficulty;
  isSchoolSpecific: boolean;
  followUpTemplates?: Record<string, unknown>[];
}

export interface QuestionFilterParams extends ListParams {
  category?: QuestionCategory;
  difficulty?: QuestionDifficulty;
}

// ═════════════════════════════════════════════════════════════════════════════
// Interview Sessions
// ═════════════════════════════════════════════════════════════════════════════

export type SessionStatus =
  | "pending"
  | "active"
  | "paused"
  | "completed"
  | "abandoned";

export interface InterviewSession {
  id: string;
  schoolId: string;
  schoolName: string;
  status: SessionStatus;
  currentQuestionIndex: number;
  totalQuestions: number;
  totalTokensUsed: number;
  tokenWarning?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationTurn {
  turnIndex: number;
  questionId: string | null;
  isFollowUp: boolean;
  aiQuestion: string;
  userAnswer: string | null;
  submittedAt: string | null;
  tokensUsed: number;
}

export interface PlannedQuestion {
  id: string;
  text: string;
  category?: string;
  difficulty?: string;
}

export interface InterviewSessionDetail extends InterviewSession {
  turns: ConversationTurn[];
  lastQuestion?: string | null;
  awaitingAnswer: boolean;
  plannedQuestions?: PlannedQuestion[];
}

// ═════════════════════════════════════════════════════════════════════════════
// Feedback
// ═════════════════════════════════════════════════════════════════════════════

export interface TurnFeedback {
  id: string;
  turnIndex: number;
  questionId: string | null;
  score: number;
  feedback: string;
  suggestedAnswer: string;
  keyStrengths: string[];
  areasForImprovement: string[];
}

export interface CriterionScore {
  criterionName: string;
  score: number;
  comment: string;
}

export interface VideoAnalysis {
  confidenceScore: number;
  bodyLanguageScore: number;
  eyeContactScore: number;
  pacingScore: number;
  overallPresentationScore: number;
  strengths: string[];
  improvements: string[];
  summary: string;
  transcription?: string;
}

export interface SessionFeedback {
  id: string;
  sessionId: string;
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  overallSummary: string;
  criteriaScores: CriterionScore[];
  suggestedFocusAreas: string[];
  generatedAt: string;
  tokensUsed: number;
  pdfReportKey: string | null;
  videoAnalysis: VideoAnalysis | null;
  turnFeedbacks: TurnFeedback[];
}

// ═════════════════════════════════════════════════════════════════════════════
// Kira Video Essays
// ═════════════════════════════════════════════════════════════════════════════

export interface KiraPrompt {
  id: string;
  text: string;
  category: string;
  prepTimeSeconds: number;
  responseTimeSeconds: number;
  difficulty: string;
  schoolId: string | null;
  orderIndex: number;
}

export interface KiraFeedback {
  overallScore: number;
  clarity: number;
  structure: number;
  content: number;
  confidence: number;
  suggestions: string[];
  summary?: string;
}

export interface KiraResponse {
  id: string;
  sessionId: string;
  promptId: string;
  prompt?: KiraPrompt | null;
  recordingS3Key: string | null;
  recordingDurationSeconds: number | null;
  feedbackGenerated: boolean;
  aiTranscript: string | null;
  aiFeedback: KiraFeedback | null;
  orderIndex: number;
}

export type KiraSessionStatus = "in_progress" | "completed" | "abandoned";

export interface KiraSession {
  id: string;
  userId: string;
  schoolId: string | null;
  status: KiraSessionStatus;
  promptCount: number;
  completedCount: number;
  responses?: KiraResponse[];
}

// ═════════════════════════════════════════════════════════════════════════════
// Subscriptions & Payments
// ═════════════════════════════════════════════════════════════════════════════

export interface PlanFeatures {
  maxSessionsPerDay: number;
  maxTokensDaily: number;
  maxTokensMonthly: number;
  videoEssayAccess: boolean;
  pdfReportAccess: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  priceInCents: number;
  currency: string;
  intervalMonths: number;
  description: string | null;
  displayFeatures: string[];
  features: PlanFeatures;
  isActive: boolean;
  isDefault: boolean;
  isFeatured: boolean;
  sortOrder: number;
  trialDays: number;
  stripePriceId: string | null;
}

export interface CreatePlanInput {
  name: string;
  slug?: string;
  priceInCents: number;
  intervalMonths: number;
  currency?: string;
  description?: string | null;
  displayFeatures?: string[];
  isActive?: boolean;
  isDefault?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
  trialDays?: number;
  stripePriceId?: string | null;
}

export type UpdatePlanInput = Partial<CreatePlanInput>;

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "expired";

export interface CurrentSubscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  trialEndAt: string | null;
  plan: SubscriptionPlan;
  paymentMethodBrand?: string | null;
  paymentMethodLast4?: string | null;
  latestInvoiceId?: string | null;
  nextChargeAt?: string | null;
}

export interface CreateSubscriptionIntentResponse {
  subscriptionId: string;
  clientSecret: string;
  intentType: "payment" | "setup";
  status: string;
  trialEnd: number | null;
}

// ═════════════════════════════════════════════════════════════════════════════
// Notifications
// ═════════════════════════════════════════════════════════════════════════════

export type NotificationType =
  | "session_complete"
  | "feedback_ready"
  | "payment_failed"
  | "subscription_expiring"
  | "system_announcement";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  isRead: boolean;
  readAt: string | null;
  created_at: string;
}

export interface NotificationPreferences {
  emailEnabled: boolean;
  pushEnabled: boolean;
  sessionReminders: boolean;
  feedbackAlerts: boolean;
  paymentAlerts: boolean;
  marketingEmails: boolean;
}

// ═════════════════════════════════════════════════════════════════════════════
// Settings
// ═════════════════════════════════════════════════════════════════════════════

export interface PrivacySettings {
  profilePublic: boolean;
  analyticsEnabled: boolean;
  allowSchoolContact: boolean;
}

// ═════════════════════════════════════════════════════════════════════════════
// Analytics
// ═════════════════════════════════════════════════════════════════════════════

export interface OverallStats {
  totalSessions: number;
  completedSessions: number;
  averageScore: number;
  completionRate: number;
  totalTokensUsed: number;
}

export interface HistoryItem {
  sessionId: string;
  schoolId: string;
  schoolName: string;
  schoolAbbreviation: string;
  status: SessionStatus;
  overallScore: number | null;
  createdAt: string;
  completedAt: string | null;
}

export interface HistoryResponse {
  items: HistoryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export interface TrendPoint {
  date: string;
  value: number;
  count: number;
}

export interface SkillBreakdownItem {
  criterionName: string;
  averageScore: number;
  sampleCount: number;
}

export interface SchoolInsights {
  schoolId: string;
  schoolName: string;
  sessionCount: number;
  averageScore: number | null;
  criteria: SkillBreakdownItem[];
}

export interface UsageStats {
  dailyUsed: number;
  monthlyUsed: number;
  dailyCap: number;
  monthlyCap: number;
  dailyUtilization: number;
  monthlyUtilization: number;
  planSlug: string;
  planName: string;
}

export interface UsageHistoryPoint {
  date: string;
  tokensUsed: number;
}

// ═════════════════════════════════════════════════════════════════════════════
// Usage (from /me/usage)
// ═════════════════════════════════════════════════════════════════════════════

export interface UsageResponse {
  dailyUsed: number;
  monthlyUsed: number;
  dailyCap: number;
  monthlyCap: number;
  dailyRemaining: number;
  monthlyRemaining: number;
}

// ═════════════════════════════════════════════════════════════════════════════
// Job Response (async operations)
// ═════════════════════════════════════════════════════════════════════════════

export interface JobResponse {
  jobId: string;
}

// ═════════════════════════════════════════════════════════════════════════════
// Admin
// ═════════════════════════════════════════════════════════════════════════════

export type UserStatus = "active" | "pending" | "suspended" | "deleted";
export type UserRole = "user" | "admin";

export interface AdminUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  status: UserStatus;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserDetail extends AdminUser {
  profile?: UserProfile;
  subscription?: CurrentSubscription;
  usage?: UsageResponse;
}

export interface AdminUserFilterParams extends ListParams {
  status?: UserStatus;
  role?: UserRole;
  planSlug?: string;
  search?: string;
}

export interface AdminOverview {
  totalUsers: number;
  activeUsers7d: number;
  totalSessions: number;
  avgScore: number;
  totalTokens: number;
}

export interface AdminUsageAnalytics {
  dailySessions30d: Array<{ date: string; count: number }>;
  topUsersByTokens: Array<{ userId: string; email: string; tokens: number }>;
  estimatedCost: number;
}

export interface AdminEngagement {
  sessionsPerUserDist: Record<string, number>;
  completionRate: number;
  averageDurationMinutes: number;
}

export interface AdminRevenue {
  mrrCents: number;
  paidSubscribers: number;
  planDistribution: Array<{ slug: string; name: string; count: number }>;
  trend: Array<{ date: string; activeSubscribers: number }>;
}

export interface SubscriptionFilterParams extends ListParams {
  status?: SubscriptionStatus;
  planSlug?: string;
}

export interface SubscriptionStats {
  byStatus: Record<string, number>;
  byPlan: Record<string, number>;
  totalMrrCents: number;
}

// ═════════════════════════════════════════════════════════════════════════════
// Admin — Notification Templates
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Lifecycle events that can fire an outbound email template. Mirrors the
 * `TriggerEvent` enum in `backend/src/modules/notification/core/enums/trigger-event.enum.ts`.
 */
export type TriggerEvent =
  | "on_signup"
  | "on_password_reset"
  | "on_account_deletion"
  | "on_payment_success"
  | "on_payment_failed"
  | "on_subscription_expiring"
  | "on_subscription_expired"
  | "on_admin_alert"
  | "on_session_complete"
  | "on_feedback_ready";

export const TRIGGER_EVENTS: TriggerEvent[] = [
  "on_signup",
  "on_password_reset",
  "on_account_deletion",
  "on_payment_success",
  "on_payment_failed",
  "on_subscription_expiring",
  "on_subscription_expired",
  "on_admin_alert",
  "on_session_complete",
  "on_feedback_ready",
];

export const TRIGGER_EVENT_LABELS: Record<TriggerEvent, string> = {
  on_signup: "On Signup",
  on_password_reset: "On Password Reset",
  on_account_deletion: "On Account Deletion",
  on_payment_success: "On Payment Success",
  on_payment_failed: "On Payment Failed",
  on_subscription_expiring: "On Subscription Expiring",
  on_subscription_expired: "On Subscription Expired",
  on_admin_alert: "On Admin Alert",
  on_session_complete: "On Session Complete",
  on_feedback_ready: "On Feedback Ready",
};

/**
 * Variables that the backend dispatch path actually passes to the renderer
 * for each trigger. Kept in sync with the `params` objects in each
 * EmailService.send(…) call site on the backend.
 *
 * If a trigger isn't listed here, or has an empty array, it means no
 * backend caller passes variables yet — the template will still render
 * but any `{{token}}` will come through literally.
 */
export interface TriggerVariable {
  name: string;
  description: string;
}

export const TRIGGER_EVENT_VARIABLES: Record<TriggerEvent, TriggerVariable[]> = {
  on_signup: [
    { name: "name", description: "Recipient's first name" },
    { name: "url", description: "Email verification link" },
  ],
  on_password_reset: [
    { name: "name", description: "Recipient's first name" },
    { name: "url", description: "Password-reset link (expires in 1 hour)" },
  ],
  on_account_deletion: [
    { name: "name", description: "Recipient's first name at time of deletion" },
  ],
  on_admin_alert: [
    { name: "name", description: "Recipient's first name (generic alerts)" },
    { name: "title", description: "Alert title (generic alerts)" },
    { name: "message", description: "Alert body (generic alerts)" },
    { name: "error", description: "Error message (system-error alerts)" },
    { name: "path", description: "Request path that failed (system-error alerts)" },
    { name: "timestamp", description: "When the error happened (ISO string)" },
    { name: "stack", description: "Error stack trace (system-error alerts)" },
  ],
  on_payment_success: [
    { name: "name", description: "Recipient's first name" },
    { name: "planName", description: "Plan name, e.g. \"Pro\"" },
    { name: "amount", description: "Charged amount formatted, e.g. \"$29.00\"" },
  ],
  // `on_payment_failed` IS dispatched today (webhook-handler.service.ts →
  // handleInvoicePaymentFailed) with `{ name, message }`.
  on_payment_failed: [
    { name: "name", description: "Recipient's first name" },
    { name: "message", description: "Failure description" },
  ],
  // The two below are supported by the hardcoded renderer but no backend
  // caller dispatches them today. `on_subscription_expiring` IS dispatched
  // from the trial_will_end webhook, so list its params as live; the
  // expired case is dormant.
  on_subscription_expiring: [
    { name: "name", description: "Recipient's first name" },
    { name: "message", description: "Expiry details (e.g. trial end date)" },
  ],
  on_subscription_expired: [
    { name: "name", description: "Recipient's first name (not yet dispatched)" },
    { name: "message", description: "Expiry details (not yet dispatched)" },
  ],
  // No EmailType maps to these yet, so no dispatch and no params.
  on_session_complete: [],
  on_feedback_ready: [],
};

export interface TemplateVariable {
  name: string;
  example?: string;
}

export interface NotificationTemplate {
  id: string;
  key: string;
  triggerEvent: TriggerEvent;
  name: string;
  emailSubject: string;
  emailBody: string;
  variables: TemplateVariable[];
  isActive: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateNotificationTemplateInput {
  key: string;
  triggerEvent: TriggerEvent;
  name: string;
  emailSubject: string;
  emailBody: string;
  variables?: TemplateVariable[];
  isActive?: boolean;
}

export type UpdateNotificationTemplateInput =
  Partial<CreateNotificationTemplateInput>;

export interface NotificationTemplateFilterParams {
  page?: number;
  limit?: number;
  triggerEvent?: TriggerEvent;
  search?: string;
  isActive?: boolean;
  sort?: "created_at" | "updated_at" | "name" | "id";
  order?: "ASC" | "DESC";
}

export interface NotificationTemplatePreview {
  subject: string;
  html: string;
}
