import ResourcePage from "../components/resource/ResourcePage";
import { usersConfig } from "../config/resources";

export default function UsersPage() {
  return <ResourcePage config={usersConfig} />;
}
