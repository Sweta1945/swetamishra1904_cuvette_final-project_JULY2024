import React, { useState } from "react";
import "../styles/DeleteConfirmationPopup.css";

const DeleteConfirmationPopup = ({ quizId, onCancel, onDelete }) => {
  const [deleting, setDeleting] = useState(false); // State to manage deletion process

  const handleDelete = async () => {
    setDeleting(true); // Set deleting to true when deletion process starts
    await onDelete(quizId); // Wait for the deletion process to complete
    setDeleting(false); // Set deleting to false when deletion process finishes
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
