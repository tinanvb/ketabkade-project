import React, { useState } from "react";
import "@/app/styles/TextInput.css";
import { Col } from "react-bootstrap";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function TextInput({
  label,
  type = "text",
  name,
  value,
  onChange,
  required = false,
  error,
  inputClassName = "",
  wrapperClassName = "",
  disabled = false,
}) {

  const [showPassword, setShowPassword] = useState(false);

  const isPasswordField = type === "password";
  const inputType = isPasswordField && showPassword ? "text" : type;


  return (
    <Col className={`${wrapperClassName}`}>
      <div className="form-group position-relative mt-3 styled-input">
        <input
          type={inputType}
          name={name}
          id={name}
          value={value}
          onChange={onChange}
          className={`form-control ${
            error ? "is-invalid" : ""
          } ${inputClassName}`}
          placeholder=" "
          required={required}
          autoComplete="off"
          disabled={disabled}
        />
        <label htmlFor={name}>{label}</label>

        {/* Eye Icon only for password fields */}
        {isPasswordField && (
          <span
            className="password-toggle-icon"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        )}

      </div>
      {error && <div className="invalid-feedback d-block">{error}</div>}
    </Col>
  );
}
