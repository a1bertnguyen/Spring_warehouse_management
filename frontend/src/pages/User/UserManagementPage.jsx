import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import ApiService from "../../services/ApiService";

const ROLE_OPTIONS = [
  "ADMIN",
  "MANAGER",
  "PURCHASE_STAFF",
  "SALE_STAFF",
  "WAREHOUSE_STAFF",
];

const EMPTY_FORM = {
  name: "",
  email: "",
  phoneNumber: "",
  role: "MANAGER",
  password: "",
};

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingUserId, setEditingUserId] = useState(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = editingUserId !== null;

  const sortedUsers = useMemo(
    () => [...users].sort((left, right) => left.name.localeCompare(right.name)),
    [users]
  );

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);

    try {
      const response = await ApiService.getAllUsers();
      setUsers(response?.users || []);
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Unable to load users right now."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingUserId(null);
  };

  const showMessage = (nextMessage) => {
    setMessage(nextMessage);
    window.setTimeout(() => {
      setMessage("");
    }, 4000);
  };

  const handleInputChange = ({ target: { name, value } }) => {
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleEditUser = (user) => {
    setEditingUserId(user.id);
    setForm({
      name: user.name || "",
      email: user.email || "",
      phoneNumber: user.phoneNumber || "",
      role: user.role || "MANAGER",
      password: "",
    });
  };

  const handleSubmit = async (event) => {
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
        error.response?.data?.message ||
          "Unable to save this user right now."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      {message && <div className="message">{message}</div>}

      <div className="user-management-page">
        <div className="user-management-header">
          <div>
            <h1>User Management</h1>
            <p>
              Only administrators can create accounts, edit user details, and
              assign new passwords.
            </p>
          </div>
        </div>

        <div className="user-management-grid">
          <section className="user-management-card">
            <h2>{isEditing ? "Edit User" : "Create User"}</h2>

            <form className="user-form" onSubmit={handleSubmit}>
              <label htmlFor="user-name">Name</label>
              <input
                id="user-name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleInputChange}
                required
              />

              <label htmlFor="user-email">Email</label>
              <input
                id="user-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleInputChange}
                required
              />

              <label htmlFor="user-phone">Phone Number</label>
              <input
                id="user-phone"
                name="phoneNumber"
                type="text"
                value={form.phoneNumber}
                onChange={handleInputChange}
                required
              />

              <label htmlFor="user-role">Role</label>
              <select
                id="user-role"
                name="role"
                value={form.role}
                onChange={handleInputChange}
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {role.replace(/_/g, " ")}
                  </option>
                ))}
              </select>

              <label htmlFor="user-password">
                {isEditing ? "New Password (optional)" : "Password"}
              </label>
              <input
                id="user-password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleInputChange}
                required={!isEditing}
              />

              <div className="user-form-actions">
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
                    className="secondary-button"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="user-management-card">
            <h2>Existing Users</h2>

            {isLoading ? (
              <p>Loading users...</p>
            ) : (
              <div className="user-list">
                {sortedUsers.map((user) => (
                  <article className="user-list-item" key={user.id}>
                    <div>
                      <h3>{user.name}</h3>
                      <p>{user.email}</p>
                      <p>{user.phoneNumber}</p>
                      <span className="user-role-badge">
                        {user.role?.replace(/_/g, " ")}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => handleEditUser(user)}
                    >
                      Edit
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </MainLayout>
  );
};

export default UserManagementPage;
