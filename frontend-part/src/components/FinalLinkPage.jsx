import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/FinalLinkPage.css"

const FinalLinkPage = () => {
  const [copied, setCopied] = useState(false);
  const baseUrl = "https://sweta-mishra.netlify.app"; // Replace 'yourwebsite.com' with your actual website domain
  const { quizId } = useParams();
  const sharableLink = quizId ? `${baseUrl}/quiz/${quizId}?click=true` : "";
  const navigate = useNavigate();

  useEffect(() => {
    if (!quizId) {
      navigate("/homepage");
    }
  }, [quizId, navigate]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sharableLink);
    setCopied(true);
  };

  const onClose = () => {
    navigate("/homepage");
  };

  return (
    <div className="quiz-published-container">
      {quizId && (
        <div>
          <h1 className="cross" onClick={onClose}>X</h1>
          <div className="congrats-message">
            <h2 className="cong">Congratulations! Your quiz is published.</h2>
          </div>
          <div className="sharable-link-input">
            <div className="link">
            <input type="text" className="link-input" value={sharableLink} readOnly />
            </div>
          <div className="button-divv">
            <button  className="coppyy-button" onClick={copyToClipboard}>
              {copied ? "Copied!" : "Copy Link"}
            </button>
            <button className="closee-button" onClick={onClose}>Close</button> {/* Cross button */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinalLinkPage;
