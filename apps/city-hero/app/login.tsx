import { useRouter } from "expo-router";

import { LoginScreen } from "@/src/screens/Login/LoginScreen";

export default function Login() {
  const router = useRouter();

  return <LoginScreen onBack={() => router.back()} />;
}
