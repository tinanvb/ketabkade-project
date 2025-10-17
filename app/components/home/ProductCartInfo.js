"use client";

import React from "react";
import AddToCartButton from "./AddToCartButton";

const ProductCartInfo = ({ product }) => {
  const price = product?.price || 0;
  const discountedPrice = product?.discountedPrice || 0;
  const payableAmount = price - discountedPrice;

  return (
    <section className="bg-light-subtle rounded-4 cart-total-price p-3">
      <h5 className="text-center mb-3">الکترونیکی</h5>
      <section className="border-bottom mb-3"></section>

      <section className="d-flex justify-content-between align-items-center">
        <p className="text-muted text-cart">قیمت کالا</p>
        <p className="text-muted">{price.toLocaleString()} تومان</p>
      </section>

      <section className="d-flex justify-content-between align-items-center">
        <p className="text-muted text-cart">تخفیف کالا</p>
        <p className="text-danger fw-bolder">
          {discountedPrice.toLocaleString()} تومان
        </p>
      </section>

      <section className="border-bottom mb-3"></section>

      <section className="d-flex justify-content-between align-items-center">
        <p className="text-muted text-cart"> قیمت پرداخت</p>
        <p className="fw-bolder">
          {payableAmount <= 0
            ? "رایگان"
            : `${payableAmount.toLocaleString()} تومان`}
        </p>{" "}
      </section>

      {product?._id && (
        <AddToCartButton
          productId={product._id}
          productDetails={{
            name: product.name,
            price: product.price,
            discountedPrice: product.discountedPrice,
            imageUrl: product.imageUrl,
          }}
        />
      )}
    </section>
  );
};

export default ProductCartInfo;
