import React from "react";

const ProductDetails = ({ name, category, product, author }) => {
  return (
    <section className="productDetail">
      <section className="mb-3">
        <section className="d-flex justify-content-between align-items-center">
          <h3 className="content-header-title-small">{name}</h3>
        </section>
      </section>
      <section>
        <p>
          نویسنده :
          <span className="text-productDetail">
            {product?.author || "نامشخص"}
          </span>
        </p>
        <p>
          دسته بندی :
          <span className="text-productDetail">
            {category?.name || "نامشخص"}
          </span>
        </p>

        <div className="d-flex align-items-center gap-2">
          <span>امتیاز : </span>
          {product.totalReviews > 0 ? (
            <>
              <span className="text-productDetail">
                {product.averageRating.toFixed(1)} از
              </span>
              <span className="small text-muted">
                ({product.totalReviews} نظر ثبت‌ شده)
              </span>
            </>
          ) : (
            <span className="text-muted">هنوز نظری ثبت نشده</span>
          )}
        </div>
      </section>
    </section>
  );
};

export default ProductDetails;
