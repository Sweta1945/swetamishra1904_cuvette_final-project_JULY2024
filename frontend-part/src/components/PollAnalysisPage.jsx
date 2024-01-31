import React, { useState, useEffect } from "react";
import "../styles/PollAnalysisPage.css"
const PollAnalysisPage = ({ quizId }) => {
  console.log("Received quizId:", quizId);

  const [pollDataToStore, setPollDataToStore] = useState(null);

  useEffect(() => {
    fetchPollStats();
  }, [quizId]); // Make sure to include quizId in the dependency array

  const fetchPollStats = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/poll/response/stats/${quizId}`);
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

  return (
    <div>
      <h1 className="analysisPoll">Poll Analysis Page</h1>
      {pollDataToStore && (
        <div className="poll-division">
         <span className="option-div"> <p className="div-poll"> {pollDataToStore.option1}</p><p className="para">option1</p> </span>
         <span className="option-div"> <p className="div-poll"> {pollDataToStore.option2}</p><p className="para">option2</p> </span>
         <span className="option-div"> <p className="div-poll"> {pollDataToStore.option3}</p><p className="para">option3</p> </span>
        <span className="option-div"> <p className="div-poll"> {pollDataToStore.option4}</p><p className="para">option4</p> </span> 
        </div>
      )}
    </div>
  );
};

export default PollAnalysisPage;
