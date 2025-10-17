"use client";
import { FaShoppingCart, FaTrash } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContext";

const CartDropdown = ({
  isAdmin,
  isAdminPage,
  showAlert,
  cartDropdownOpen,
  setCartDropdownOpen,
}) => {
  const { cart, removeFromCart } = useCart();
  const router = useRouter();
  const totalItems = cart?.items?.length || 0;

  const toggleCartDropdown = (e) => {
    e.stopPropagation();
    if (!cart?.items || cart.items.length === 0) {
      router.push("/cart");
      setCartDropdownOpen(false);
      return;
    }
    setCartDropdownOpen((prev) => !prev);
  };

  const totalPrice =
    cart?.items?.reduce(
      (total, item) => total + (item.product?.price || 0),
      0
    ) || 0;
  const totalDiscountedPrice =
    cart?.items?.reduce(
      (total, item) => total + (item.product?.discountedPrice || 0),
      0
    ) || 0;
  const payableAmount =
    cart?.items?.length > 0
      ? totalPrice - totalDiscountedPrice - (cart?.discountPrice || 0)
      : 0;

  if (isAdmin || isAdminPage) return null;

  return (
    <section className="header-cart CartDropdown d-inline position-relative">
      <button
        className="position-relative ps-sm-3 header-cart-link"
        onClick={toggleCartDropdown}
      >
        <FaShoppingCart />
        {totalItems > 0 && <span className="total-badge">{totalItems}</span>}
      </button>
      {cartDropdownOpen && (
        <section className="header-cart-dropdown shadow-lg rounded-3">
          <section className="border-bottom d-flex justify-content-between p-2 align-items-center">
            <span className="text-muted">{totalItems} کالا</span>
          </section>
          <section className="header-cart-dropdown-body m-2">
            <table className="table table-sm align-middle mb-0">
              <thead className="text-muted small">
                <tr>
                  <th scope="col">کالا</th>
                  <th scope="col">قیمت</th>
                  <th scope="col" className="text-center">
                    حذف
                  </th>
                </tr>
              </thead>
              <tbody>
                {cart?.items?.map((item) => {
                  if (!item?.product) {
                    return (
                      <tr key={item._id || Math.random()}>
                        <td>در حال بارگذاری...</td>
                        <td>-</td>
                        <td className="text-center">
                          <FaTrash
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              removeFromCart(item.product?._id).catch(() => {
                                showAlert("خطا در حذف محصول", "danger");
                              });
                            }}
                          />
                        </td>
                      </tr>
                    );
                  }
                  const name = item.product.name || "محصول نامشخص";
                  const hasDiscount =
                    item.product.discountedPrice &&
                    item.product.discountedPrice < item.product.price;
                  const discountAmount = hasDiscount
                    ? item.product.price - item.product.discountedPrice
                    : 0;

                  return (
                    <tr key={item.product._id}>
                      <td>
                        <div className="d-flex align-items-center">
                          {item.product.imageUrl ? (
                            <Image
                              src={item.product.imageUrl}
                              alt={name}
                              width={40}
                              height={60}
                              className="rounded"
                              style={{ objectFit: "cover" }}
                            />
                          ) : (
                            <span>تصویر موجود نیست</span>
                          )}
                          <span className="ms-2">
                            {name.length > 10
                              ? name.slice(0, 10) + "..."
                              : name}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex flex-column g-1">
                          <del className="text-muted">
                            {(item.product?.price || 0).toLocaleString()}
                            تومان
                          </del>
                          {hasDiscount && (
                            <>
                              <span className="text-muted small">
                                ({discountAmount.toLocaleString()} تومان)
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="text-center">
                        <FaTrash
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            removeFromCart(item.product._id).catch(() => {
                              showAlert("خطا در حذف محصول", "danger");
                            });
                          }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
          <section className="header-cart-dropdown-footer px-3 d-flex justify-content-between align-items-center p-2 fw-bold">
            <span>مبلغ قابل پرداخت :</span>
            <span>{payableAmount.toLocaleString()} تومان</span>
          </section>
          <section className="cart-btn d-flex justify-content-end m-3">
            <Link
              className="bg-cart text-white text-decoration-none px-3 py-2 rounded-2"
              href="/cart"
              onClick={() => setCartDropdownOpen(false)}
            >
              مشاهده سبد خرید
            </Link>
          </section>
        </section>
      )}
    </section>
  );
};

export default CartDropdown;
