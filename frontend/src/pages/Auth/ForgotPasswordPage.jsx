import React, { useState } from "react";
import { Link } from "react-router-dom";
import ApiService from "../../services/ApiService";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showMessage = (nextMessage) => {
    setMessage(nextMessage);
    setTimeout(() => {
      setMessage("");
    }, 4000);
  };

  const handleForgotPassword = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await ApiService.forgotPassword(email);
      showMessage(
        response?.message ||
          "If the account exists, password reset instructions have been sent."
      );
      setEmail("");
    } catch (error) {
      showMessage(
        error.response?.data?.message ||
          "Unable to start password reset right now."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Forgot Password</h2>

      {message && <p className="message">{message}</p>}

      <form onSubmit={handleForgotPassword}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <p>
        Remembered your password? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default ForgotPasswordPage;
