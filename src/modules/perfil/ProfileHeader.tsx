import * as Flags from "country-flag-icons/react/3x2";
import { Star, MessageCircle, Heart, Share2, ShieldCheck, Trophy, Zap } from "lucide-react";
import type { FreelancerProfile } from "@/types/freelancerProfile";
import { Avatar } from "@/ui/Avatar";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { InfoCard } from "@/ui/InfoCard";

const SKILLS_LIMIT = 7;

export function ProfileHeader({ profile }: { profile: FreelancerProfile }) {
  const Flag = Flags[profile.countryCode as keyof typeof Flags];

  return (
    <Card className="flex flex-col gap-5 md:flex-row md:justify-between">
      <div className="flex items-start gap-4">
        <Avatar
          initials={profile.initials}
          name={profile.name}
          size="lg"
          online={profile.online}
        />

        <div className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-gray-900">{profile.name}</h1>
              <span className="flex items-center gap-1 text-xs text-gray-600">
                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                {profile.rating.toFixed(1)} ({profile.reviewCount})
              </span>
            </div>
            <p className="text-xs text-gray-700">{profile.specialty}</p>
            <p className="flex items-center gap-1.5 text-xs text-gray-500">
              {Flag && <Flag className="h-3 w-4 rounded-[1px]" />}
              {profile.country}
            </p>
            <p className="text-xs text-gray-500">
              {profile.languages.map((l) => `${l.name} (${l.level})`).join(" · ")}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <InfoCard
              icon={<ShieldCheck className="h-6 w-6 shrink-0 text-emerald-600" />}
              label={`${profile.badges.successRate}%`}
              description="Éxito de proyectos"
            />
            {profile.badges.topRated && (
              <InfoCard
                icon={<Trophy className="h-6 w-6 shrink-0 text-amber-600" />}
                label="Top Rated"
                description="Freelancer"
              />
            )}
            <InfoCard
              icon={<Zap className="h-6 w-6 shrink-0 text-indigo-600" />}
              label="Responde en"
              description={profile.badges.avgResponseTime}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {profile.skills.slice(0, SKILLS_LIMIT).map((skill) => (
              <Badge key={skill}>{skill}</Badge>
            ))}
            {profile.skills.length > SKILLS_LIMIT && (
              <Badge>+{profile.skills.length - SKILLS_LIMIT} más</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:w-56 md:shrink-0">
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            href={`mailto:${profile.email}`}
            className="min-w-0 flex-1 gap-1.5"
          >
            <MessageCircle className="h-4 w-4" />
            Contactar
          </Button>
          <button
            type="button"
            aria-label="Favorito"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500"
          >
            <Heart className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Compartir"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>

        <dl className="flex flex-col gap-2.5 text-xs">
          <div className="flex items-center justify-between">
            <dt className="text-gray-500">Proyectos completados</dt>
            <dd className="font-semibold text-gray-900">{profile.stats.completedProjects}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-gray-500">Horas trabajadas</dt>
            <dd className="font-semibold text-gray-900">{profile.stats.hoursWorked}+</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-gray-500">Clientes recurrentes</dt>
            <dd className="font-semibold text-gray-900">{profile.stats.repeatClients}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-gray-500">Miembro desde</dt>
            <dd className="font-semibold text-gray-900">{profile.stats.memberSince}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-gray-500">Última entrega</dt>
            <dd className="font-semibold text-gray-900">{profile.stats.lastDelivery}</dd>
          </div>
        </dl>
      </div>
    </Card>
  );
}
