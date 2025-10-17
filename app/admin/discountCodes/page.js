"use client";
import { useEffect, useState } from "react";
import GeneralError from "@/app/components/ui/GeneralError";
import ConfirmDeleteModal from "@/app/components/ui/ConfirmDeleteModal";
import { Table, Modal, Button } from "react-bootstrap";
import Link from "next/link";
import {
  AiOutlineDelete,
  AiOutlineEdit,
  AiOutlinePercentage,
  AiOutlineEye,
} from "react-icons/ai";
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import GeneralLoading from "@/app/components/ui/GeneralLoading";
import TablePagination from "@/app/components/ui/TablePagination";

const DiscountCodes = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // مودال جزئیات
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState(null);

  // مودال حذف عمومی
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [discountToDelete, setDiscountToDelete] = useState(null);

  useEffect(() => {
    const fetchDiscount = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/discountCodes");
        if (!response.ok) throw new Error("مشکل در دریافت کدهای تخفیف");
        const data = await response.json();
        setDiscounts(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDiscount();
  }, []);

  // باز کردن مودال حذف
  const confirmDelete = (id) => {
    setDiscountToDelete(id);
    setShowDeleteModal(true);
  };

  // حذف کد تخفیف
  const handleDelete = async () => {
    if (!discountToDelete) return;
    try {
      const response = await fetch(`/api/discountCodes/${discountToDelete}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("مشکلی در حذف کد تخفیف پیش آمد");
      setDiscounts(discounts.filter((d) => d._id !== discountToDelete));
    } catch (err) {
      setError(err.message);
    } finally {
      setShowDeleteModal(false);
      setDiscountToDelete(null);
    }
  };

  const handleShowDetails = (discount) => {
    setSelectedDiscount(discount);
    setShowDetailsModal(true);
  };

  const handleCloseModal = () => {
    setSelectedDiscount(null);
    setShowDetailsModal(false);
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDiscounts = discounts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(discounts.length / itemsPerPage);

  return (
    <section className='admin-section'>
      <div className="admin-header">
        <h4>مدیریت کدهای تخفیف</h4>
        <Link href="discountCodes/add" className="btn-custom-add ">
          <AiOutlinePercentage />
          افزودن کد تخفیف
        </Link>
      </div>
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
            <thead className="custom-header">
              <tr className="text-center">
                <th>#</th>
                <th>کد تخفیف</th>
                <th>مقدار</th>
                <th>نوع</th>
                <th>تاریخ انقضا</th>
                <th>وضعیت</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {currentDiscounts.map((discount, index) => (
                <tr key={discount._id} className="text-center">
                  <td>{indexOfFirstItem + index + 1}</td>
                  <td>{discount.code}</td>
                  <td>
                    {discount.discountType === "percent"
                      ? `${discount.discountAmount}%`
                      : `${discount.discountAmount.toLocaleString()} تومان`}
                  </td>
                  <td>
                    {discount.discountType === "percent" ? "درصدی" : "نقدی"}
                  </td>
                  <td>
                    {discount.expiryDate
                      ? new DateObject({
                          date: discount.expiryDate,
                          calendar: persian,
                          locale: persian_fa,
                        }).format("YYYY/MM/DD")
                      : "-"}
                  </td>
                  <td>
                    {discount.status ? (
                      <div className="status-active">فعال</div>
                    ) : (
                      <div className="status-inactive">غیرفعال</div>
                    )}
                  </td>
                  <td>
                    <div className="btn-group-inline">
                      <button
                        onClick={() => handleShowDetails(discount)}
                        className="btn-custom-file"
                      >
                        <AiOutlineEye />
                      </button>

                      <Link
                        href={`/admin/discountCodes/edit/${discount._id}`}
                        className="btn-custom-edit"
                      >
                        <AiOutlineEdit />
                      </Link>
                      <button
                        onClick={() => confirmDelete(discount._id)}
                        className="btn-custom-delete"
                      >
                        <AiOutlineDelete />
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

      {/* مودال جزئیات */}
      <Modal show={showDetailsModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>جزئیات کد تخفیف</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDiscount ? (
            <table className="table table-bordered text-center">
              <tbody>
                <tr>
                  <th>کد</th>
                  <td>{selectedDiscount.code}</td>
                </tr>
                <tr>
                  <th>وضعیت</th>
                  <td>{selectedDiscount.status ? "فعال" : "غیرفعال"}</td>
                </tr>
                <tr>
                  <th>نوع</th>
                  <td>
                    {selectedDiscount.discountType === "percent"
                      ? "درصدی"
                      : "نقدی"}
                  </td>
                </tr>
                <tr>
                  <th>مقدار</th>
                  <td>
                    {selectedDiscount.discountType === "percent"
                      ? `${selectedDiscount.discountAmount}%`
                      : `${selectedDiscount.discountAmount.toLocaleString()} تومان`}
                  </td>
                </tr>
                <tr>
                  <th>تاریخ ایجاد</th>
                  <td>
                    {selectedDiscount.createdAt
                      ? new DateObject({
                          date: selectedDiscount.createdAt,
                          calendar: persian,
                          locale: persian_fa,
                        }).format("YYYY/MM/DD")
                      : "-"}
                  </td>
                </tr>
                <tr>
                  <th>تاریخ انقضا</th>
                  <td>
                    {selectedDiscount.expiryDate
                      ? new DateObject({
                          date: selectedDiscount.expiryDate,
                          calendar: persian,
                          locale: persian_fa,
                        }).format("YYYY/MM/DD")
                      : "-"}
                  </td>
                </tr>
                <tr>
                  <th>شناسه</th>
                  <td>{selectedDiscount._id}</td>
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

      {/* مودال حذف عمومی */}
      <ConfirmDeleteModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="تأیید حذف کد تخفیف"
        message="آیا از حذف این کد تخفیف مطمئن هستید؟"
      />
    </section>
  );
};

export default DiscountCodes;
