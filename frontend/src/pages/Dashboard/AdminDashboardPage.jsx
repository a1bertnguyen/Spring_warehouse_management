import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import MainLayout from "../../layouts/MainLayout";
import ApiService from "../../services/ApiService";
import { PATHS } from "../../constants/paths";
import {
  buildLastLoginMap,
  buildLoginActivityView,
  buildMonthlyLoginSeries,
  buildMonthlyTransactionSeries,
  buildOverviewMetrics,
  buildRecentLogins,
  buildTransactionDailyData,
  buildUserRoleDistribution,
  buildUsersView,
  formatUserRole,
  resolveUserActive,
} from "./adminDashboardUtils";
import "./AdminDashboardPage.css";

const CHART_COLORS = ["#0f766e", "#14b8a6", "#0f172a", "#fb7185", "#f59e0b"];

const EMPTY_FORM = {
  name: "",
  email: "",
  phoneNumber: "",
  role: "MANAGER",
  password: "",
};

const ROLE_OPTIONS = [
  "ADMIN",
  "MANAGER",
  "PURCHASE_STAFF",
  "SALE_STAFF",
  "WAREHOUSE_STAFF",
];

const SECTION_CONFIG = {
  overview: {
    path: PATHS.dashboard,
    label: "Statistics",
    hint: "KPIs, charts, monthly revenue, and recent login activity.",
  },
  users: {
    path: PATHS.users,
    label: "User Management",
    hint: "Create, edit, disable, delete, search, sort, and paginate users.",
  },
  activity: {
    path: PATHS.activityLogs,
    label: "Activity Log",
    hint: "Review login history, timestamps, and access footprints.",
  },
};

