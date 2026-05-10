import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ApiService from "../../services/ApiService";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage("");
    }, 4000);
  };

  useEffect(() => {
    if (!location.state?.message) {
      return undefined;
    }

    setMessage(location.state.message);
    const timeoutId = window.setTimeout(() => {
      setMessage("");
    }, 4000);

    return () => window.clearTimeout(timeoutId);
  }, [location.state]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const loginData = { email, password };
      const res = await ApiService.loginUser(loginData);
      const redirectPath = location.state?.from?.pathname || "/dashboard";

      if (res?.status === 200 && res?.token) {
        navigate(redirectPath, { replace: true });
        return;
      }

      showMessage(res?.message || "Login failed.");
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Unable to log in right now."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>

      {message && <p className="message">{message}</p>}

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="auth-help-text">
        New accounts, profile changes, and password resets are managed by the
        admin. Please contact your administrator for support.
      </p>
    </div>
  );
};

export default LoginPage;
