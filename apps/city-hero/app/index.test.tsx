import { render } from "@testing-library/react-native";

import Index from "./index";

const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush }),
}));

let capturedOnEmailLogin: (() => void) | undefined;
jest.mock("@/src/screens/Splash/SplashScreen", () => ({
  SplashScreen: (props: { onEmailLogin?: () => void }) => {
    capturedOnEmailLogin = props.onEmailLogin;
    return null;
  },
}));

test("wires the Splash email CTA to navigate to /login", async () => {
  await render(<Index />);

  expect(capturedOnEmailLogin).toBeInstanceOf(Function);
  capturedOnEmailLogin?.();

  expect(mockPush).toHaveBeenCalledWith("/login");
});
