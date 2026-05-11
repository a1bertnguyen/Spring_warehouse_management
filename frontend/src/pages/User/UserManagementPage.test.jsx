import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import UserManagementPage from "./UserManagementPage";
import ApiService from "../../services/ApiService";

jest.mock("../../layouts/MainLayout", () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));

jest.mock("../../services/ApiService", () => ({
  __esModule: true,
  default: {
    isAdmin: jest.fn(() => true),
    getAllUsers: jest.fn(),
    getAllTransactions: jest.fn(),
    getAllActivityLogs: jest.fn(),
    registerUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
  },
}));

const existingUser = {
  id: 7,
  name: "Alice Nguyen",
  email: "alice@example.com",
  phoneNumber: "0900000001",
  role: "MANAGER",
};

beforeEach(() => {
  jest.clearAllMocks();
  ApiService.getAllUsers.mockResolvedValue({ users: [existingUser] });
  ApiService.getAllTransactions.mockResolvedValue({ transactions: [] });
  ApiService.getAllActivityLogs.mockResolvedValue({ activityLogs: [] });
  ApiService.registerUser.mockResolvedValue({ message: "created" });
  ApiService.updateUser.mockResolvedValue({ message: "updated" });
  ApiService.deleteUser.mockResolvedValue({ message: "deleted" });
  window.confirm = jest.fn(() => true);
});

test("allows an admin to create a new user account", async () => {
  render(
    <MemoryRouter>
      <UserManagementPage />
    </MemoryRouter>
  );

  await screen.findByLabelText(/^name$/i);

  await userEvent.type(screen.getByLabelText(/^name$/i), "Bob Tran");
  await userEvent.type(screen.getByLabelText(/^email$/i), "bob@example.com");
  await userEvent.type(screen.getByLabelText(/phone number/i), "0900000002");
  await userEvent.selectOptions(screen.getByLabelText(/role/i), "SALE_STAFF");
  await userEvent.type(
    screen.getByLabelText(/^password$/i),
    "Password@123"
  );
  await userEvent.click(screen.getByRole("button", { name: /create user/i }));

  await waitFor(() => {
    expect(ApiService.registerUser).toHaveBeenCalledWith({
      name: "Bob Tran",
      email: "bob@example.com",
      phoneNumber: "0900000002",
      role: "SALE_STAFF",
      password: "Password@123",
    });
  });
});

test("allows an admin to update a user and assign a new password", async () => {
  render(
    <MemoryRouter>
      <UserManagementPage />
    </MemoryRouter>
  );

  const userRow = await screen.findByRole("row", { name: /alice nguyen/i });
  await userEvent.click(within(userRow).getByRole("button", { name: /^edit$/i }));
  await userEvent.type(
    screen.getByLabelText(/new password \(optional\)/i),
    "NewPassword@456"
  );
  await userEvent.click(screen.getByRole("button", { name: /save changes/i }));

  await waitFor(() => {
    expect(ApiService.updateUser).toHaveBeenCalledWith(existingUser.id, {
      name: existingUser.name,
      email: existingUser.email,
      phoneNumber: existingUser.phoneNumber,
      role: existingUser.role,
      password: "NewPassword@456",
    });
  });
});
