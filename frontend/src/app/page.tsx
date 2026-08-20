import { HomeClient } from "@/modules/inicio/HomeClient";
import { getFreelancerList } from "@/lib/api/server/freelancers";

export default async function Home() {
  const freelancers = await getFreelancerList();

  return <HomeClient freelancers={freelancers} />;
}
