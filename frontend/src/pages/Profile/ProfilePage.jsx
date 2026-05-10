import React, { useState, useEffect } from "react";
import MainLayout from "../../layouts/MainLayout";
import ApiService from "../../services/ApiService";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userInfo = await ApiService.getLoggedInUsesInfo();
        setUser(userInfo?.user || null);
      } catch (error) {
        showMessage(
          error.response?.data?.message ||
            "Unable to load your profile right now."
        );
      }
    };
    fetchUserInfo();
  }, []);

  //Method> to show message or errors
  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage("");
    }, 4000);
  };

  return (
    <MainLayout>
      {message && <div className="message">{message}</div>}
      <div className="profile-page">
        {user && (
          <div className="profile-card">
            <h1>Hello, {user.name} 🥳</h1>
            <div className="profile-info">
              <div className="profile-item">
                <label>Name</label>
                <span>{user.name}</span>
              </div>
              <div className="profile-item">
                <label>Email</label>
                <span>{user.email}</span>
              </div>
              <div className="profile-item">
                <label>Phone Number</label>
                <span>{user.phoneNumber}</span>
              </div>
              <div className="profile-item">
                <label>Role</label>
                <span>{user.role}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};
export default ProfilePage;
