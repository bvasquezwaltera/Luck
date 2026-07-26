export interface FreelancerLanguage {
  name: string;
  level: string;
}

export interface FreelancerBadges {
  successRate: number;
  topRated: boolean;
  avgResponseTime: string;
}

export interface FreelancerStats {
  completedProjects: number;
  hoursWorked: number;
  repeatClients: number;
  memberSince: string;
  lastDelivery: string;
}

export interface ExperienceEntry {
  period: string;
  role: string;
  company: string;
  description: string;
}

export interface EducationEntry {
  period: string;
  degree: string;
  institution: string;
}

export interface WorkMethodCategory {
  label: string;
  items: string[];
}

export type WorkMethods = WorkMethodCategory[];

export interface FreelancerProfile {
  id: string;
  name: string;
  email: string;
  initials: string;
  rating: number;
  reviewCount: number;
  specialty: string;
  category: string;
  country: string;
  countryCode: string;
  timezone: string;
  online: boolean;
  languages: FreelancerLanguage[];
  skills: string[];
  badges: FreelancerBadges;
  stats: FreelancerStats;
  bio: string;
  differentiators: string[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  tools: string[];
  availabilityStatus: string;
  workMethods: WorkMethods;
}
