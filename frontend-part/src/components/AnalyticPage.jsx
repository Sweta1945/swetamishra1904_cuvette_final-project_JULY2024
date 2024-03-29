import React, { useState, useEffect } from "react";
import bin from "../assets/dust-bin.png";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/CreateQuizPage.css";
import DeleteConfirmationPopup from "./DeleteConfirmationPopup";
import edit from "../assets/edit.png";
import share from "../assets/share.png";
import "../styles/AnalyticPage.css";
import loadingSpinner from "../assets/loading-spinner.gif"; // Import loading spinner image
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AnalyticPage = ({ changeContent }) => {
  const [trendingQuizzes, setTrendingQuizzes] = useState([]);
  const [deleteConfirmationVisible, setDeleteConfirmationVisible] = useState(false);
  const [quizToDeleteId, setQuizToDeleteId] = useState(null);
  const baseUrl = "https://sweta-mishra.netlify.app";
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false); 
  const [loading, setLoading] = useState(true); // State to manage loading spinner visibility

  useEffect(() => {
    fetchTrendingQuizzes();
  }, []);

  const fetchTrendingQuizzes = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const response = await fetch(
        `https://backend-part-3u6u.onrender.com/api/trending-quizzes-opp/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTrendingQuizzes(data);
      } else {
        console.error("Failed to fetch trending quizzes");
      }
    } catch (error) {
      console.error("Error fetching trending quizzes:", error);
    } finally {
      setLoading(false); // Set loading to false when fetching is done
    }
  };

  const handleDeleteConfirmation = (quizId) => {
    setDeleteConfirmationVisible(true);
    setQuizToDeleteId(quizId);
  };

  const handleCancelDelete = () => {
    setDeleteConfirmationVisible(false);
    setQuizToDeleteId(null);
  };

  const handleDeleteQuiz = async () => {
    if (quizToDeleteId) {
      try {
        const response = await fetch(
          `https://backend-part-3u6u.onrender.com/api/delete-quiz/${quizToDeleteId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          // Filter out the deleted quiz from the state
          setTrendingQuizzes((prevQuizzes) =>
            prevQuizzes.filter((quiz) => quiz.id !== quizToDeleteId)
          );
        } else {
          console.error("Failed to delete quiz");
        }
      } catch (error) {
        console.error("Error deleting quiz:", error);
      }
    }
    handleCancelDelete();
  };

  const handleText = (quizId, quizType) => {
    console.log("this is quiz id", quizId); 
    const content =
      quizType === "quiz" ? "quizAnalysis-content" : "pollAnalysis-content";
    changeContent(content, quizId); 
  };

  const generateSharableLink = (quizId) => {
    return `${baseUrl}/quiz/${quizId}?click=true`;
  };

  const copyToClipboard = (link) => {
    navigator.clipboard
      .writeText(link)
      .then(() => {
        toast.success("Link copied to clipboard!", {
          position: "top-right",
          autoClose: 3000, // Close the toast after 3 seconds
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        // Link copied successfully, show notification
        setCopied(true);
        // Hide notification after 3 seconds
        setTimeout(() => {
          setCopied(false);
        }, 3000);
      })
      .catch((error) => {
        console.error("Error copying to clipboard:", error);
        // Optionally, handle error if copying to clipboard fails
      });
  };

  const handleEdit = (quizId) => {
    changeContent("edit-page", quizId);
  };

  return (
    <div className="analyticPage">
      {loading && ( // Showing loading spinner if loading is true
        <div className="loading-spinner" style={{marginTop:"20px"}}>
          <img src={loadingSpinner} alt="Loading..." />
        </div>
      )}

      {!loading && (
        <>
          <h2 className="quiz-analysis-heading">Quiz Analysis</h2>
          <div className={`analysis-div ${deleteConfirmationVisible ? "overlay-visible" : ""}`}>
            <div className="analysis-bar">
              <h3>S.No</h3>
              <h3>Quiz Name</h3>
              <h3>Created on</h3>
              <h3>Impression</h3>
            </div>
            <div className="analysis-content">
              {trendingQuizzes.map((quiz, index) => (
                <div
                  key={quiz.id}
                  className={`analysis-row ${
                    index % 2 === 0 ? "even-row" : "odd-row"
                  }`}
                >
                  <div className="row-row">
                    <span className="wid-index">{index + 1}</span>
                    <span className="wid-title">{quiz.title}</span>
                    <span className="wid-date">{quiz.createdDate}</span>
                    <span className="wid-impression">{quiz.impressions}</span>
                    <div className="images">
                      <img
                        src={bin}
                        onClick={() => handleDeleteConfirmation(quiz.id)}
                        alt="Delete"
                      />
                      <img
                        src={share}
                        onClick={() =>
                          copyToClipboard(generateSharableLink(quiz.id))
                        }
                        alt="Share"
                      />
                      <img src={edit} onClick={() => handleEdit(quiz.id)} />
                    </div>
  
                    <p
                      className="wid-p"
                      onClick={() => handleText(quiz.id, quiz.quizType)}
                    >
                      Question Wise Analysis
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
  
      {/* Conditionally render the DeleteConfirmationPopup component */}
      {deleteConfirmationVisible && (
        <DeleteConfirmationPopup
          quizId={quizToDeleteId}
          onCancel={handleCancelDelete}
          onDelete={handleDeleteQuiz}
        />
      )}
              <ToastContainer />

    </div>
  );
};

export default AnalyticPage;
