"use client";

import { useState } from "react";
import { Header } from "@/modules/inicio/Header";
import { Breadcrumb } from "@/modules/perfil/Breadcrumb";
import { ProfileHeader } from "@/modules/perfil/ProfileHeader";
import { ProfileTabs, type ProfileTab } from "@/modules/perfil/ProfileTabs";
import { AboutTab } from "@/modules/perfil/AboutTab";
import { ProfileSidebar } from "@/modules/perfil/ProfileSidebar";
import { PortfolioTab } from "@/modules/perfil/PortfolioTab";
import { ReviewsTab } from "@/modules/perfil/ReviewsTab";
import { SubscriptionsTab } from "@/modules/perfil/SubscriptionsTab";
import type { FreelancerProfile } from "@/types/freelancerProfile";
import type { PortfolioProject } from "@/types/portfolioProject";
import type { ReviewEntry } from "@/types/review";
import type { SubscriptionPlan } from "@/types/subscriptionPlan";
import reviewsData from "@/data/reviews.json";

const exampleReviews = reviewsData as ReviewEntry[];

const examplePlans: SubscriptionPlan[] = [
  {
    id: "plan-basico",
    name: "Básico",
    tier: "basico",
    description: "Solución perfecta para MVPs o funcionalidades específicas.",
    price: 800,
    activeProjects: "1 proyecto activo",
    revisions: "2 revisiones",
    support: "Soporte por email",
    deliveryTime: "Entrega en 2 semanas",
  },
  {
    id: "plan-estandar",
    name: "Estándar",
    tier: "estandar",
    description: "Desarrollo completo de aplicaciones web con funcionalidades avanzadas.",
    price: 2000,
    activeProjects: "3 proyectos activos",
    revisions: "5 revisiones",
    support: "Soporte por email y chat",
    deliveryTime: "Entrega en 1 semana",
  },
  {
    id: "plan-premium",
    name: "Premium",
    tier: "premium",
    description: "Aplicaciones completas, escalables y optimizadas para rendimiento.",
    price: 4000,
    activeProjects: "Proyectos ilimitados",
    revisions: "Revisiones ilimitadas",
    support: "Soporte prioritario 24/7",
    deliveryTime: "Entrega en 3 días",
  },
];

const exampleProfile: FreelancerProfile = {
  id: "f-1",
  name: "Diego B.",
  email: "diego.b@example.com",
  initials: "DB",
  rating: 5.0,
  reviewCount: 54,
  specialty: "Full Stack Developer",
  category: "Desarrollo Web",
  country: "Brasil",
  countryCode: "BR",
  timezone: "GMT-3 (São Paulo)",
  online: true,
  languages: [
    { name: "Português", level: "Nativo" },
    { name: "Español", level: "Avanzado" },
    { name: "English", level: "Intermediate" },
  ],
  skills: [
    "Python",
    "JavaScript",
    "TypeScript",
    "React",
    "Node.js",
    "PostgreSQL",
    "Docker",
    "REST API",
    "Git",
    "AWS",
  ],
  badges: {
    successRate: 98,
    topRated: true,
    avgResponseTime: "<1 hora",
  },
  stats: {
    completedProjects: 54,
    hoursWorked: 1240,
    repeatClients: 18,
    memberSince: "Enero 2022",
    lastDelivery: "Hace 2 días",
  },
  bio: "Soy desarrollador Full Stack con más de 6 años de experiencia construyendo productos digitales que escalan. Empecé con Python para automatización y data, luego migré al mundo web con Node.js y React, y hoy trabajo con ambos mundos en proyectos que van desde startups en etapa temprana hasta empresas con millones de usuarios.",
  differentiators: [
    "Comunicación clara y constante durante todo el proyecto",
    "Entrega a tiempo y compromiso total con el cliente",
    "Código limpio, escalable y bien documentado",
    "Soluciones personalizadas para cada caso de negocio",
    "Enfoque en resultados y experiencia de usuario",
  ],
  experience: [
    {
      period: "2022 – Presente",
      role: "Senior Full Stack Developer",
      company: "TechLab Brasil",
      description:
        "Desarrollo de plataformas SaaS para el sector fintech. Lideré la migración de arquitectura monolítica a microservicios, reduciendo el tiempo de despliegue en un 60%.",
    },
    {
      period: "2019 – 2022",
      role: "Full Stack Developer",
      company: "StartupHub",
      description:
        "Construcción de MVPs para más de 12 startups. Stack principal: React, Node.js, PostgreSQL, AWS.",
    },
  ],
  education: [
    {
      period: "2015 – 2019",
      degree: "Bachillerato en Ciencias de la Computación",
      institution: "Universidade de São Paulo (USP)",
    },
    {
      period: "2021",
      degree: "AWS Certified Solutions Architect – Associate",
      institution: "AWS Training",
    },
  ],
  tools: [
    "Python",
    "JavaScript",
    "TypeScript",
    "React",
    "Node.js",
    "PostgreSQL",
    "Docker",
    "REST API",
    "Git",
    "AWS",
    "VS Code",
    "Postman",
    "Figma",
    "GitHub Actions",
    "Terraform",
    "Redis",
    "MongoDB",
    "Linux",
    "Nginx",
  ],
  availabilityStatus: "Nuevos proyectos",
  workMethods: {
    communication: ["Slack", "WhatsApp", "Google Meet"],
    projectManagement: ["Jira", "Trello", "Notion"],
    versionControl: ["Git", "GitHub", "GitLab"],
  },
};

