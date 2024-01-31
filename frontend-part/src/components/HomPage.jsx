import React, { useState } from "react";
import DashboardContent from "./DashboardPage";
import AnalyticsContent from "./AnalyticPage";
import CreateQuizContent from "./CreateQuizContent";
import QuizAnalysisPage from "./QuizAnalysisPage";
import PollAnalysisPage from "./PollAnalysisPage";
import EditPage from "./EditPage";
import { useNavigate } from "react-router-dom";

import "../styles/HomePage.css";

const HomePage = () => {
  const [selectButton, setSelectButton] = useState("dashboard-content");
  const [content, setContent] = useState("dashboard-content");
  const [quizId, setQuizId] = useState(null);

  const changeContent = (newContent, id = null) => {
    console.log("Changing content to:", newContent);
    setContent(newContent);
    setSelectButton(newContent);
    if (id !== null) {
      setQuizId(id);
    }
  };
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="homePage">
      <div className="homepage_leftDiv">
        <h1 className="app-heading">QUIZZIE</h1>
        <div className="changing-components">
          <button
            className={`dashboard-heading ${
              selectButton === "dashboard-content" ? "selectedButton" : ""
            }`}
            onClick={() => changeContent("dashboard-content")}
          >
            Dashboard
          </button>
          <button
            className={`analytics-heading ${
              selectButton === "analytic-content" ? "selectedButton" : ""
            }`}
            onClick={() => changeContent("analytic-content")}
          >
            Analytics
          </button>
          <button
            className={`createQuiz-heading ${
              selectButton === "createQuiz-content" ? "selectedButton" : ""
            }`}
            onClick={() => changeContent("createQuiz-content")}
          >
            Create Quiz
          </button>
        </div>

        <div className="line"></div>
        <h1 className="logout" onClick={handleLogout}>
          Logout
        </h1>
      </div>
      <div className="homepage_rightDiv">
        {content === "dashboard-content" && (
          <DashboardContent changeContent={changeContent} />
        )}
        {content === "analytic-content" && (
          <AnalyticsContent changeContent={changeContent} />
        )}
        {content === "createQuiz-content" && (
          <CreateQuizContent changeContent={changeContent} />
        )}
        {content === "quizAnalysis-content" && (
          <QuizAnalysisPage changeContent={changeContent} quizId={quizId} />
        )}
        {content === "pollAnalysis-content" && (
          <PollAnalysisPage changeContent={changeContent} quizId={quizId} />
        )}
        {content === "edit-page" && (
          <EditPage changeContent={changeContent} quizId={quizId} />
        )}
      </div>
    </div>
  );
};

export default HomePage;
