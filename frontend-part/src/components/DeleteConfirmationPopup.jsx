import React, { useState } from "react";
import "../styles/DeleteConfirmationPopup.css";

const DeleteConfirmationPopup = ({ quizId, onCancel, onDelete }) => {
  const [deleting, setDeleting] = useState(false); 

  const handleDelete = async () => {
    setDeleting(true); 
    await onDelete(quizId); 
    setDeleting(false); 
  };

  return (
    <div className="delete-confirmation-popup">
      <div className="delete-confirmation-content">
        <h1>Are you sure you want to delete?</h1>
        <div className="buttons">
          <button className="onDelete" onClick={handleDelete}>
            {deleting ? "Deleting..." : "Delete"}
          </button>
          <button className="onClick" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationPopup;