const exampleProjects: PortfolioProject[] = [
  {
    id: "pf-1",
    name: "Dashboard Analytics",
    category: "SaaS",
    description:
      "Plataforma de analítica con métricas en tiempo real, reportes personalizados y gestión de usuarios.",
    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "Chart.js"],
    date: "May 2024",
    dateValue: "2024-05",
    duration: "3 semanas",
    url: "https://example.com/dashboard-analytics",
    bannerClassName: "bg-indigo-900",
  },
  {
    id: "pf-2",
    name: "E-commerce Fashion",
    category: "Tienda Online",
    description:
      "Tienda online moderna con catálogo, carrito, pagos y panel administrativo.",
    techStack: ["React", "Node.js", "MongoDB", "Stripe"],
    date: "Abr 2024",
    dateValue: "2024-04",
    duration: "5 semanas",
    url: "https://example.com/ecommerce-fashion",
    bannerClassName: "bg-gray-200",
  },
  {
    id: "pf-3",
    name: "TaskFlow",
    category: "Aplicación Web",
    description:
      "Aplicación colaborativa para gestión de proyectos, tareas y seguimiento de equipos.",
    techStack: ["React", "TypeScript", "Firebase", "Tailwind CSS"],
    date: "Mar 2024",
    dateValue: "2024-03",
    duration: "4 semanas",
    url: "https://example.com/taskflow",
    bannerClassName: "bg-slate-300",
  },
  {
    id: "pf-4",
    name: "FinTrack App",
    category: "Aplicación Móvil",
    description:
      "Aplicación móvil para finanzas personales con reportes, presupuestos y metas.",
    techStack: ["React Native", "TypeScript", "Expo", "UI Kitten"],
    date: "Feb 2024",
    dateValue: "2024-02",
    duration: "6 semanas",
    url: "https://example.com/fintrack-app",
    bannerClassName: "bg-indigo-950",
  },
  {
    id: "pf-5",
    name: "MedConnect",
    category: "SaaS",
    description:
      "Plataforma de telemedicina con videollamadas, historial clínico y agendamiento.",
    techStack: ["Next.js", "PostgreSQL", "WebRTC", "AWS"],
    date: "Ene 2024",
    dateValue: "2024-01",
    duration: "8 semanas",
    url: "https://example.com/medconnect",
    bannerClassName: "bg-emerald-100",
  },
  {
    id: "pf-6",
    name: "ShopBot",
    category: "Desarrollo Web",
    description:
      "Bot de ventas automatizado con integración a WhatsApp, catálogo y pagos.",
    techStack: ["Node.js", "PostgreSQL", "Docker", "Twilio"],
    date: "Dic 2023",
    dateValue: "2023-12",
    duration: "3 semanas",
    url: "https://example.com/shopbot",
    bannerClassName: "bg-orange-100",
  },
  {
    id: "pf-7",
    name: "LMS Educativo",
    category: "Aplicación Web",
    description:
      "Sistema de gestión de aprendizaje con cursos, evaluaciones y certificados.",
    techStack: ["React", "Node.js", "MongoDB", "AWS S3"],
    date: "Nov 2023",
    dateValue: "2023-11",
    duration: "10 semanas",
    url: "https://example.com/lms-educativo",
    bannerClassName: "bg-violet-700",
  },
  {
    id: "pf-8",
    name: "RealEstate Pro",
    category: "Desarrollo Web",
    description:
      "Portal inmobiliario con búsqueda avanzada, mapa interactivo y CRM integrado.",
    techStack: ["Next.js", "PostgreSQL", "Mapbox", "Stripe"],
    date: "Oct 2023",
    dateValue: "2023-10",
    duration: "7 semanas",
    url: "https://example.com/realestate-pro",
    bannerClassName: "bg-gray-900",
  },
];

export default function PerfilPage() {
  const [activeTab, setActiveTab] = useState<ProfileTab>("sobre-mi");

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-4">
          <Breadcrumb category={exampleProfile.category} name={exampleProfile.name} />
        </div>

        <div className="mb-6">
          <ProfileHeader profile={exampleProfile} />
        </div>

        <ProfileTabs
          activeTab={activeTab}
          onChange={setActiveTab}
          reviewCount={exampleProfile.reviewCount}
        />

        <div className="mt-6">
          {activeTab === "sobre-mi" && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_240px]">
              <AboutTab profile={exampleProfile} />
              <ProfileSidebar profile={exampleProfile} />
            </div>
          )}
          {activeTab === "portafolio" && (
            <PortfolioTab projects={exampleProjects} email={exampleProfile.email} />
          )}
          {activeTab === "resenas" && (
            <ReviewsTab reviews={exampleReviews} rating={exampleProfile.rating} />
          )}
          {activeTab === "suscripciones" && <SubscriptionsTab plans={examplePlans} />}
        </div>
      </main>
    </div>
  );
}
