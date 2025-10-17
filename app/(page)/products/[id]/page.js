import ProductDetails from "@/app/components/home/ProductDetails";
import RelatedProducts from "@/app/components/home/RelatedProducts";
import ProductComments from "@/app/components/home/ProductComment";
import Breadcrumb from "@/app/components/home/Breadcrumb";
import Image from "next/image";
import ProductCartInfo from "@/app/components/home/ProductCartInfo";
import AddToCartButton from "@/app/components/home/AddToCartButton";

async function getProduct(id) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/home/${id}`,
      { cache: "force-cache" } // سرور رندر میشه
    );

    if (!res.ok) {
      console.error("Fetch failed:", res.status);
      return null;
    }

    const data = await res.json();
    return data?.product || null;
  } catch (err) {
    console.error("Error fetching product:", err);
    return null;
  }
}

export default async function SingleProduct({ params }) {
  const { id } = params;
  const product = await getProduct(id);

  if (!product) {
    return (
      <main className="bg-singleProduct">
        <section className="container-xxl py-5">
          <h2 className="text-center text-danger">
            محصولی با این مشخصات پیدا نشد
          </h2>
        </section>
      </main>
    );
  }

  return (
    <section>
      <section className="breadcrumb">
        <Breadcrumb name={product?.name} category={product?.category} />
      </section>

      <section className="mt-4 container-xxl">
        <section className="row gy-4 align-items-start product-wrapper">
          {/* تصاویر */}
          <section className="col-12 col-md-6 col-lg-3 text-center">
            <Image
              src={product?.imageUrl}
              width={210}
              height={320}
              alt={product?.name || "تصویر محصول"}
              className="img-fluid rounded"
              priority
            />
          </section>

          {/* جزئیات محصول */}
          <section className="col-12 col-md-6 col-lg-5">
            <ProductDetails
              name={
                <span className="product-details-name">{product?.name}</span>
              }
              author={product?.author}
              category={product?.category}
              product={product}
            />
          </section>

          {/* قیمت و دکمه افزودن به سبد */}
          <section className="col-12 col-lg-4">
            <ProductCartInfo product={product} />
          </section>
        </section>

        {/* توضیحات */}
        {product.description?.trim().length > 0 && (
          <section className="mt-5">
            <h5 className="pt-3 ps-3">
              معرفی کتاب {product?.name || "نا مشخص"}
            </h5>
            <p className="text-description">
              <span>{product?.description}</span>
            </p>
          </section>
        )}

        {/* نظرات */}
        <section>
          <ProductComments productId={product?._id} />
        </section>

        {/* محصولات مرتبط */}
        <section>
          {product?.category?._id && (
            <RelatedProducts
              categoryId={product?.category._id}
              categoryName={product?.category?.name}
            />
          )}
        </section>
      </section>
    </section>
  );
}
