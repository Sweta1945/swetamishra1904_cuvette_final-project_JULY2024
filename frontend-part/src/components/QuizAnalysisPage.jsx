import React, { useState, useEffect } from "react";
import "../styles/QuestionWiseAnalysis.css"

function QuizAnalysisPage({ quizId }) {
  const [questionStats, setQuestionStats] = useState({});
  const [createdAt, setCreatedAt] = useState(null);
  const [quizTitle, setQuizTitle] = useState(""); 
  const [impressions, setImpressions] = useState(0); 
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    fetchQuizData();
    fetchQuizDetails(); 
  }, []);

  const fetchQuizData = async () => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/quiz/response/stats/${quizId}`
      );
      if (response.ok) {
        const data = await response.json();
        console.log("questionStats data:", data); 
        setQuestionStats(data);
        setCreatedAt(data.createdAt);
        setImpressions(data.impressions);
      } else {
        console.error("Failed to fetch quiz data");
      }
    } catch (error) {
      console.error("Error fetching quiz data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizDetails = async () => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/quiz-data/${quizId}`
      );
      if (response.ok) {
        const data = await response.json();
        console.log("Quiz details:", data);
        setQuizTitle(data.title); 
        setCreatedAt(data.createdAt); 
        setImpressions(data.impressions || 0); 
      } else {
        console.error("Failed to fetch quiz details");
      }
    } catch (error) {
      console.error("Error fetching quiz details:", error);
    }
  };

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="Container-Main">
      <div className="header">
        {loading ? (
          <h1>Loading...</h1>
        ) : (
          <>
            <h1 className="quizzy-heading">{quizTitle} Analysis</h1> 
            <div className="para">
              <p className="created-date">Created on: {createdAt ? formatDate(createdAt) : "Loading..."}</p>
              <p>Impressions: {impressions}</p> 
            </div>
          </>
        )}
      </div>
      {!loading && Object.keys(questionStats).length > 0 && (
        <div className="questions">
          {Object.entries(questionStats).map(([questionId, stats]) => (
            <div key={questionId}>
              <h2>{`Q.${questionId} `}</h2>
              <div className="question-numbers">
                <div className="box">
                  <span>{loading ? <div className="loading-circle"></div> : stats.totalAttempts}</span>
                  <p>people Attempted the quiz</p>
                </div>
                <div className="box">
                  <span>{loading ? <div className="loading-circle"></div> : stats.totalCorrect}</span>
                  <p>people Answered correct</p>
                </div>
                <div className="box">
                  <span>{loading ? <div className="loading-circle"></div> : stats.totalIncorrect}</span>
                  <p>people Answered Incorrect</p>
                </div>
              </div>
              <br />
              <hr className="borders" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default QuizAnalysisPage;
