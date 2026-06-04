// Learning note: These tests cover the pure admin dashboard helpers without
// needing to render the full dashboard UI.
import {
  buildLoginActivityView,
  buildOverviewMetrics,
  buildUsersView,
  resolveUserActive,
} from "./adminDashboardUtils";

const users = [
  {
    id: 1,
    name: "Charlie Tran",
    email: "charlie@example.com",
    phoneNumber: "0901000001",
    role: "MANAGER",
    active: true,
  },
  {
    id: 2,
    name: "Alice Nguyen",
    email: "alice@example.com",
    phoneNumber: "0901000002",
    role: "ADMIN",
    active: false,
  },
  {
    id: 3,
    name: "Bob Pham",
    email: "bob@example.com",
    phoneNumber: "0901000003",
    role: "SALE_STAFF",
  },
];

const activityLogs = [
  {
    id: 11,
    userId: 3,
    userName: "Bob Pham",
    userEmail: "bob@example.com",
    action: "LOGIN",
    ipAddress: "10.10.0.3",
    note: "User logged in successfully",
    createdAt: "2099-01-02T10:00:00",
  },
  {
    id: 12,
    userId: 1,
    userName: "Charlie Tran",
    userEmail: "charlie@example.com",
    action: "LOGOUT",
    ipAddress: "10.10.0.1",
    note: "User logged out successfully",
    createdAt: "2099-01-02T09:00:00",
  },
  {
    id: 13,
    userId: 1,
    userName: "Charlie Tran",
    userEmail: "charlie@example.com",
    action: "LOGIN",
    ipAddress: "10.10.0.1",
    note: "User logged in successfully",
    createdAt: "2099-01-01T08:00:00",
  },
];

test("buildUsersView filters and sorts users by name while preserving last login", () => {
  const view = buildUsersView(users, activityLogs, "example.com", "asc", 1, 10);

  expect(view.items).toHaveLength(3);
  expect(view.items.map((user) => user.name)).toEqual([
    "Alice Nguyen",
    "Bob Pham",
    "Charlie Tran",
  ]);
  expect(view.items[1].lastLogin).toBe("2099-01-02T10:00:00");
  expect(resolveUserActive(view.items[2])).toBe(true);
});

test("buildLoginActivityView keeps only login events and paginates the results", () => {
  const view = buildLoginActivityView(activityLogs, "bob", 1, 1);

  expect(view.totalItems).toBe(1);
  expect(view.totalPages).toBe(1);
  expect(view.items[0].userName).toBe("Bob Pham");
  expect(view.items[0].action).toBe("LOGIN");
});

test("buildOverviewMetrics summarizes active users and monthly activity", () => {
  const metrics = buildOverviewMetrics(
    users,
    [
      { createdAt: "2099-01-04T10:00:00", totalPrice: 500 },
      { createdAt: "2099-01-12T10:00:00", totalPrice: 250 },
      { createdAt: "2099-02-01T10:00:00", totalPrice: 900 },
    ],
    [
      {
        action: "LOGIN",
        createdAt: new Date().toISOString(),
      },
    ],
    1,
    2099
  );

  expect(metrics.totalUsers).toBe(3);
  expect(metrics.activeUsers).toBe(2);
  expect(metrics.monthlyTransactions).toBe(2);
  expect(metrics.monthlyRevenue).toBe(750);
  expect(metrics.loginsToday).toBe(1);
});
