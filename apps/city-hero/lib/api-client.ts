import { createApiClient } from "@city-hero/api-client";
import { Platform } from "react-native";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000";

// getToken/onAuthFailure are stubs: 00-foundation/06-auth-system.md hasn't
// shipped yet, so there's no secure-storage token to read and no session to
// tear down. Swap these for real SecureStore-backed implementations once it
// does — every screen keeps calling the same `apiClient.<resource>.*`
// methods, only this factory changes.
export const apiClient = createApiClient({
  baseUrl: API_URL,
  getToken: () => null,
  onAuthFailure: () => {},
  platform: Platform.OS === "ios" || Platform.OS === "web" ? Platform.OS : "android",
});
