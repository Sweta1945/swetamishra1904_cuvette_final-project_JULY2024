import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../styles/QuizinfoComponent.css";
import congratsText from "../assets/congrats-text.png";
import trophy from "../assets/trophy.png";

const QuizInfoComponent = () => {
  const { quizId } = useParams();
  const [quizInfo, setQuizInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [score, setScore] = useState(0); // Initialize score state
  const [submitted, setSubmitted] = useState(false);
  const [timer, setTimer] = useState(null);

  useEffect(() => {
    const fetchQuizInfo = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/api/all-info/${quizId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch quiz information");
        }

        const data = await response.json();
        setQuizInfo(data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchQuizInfo();
  }, [quizId]);

  useEffect(() => {
    if (quizInfo && quizInfo.questions && quizInfo.questions.length > 0) {
      setSelectedOptions(new Array(quizInfo.questions.length).fill(null));
    }
  }, [quizInfo]);

  useEffect(() => {
    if (quizInfo && quizInfo.questions[currentQuestionIndex]) {
      const currentQuestion = quizInfo.questions[currentQuestionIndex];
      const questionTimer = currentQuestion.timer;

      if (
        quizInfo.quizType === "quiz" &&
        questionTimer !== "off" &&
        questionTimer !== 0
      ) {
        setTimer(questionTimer);
      } else {
        setTimer(null);
      }
    }
  }, [currentQuestionIndex, quizInfo]);

  useEffect(() => {
    // Handle timer reaching 0
    if (timer === 0) {
      handleNextQuestion();
    }
  }, [timer]);

  useEffect(() => {
    // Countdown timer effect
    if (timer !== null) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => (prevTimer > 0 ? prevTimer - 1 : 0));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleOptionChange = (e, index) => {
    // Update selected option
    const newSelectedOptions = [...selectedOptions];
    newSelectedOptions[currentQuestionIndex] = parseInt(index);
    setSelectedOptions(newSelectedOptions);
  };

  const handleSubmit = () => {
    // Initialize an array to store data for all questions
    const questionsData = [];

    // Loop through all questions and prepare data for each question
    quizInfo.questions.forEach((question, index) => {
      const correctAnswerIndex = parseInt(question.correctAnswer);
      const selectedOptionIndex = parseInt(selectedOptions[index]);
      const isCorrect = selectedOptionIndex === correctAnswerIndex;

      // Increment score if the selected option is correct
      if (isCorrect) {
        setScore((prevScore) => prevScore + 1); // Increment score by 1 if correct
      }

      // Prepare data for the current question
      const questionData = {
        questionName: question.questionText,
        selectedOption: selectedOptionIndex,
        isCorrect: isCorrect,
      };

      // Add the current question's data to the array
      questionsData.push(questionData);
    });

    // Prepare the complete data to store in MongoDB
    const dataToStore = {
      userId: localStorage.getItem("userId"), // Get user ID from local storage
      quizId: quizId,
      quizTitle: quizInfo.title,
      questions: questionsData, // Include data for all questions
      score: score, // Include updated score
    };

    console.log("Data to store:", dataToStore); // Log the data for debugging

    // Send data to the server
    fetch("http://localhost:4000/api/submit-response", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataToStore),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Response stored successfully:", data);
        setSubmitted(true);
      })
      .catch((error) => {
        console.error("Error storing response:", error);
      });
  };

  const handleNextQuestion = () => {
    // Move to the next question
    if (currentQuestionIndex === quizInfo.questions.length - 1) {
      setSubmitted(true);
    } else {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    }
  };

  // Render option with image or text
  const renderOption = (option) => {
    if (option.includes("|")) {
      const [text, imageUrl] = option.split("|");
      return (
        <div className="option-container">
          <p>{text}</p>
          {imageUrl && isValidUrl(imageUrl) ? (
            <img src={imageUrl} alt="Option Image" className="image-option" />
          ) : null}
        </div>
      );
    } else if (isValidUrl(option)) {
      return (
        <div className="option-container">
          <img src={option} alt="Option Image" className="image-option" />
        </div>
      );
    } else {
      return (
        <div className="option-container">
          <p>{option}</p>
        </div>
      );
    }
  };

  // Check if a string is a valid URL
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!quizInfo) {
    return <p>No quiz information available.</p>;
  }

  if (submitted) {
    if (quizInfo.quizType === "quiz") {
      return (
        <div className="award-page">
          <img src={congratsText} alt="Congrats Text" />
          <img src={trophy} alt="Trophy" />
          <span className="scoreIs">
            Your Score Is:
            <p className="score">
              {score}/{quizInfo.questions.length}
            </p>
          </span>
        </div>
      );
    } else {
      return (
        <p className="poll-msg">
          Thank You <br />
          for participating in <br />
          the poll!
        </p>
      );
    }
  }

  const currentQuestion = quizInfo.questions[currentQuestionIndex];
  const quizType = quizInfo.quizType;
  if (!currentQuestion || !currentQuestion.questionText) {
    return <p>Loading...</p>;
  }

  return (
    <div className="quizInfo-div">
      <h2 className="take-test">
        {quizType === "quiz" ? "Take Your Quiz" : "Take Your Poll"}
      </h2>
      <div>
        <div className="questAndTimer">
          <p>
            {" "}
            {`${(currentQuestionIndex + 1)
              .toString()
              .padStart(2, "0")}/${quizInfo.questions.length
              .toString()
              .padStart(2, "0")}`}
          </p>
          {timer !== null && (
            <p className="timer-quiz">
              {String(Math.floor(timer / 60)).padStart(2, "0")}:
              {String(timer % 60).padStart(2, "0")}s
            </p>
          )}
        </div>
      </div>
      <form>
        <p className="quiz-question">{currentQuestion.questionText}</p>
        <div className="options-container">
          {currentQuestion.options.map((option, index) => (
            <div key={index} className={`option option-${index}`}>
              <div className="option-label">
                <label>
                  <input
                    type="radio"
                    name="option"
                    value={option}
                    checked={selectedOptions[currentQuestionIndex] === index}
                    onChange={(e) => handleOptionChange(e, index)}
                  />
                  {renderOption(option)}
                </label>
              </div>
            </div>
          ))}
        </div>
      </form>
      {currentQuestionIndex === quizInfo.questions.length - 1 ? (
        <button onClick={handleSubmit} className="next-button">
          Submit
        </button>
      ) : (
        <button onClick={handleNextQuestion} className="submit-button">
          Next
        </button>
      )}
    </div>
  );
};

export default QuizInfoComponent;
