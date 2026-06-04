// Learning note: Login page tests verify the auth form behavior without calling
// the real backend.
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "./LoginPage";

jest.mock("../../services/ApiService", () => ({
  __esModule: true,
  default: {
    loginUser: jest.fn(),
  },
}));

test("shows admin-managed support message instead of self-service auth links", () => {
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );

  expect(
    screen.getByText(/new accounts, profile changes, and password resets/i)
  ).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  expect(screen.queryByText(/register/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/reset it/i)).not.toBeInTheDocument();
});
