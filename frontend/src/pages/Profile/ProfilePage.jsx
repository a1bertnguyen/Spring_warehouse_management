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

function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Not available";
  }

  return parsedDate.toLocaleDateString();
}

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
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

              <article className="profile-panel profile-panel-accent">
                <div className="profile-panel-heading">
                  <div>
                    <span className="profile-section-label">Overview</span>
                    <h2>Account Status</h2>
                  </div>
                </div>

                <div className="profile-stat-grid">
                  <div className="profile-stat-card">
                    <span>Status</span>
                    <strong>
                      {user.active === false ? "Disabled" : "Active"}
                    </strong>
                    <p>The current access state of this account.</p>
                  </div>

                  <div className="profile-stat-card">
                    <span>Created On</span>
                    <strong>{formatDate(user.createdAt)}</strong>
                    <p>When this account was added to the system.</p>
                  </div>

                  <div className="profile-stat-card">
                    <span>Current Role</span>
                    <strong>{formatRoleLabel(user.role)}</strong>
                    <p>Your role determines which areas and tasks are available.</p>
                  </div>
                </div>
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
