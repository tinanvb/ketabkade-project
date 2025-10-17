"use client";

import { Carousel, Col } from "react-bootstrap";
import Image from "next/image";
import "@/app/styles/auth.css";
import NoAuthWrapper from "../components/ui/auth/NoAuthWrapper";

export default function Layout({ children }) {
  return (
    <NoAuthWrapper>
      <div className="d-flex align-items-stretch">
        <Col
          className="auth-right-box flex-column justify-content-between d-none d-lg-flex"
          lg={4}
        >
          <Carousel
            indicators
            controls={false}
            interval={4000}
            fade={false}
            className="mt-5 custom-carousel"
            style={{ marginTop: "100px" }}
          >
            <Carousel.Item>
              <div className="d-flex flex-column justify-content-center align-items-center">
                <Image
                  priority
                  src="/img1.svg"
                  alt="slider 1"
                  width={264}
                  height={230}
                />
                <div className="text-center">
                  تمام تلاش مان را میکنیم تا از
                  <div className="fs-5">خواندن و شنیدن کتاب ها</div>
                  لذت ببری.
                </div>
              </div>
            </Carousel.Item>
            <Carousel.Item>
              <div className="d-flex flex-column justify-content-center align-items-center">
                <Image
                  priority
                  src="/img2.svg"
                  width={264}
                  height={230}
                  alt="slider 1"
                />
                <div className="text-center mt-4">
                  میتوانی
                  <div className="fs-5">بیش از 1000 کتاب</div>
                  را قانونی دانلود کنی .
                </div>
              </div>
            </Carousel.Item>
          </Carousel>

          <div>
            <Image
              src="/Over-Back.svg"
              priority
              width={630}
              height={157}
              alt="slider-background"
              
            />
          </div>
        </Col>

        <Col
          className="auth-left-box py-5 d-flex justify-content-center align-items-center flex-column"
          xs
          lg={8}
        >
          {children}
        </Col>
      </div>
    </NoAuthWrapper>
  );
}
