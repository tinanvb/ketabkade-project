import React from "react";

const Breadcrumb = ({ name, category }) => {
  return (
    <nav aria-label="breadcrumb">
      <ol className="breadcrumb">
        <li className="breadcrumb-item">{category?.name || "نامشخص"}</li>
        <li className="breadcrumb-item" aria-current="page">
          {name || "نامشخص"}
        </li>
      </ol>
    </nav>
  );
};

export default Breadcrumb;
