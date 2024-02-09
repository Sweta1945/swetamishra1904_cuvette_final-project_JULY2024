import React, { useState, useEffect } from "react";
import "../styles/QuestionWiseAnalysis.css";

const PollAnalysisPage = ({ quizId }) => {
  console.log("Received quizId:", quizId);

  const [pollDataToStore, setPollDataToStore] = useState(null);
  const [createdAt, setCreatedAt] = useState(null);
  const [quizTitle, setQuizTitle] = useState(""); 
  const [impressions, setImpressions] = useState(0); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPollStats();
    fetchQuizDetails(); 
  }, []); // Make sure to include quizId in the dependency array

  const fetchPollStats = async () => {
    try {
      const response = await fetch(`https://backend-part-3u6u.onrender.com/api/poll/response/stats/${quizId}`);
      if (response.ok) {
        const data = await response.json();
        setPollDataToStore(data);
      } else {
        console.error('Failed to fetch poll stats');
      }
    } catch (error) {
      console.error('Error fetching poll stats:', error);
    }
  };

  const fetchQuizDetails = async () => {
    try {
      const response = await fetch(
        `https://backend-part-3u6u.onrender.com/api/quiz-data/${quizId}`
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
        <h1>{quizTitle} Analysis</h1>
        <div className="para">
          <p className="created-date">Created on: {createdAt ? formatDate(createdAt) : "Loading..."}</p>
          <p>Impressions: {impressions}</p> 
        </div>
      </div>
      <div className="questions">
        {pollDataToStore && Object.entries(pollDataToStore).map(([questionName, stats]) => (
          <div key={questionName}>
            <h2>{`Q. ${questionName}`}</h2>
            <div className="question-numbers">
              <div className="box-poll">
                <span>{stats.options.option1}</span>
                <p> Option 1</p>
              </div>
              <div className="box-poll">
                <span>{stats.options.option2}</span>
                <p> Option 2</p>
              </div>
              <div className="box-poll">
                <span>{stats.options.option3}</span>
                <p> Option 3</p>
              </div>
              <div className="box-poll">
                <span>{stats.options.option4}</span>
                <p> Option 4</p>
              </div>
            </div>
            <br></br>
            <hr className="borders"></hr>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PollAnalysisPage;
