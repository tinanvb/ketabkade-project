"use client";
import React, { useEffect, useState } from "react";
import Filters from "./Filters";
import SortDropdown from "./SortDropdown";
import { Container, Row, Col } from "react-bootstrap";

const ProductPageWrapper = ({
  fetchFunction,
  onFilterChange,
  onProductsChange,
  initialFilters = {},
  showCategory = true,
  showAuthor = true,
}) => {
  const [products, setProducts] = useState([]);
  const [tags, setTags] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [sortOrder, setSortOrder] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (!fetchFunction) return;
        let data = await fetchFunction(filters);

        // محاسبه قیمت نهایی هر محصول
        const productsWithFinalPrice = data.map((p) => ({
          ...p,
          finalPrice:
            typeof p.discountedPrice === "number" && p.discountedPrice > 0
              ? p.price - p.discountedPrice
              : p.price,
        }));

        let sortedProducts = [...productsWithFinalPrice];

        switch (sortOrder) {
          case "discount":
            sortedProducts = sortedProducts
              .filter(
                (p) =>
                  typeof p.discountedPrice === "number" &&
                  p.discountedPrice > 0 &&
                  p.discountedPrice < p.price
              )
              .sort((a, b) => {
                const discountA = a.discountedPrice / a.price;
                const discountB = b.discountedPrice / b.price;
                return discountB - discountA;
              });
            break;

          case "priceAsc":
            sortedProducts.sort((a, b) => a.finalPrice - b.finalPrice);
            break;

          case "priceDesc":
            sortedProducts.sort((a, b) => b.finalPrice - a.finalPrice);
            break;

          case "newest":
            sortedProducts.sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
            break;

          case "alphabet":
            sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;

          default:
            break;
        }

        setProducts(sortedProducts);
        if (onProductsChange) onProductsChange(sortedProducts);
      } catch (error) {
        console.error(error);
      }
    };

    fetchProducts();
  }, [filters, sortOrder]); // فقط stateهای primitive در dependency

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await fetch("/api/tags");
        const data = await res.json();

        // مرتب‌سازی بر اساس نام تگ
        data.sort((a, b) => a.name.localeCompare(b.name));
        setTags(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchTags();
  }, []);

  return (
    <Container>
      <Row className="mb-3">
        <Col>
          <div className="sticky-sidebar">
            <Filters
              tags={tags}
              onFilterChange={(newFilters) => {
                setFilters(newFilters);
                if (onFilterChange) onFilterChange(newFilters);
              }}
              showCategory={showCategory}
              showAuthor={showAuthor}
            />

            <div className="d-flex justify-content-center mb-md-3 mb-0 mt-3 p-4 p-md-5">
              <SortDropdown sortOrder={sortOrder} onSortChange={setSortOrder} />
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductPageWrapper;
