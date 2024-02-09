import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/AuthPage.css";

const apiUrl = "https://backend-part-3u6u.onrender.com/api";
const AuthComponent = () => {
  const navigate = useNavigate();

  const [nameValue, setName] = useState("");
  const [emailValue, setEmail] = useState("");
  const [passwordValue, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nameErrorMsg, setNameErrorMsg] = useState("");
  const [passwordErrorMsg, setPasswordErrorMsg] = useState("");
  const [emailErrorMsg, setEmailErrorMsg] = useState("");
  const [confirmPasswordErrorMsg, setConfirmPasswordErrorMsg] = useState("");
  const [isCheckedErrorMsg, setIsCheckedErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [authContent, setAuthContent] = useState("signupMode");
  const [selectedButton, setSelectedButton] = useState("signupMode");

  const handleName = (e) => {
    const input = e.target.value;
    if (input) {
      setName(input);
      setNameErrorMsg("");
    } else {
      setName("");
      setNameErrorMsg("Field is required");
    }
  };

  const handlePassword = (e) => {
    const input = e.target.value;
    if (input) {
      setPassword(input);
      setPasswordErrorMsg("");
    } else {
      setPassword("");
      setPasswordErrorMsg("Field is required");
    }
  };

  const handleConfirmPassword = (e) => {
    const input = e.target.value;
    if (input) {
      setConfirmPassword(input);
      setConfirmPasswordErrorMsg("");
    } else {
      setConfirmPassword("");
      setConfirmPasswordErrorMsg("Field is required");
    }
  };

  const handleEmail = (e) => {
    const email = e.target.value;

    // Regular expression for a basic email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (emailPattern.test(email)) {
      setEmail(email);
      setEmailErrorMsg("");
    } else {
      setEmail(email);
      setEmailErrorMsg("Please enter a valid email address only!");
    }
    if (!email) {
      setEmailErrorMsg("Field is required!");
    }
  };

  const handleRegistration = async () => {
    setIsLoading(true);
    localStorage.removeItem("quizData");

    if (!nameValue.trim()) {
      setNameErrorMsg("Name is required");
    } else {
      setNameErrorMsg("");
    }

    if (!emailValue) {
      setEmailErrorMsg("Email is required");
    } else {
      setEmailErrorMsg("");
    }

    if (!passwordValue) {
      setPasswordErrorMsg("Password is required");
    } else {
      setPasswordErrorMsg("");
    }

    if (!confirmPassword) {
      setConfirmPasswordErrorMsg("Confirm Password is required");
    } else if (passwordValue !== confirmPassword) {
      setConfirmPasswordErrorMsg("Passwords do not match");
    } else {
      setConfirmPasswordErrorMsg("");
    }

    if (
      nameErrorMsg ||
      emailErrorMsg ||
      passwordErrorMsg ||
      confirmPasswordErrorMsg
    ) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${apiUrl}/signup`, {
        name: nameValue,
        email: emailValue,
        password: passwordValue,
      });

      const { data } = response;
      console.log(response);
      console.log(data);

      if (response.status === 201) {
        console.log("User registered successfully");
        console.log("JWT Token:", data.jwttoken);

        // Store the JWT token in local storage
        localStorage.setItem("userId", data.id);

        localStorage.setItem("jwtToken", data.jwttoken);

        // Navigate to homepage
        window.alert("Signed up successfully!!");

        navigate("/homepage");
      } else {
        console.error("Registration failed:", data.message);
        window.alert('Registration failed', data.message)
      }
    } catch (error) {
      console.error("Error during registration:", error);
      window.alert("Error during registration", error)
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    localStorage.removeItem("quizData");

    try {
      const response = await axios.post(`${apiUrl}/login`, {
        email: emailValue,
        password: passwordValue,
      });

      const { data } = response;
      console.log("data is herer..............", data.user.id);

      if (response.status === 200) {
        console.log("Login successful");
        console.log(data);
        console.log("JWT Token:", data.jwttoken);

        // Store the JWT token in local storage
        localStorage.setItem("userId", data.user.id);

        localStorage.setItem("jwtToken", data.jwttoken);

        // Navigate to homepage
        window.alert("Logged in succesfully!!");

        navigate("/homepage");
      } else {
        console.error("Login failed:", data.message);
        window.alert('Login failed!', data.message )
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error during login:", error);
      window.alert(error)
      setIsLoading(false);
    }
  };

  const changeAuthContent = (newContent) => {
    setAuthContent(newContent);
    setSelectedButton(newContent);
  };

  return (
    <div className="authPage">
      <div className="show-selected">
        <h1 className="heading-quizzie">QUIZZIE</h1>
        <span className="toggle-buttons">
          <button
            className={`signup-toggle ${
              selectedButton === "signupMode" ? "selected" : ""
            }`}
            onClick={() => changeAuthContent("signupMode")}
          >
            Sign Up
          </button>
          <button
            className={`login-toggle ${
              selectedButton === "loginMode" ? "selected" : ""
            }`}
            onClick={() => changeAuthContent("loginMode")}
          >
            Log In
          </button>
        </span>
        {authContent === "signupMode" && (
          <div className="signup-content">
            <div className="label">
              <h2 className="signup-headings">Name</h2>
              <input
                type="text"
                id="name"
                value={nameValue}
                className={`_input ${nameErrorMsg ? "error" : ""}`}
                onChange={handleName}
              />
              {nameErrorMsg && <p className="error-message">{nameErrorMsg}</p>}
            </div>

            <div className="label">
              <h2 className="signup-headings"> Email</h2>
              <input
                type="email"
                id="email"
                value={emailValue}
                className={`_input ${emailErrorMsg ? "error" : ""}`}
                onChange={handleEmail}
              />
              {emailErrorMsg && (
                <p className="error-message">{emailErrorMsg}</p>
              )}
            </div>
            <div className="label">
              <h2 className="signup-headings"> Password</h2>
              <input
                type="password"
                id="password"
                value={passwordValue}
                className={`_input ${passwordErrorMsg ? "error" : ""}`}
                onChange={handlePassword}
              />
              {passwordErrorMsg && (
                <p className="error-message">{passwordErrorMsg}</p>
              )}
            </div>
            <div className="label">
              <h2 className="signup-headings">Confirm Password</h2>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                className={`_input ${confirmPasswordErrorMsg ? "error" : ""}`}
                onChange={handleConfirmPassword}
              />
              {confirmPasswordErrorMsg && (
                <p className="error-message">{confirmPasswordErrorMsg}</p>
              )}
            </div>
            <button
              onClick={handleRegistration}
              className="signup-submit-button"
              disabled={isLoading}
            >
              {isLoading ? "Signing Up..." : "Sign Up"}
            </button>
          </div>
        )}
        {authContent === "loginMode" && (
          <div className="login-content">
            <div className="label">
              <h2 className="login-headings">Email</h2>
              <input
                type="email"
                id="loginEmail"
                className={`_input ${emailErrorMsg ? "error" : ""}`}
                onChange={handleEmail}
              />
              {emailErrorMsg && (
                <p className="error-message">{emailErrorMsg}</p>
              )}
            </div>
            <div className="label">
              <h2 className="login-headings">Password</h2>
              <input
                type="password"
                id="loginPassword"
                className={`_input ${passwordErrorMsg ? "error" : ""}`}
                onChange={handlePassword}
              />
              {passwordErrorMsg && (
                <p className="error-message">{passwordErrorMsg}</p>
              )}
            </div>
            <button
              className="login-submit-button"
              onClick={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? "Logging In..." : "Log In"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthComponent;