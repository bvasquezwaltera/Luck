import { HomeClient } from "@/modules/inicio/HomeClient";
import { getFreelancerList } from "@/server/freelancers/actions";

export default async function Home() {
  const freelancers = await getFreelancerList();

  return <HomeClient freelancers={freelancers} />;
}
