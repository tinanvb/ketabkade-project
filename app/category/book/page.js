"use client";
import React, { useEffect, useState } from "react";
import Filters from "@/app/components/home/Filters";
import SortDropdown from "@/app/components/home/SortDropdown";
import { Container, Row, Col, Spinner, Card } from "react-bootstrap";

const CategoryPage = ({ params }) => {
  const { slug } = params;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  const [filters, setFilters] = useState({
    author: "",
    category: slug,
    minPrice: "",
    maxPrice: "",
  });

  const [sort, setSort] = useState("");

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.author) queryParams.append("author", filters.author);
      if (filters.category) queryParams.append("category", filters.category);
      if (filters.minPrice) queryParams.append("minPrice", filters.minPrice);
      if (filters.maxPrice) queryParams.append("maxPrice", filters.maxPrice);
      if (sort) queryParams.append("sort", sort);

      const res = await fetch(`/api/products?${queryParams.toString()}`);
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("خطا در دریافت محصولات:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("خطا در دریافت دسته‌بندی‌ها:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [filters, sort]);

  useEffect(() => {
    // اگر کاربر slug (دسته) جدید وارد کرد، فیلتر ریست شود
    setFilters((prev) => ({ ...prev, category: slug }));
  }, [slug]);

  return (
    <Container className="pt-5">
      <section style={{ paddingTop: "110px" }}></section>
      <h3 className="my-4 header-text">محصولات دسته‌بندی</h3>
      <Row className="mb-3">
        <Col md={3}>
          <Filters categories={categories} onFilterChange={setFilters} />

          <div className="d-flex justify-content-center mb-3 mt-5 p-3">
            <SortDropdown onSortChange={setSort} />
          </div>
        </Col>
        <Col md={9}>
          {loading ? (
            <div className="text-center">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : products.length === 0 ? (
            <p>هیچ محصولی یافت نشد.</p>
          ) : (
            <Row>
              {products.map((product) => (
                <Col xl={4} lg={5} md={6} key={product._id} className="mb-4">
                  <Card
                    className=""
                    style={{ width: "80%", marginRight: "35px" }}
                  >
                    <Card.Img
                      width={80}
                      height={250}
                      variant="top"
                      src={product.imageUrl}
                      alt={product.name}
                    />
                    <Card.Body>
                      <Card.Title>{product.name}</Card.Title>
                      <Card.Text
                        style={{
                          marginTop: "20px",
                        }}
                        className="text-author"
                      >
                        {product.author ? product.author : "\u00A0"}
                      </Card.Text>
                    </Card.Body>

                    <Card.Footer className="py-2" style={{ minHeight: "60px" }}>
                      {product.discountAmount > 0 ? (
                        <>
                          {/* قیمت نهایی */}
                          <strong className="text-danger me-2">
                            {product.finalPrice.toLocaleString()} تومان
                          </strong>

                          {/* قیمت اصلی */}
                          <del className="header-text me-2">
                            {product.price.toLocaleString()} تومان
                          </del>

                          {/* درصد تخفیف */}
                          <span className="badge bg-success ms-2">
                            %{product.discountPercent}
                          </span>
                        </>
                      ) : (
                        <strong className="header-text">
                          {product.price.toLocaleString()} تومان
                        </strong>
                      )}
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default CategoryPage;