function formatDateTime(value) {
  if (!value) {
    return "No login yet";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "No login yet";
  }

  return date.toLocaleString();
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function Pager({ currentPage, totalPages, totalItems, itemLabel, onPageChange }) {
  return (
    <div className="admin-pager">
      <span className="admin-pager-info">
        {totalItems} {itemLabel}
      </span>

      <div className="admin-pager-controls">
        <button
          type="button"
          className="ghost-button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </button>
        <button type="button" className="ghost-button">
          Page {currentPage} / {totalPages}
        </button>
        <button
          type="button"
          className="ghost-button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

const AdminDashboardPage = ({ initialSection = "overview" }) => {
  const messageTimeoutRef = useRef(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMetric, setSelectedMetric] = useState("amount");

  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeMutationId, setActiveMutationId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingUserId, setEditingUserId] = useState(null);

  const [userSearch, setUserSearch] = useState("");
  const [userSort, setUserSort] = useState("asc");
  const [userPage, setUserPage] = useState(1);

  const [activitySearch, setActivitySearch] = useState("");
  const [activityPage, setActivityPage] = useState(1);

  const isEditing = editingUserId !== null;
  const selectedSection = initialSection;
  const activeSectionConfig = SECTION_CONFIG[selectedSection] || SECTION_CONFIG.overview;

  useEffect(() => {
    loadAdminData();

    return () => {
      if (messageTimeoutRef.current) {
        window.clearTimeout(messageTimeoutRef.current);
      }
    };
    // `loadAdminData` is intentionally invoked once on mount for the dashboard shell.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setUserPage(1);
  }, [userSearch, userSort]);

  useEffect(() => {
    setActivityPage(1);
  }, [activitySearch]);

  async function loadUsers() {
    const response = await ApiService.getAllUsers();
    setUsers(response?.users || []);
  }

  async function loadAdminData() {
    setIsLoading(true);

    const [usersResult, transactionsResult, activityResult] = await Promise.allSettled([
      ApiService.getAllUsers(),
      ApiService.getAllTransactions(),
      ApiService.getAllActivityLogs(),
    ]);

    if (usersResult.status === "fulfilled") {
      setUsers(usersResult.value?.users || []);
    } else {
      setUsers([]);
    }

    if (transactionsResult.status === "fulfilled") {
      setTransactions(transactionsResult.value?.transactions || []);
    } else {
      setTransactions([]);
    }

    if (activityResult.status === "fulfilled") {
      setActivityLogs(activityResult.value?.activityLogs || []);
    } else {
      setActivityLogs([]);
    }

    const firstFailure = [usersResult, transactionsResult, activityResult].find(
      (result) => result.status === "rejected"
    );

    if (firstFailure) {
      showMessage(
        firstFailure.reason?.response?.data?.message ||
          "Some dashboard data could not be loaded."
      );
    }

    setIsLoading(false);
  }

  function showMessage(nextMessage) {
    setMessage(nextMessage);

    if (messageTimeoutRef.current) {
      window.clearTimeout(messageTimeoutRef.current);
    }

    messageTimeoutRef.current = window.setTimeout(() => {
      setMessage("");
    }, 4000);
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingUserId(null);
  }

  function handleInputChange({ target: { name, value } }) {
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  function handleEditUser(user) {
    setEditingUserId(user.id);
    setForm({
      name: user.name || "",
      email: user.email || "",
      phoneNumber: user.phoneNumber || "",
      role: user.role || "MANAGER",
      password: "",
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      if (isEditing) {
        const updatePayload = {
          name: form.name.trim(),
          email: form.email.trim(),
          phoneNumber: form.phoneNumber.trim(),
          role: form.role,
        };

        if (form.password.trim()) {
          updatePayload.password = form.password.trim();
        }

        await ApiService.updateUser(editingUserId, updatePayload);
        showMessage("User updated successfully.");
      } else {
        await ApiService.registerUser({
          name: form.name.trim(),
          email: form.email.trim(),
          phoneNumber: form.phoneNumber.trim(),
          role: form.role,
          password: form.password.trim(),
        });
        showMessage("User account created successfully.");
      }

      resetForm();
      await loadUsers();
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Unable to save this user right now."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleUserState(user) {
    const nextActiveState = !resolveUserActive(user);
    setActiveMutationId(user.id);

    try {
      await ApiService.updateUser(user.id, { active: nextActiveState });
      showMessage(
        nextActiveState
          ? "User re-enabled successfully."
          : "User disabled successfully."
      );
      await loadUsers();
    } catch (error) {
      showMessage(
        error.response?.data?.message ||
          "Unable to update this user right now."
      );
    } finally {
      setActiveMutationId(null);
    }
  }

  async function handleDeleteUser(user) {
    const shouldDelete = window.confirm(
      `Delete ${user.name}? This action cannot be undone.`
    );

    if (!shouldDelete) {
      return;
    }

    setActiveMutationId(user.id);

    try {
      await ApiService.deleteUser(user.id);
      showMessage("User deleted successfully.");

      if (editingUserId === user.id) {
        resetForm();
      }

      await loadUsers();
    } catch (error) {
      showMessage(
        error.response?.data?.message ||
          "Unable to delete this user right now."
      );
    } finally {
      setActiveMutationId(null);
    }
  }

  const metrics = useMemo(
    () => buildOverviewMetrics(users, transactions, activityLogs, selectedMonth, selectedYear),
    [activityLogs, selectedMonth, selectedYear, transactions, users]
  );

  const transactionSeries = useMemo(
    () => buildTransactionDailyData(transactions, selectedMonth, selectedYear),
    [selectedMonth, selectedYear, transactions]
  );

  const roleDistribution = useMemo(
    () => buildUserRoleDistribution(users),
    [users]
  );

  const monthlyTransactions = useMemo(
    () => buildMonthlyTransactionSeries(transactions),
    [transactions]
  );

  const recentLogins = useMemo(
    () => buildRecentLogins(activityLogs, 5),
    [activityLogs]
  );

  const monthlyLogins = useMemo(
    () => buildMonthlyLoginSeries(activityLogs),
    [activityLogs]
  );

  const latestLoginMap = useMemo(
    () => buildLastLoginMap(activityLogs),
    [activityLogs]
  );

  const usersView = useMemo(
    () => buildUsersView(users, activityLogs, userSearch, userSort, userPage),
    [activityLogs, userPage, userSearch, userSort, users]
  );

  const activityView = useMemo(
    () => buildLoginActivityView(activityLogs, activitySearch, activityPage),
    [activityLogs, activityPage, activitySearch]
  );

  const uniqueUsersLoggedToday = useMemo(() => {
    const today = new Date();
    const userIds = new Set(
      activityLogs
        .filter((activity) => activity?.action === "LOGIN")
        .filter((activity) => {
          const createdAt = new Date(activity?.createdAt);
          return (
            !Number.isNaN(createdAt.getTime()) &&
            createdAt.getDate() === today.getDate() &&
            createdAt.getMonth() === today.getMonth() &&
            createdAt.getFullYear() === today.getFullYear()
          );
        })
        .map((activity) => activity.userId)
    );

    return userIds.size;
  }, [activityLogs]);

  const chartMeta = {
    count: {
      title: "Transactions per day",
      description: "Follow how many order flows were created each day in the selected month.",
      formatter: (value) => `${value}`,
    },
    quantity: {
      title: "Products moved per day",
      description: "Track the number of units flowing through warehouse operations each day.",
      formatter: (value) => `${value}`,
    },
    amount: {
      title: "Revenue value per day",
      description: "Monitor the value generated by transactions inside the selected month.",
      formatter: (value) => formatCurrency(value),
    },
  }[selectedMetric];

  return (
    <MainLayout>
      {message && <div className="message">{message}</div>}

      <div className="admin-dashboard-page">
        <section className="admin-banner">
          <div className="admin-banner-copy">
            <div className="admin-banner-meta">
              <span className="admin-banner-chip">Admin workspace</span>
              <span className="admin-banner-chip">Three admin features only</span>
              <span className="admin-banner-chip">Search + sort + pagination</span>
            </div>
            <div>
              <h1>{activeSectionConfig.label}</h1>
              <p>{activeSectionConfig.hint}</p>
            </div>
          </div>

          <div className="admin-banner-focus">
            <span>Current section</span>
            <strong>{activeSectionConfig.label}</strong>
            <p>Navigation now lives in the left sidebar to match your reference.</p>
          </div>
        </section>

        {isLoading ? (
          <section className="admin-loading-grid" aria-label="Loading dashboard">
            <div className="admin-loading-card" />
            <div className="admin-loading-card" />
            <div className="admin-loading-card" />
          </section>
        ) : (
          <>
            {selectedSection === "overview" && (
              <section className="admin-section">
                <div className="admin-kpi-grid">
                  <article className="admin-kpi-card">
                    <span>Total Users</span>
                    <strong>{metrics.totalUsers}</strong>
                    <p>Every account registered in the system.</p>
                  </article>

                  <article className="admin-kpi-card">
                    <span>Active Users</span>
                    <strong>{metrics.activeUsers}</strong>
                    <p>Accounts that can still access the system right now.</p>
                  </article>

                  <article className="admin-kpi-card">
                    <span>Logins Today</span>
                    <strong>{metrics.loginsToday}</strong>
                    <p>Successful login events recorded in today&apos;s activity log.</p>
                  </article>

                  <article className="admin-kpi-card">
                    <span>Month Transactions</span>
                    <strong>{metrics.monthlyTransactions}</strong>
                    <p>{formatCurrency(metrics.monthlyRevenue)} processed this month.</p>
                  </article>
                </div>

                <div className="admin-chart-grid">
                  <article className="admin-visual-card">
                    <div className="admin-toolbar">
                      <div>
                        <h2>{chartMeta.title}</h2>
                        <p>{chartMeta.description}</p>
                      </div>

                      <div className="admin-toolbar-group">
                        <button
                          type="button"
                          className={`metric-toggle ${selectedMetric === "count" ? "active" : ""}`}
                          onClick={() => setSelectedMetric("count")}
                        >
                          Count
                        </button>
                        <button
                          type="button"
                          className={`metric-toggle ${selectedMetric === "quantity" ? "active" : ""}`}
                          onClick={() => setSelectedMetric("quantity")}
                        >
                          Quantity
                        </button>
                        <button
                          type="button"
                          className={`metric-toggle ${selectedMetric === "amount" ? "active" : ""}`}
                          onClick={() => setSelectedMetric("amount")}
                        >
                          Amount
                        </button>
                        <select
                          aria-label="Select month"
                          value={selectedMonth}
                          onChange={(event) => setSelectedMonth(parseInt(event.target.value, 10))}
                        >
                          {Array.from({ length: 12 }, (_, index) => (
                            <option key={index + 1} value={index + 1}>
                              {new Date(0, index).toLocaleString("default", { month: "long" })}
                            </option>
                          ))}
                        </select>
                        <select
                          aria-label="Select year"
                          value={selectedYear}
                          onChange={(event) => setSelectedYear(parseInt(event.target.value, 10))}
                        >
                          {Array.from({ length: 5 }, (_, index) => {
                            const year = new Date().getFullYear() - index;
                            return (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    </div>

                    <ResponsiveContainer width="100%" height={320}>
                      <LineChart data={transactionSeries}>
                        <CartesianGrid stroke="#dbe6eb" strokeDasharray="3 3" />
                        <XAxis dataKey="day" tick={{ fill: "#64748b" }} />
                        <YAxis tick={{ fill: "#64748b" }} />
                        <Tooltip
                          formatter={(value) => chartMeta.formatter(value)}
                          labelFormatter={(label) => `Day ${label}`}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey={selectedMetric}
                          stroke="#0f766e"
                          strokeWidth={3}
                          dot={{ r: 3 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </article>

                  <article className="admin-visual-card">
                    <div className="admin-card-header">
                      <div>
                        <h3>User Role Distribution</h3>
                        <p>See how accounts are spread across each operational role.</p>
                      </div>
                    </div>

                    <ResponsiveContainer width="100%" height={320}>
                      <PieChart>
                        <Pie
                          data={roleDistribution}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={110}
                          innerRadius={58}
                          paddingAngle={3}
                        >
                          {roleDistribution.map((entry, index) => (
                            <Cell
                              key={entry.name}
                              fill={CHART_COLORS[index % CHART_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </article>
                </div>

                <div className="admin-summary-grid">
                  <article className="admin-visual-card">
                    <div className="admin-card-header">
                      <div>
                        <h3>Revenue Trend</h3>
                        <p>Last six months of transaction value across the warehouse flow.</p>
                      </div>
                    </div>

                    <ResponsiveContainer width="100%" height={280}>
                      <AreaChart data={monthlyTransactions}>
                        <defs>
                          <linearGradient id="tealGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.85} />
                            <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.08} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#dbe6eb" strokeDasharray="3 3" />
                        <XAxis dataKey="month" tick={{ fill: "#64748b" }} />
                        <YAxis tick={{ fill: "#64748b" }} />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Area
                          type="monotone"
                          dataKey="amount"
                          stroke="#0f766e"
                          fill="url(#tealGradient)"
                          strokeWidth={3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </article>

                  <article className="admin-visual-card">
                    <div className="admin-card-header">
                      <div>
                        <h3>Recent Login Activity</h3>
                        <p>Latest successful login events recorded by the auth service.</p>
                      </div>
                    </div>

                    {recentLogins.length ? (
                      <div className="admin-list">
                        {recentLogins.map((activity) => (
                          <div className="admin-list-row" key={activity.id}>
                            <div>
                              <h4>{activity.userName}</h4>
                              <p>{activity.userEmail}</p>
                            </div>

                            <div>
                              <span className="admin-status-pill login">LOGIN</span>
                              <p>{formatDateTime(activity.createdAt)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="admin-empty-state">No login activity has been recorded yet.</p>
                    )}
                  </article>
                </div>
              </section>
            )}

            {selectedSection === "users" && (
              <section className="admin-section">
                <article className="admin-card">
                  <div className="admin-card-header">
                    <div>
                      <h2>User Dashboard</h2>
                      <p>Add, update, disable, delete, search, and sort user accounts.</p>
                    </div>
                    <span className="admin-count-note">
                      {usersView.totalItems} users in current view
                    </span>
                  </div>

                  <div className="admin-user-layout">
                    <div>
                      <div className="admin-toolbar">
                        <div className="admin-toolbar-group">
                          <input
                            aria-label="Search users"
                            placeholder="Search by name, email, phone, or role"
                            type="text"
                            value={userSearch}
                            onChange={(event) => setUserSearch(event.target.value)}
                          />
                          <select
                            aria-label="Sort users"
                            value={userSort}
                            onChange={(event) => setUserSort(event.target.value)}
                          >
                            <option value="asc">Name A - Z</option>
                            <option value="desc">Name Z - A</option>
                          </select>
                          <button
                            type="button"
                            className="ghost-button"
                            onClick={resetForm}
                          >
                            New User
                          </button>
                        </div>
                      </div>

                      <div className="admin-table-shell">
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>User</th>
                              <th>Role</th>
                              <th>Status</th>
                              <th>Last Login</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {usersView.items.map((user) => (
                              <tr key={user.id}>
                                <td>
                                  <strong>{user.name}</strong>
                                  <small>{user.email}</small>
                                  <small>{user.phoneNumber}</small>
                                </td>
                                <td>{formatUserRole(user.role)}</td>
                                <td>
                                  <span
                                    className={`admin-status-pill ${user.active ? "active" : "disabled"}`}
                                  >
                                    {user.active ? "Active" : "Disabled"}
                                  </span>
                                </td>
                                <td>{formatDateTime(user.lastLogin)}</td>
                                <td>
                                  <div className="admin-inline-actions">
                                    <button
                                      type="button"
                                      className="ghost-button"
                                      onClick={() => handleEditUser(user)}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      className={user.active ? "warn-button" : "success-button"}
                                      disabled={activeMutationId === user.id}
                                      onClick={() => handleToggleUserState(user)}
                                    >
                                      {user.active ? "Disable" : "Enable"}
                                    </button>
                                    <button
                                      type="button"
                                      className="danger-button"
                                      disabled={activeMutationId === user.id}
                                      onClick={() => handleDeleteUser(user)}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {!usersView.items.length && (
                          <p className="admin-empty-state">
                            No users match the current search filters.
                          </p>
                        )}
                      </div>

                      <Pager
                        currentPage={usersView.currentPage}
                        totalPages={usersView.totalPages}
                        totalItems={usersView.totalItems}
                        itemLabel="users"
                        onPageChange={setUserPage}
                      />
                    </div>

                    <aside className="admin-card">
                      <div className="admin-card-header">
                        <div>
                          <h3>{isEditing ? "Edit User" : "Create User"}</h3>
                          <p>
                            {isEditing
                              ? "Update profile fields, role, or assign a new password."
                              : "Add a new account to the system with an assigned role."}
                          </p>
                        </div>
                      </div>

                      <form className="admin-form" onSubmit={handleSubmit}>
                        <label htmlFor="dashboard-user-name">
                          Name
                          <input
                            id="dashboard-user-name"
                            name="name"
                            type="text"
                            value={form.name}
                            onChange={handleInputChange}
                            required
                          />
                        </label>

                        <label htmlFor="dashboard-user-email">
                          Email
                          <input
                            id="dashboard-user-email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleInputChange}
                            required
                          />
                        </label>

                        <label htmlFor="dashboard-user-phone">
                          Phone Number
                          <input
                            id="dashboard-user-phone"
                            name="phoneNumber"
                            type="text"
                            value={form.phoneNumber}
                            onChange={handleInputChange}
                            required
                          />
                        </label>

                        <label htmlFor="dashboard-user-role">
                          Role
                          <select
                            id="dashboard-user-role"
                            name="role"
                            value={form.role}
                            onChange={handleInputChange}
                          >
                            {ROLE_OPTIONS.map((role) => (
                              <option key={role} value={role}>
                                {formatUserRole(role)}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label htmlFor="dashboard-user-password">
                          {isEditing ? "New Password (optional)" : "Password"}
                          <input
                            id="dashboard-user-password"
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleInputChange}
                            required={!isEditing}
                          />
                        </label>

                        {isEditing && (
                          <p className="admin-count-note">
                            Current account status:{" "}
                            {resolveUserActive(users.find((user) => user.id === editingUserId))
                              ? "Active"
                              : "Disabled"}
                          </p>
                        )}

                        <div className="admin-form-actions">
                          <button type="submit" disabled={isSubmitting}>
                            {isSubmitting
                              ? "Saving..."
                              : isEditing
                                ? "Save Changes"
                                : "Create User"}
                          </button>
                          {isEditing && (
                            <button
                              type="button"
                              className="ghost-button"
                              onClick={resetForm}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </form>
                    </aside>
                  </div>
                </article>
              </section>
            )}

            {selectedSection === "activity" && (
              <section className="admin-section">
                <div className="admin-activity-stats">
                  <article className="admin-stat-strip">
                    <span>Total Login Events</span>
                    <strong>{activityView.totalItems}</strong>
                    <p>Filtered login records currently visible to administrators.</p>
                  </article>

                  <article className="admin-stat-strip">
                    <span>Unique Users Logged Today</span>
                    <strong>{uniqueUsersLoggedToday}</strong>
                    <p>Distinct accounts that have logged in during the current day.</p>
                  </article>
                </div>

                <article className="admin-card">
                  <div className="admin-card-header">
                    <div>
                      <h2>Activity Log</h2>
                      <p>Track exactly when users logged into the system.</p>
                    </div>
                  </div>

                  <div className="admin-toolbar">
                    <div className="admin-toolbar-group">
                      <input
                        aria-label="Search activity logs"
                        placeholder="Search by user, email, note, or IP address"
                        type="text"
                        value={activitySearch}
                        onChange={(event) => setActivitySearch(event.target.value)}
                      />
                    </div>
                  </div>

                  <div className="admin-table-shell">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Time</th>
                          <th>User</th>
                          <th>Action</th>
                          <th>IP</th>
                          <th>Note</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activityView.items.map((activity) => (
                          <tr key={activity.id}>
                            <td>{formatDateTime(activity.createdAt)}</td>
                            <td>
                              <strong>{activity.userName}</strong>
                              <small>{activity.userEmail}</small>
                              <small>
                                Last login on profile:{" "}
                                {formatDateTime(latestLoginMap.get(activity.userId))}
                              </small>
                            </td>
                            <td>
                              <span className="admin-status-pill login">{activity.action}</span>
                            </td>
                            <td>{activity.ipAddress || "Unknown"}</td>
                            <td>{activity.note || "Login event captured successfully."}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {!activityView.items.length && (
                      <p className="admin-empty-state">
                        No login activity matches the current search term.
                      </p>
                    )}
                  </div>

                  <Pager
                    currentPage={activityView.currentPage}
                    totalPages={activityView.totalPages}
                    totalItems={activityView.totalItems}
                    itemLabel="login events"
                    onPageChange={setActivityPage}
                  />
                </article>

                <article className="admin-card">
                  <div className="admin-card-header">
                    <div>
                      <h3>Login Volume By Month</h3>
                      <p>Monthly trend of successful login events recorded by the system.</p>
                    </div>
                  </div>

                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={monthlyLogins}>
                      <CartesianGrid stroke="#dbe6eb" strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={{ fill: "#64748b" }} />
                      <YAxis tick={{ fill: "#64748b" }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#14b8a6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </article>
              </section>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default AdminDashboardPage;
