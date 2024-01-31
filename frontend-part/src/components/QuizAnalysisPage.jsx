import React, { useState, useEffect } from "react";
import "../styles/PollAnalysisPage.css";

function QuizAnalysisPage({ quizId }) {
  console.log("here is id", quizId);
  const [quizDataToStore, setQuizDataToStore] = useState(null);

  useEffect(() => {
    fetchQuizStats();
  }, []);

  const fetchQuizStats = async () => {
    try {
      const response = await fetch(
        `https://backend-part-3u6u.onrender.com/api/quiz/response/stats/${quizId}`
      );
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setQuizDataToStore(data);
      } else {
        console.error("Failed to fetch quiz stats");
      }
    } catch (error) {
      console.error("Error fetching quiz stats:", error);
    }
  };

  return (
    <div>
      <h1 className="analysisPoll">Quiz Analysis Page</h1>
      {quizDataToStore && (
        <div className="poll-division">
          <span className="option-div">
            {" "}
            <p className="div-poll"> {quizDataToStore.totalResponses}</p>
            <p className="para">Total</p>{" "}
          </span>
          <span className="option-div">
            {" "}
            <p className="div-poll"> {quizDataToStore.totalCorrect}</p>
            <p className="para">Total-correct</p>{" "}
          </span>
          <span className="option-div">
            {" "}
            <p className="div-poll"> {quizDataToStore.totalIncorrect}</p>
            <p className="para">Total-incorrect</p>{" "}
          </span>
        </div>
      )}
    </div>
  );
}

export default QuizAnalysisPage;
