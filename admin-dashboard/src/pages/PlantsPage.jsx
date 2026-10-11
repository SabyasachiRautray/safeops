import ResourcePage from "../components/resource/ResourcePage";
import { plantsConfig } from "../config/resources";

export default function PlantsPage() {
  return <ResourcePage config={plantsConfig} />;
}
