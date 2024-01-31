import React from "react";
import "../styles/DeleteConfirmationPopup.css";

const DeleteConfirmationPopup = ({ quizId, onCancel, onDelete }) => {
  const handleDelete = () => {
    onDelete(quizId);
  };

  return (
    <div className="delete-confirmation-popup">
      <div className="delete-confirmation-content">
        <h1>Are you sure you want to delete?</h1>
        <div className="buttons">
          <button className="onDelete" onClick={handleDelete}>Delete</button>
          <button className="onClick" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationPopup;
