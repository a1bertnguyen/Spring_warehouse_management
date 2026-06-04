// Learning note: Default smoke test scaffold from Create React App. Project
// feature tests live closer to their pages when present.
import { render, screen } from "@testing-library/react";
import App from "./app/App";

jest.mock("./services/ApiService", () => ({
  __esModule: true,
  default: {
    isAuthenticated: jest.fn(() => false),
    isAdmin: jest.fn(() => false),
    clearAuth: jest.fn(),
    logoutUser: jest.fn(),
  },
}));

test("renders login page for unauthenticated users", () => {
  render(<App />);
  expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
});
