import type { Freelancer } from "@/types/freelancer";
import { FreelancerCard } from "@/modules/inicio/FreelancerCard";

export function FreelancerGrid({ freelancers }: { freelancers: Freelancer[] }) {
  return (
    <div>
      <p className="mb-4 text-xs text-gray-600">
        {freelancers.length} freelancers encontrados
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {freelancers.map((freelancer) => (
          <FreelancerCard key={freelancer.id} freelancer={freelancer} />
        ))}
      </div>
    </div>
  );
}
