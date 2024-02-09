import React, { useContext, useState, useEffect } from "react";
import bin from "../assets/dust-bin.png";
import "../styles/CreateQuizPage.css";
import { Link } from "react-router-dom";
import FinalLinkPage from "./FinalLinkPage";
import { useNavigate } from "react-router-dom";


const EditPage = ({ changeContent, quizId }) => {
  const [inputpart, setInputPart] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
  const changeContenthere = (newContent) => {
    setContenthere(newContent);
  };
  const [selectedQuizType, setSelectedQuizType] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [optionContent, setOptionContent] = useState("text-option"); // Set the default option type to "text-option"
  const [showAdditionalOptions, setShowAdditionalOptions] = useState(false);
  const [selectProceedButton, setSelectProceedButton] = useState("continue");
  const [activeIndex, setActiveIndex] = useState(0);
  const [timer, setTimer] = useState(0); // 0: off, 5: 5 seconds, 10: 10 seconds
  const [selectedOptions, setSelectedOptions] = useState(
    Array.from({ length: 5 }, () => "")
  );
  const [quizIdHere, setQuizIdHere] = useState(null);
  const [sharableLink, setSharableLink] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const [quizData, setQuizData] = useState(null); // State to store the fetched quiz data

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const response = await fetch(`https://backend-part-3u6u.onrender.com/api/quiz-data/${quizId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch quiz data");
        }
        const data = await response.json();
        setQuizData(data); // Update the state with the fetched quiz data
  
        // Pre-fill the input fields with the fetched quiz data
        setTitle(data.title);
        setSelectedQuizType(data.quizType);
        setQuestions(data.questions);
        // Preserve the initial state of optionContent if not provided in fetched data
        setOptionContent(data.questions[0]?.optionContent || "text-option");
  
        // Log the fetched quiz data
        console.log("Fetched Quiz Data:", data);
      } catch (error) {
        console.error("Error fetching quiz data:", error.message);
      }
    };
  
    if (quizId) {
      fetchQuizData(); // Fetch quiz data when the component mounts
    }
  
    // Ensure "text-option" is pre-selected when the component mounts
    setOptionContent("text-option");
  }, [quizId]);
  
  
  useEffect(() => {
    if (quizData && quizData.questions && quizData.questions.length > 0) {
      setOptionContent(quizData.questions[0].optionContent);
    }
  }, [quizData]);
  

  useEffect(() => {
    const storedQuizData = localStorage.getItem("quizData");
    if (storedQuizData) {
      const parsedData = JSON.parse(storedQuizData);
      const updatedQuestions = parsedData.questions.map((question) => ({
        ...question,
        correctAnswer: question.quizType === "poll" ? null : "", // Default value for correct answer for poll questions
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

    // Handle correct answer selection for text-image-option
    if (question.correctAnswer === optionIndex.toString()) {
      const newSelectedOptions = [...selectedOptions];
      newSelectedOptions[questionIndex] = combinedValue;
      setSelectedOptions(newSelectedOptions);
    }
  };

  const finalSubmit = async () => {
    setIsLoading(true);
  
    if (error) {
      setIsLoading(false); // Reset loading state if there's an error
      window.alert("attempt failed! retry")
      return; // Prevent submission if there is an error
    }
   
    // Check if the title and quiz type are provided
    if (!title.trim()) {
      setError("Please provide a title for your quiz.");
      return;
    }
    if (!["quiz", "poll"].includes(selectedQuizType)) {
      setError('Please select either "quiz" or "poll".');
      return;
    }
  
    // Prepare data to be submitted
    let quizDataToStore = {
      title,
      quizType: selectedQuizType,
      questions: questions
        .filter((question) => question.questionText.trim() !== "")
        .map(
          ({ questionText, options, correctAnswer, timer, optionContent }) => ({
            questionText,
            options: options.filter((option) => option.trim() !== ""),
            correctAnswer: selectedQuizType === "quiz" ? correctAnswer : null,
            timer: selectedQuizType === "quiz" ? timer : 0, // Set timer to 0 for poll questions
            optionContent,
          })
        ),
        
    };
  
    console.log("Quiz Data to Store:", quizDataToStore); // Check quizDataToStore before submission

  
    // Sending data to the backend
    try {
      const response = await fetch(`https://backend-part-3u6u.onrender.com/api/edit-quiz/${quizId}`, {
        method: "PUT", // Assuming your backend API uses PUT method for updating quizzes
        headers: {
          "Content-Type": "application/json",
          Authorization: ` ${localStorage.getItem("jwtToken") || ""}`,
        },
        body: JSON.stringify(quizDataToStore),
      });
      if (!response.ok) {
        throw new Error("Failed to update quiz");
      }

      const data = await response.json();
      console.log("Updated quiz data:", data);

              window.alert('Quiz updated successfully!');
              changeContent('analytic-content')

      // Optionally, you can perform additional actions after the quiz is successfully updated,
      // such as displaying a success message or navigating to another page.
      setIsLoading(false);
  
    } catch (error) {
      console.error("Error updating quiz:", error.message);
      setError("Failed to update quiz. Please try again later.");
    }
  };
  

  const navigate = useNavigate();
  useEffect(() => {
    if (quizIdHere) {
      console.log("useeffectrendered", quizIdHere);

      navigate(`/final-page/${quizIdHere}`);
      setQuizSubmitted(true);
    }
  }, [quizIdHere, changeContent]);

  console.log("this is quizid", quizIdHere);

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
    // Check if the previous question has a correct answer selected
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
        timer: timer, // Initialize timer for new question
        optionContent: "text-option",
      };
      setQuestions((prevQuestions) => [...prevQuestions, newQuestion]);
      setSelectedOptions((prevSelectedOptions) => [...prevSelectedOptions, ""]);
      setActiveIndex(questions.length);
    }
  };
  const resetQuizForm = () => {
    setQuestions([
      /* Initial state */
    ]);
    setSelectedQuizType("");
    setTitle("");
    setError("");
    setOptionContent("text-option");
    setShowAdditionalOptions(false);
    setSelectProceedButton("continue");
    setActiveIndex(0);
    setTimer(0);
    setSelectedOptions([
      /* Initial state */
    ]);

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
  checked={question.optionContent === "text-option" } // Add this condition
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
          <div className="option-listDown">
          {question.optionContent === "text-option"  && (
              <div>
                {/* Render the first two options */}
                {question.options.slice(0, 2).map((option, optionIndex) => (
                  <div key={optionIndex}>
                    <label>
                      <input
                        type="radio"
                        name={`question_${index}_option`}
                        value={option}
                        checked={
                          question.correctAnswer === optionIndex.toString()
                        } // Compare with index
                        onChange={() => handleRadioChange(index, optionIndex)}
                        style={{
                          display:
                            selectedQuizType !== "poll"
                              ? "inline-block"
                              : "none",
                        }}
                      />
                      <input
                        type="text"
                        placeholder={`Text`}
                        value={option}
                        onChange={(e) =>
                          handleInputChange(index, optionIndex, e.target.value)
                        }
                        className={`option_input ${
                          question.correctAnswer === optionIndex.toString() // Compare with index
                            ? "selectedOption"
                            : ""
                        }`}
                      />
                    </label>
                  </div>
                ))}

                {question.options.slice(2).map((option, optionIndex) => (
                  <div key={optionIndex + 2}>
                    <label>
                      <input
                        type="radio"
                        name={`question_${index}_option`}
                        value={option}
                        checked={
                          question.correctAnswer ===
                          (optionIndex + 2).toString()
                        }
                        onChange={() =>
                          handleRadioChange(index, optionIndex + 2)
                        }
                        style={{
                          display:
                            selectedQuizType !== "poll"
                              ? "inline-block"
                              : "none",
                        }}
                      />
                      <input
                        type="text"
                        placeholder={`Text`}
                        value={option}
                        onChange={(e) =>
                          handleInputChange(
                            index,
                            optionIndex + 2,
                            e.target.value
                          )
                        }
                        className={`option_input ${
                          question.correctAnswer ===
                          (optionIndex + 2).toString()
                            ? "selectedOption"
                            : ""
                        }`}
                      />
                    </label>
                    <img
                      src={bin}
                      onClick={() => handleDeleteOption(index, optionIndex + 2)}
                    />
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
              </div>
            )}

{question.optionContent === "image-option" && (
  <div>
    {/* Render the first two options */}
    {question.options.slice(0, 2).map((option, optionIndex) => (
      <div key={optionIndex}>
        <label>
          <input
            type="radio"
            name={`question_${index}_option`}
            value={option}
            checked={question.correctAnswer === optionIndex.toString()} // Check if the correct answer matches the option index
            onChange={() => handleRadioChange(index, optionIndex)}
            style={{
              display: selectedQuizType !== "poll" ? "inline-block" : "none",
            }}
          />
          <input
            type="text"
            placeholder={`Image Url`}
            value={option}
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

    {question.options.slice(2).map((option, optionIndex) => (
      <div key={optionIndex + 2}>
        <label>
          <input
            type="radio"
            name={`question_${index}_option`}
            value={option}
            checked={
              question.correctAnswer === (optionIndex + 2).toString()
            } // Check if the correct answer matches the option index
            onChange={() => handleRadioChange(index, optionIndex + 2)}
            style={{
              display: selectedQuizType !== "poll" ? "inline-block" : "none",
            }}
          />
          <input
            type="text"
            placeholder={`Image Url`}
            value={option}
            onChange={(e) =>
              handleInputChange(index, optionIndex + 2, e.target.value)
            }
            className={`option_input ${
              question.correctAnswer === (optionIndex + 2).toString()
                ? "selectedOption"
                : ""
            }`}
          />
        </label>{" "}
        <img
          src={bin}
          onClick={() => handleDeleteOption(index, optionIndex + 2)}
        />
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
  </div>
)}

            {question.optionContent === "text-image-option" && (
              <div>
                {question.options.slice(0, 2).map((option, optionIndex) => (
                  <div key={optionIndex}>
                    <label>
                      <input
                        type="radio"
                        name={`question_${index}_option`}
                        value={option}
                        checked={
                          question.correctAnswer === optionIndex.toString()
                        }
                        onChange={() => handleRadioChange(index, optionIndex)}
                        style={{
                          display:
                            selectedQuizType !== "poll"
                              ? "inline-block"
                              : "none",
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Text"
                        value={option.split("|")[0]}
                        onChange={(e) =>
                          handleTextImageInputChange(
                            index,
                            optionIndex,
                            e.target.value,
                            option.split("|")[1]
                          )
                        }
                        className={`option_input ${
                          question.correctAnswer === optionIndex.toString()
                            ? "selectedOption"
                            : ""
                        }`}
                      />
                      <input
                        type="text"
                        placeholder="Image URL"
                        value={option.split("|")[1]}
                        onChange={(e) =>
                          handleTextImageInputChange(
                            index,
                            optionIndex,
                            option.split("|")[0],
                            e.target.value
                          )
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
                {question.options.slice(2).map((option, optionIndex) => (
                  <div key={optionIndex + 2}>
                    <label>
                      <input
                        type="radio"
                        name={`question_${index}_option`}
                        value={option}
                        checked={
                          question.correctAnswer ===
                          (optionIndex + 2).toString()
                        }
                        onChange={() =>
                          handleRadioChange(index, optionIndex + 2)
                        }
                        style={{
                          display:
                            selectedQuizType !== "poll"
                              ? "inline-block"
                              : "none",
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Text"
                        value={option.split("|")[0]}
                        onChange={(e) =>
                          handleTextImageInputChange(
                            index,
                            optionIndex + 2,
                            e.target.value,
                            option.split("|")[1]
                          )
                        }
                        className={`option_input ${
                          question.correctAnswer ===
                          (optionIndex + 2).toString()
                            ? "selectedOption"
                            : ""
                        }`}
                      />
                      <input
                        type="text"
                        placeholder="Image URL"
                        value={option.split("|")[1]}
                        onChange={(e) =>
                          handleTextImageInputChange(
                            index,
                            optionIndex + 2,
                            option.split("|")[0],
                            e.target.value
                          )
                        }
                        className={`option_input ${
                          question.correctAnswer ===
                          (optionIndex + 2).toString()
                            ? "selectedOption"
                            : ""
                        }`}
                      />
                    </label>
                    <img
                      src={bin}
                      onClick={() => handleDeleteOption(index, optionIndex + 2)}
                    />
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
              </div>
            )}

            <div className="timer-options">
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
          </div>
          <div className="cancel-continue">
            {error && <p className="error-message">{error}</p>}{" "}
            {/* Render error message here */}
            <button
              onClick={() => changeContent("analytic-content")}
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
            {isLoading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="createQuizPage">
     
        <div className="quizMaking-div">
          <div className="question-numbers-container">
            {questions.map((question, index) =>
              renderQuestion(question, index)
            )}
          </div>
        </div>
      
    </div>
  );
};

export default EditPage;
