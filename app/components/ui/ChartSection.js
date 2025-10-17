"use client";
import React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
const persianMonths = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];
const ChartSection = ({ monthlyUserCounts, monthlyBookCounts, payments }) => {
  // شمارش وضعیت سفارش‌ها
  const getOrdersStatusCounts = (list) => {
    const statusMap = {
      completed: 0,
      pending: 0,
      cancelled: 0,
    };
    list.forEach((p) => {
      if (statusMap[p.status] !== undefined) {
        statusMap[p.status]++;
      }
    });
    return statusMap;
  };

  const statusCounts = getOrdersStatusCounts(payments || []);

  // چارت کاربران
  const usersChartOptions = {
    chart: {
      spacingBottom: -10,
    },
    title: { text: "کاربران جدید ماهانه" },
    xAxis: {
      categories: persianMonths,
      lineWidth: 1,
      tickLength: 5,
      labels: {
        y: 20,
        align: "center",
      },
    },
    yAxis: { title: { text: "تعداد کاربران" } },
    series: [{ name: "کاربران", data: monthlyUserCounts, color: "#c7a3ff" }],
    credits: { enabled: false },
    legend: { enabled: false },
    tooltip: {
      useHTML: true,
      className: "custom-tooltip",
    },
  };

  // چارت سفارش‌ها
  const ordersChartOptions = {
    chart: { type: "column" },
    title: { text: "وضعیت سفارش‌ها" },
    xAxis: {
      categories: ["انجام‌شده", "در انتظار", "لغوشده"],
    },
    yAxis: { title: { text: "تعداد سفارش‌ها" } },
    series: [
      {
        name: "سفارش‌ها",
        data: [
          statusCounts.completed,
          statusCounts.pending,
          statusCounts.cancelled,
        ],
        color: "#c7a3ff",
      },
    ],
    legend: { enabled: false },
    credits: { enabled: false },
    tooltip: {
      useHTML: true,
      className: "custom-tooltip",
    },
  };

  // چارت کتاب‌ها
  const areaChartOptions = {
    chart: { type: "areaspline", zoomType: "x" },
    title: { text: "تعداد کتاب اضافه شده در ماه" },
    xAxis: { categories: persianMonths },
    yAxis: { title: { text: "تعداد کتاب‌ها" } },
    series: [{ name: "کتاب‌ها", data: monthlyBookCounts, color: "#c7a3ff" }],
    credits: { enabled: false },
    exporting: { enabled: false },
    legend: { enabled: false },

    tooltip: {
      useHTML: true,
      className: "custom-tooltip",
    },
  };

  return (
    <>
      <div className="row mb-4">
        <div className="col-md-6">
          <HighchartsReact
            highcharts={Highcharts}
            options={usersChartOptions}
          />
        </div>
        <div className="col-md-6">
          <HighchartsReact
            highcharts={Highcharts}
            options={ordersChartOptions}
          />
        </div>
      </div>
      <div className="row mb-4">
        <div className="col-md-12">
          <HighchartsReact highcharts={Highcharts} options={areaChartOptions} />
        </div>
      </div>
    </>
  );
};

export default ChartSection;
