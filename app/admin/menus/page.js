"use client";
import GeneralError from "@/app/components/ui/GeneralError";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import { AiOutlineDelete, AiOutlineEdit, AiOutlinePlus } from "react-icons/ai";
import * as FaIcons from "react-icons/fa";
import ConfirmDeleteModal from "@/app/components/ui/ConfirmDeleteModal";
import GeneralLoading from "@/app/components/ui/GeneralLoading";
import TablePagination from "@/app/components/ui/TablePagination";

const Menus = () => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [menus, setMenus] = useState([]);
  const [hasFetchOnce, setHasFetchOnce] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const res = await fetch("/api/menus");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setMenus(data);
            setError("");
          } else {
            setError("داده‌های دریافتی نامعتبر است.");
          }
        } else {
          setError("در دریافت اطلاعات مشکلی رخ داد.");
        }
      } catch (err) {
        console.error("خطا در گرفتن منوها", err);
        setError("در دریافت اطلاعات مشکلی رخ داد.");
      } finally {
        setLoading(false);
        setHasFetchOnce(true);
      }
    };
    fetchMenus();
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/menus/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSuccess("منو با موفقیت حذف شد");
        setError("");
        setMenus((prev) => prev.filter((menu) => menu._id !== id));
      } else {
        const data = await res.json();
        setError(data?.error || "خطایی در حذف منو پیش آمد");
      }
    } catch (err) {
      setError("مشکلی در حذف منو پیش آمد");
      setSuccess("");
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (menu) => {
    setSelectedMenu(menu);
    setShowDeleteModal(true);
  };

  const handleCloseModal = () => {
    setSelectedMenu(null);
    setShowDeleteModal(false);
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMenus = menus.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(menus.length / itemsPerPage);

  return (
    <section className='admin-section'>
      <div className="admin-header">
        <h4>مدیریت منو ها</h4>
        <Link href="menus/add" className="btn-custom-add">
          <AiOutlinePlus />
          افزودن
        </Link>
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <GeneralError error={error} />}
      {loading && !hasFetchOnce ? (
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
                <th>شناسه</th>
                <th className="text-center">آیکون</th>
                <th className="text-center">عنوان منو</th>
                <th className="text-center">آدرس لینک</th>
                <th className="text-center">نوع لینک</th>
                <th className="text-center">ترتیب نمایش</th>
                <th className="text-center">منوی والد</th>
                <th className="text-center">وضعیت</th>
                <th className="text-center">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {hasFetchOnce && menus.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center text-muted py-4">
                    هیچ منویی وجود ندارد.
                  </td>
                </tr>
              ) : (
                currentMenus.map((menu, index) => (
                  <tr key={menu._id} className="text-center">
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td>
                      {(() => {
                        const Icon = FaIcons[menu.icon];
                        return Icon ? <Icon size={20} /> : <span>—</span>;
                      })()}
                    </td>
                    <td>{menu.title}</td>
                    <td>
                      <a href={menu.url} target="_blank" rel="noopener noreferrer" dir="ltr">
                        {menu.url}
                      </a>
                    </td>
                    <td>{menu.type === "internal" ? "داخلی" : menu.type === "external" ? "خارجی" : "داینامیک"}</td>
                    <td>{menu.order}</td>
                    <td>{menu.parent?.title || "-"}</td>
                    <td>{menu.isActive ? <div className="status-active">فعال</div> : <div className="status-inactive">غیرفعال</div>}</td>
                    <td>
                      <div className="btn-group-inline text-center">
                        <Link href={`/admin/menus/edit/${menu._id}`} className="btn-custom-edit">
                          <AiOutlineEdit /> ویرایش
                        </Link>
                        <button onClick={() => handleShowModal(menu)} className="btn-custom-delete">
                          <AiOutlineDelete /> حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
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

      {/* ConfirmDeleteModal */}
      <ConfirmDeleteModal
        show={showDeleteModal}
        onClose={handleCloseModal}
        onConfirm={async () => {
          await handleDelete(selectedMenu._id);
          handleCloseModal();
        }}
        title="تأیید حذف منو"
        message={
          selectedMenu ? (
            <>
              آیا مطمئن هستید که منوی <strong className="text-danger">{selectedMenu.title}</strong> را حذف کنید؟
            </>
          ) : null
        }
      />
    </section>
  );
};

export default Menus;
