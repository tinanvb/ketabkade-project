"use client";
import { Modal, Button } from "react-bootstrap";
import React from "react";

const ConfirmDeleteModal = ({ 
  show, 
  onClose, 
  onConfirm, 
  title = "تأیید حذف", 
  message = "آیا از حذف این مورد مطمئن هستید؟" 
}) => {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          انصراف
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          حذف
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmDeleteModal;
