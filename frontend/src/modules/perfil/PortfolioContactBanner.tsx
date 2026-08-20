import { Briefcase } from "lucide-react";
import { Card } from "@/ui/Card";
import { Button } from "@/ui/Button";

export function PortfolioContactBanner({ email }: { email: string }) {
  return (
    <Card className="flex flex-col items-center gap-4 bg-indigo-50 sm:flex-row sm:justify-between">
      <div className="flex items-center gap-3">
        <Briefcase className="h-5 w-5 shrink-0 text-indigo-600" />
        <div>
          <p className="text-sm font-bold text-gray-900">¿Tienes un proyecto en mente?</p>
          <p className="text-xs text-gray-600">Hablemos y hagamos realidad tu idea.</p>
        </div>
      </div>
      <Button variant="primary" href={`mailto:${email}`} className="w-full sm:w-auto">
        Contactar ahora
      </Button>
    </Card>
  );
}
