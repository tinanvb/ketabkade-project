"use client";
import Image from "next/image";
import React from "react";
import RecentBooks from "./components/home/RecentBooks";
import CategoriesList from "./components/home/CategoriesList";
import ProductAdvantages from "./components/home/ProductAdvantages";
import AppDownloadSection from "./components/home/AppDownloadSection";
import AudioBooks from "./components/home/AudioBooks";
import DiscountedProducts from "./components/home/discountedProducts";

const Home = () => {
  return (
    <div>
      <section className="banner">
        <Image
          src="/banner.svg"
          alt="Banner"
          fill
          style={{ objectFit: "cover" }}
          priority
        />
      </section>
      <section className="container-xxl my-4">
        <CategoriesList />
      </section>
      <section className="container-xxl my-4">
        <RecentBooks />
      </section>
      <section className="container-xxl my-4">
        <AudioBooks />
      </section>
      <section className="container-xxl my-4">
        <DiscountedProducts />
      </section>
      <section className="container-xxl my-4">
        <ProductAdvantages />
      </section>
      <section className="container-xxl my-4">
        <AppDownloadSection />
      </section>
    </div>
  );
};

export default Home;











