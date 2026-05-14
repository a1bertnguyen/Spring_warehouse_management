import React, { useEffect, useMemo, useRef, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import ApiService from "../../services/ApiService";

function formatRoleLabel(role) {
  if (!role) {
    return "Updating";
  }

  return role
    .toLowerCase()
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const timeoutRef = useRef(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userInfo = await ApiService.getLoggedInUserInfo();
        setUser(userInfo?.user || null);
      } catch (error) {
        showMessage(
          error.response?.data?.message ||
            "Unable to load your profile right now."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const showMessage = (msg) => {
    setMessage(msg);

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      setMessage("");
    }, 4000);
  };

  const profileFacts = useMemo(
    () => [
      { label: "Full Name", value: user?.name || "Not updated" },
      { label: "Email", value: user?.email || "Not updated" },
      { label: "Phone Number", value: user?.phoneNumber || "Not updated" },
      { label: "Role", value: formatRoleLabel(user?.role) },
    ],
    [user]
  );

  const handlePasswordFieldChange = ({ target: { name, value } }) => {
    setPasswordForm((currentValue) => ({
      ...currentValue,
      [name]: value,
    }));
  };

  const resetPasswordForm = () => {
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    if (!passwordForm.currentPassword.trim() || !passwordForm.newPassword.trim()) {
      showMessage("Current password and new password are required.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage("New password and confirmation do not match.");
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const response = await ApiService.changeCurrentUserPassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      showMessage(response?.message || "Password updated successfully.");
      resetPasswordForm();
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Unable to update your password right now."
      );
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <MainLayout>
      {message && <div className="message">{message}</div>}

      <div className="profile-dashboard">
        {isLoading && (
          <div className="profile-shell">
            <div className="profile-panel">
              <h1>Loading profile...</h1>
              <p>The system is loading your account information.</p>
            </div>
          </div>
        )}

        {!isLoading && user && (
          <div className="profile-shell">
            <section className="profile-hero">
              <div className="profile-hero-copy">
                <span className="profile-eyebrow">Profile Dashboard</span>
                <h1>{user.name}</h1>
                <p>
                  This area brings together your account details, current role,
                  and access status inside the warehouse system.
                </p>
              </div>

              <div className="profile-avatar-badge">
                {(user.name || "U").trim().charAt(0).toUpperCase()}
              </div>
            </section>

            <div className="profile-grid">
              <article className="profile-panel">
                <div className="profile-panel-heading">
                  <div>
                    <span className="profile-section-label">Account</span>
                    <h2>Personal Information</h2>
                  </div>
                </div>

                <div className="profile-info-list">
                  {profileFacts.map((item) => (
                    <div className="profile-item" key={item.label}>
                      <label>{item.label}</label>
                      <span>{item.value}</span>
                    </div>
                  ))}
                </div>
              </article>

              <article className="profile-panel">
                <div className="profile-panel-heading">
                  <div>
                    <span className="profile-section-label">Security</span>
                    <h2>Change Password</h2>
                  </div>
                </div>

                <form className="profile-password-form" onSubmit={handlePasswordSubmit}>
                  <label htmlFor="profile-current-password">
                    Current Password
                    <input
                      id="profile-current-password"
                      name="currentPassword"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordFieldChange}
                      placeholder="Enter current password"
                      autoComplete="current-password"
                      required
                    />
                  </label>

                  <label htmlFor="profile-new-password">
                    New Password
                    <input
                      id="profile-new-password"
                      name="newPassword"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordFieldChange}
                      placeholder="Enter new password"
                      autoComplete="new-password"
                      required
                    />
                  </label>

                  <label htmlFor="profile-confirm-password">
                    Confirm New Password
                    <input
                      id="profile-confirm-password"
                      name="confirmPassword"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordFieldChange}
                      placeholder="Re-enter new password"
                      autoComplete="new-password"
                      required
                    />
                  </label>

                  <div className="profile-password-actions">
                    <button
                      type="button"
                      className="secondary-page-button"
                      onClick={resetPasswordForm}
                      disabled={isUpdatingPassword}
                    >
                      Clear
                    </button>
                    <button
                      type="submit"
                      className="manager-primary-button"
                      disabled={isUpdatingPassword}
                    >
                      {isUpdatingPassword ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </form>
              </article>
            </div>
          </div>
        )}

        {!isLoading && !user && (
          <div className="profile-shell">
            <div className="profile-panel">
              <h1>Profile not found</h1>
              <p>The system did not return account data for this login session.</p>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
