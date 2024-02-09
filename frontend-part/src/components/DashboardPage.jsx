import React, { useState, useEffect } from "react";
// import axios from 'axios';
import eyes from "../assets/eyes.png";

import "../styles/DashboardPage.css";

const DashboardContent = () => {
  const [totalQuiz, setTotalQuiz] = useState(0);
  const [totalQuestion, setTotalQuestion] = useState(0);
  const [totalImpression, setTotalImpression] = useState(0);

  const [trendingQuizzes, setTrendingQuizzes] = useState([]);

  useEffect(() => {
    fetchTotalQuestions();
    fetchTotalQuiz();
    fetchTotalImpressions();
    fetchTrendingQuizzes();
  }, []);

  const fetchTotalQuiz = async () => {
    try {
      const response = await fetch("https://backend-part-3u6u.onrender.com/api/total-quizzes", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${localStorage.getItem("jwtToken")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setTotalQuiz(data.totalQuizzes);
      } else {
        console.error("Failed to fetch total quizs");
      }
    } catch (error) {
      console.error("Error fetching total questions:", error);
    }
  };

  const fetchTotalQuestions = async () => {
    try {
      const response = await fetch(
        "https://backend-part-3u6u.onrender.com/api/total-questions",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${localStorage.getItem("jwtToken")}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setTotalQuestion(data.totalQuestions);
      } else {
        console.error("Failed to fetch total questions");
      }
    } catch (error) {
      console.error("Error fetching total questions:", error);
    }
  };

  const fetchTotalImpressions = async () => {
    try {
      const response = await fetch(
        "https://backend-part-3u6u.onrender.com/api/total-impressions",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${localStorage.getItem("jwtToken")}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setTotalImpression(data.totalImpressions);
      } else {
        console.error("Failed to fetch total questions");
      }
    } catch (error) {
      console.error("Error fetching total questions:", error);
    }
  };

  const fetchTrendingQuizzes = async () => {
    try {
      const userId = localStorage.getItem("userId");

      const response = await fetch(
        `https://backend-part-3u6u.onrender.com/api/trending-quizzes/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(response);
      if (response.ok) {
        const data = await response.json();
        setTrendingQuizzes(data);
      } else {
        console.error("Failed to fetch trending quizzes");
      }
    } catch (error) {
      console.error("Error fetching trending quizzes:", error);
    }
  };

  const formatNumber = (number) => {
    if (number >= 1000) {
      const roundedNumber = Math.round(number / 100) / 10;
      return `${roundedNumber}k`;
    }
    return number.toString();
  };

  const capitalizeFirstWord = (title) => {
    return title.charAt(0).toUpperCase() + title.slice(1);
  };
  const renderQuizCards = () => {
    return trendingQuizzes.map((quiz, index) => (
      <div key={index} className="quiz-card">
        <div className="titleAndImpression">
          <h3 className="quizCard-title">{capitalizeFirstWord(quiz.title)}</h3>
          <div className="quizCard-impression">
            <p>{quiz.impressions}</p>
            <img
              src={eyes}
              alt="eyes"
              style={{ width: "30px", height: "30px" }}
            />
          </div>
        </div>
        <p className="quizCard-date">Created Date: {quiz.createdDate}</p>
      </div>
    ));
  };

  return (
    <div className="dashboardPage">
      <div className="number-displaying-section">
        <div className="quiz-created-division">
          <div className="quiz-created-number">
            <span className="span-quiz">
              <h2 className="quiz-heading">{formatNumber(totalQuiz)}</h2>

              <h3 className="quiz-quiz">Quiz</h3>
            </span>
            <h3 className="quiz-created">created</h3>
          </div>
        </div>
        <div className="question-created-division">
          <div className="question-created-number">
            <span className="span-question">
              <h2 className="question-heading">
                {formatNumber(totalQuestion)}
              </h2>

              <h3 className="question-question">Questions</h3>
            </span>
            <h3 className="question-created">created</h3>
          </div>
        </div>
        <div className="total-impressions-division">
          <div className="total-impressions-number">
            <span className="span-impression">
              <h2 className="impression-heading">
                {formatNumber(totalImpression)}
              </h2>
              <h3 className="impression-impression">Total</h3>
            </span>
            <h3 className="impression-created">Impressions</h3>
          </div>
        </div>
      </div>
      <div className="trendingQuiz-div">
        <h2 className="trending-quiz-heading">Trending Quizs</h2>
        <div className="trendingQuiz-display">{renderQuizCards()}</div>
      </div>
    </div>
  );
};

export default DashboardContent;
