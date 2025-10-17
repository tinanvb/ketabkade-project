"use client";
import React, { useEffect, useState } from "react";
import { Alert, Table, Badge, Modal, Button } from "react-bootstrap";
import GeneralLoading from "@/app/components/ui/GeneralLoading";
import GeneralError from "@/app/components/ui/GeneralError";
import moment from "moment-jalaali";
import { FaRegTrashCan } from "react-icons/fa6";
import { CiEdit } from "react-icons/ci";
import Link from "next/link";
import TablePagination from "@/app/components/ui/TablePagination";

const statusMap = {
  pending: "در انتظار پاسخ",
  answered: "پاسخ داده شده",
  closed: "بسته شده",
};

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchTickets = async () => {
    try {
      setFetchLoading(true);
      const res = await fetch("/api/tickets");
      if (!res.ok) {
        setErrorMessage("خطا در دریافت اطلاعات");
        setTickets([]);
        return;
      }
      const data = await res.json();
      setTickets(data);
    } catch (err) {
      console.error(err);
      setErrorMessage(
        err.message || "مشکل در دریافت اطلاعات. لطفاً دوباره تلاش کنید."
      );
      setTickets([]);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
        setErrorMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  const handleShowModal = (ticket) => {
    setSelectedTicket(ticket);
    setShowDeleteModal(true);
  };

  const handleCloseModal = () => {
    setSelectedTicket(null);
    setShowDeleteModal(false);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tickets/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSuccessMessage("تیکت با موفقیت حذف شد");
        setErrorMessage("");
        setTickets((prev) => prev.filter((ticket) => ticket._id !== id));
      } else {
        const data = await res.json();
        setErrorMessage(data?.error || "خطایی در حذف تیکت پیش آمد");
      }
    } catch (err) {
      setErrorMessage("مشکلی در حذف تیکت پیش آمد");
      setSuccessMessage("");
    } finally {
      setLoading(false);
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTickets = tickets.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(tickets.length / itemsPerPage);

  return (
    <section className='admin-section'>
      <div className="d-flex justify-content-between align-items-center m-3">
        <h4 className="my-4">مدیریت تیکت‌های پشتیبانی</h4>
      </div>

      {errorMessage && <GeneralError error={errorMessage} />}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      {fetchLoading ? (
        <GeneralLoading />
      ) : (
        <>
          <div className="overflow-auto">
            <Table
              striped
              bordered
              hover
              responsive
              className="text-center align-middle text-table"
            >
              <thead>
                <tr>
                  <th>شناسه</th>
                  <th>عنوان تیکت</th>
                  <th>کاربر</th>
                  <th>پیام کاربر</th>
                  <th>پاسخ ادمین</th>
                  <th>وضعیت</th>
                  <th>تاریخ ایجاد</th>
                  <th>آخرین بروزرسانی</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {currentTickets.map((ticket, index) => (
                  <tr key={ticket._id}>
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td>{ticket.title}</td>
                    <td>
                      {`${ticket.user?.firstname || ""} ${
                        ticket.user?.lastname || ""
                      }`.trim() || "نام نامشخص"}
                    </td>
                    <td>
                      {ticket.messages
                        .filter((m) => m.sender === "user")
                        .slice(-1)[0]?.text || "-"}
                    </td>
                    <td>
                      {ticket.messages
                        .filter((m) => m.sender === "admin")
                        .slice(-1)[0]?.text || "-"}
                    </td>
                    <td>
                      <Badge
                        bg={
                          ticket.status === "pending"
                            ? "warning"
                            : ticket.status === "answered"
                            ? "success"
                            : "secondary"
                        }
                      >
                        {statusMap[ticket.status] || ticket.status}
                      </Badge>
                    </td>
                    <td>
                      {moment(ticket.createdAt).format("jYYYY/jMM/jDD HH:mm")}
                    </td>
                    <td>
                      {moment(ticket.updatedAt).format("jYYYY/jMM/jDD HH:mm")}
                    </td>
                    <td>
                      <div className="d-flex gap-2 justify-content-end mt-2">
                        <Link
                          href={`/admin/tickets/${ticket._id}`}
                          className="btn-custom-edit rounded px-1"
                        >
                          <CiEdit /> پاسخ
                        </Link>
                        <button
                          onClick={() => handleShowModal(ticket)}
                          className="btn-custom-delete rounded"
                        >
                          <FaRegTrashCan /> حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      <Modal show={showDeleteModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>تأیید حذف</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTicket && (
            <p>
              آیا مطمئن هستید که می‌خواهید تیکت
              <strong className="text-danger"> {selectedTicket.title} </strong>
              مربوط به کاربر
              <strong className="text-danger">
                {" "}
                {`${selectedTicket.user?.firstname || ""} ${
                  selectedTicket.user?.lastname || ""
                }`.trim() || "نام نامشخص"}{" "}
              </strong>
              را حذف کنید؟
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            لغو
          </Button>
          <Button
            variant="danger"
            onClick={async () => {
              await handleDelete(selectedTicket._id);
              handleCloseModal();
            }}
          >
            حذف
          </Button>
        </Modal.Footer>
      </Modal>
    </section>
  );
};

export default Tickets;
