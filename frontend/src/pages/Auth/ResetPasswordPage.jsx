import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import ApiService from "../../services/ApiService";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get("token") || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const showMessage = (nextMessage) => {
    setMessage(nextMessage);
    setTimeout(() => {
      setMessage("");
    }, 4000);
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      showMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await ApiService.resetPassword({
        token,
        newPassword,
      });

      navigate("/login", {
        replace: true,
        state: {
          message:
            response?.message ||
            "Password reset successfully. Please log in again.",
        },
      });
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Unable to reset password right now."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Reset Password</h2>

      {message && <p className="message">{message}</p>}

      <form onSubmit={handleResetPassword}>
        <input
          type="text"
          placeholder="Reset token"
          value={token}
          onChange={(event) => setToken(event.target.value)}
          required
        />

        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
        />

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Reset Password"}
        </button>
      </form>

      <p>
        Back to <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default ResetPasswordPage;
