import React from "react";
import "../../styles/Input.css";

export default function Input({
  label,
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  name,
  rightIcon,      
  onRightIconClick,
}) {
  return (
    <div className="input-field">
      {label && <label className="input-label" htmlFor={id}>{label}</label>}

      <div className="input-wrapper">
        <input
          className="input"
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
        {rightIcon && (
          <button type="button" className="input-icon-btn" onClick={onRightIconClick}>
            {rightIcon}
          </button>
        )}
      </div>
    </div>
  );
}
