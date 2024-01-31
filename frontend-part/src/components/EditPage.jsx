import React, { useState, useEffect } from "react";
import bin from "../assets/dust-bin.png";
import "../styles/CreateQuizPage.css";
import { Link } from "react-router-dom";
import FinalLinkPage from "./FinalLinkPage";
import { useNavigate } from "react-router-dom";

const EditPage = ({ changeContent }) => {
  const [inputpart, setInputPart] = useState("");
  const [contenthere, setContenthere] = useState("createQuiz-content");
  const [questions, setQuestions] = useState([
    {
      questionText: "",
      options: Array.from({ length: 4 }, () => ""),
      correctAnswer: null,
      timer: 0,
      optionContent: "text-option",
    },
  ]);
  const [selectedQuizType, setSelectedQuizType] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [optionContent, setOptionContent] = useState("text-option");
  const [showAdditionalOptions, setShowAdditionalOptions] = useState(false);
  const [selectProceedButton, setSelectProceedButton] = useState("continue");
  const [activeIndex, setActiveIndex] = useState(0);
  const [timer, setTimer] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState(
    Array.from({ length: 5 }, () => "")
  );
  const [quizIdHere, setQuizIdHere] = useState(null);
  const [sharableLink, setSharableLink] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const response = await fetch(
          `https://backend-part-3u6u.onrender.com/api/quiz-data/65ba24ac18c50a2aa15a8ae6`
        );
        if (response.ok) {
          const data = await response.json();
          setTitle(data.title);
          setSelectedQuizType(data.quizType);
          const updatedQuestions = data.questions.map((question) => ({
            ...question,
            options: question.options.map((option, index) => ({
              optionText: option,
              id: index.toString(),
            })),
          }));
          setQuestions(updatedQuestions);
        } else {
          console.error("Failed to fetch quiz data");
        }
      } catch (error) {
        console.error("Error fetching quiz data:", error);
      }
    };
    fetchQuizData();
  }, []);

  useEffect(() => {
    const storedQuizData = localStorage.getItem("quizData");
    if (storedQuizData) {
      const parsedData = JSON.parse(storedQuizData);
      const updatedQuestions = parsedData.questions.map((question) => ({
        ...question,
        correctAnswer: question.quizType === "poll" ? null : "",
      }));
      setTitle(parsedData.title);
      setSelectedQuizType(parsedData.quizType);
      setQuestions(updatedQuestions);
    }
  }, []);

  const changeOptionContent = (newContent, questionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].optionContent = newContent;
    setQuestions(updatedQuestions);
  };

  const handleDeleteQuestion = () => {
    if (questions.length > 1) {
      setQuestions((prevQuestions) => prevQuestions.slice(0, -1));
      setActiveIndex((prevActiveIndex) => Math.max(0, prevActiveIndex - 1));
    }
  };

  const handleRadioChange = (questionIndex, optionIndex) => {
    const updatedQuestions = [...questions];
    const question = updatedQuestions[questionIndex];
    question.correctAnswer = optionIndex.toString();
    setQuestions(updatedQuestions);
    if (selectedQuizType === "quiz") {
      const newSelectedOptions = [...selectedOptions];
      newSelectedOptions[questionIndex] = optionIndex.toString();
      setSelectedOptions(newSelectedOptions);
    }
    setError("");
  };

  const handleInputChange = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...questions];
    const question = updatedQuestions[questionIndex];
    question.options[optionIndex] = value;
    setQuestions(updatedQuestions);
    setError("");
  };

  const handleTextImageInputChange = (
    questionIndex,
    optionIndex,
    textValue,
    imageUrlValue
  ) => {
    const updatedQuestions = [...questions];
    const question = updatedQuestions[questionIndex];
    const combinedValue = textValue + "|" + imageUrlValue;
    question.options[optionIndex] = combinedValue;
    setQuestions(updatedQuestions);
    if (question.correctAnswer === optionIndex.toString()) {
      const newSelectedOptions = [...selectedOptions];
      newSelectedOptions[questionIndex] = combinedValue;
      setSelectedOptions(newSelectedOptions);
    }
  };

  const submitCheck = () => {
    if (!["quiz", "poll"].includes(selectedQuizType)) {
      setError('Please select either "quiz" or "poll".');
      return;
    }
    if (title.trim() === "") {
      setError("Please provide a title for your quiz.");
      return;
    }
    setError("");
    setActiveIndex(0);
    setSelectProceedButton("continue");
    changeContent("quizMaking-content");
  };

  const handleCancel = () => {
    setSelectProceedButton("cancel");
    changeContent("dashboard-content");
  };
  const finalSubmit = async () => {
    if (
      error ||
      !title.trim() ||
      !["quiz", "poll"].includes(selectedQuizType)
    ) {
      return;
    }

    const quizDataToUpdate = {
      title,
      quizType: selectedQuizType,
      questions: questions
        .filter((question) => question.questionText.trim() !== "")
        .map(
          ({ questionText, options, correctAnswer, timer, optionContent }) => ({
            questionText,
            options: options.filter((option) => option.trim() !== ""),
            correctAnswer: selectedQuizType === "quiz" ? correctAnswer : null,
            timer: selectedQuizType === "quiz" ? timer : 0,
            optionContent,
          })
        ),
    };

    try {
      const response = await fetch(
        `https://backend-part-3u6u.onrender.com/api/edit-quiz/${quizIdHere}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${localStorage.getItem("jwtToken") || ""}`,
          },
          body: JSON.stringify(quizDataToUpdate),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update quiz");
      }

      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error("Error updating quiz:", error.message);
      setError("Failed to update quiz. Please try again.");
    }
  };

  const navigate = useNavigate();
  useEffect(() => {
    if (quizIdHere) {
      navigate(`/final-page/${quizIdHere}`);
      setQuizSubmitted(true);
    }
  }, [quizIdHere]);

  const handleDeleteOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...questions];
    const question = updatedQuestions[questionIndex];
    if (question.options.length > 2) {
      question.options.splice(optionIndex, 1);
      setQuestions(updatedQuestions);
    }
  };

  const handleAddOption = (questionIndex) => {
    if (questions[questionIndex].options.length < 4) {
      const updatedQuestions = [...questions];
      updatedQuestions[questionIndex].options.push("");
      setQuestions(updatedQuestions);
    }
    setShowAdditionalOptions(
      updatedQuestions[questionIndex].options.length < 3
    );
  };

  const showContent = (index) => {
    setActiveIndex((prevActiveIndex) =>
      prevActiveIndex === index ? null : index
    );
  };

  const handleTimerChange = (newTimer) => {
    setTimer(newTimer);
    const updatedQuestions = questions.map((question) => ({
      ...question,
      timer: newTimer,
    }));
    setQuestions(updatedQuestions);
  };

  const handleQuestionNumberChange = () => {
    const prevQuestion = questions[questions.length - 1];
    if (!prevQuestion.questionText.trim()) {
      setError("Please provide a question for the previous question.");
      return;
    }
    if (selectedQuizType === "quiz" && prevQuestion.correctAnswer === null) {
      setError("Please select a correct answer for the previous question.");
      return;
    }
    if (questions.length < 5) {
      const newQuestion = {
        questionText: "",
        options: Array.from({ length: 4 }, () => ""),
        correctAnswer: null,
        timer: timer,
        optionContent: "text-option",
      };
      setQuestions((prevQuestions) => [...prevQuestions, newQuestion]);
      setSelectedOptions((prevSelectedOptions) => [...prevSelectedOptions, ""]);
      setActiveIndex(questions.length);
    }
  };

  const resetQuizForm = () => {
    setQuestions([]);
    setSelectedQuizType("");
    setTitle("");
    setError("");
    setOptionContent("text-option");
    setShowAdditionalOptions(false);
    setSelectProceedButton("continue");
    setActiveIndex(0);
    setTimer(0);
    setSelectedOptions([]);
    setQuizSubmitted(false);
  };

  const renderQuestion = (question, index) => (
    <div key={index}>
      <div className="question-numbering-div">
        <div className="questionAndPlus">
          <div className="questionAndCross">
            <h2 className="quest-numbers" onClick={() => showContent(index)}>
              {index + 1}
            </h2>
            {index === questions.length - 1 && index !== 0 && (
              <h2 className="cross_button" onClick={handleDeleteQuestion}>
                x
              </h2>
            )}
            {index === questions.length - 1 && questions.length < 5 && (
              <h2 className="plus_button" onClick={handleQuestionNumberChange}>
                +
              </h2>
            )}
          </div>
        </div>
        <h2 className="max5">Max 5 questions</h2>
      </div>
      {activeIndex === index && (
        <div className="showing-content">
          <input
            placeholder={
              selectedQuizType === "poll"
                ? "Poll Question"
                : selectedQuizType === "qa"
                ? "Q&A Question"
                : `Q&A Question`
            }
            value={question.questionText}
            onChange={(e) => {
              const updatedQuestions = [...questions];
              updatedQuestions[index].questionText = e.target.value;
              setQuestions(updatedQuestions);
            }}
            className="questionInput"
          />
          <div className="option_div">
            <h2 className="option_type">Option Type</h2>
            <label>
              <input
                type="radio"
                value="text-option"
                checked={question.optionContent === "text-option"}
                onChange={() => changeOptionContent("text-option", index)}
              />
              Text
            </label>
            <label>
              <input
                type="radio"
                value="image-option"
                checked={question.optionContent === "image-option"}
                onChange={() => changeOptionContent("image-option", index)}
              />
              Image
            </label>
            <label>
              <input
                type="radio"
                value="text-image-option"
                checked={question.optionContent === "text-image-option"}
                onChange={() => changeOptionContent("text-image-option", index)}
              />
              Text and Image
            </label>
          </div>
          <div className="option-list">
            {question.options.map((option, optionIndex) => (
              <div key={optionIndex}>
                <label>
                  <input
                    type="radio"
                    name={`question_${index}_option`}
                    value={option.optionText}
                    checked={question.correctAnswer === optionIndex.toString()}
                    onChange={() => handleRadioChange(index, optionIndex)}
                    style={{
                      display:
                        selectedQuizType !== "poll" ? "inline-block" : "none",
                    }}
                  />
                  <input
                    type="text"
                    placeholder={`Option ${optionIndex + 1}`}
                    value={String(option.optionText)}
                    onChange={(e) =>
                      handleInputChange(index, optionIndex, e.target.value)
                    }
                    className={`option_input ${
                      question.correctAnswer === optionIndex.toString()
                        ? "selectedOption"
                        : ""
                    }`}
                  />
                </label>
              </div>
            ))}
            {question.options.length < 4 && (
              <button
                onClick={() => handleAddOption(index)}
                className="add_opt"
              >
                Add Option
              </button>
            )}
            <div className="time-options">
              Timer
              <button
                onClick={() => handleTimerChange(0)}
                className={timer === 0 ? "selectedTimer" : "timer"}
              >
                Off
              </button>
              <button
                onClick={() => handleTimerChange(5)}
                className={timer === 5 ? "selectedTimer" : "timer"}
              >
                5 sec
              </button>
              <button
                onClick={() => handleTimerChange(10)}
                className={timer === 10 ? "selectedTimer" : "timer"}
              >
                10 sec
              </button>
            </div>

            <div className="can-con">
              {error && <p className="error-message">{error}</p>}
              <button
                onClick={() => handleCancel()}
                className={`cancel_button ${
                  selectProceedButton === "cancel"
                    ? "selectedProceed-cancel"
                    : "cancel_button"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={() => finalSubmit()}
                className={`continue_button ${
                  selectProceedButton === "continue"
                    ? "selectedProceed-continue"
                    : "continue_button"
                }`}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="createQuizPage">
      <div className="quizMaking-div">
        <div className="question-numbers-container">
          {questions.map((question, index) => renderQuestion(question, index))}
        </div>
      </div>
    </div>
  );
};

export default EditPage;
