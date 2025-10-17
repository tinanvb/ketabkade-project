"use client";
import React, { useEffect, useState } from "react";
import { Alert, Table, Modal, Button } from "react-bootstrap";
import { AiOutlineDelete } from "react-icons/ai";
import GeneralError from "@/app/components/ui/GeneralError";
import GeneralLoading from "@/app/components/ui/GeneralLoading";
import ConfirmDeleteModal from "@/app/components/ui/ConfirmDeleteModal";
import TablePagination from "@/app/components/ui/TablePagination"; // کامپوننت صفحه‌بندی

// فرمت تاریخ به شمسی
const formatPersianDate = (date) =>
  new Date(date).toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // جزئیات
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // حذف
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // صفحه‌بندی
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // دریافت کاربران
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/users");
        if (!response.ok) throw new Error("مشکل در دریافت اطلاعات کاربران");
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const confirmDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    setError(null);
    setSuccessMessage("");
    try {
      const res = await fetch(`/api/users/${userToDelete._id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setUsers(users.filter((u) => u._id !== userToDelete._id));
      setSuccessMessage("کاربر با موفقیت حذف شد");
    } catch {
      setError("مشکلی در حذف کاربر پیش آمد");
    } finally {
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  const handleToggleRole = async (id) => {
    setError(null);
    setSuccessMessage("");
    try {
      const user = users.find((u) => u._id === id);
      if (!user) return;

      const newRole = user.role === "admin" ? "user" : "admin";

      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) throw new Error();

      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, role: newRole } : u))
      );
      setSuccessMessage("نقش کاربر با موفقیت تغییر کرد");
      setTimeout(() => setSuccessMessage(""), 2000);
    } catch {
      setError("مشکلی در بروزرسانی نقش کاربر پیش آمد");
    }
  };

  const handleShowDetails = (user) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setShowDetailsModal(false);
  };

  // صفحه‌بندی
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(users.length / itemsPerPage);

  return (
    <section className="admin-section">
      <div className="admin-header">
        <h4 className="my-4">مدیریت کاربران</h4>
      </div>

      {successMessage && (
        <Alert
          variant="success"
          dismissible
          onClose={() => setSuccessMessage("")}
        >
          {successMessage}
        </Alert>
      )}
      {error && <GeneralError error={error} />}

      {loading ? (
        <GeneralLoading />
      ) : (
        <>
          <Table
            striped
            bordered
            hover
            responsive
            className="align-middle custom-table"
          >
            <thead>
              <tr>
                <th>شناسه</th>
                <th>نام</th>
                <th>نام کاربری</th>
                <th>موبایل</th>
                <th>ایمیل</th>
                <th>نقش</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user, index) => (
                <tr key={user._id}>
                  <td>{indexOfFirstItem + index + 1}</td>
                  <td>{`${user.firstname} ${user.lastname}`}</td>
                  <td>{user.username}</td>
                  <td>{user.phoneNumber}</td>
                  <td>{user.email}</td>
                  <td>
                    <div
                      className={`rounded w-75 mx-auto text-center fw-bold ${
                        user.role === "admin" ? "text-purple" : "text-dark"
                      }`}
                    >
                      {user.role === "admin" ? "ادمین" : "کاربر عادی"}
                    </div>
                  </td>
                  <td>
                    <div className="btn-group-inline">
                      <button
                        className="btn-custom-file"
                        onClick={() => handleShowDetails(user)}
                      >
                        جزئیات
                      </button>
                      <button
                        className="btn-custom-edit"
                        onClick={() => handleToggleRole(user._id)}
                      >
                        {user.role === "admin"
                          ? "تبدیل به کاربر"
                          : "تبدیل به ادمین"}
                      </button>
                      <button
                        className="btn-custom-delete"
                        onClick={() => confirmDelete(user)}
                      >
                        <AiOutlineDelete /> حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Pagination */}
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      {/* مدال نمایش جزئیات */}
      <Modal show={showDetailsModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>جزئیات کاربر</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser ? (
            <table className="table table-bordered text-center">
              <tbody>
                <tr>
                  <th>نام</th>
                  <td>{`${selectedUser.firstname} ${selectedUser.lastname}`}</td>
                </tr>
                <tr>
                  <th>نام کاربری</th>
                  <td>{selectedUser.username}</td>
                </tr>
                <tr>
                  <th>موبایل</th>
                  <td>{selectedUser.phoneNumber}</td>
                </tr>
                <tr>
                  <th>ایمیل</th>
                  <td>{selectedUser.email}</td>
                </tr>
                <tr>
                  <th>تاریخ ثبت‌نام</th>
                  <td>{formatPersianDate(selectedUser.createdAt)}</td>
                </tr>
                <tr>
                  <th>نقش</th>
                  <td>
                    {selectedUser.role === "admin" ? "ادمین" : "کاربر عادی"}
                  </td>
                </tr>
                <tr>
                  <th>شناسه</th>
                  <td>{selectedUser._id}</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <p>اطلاعاتی برای نمایش وجود ندارد.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            بستن
          </Button>
        </Modal.Footer>
      </Modal>

      {/* مدال تایید حذف */}
      <ConfirmDeleteModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="تأیید حذف کاربر"
        message={
          userToDelete
            ? `آیا از حذف کاربر ${userToDelete.firstname} ${userToDelete.lastname} مطمئن هستید؟`
            : "آیا از حذف این کاربر مطمئن هستید؟"
        }
      />
    </section>
  );
};

export default Users;
