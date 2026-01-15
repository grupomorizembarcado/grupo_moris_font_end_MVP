import React from "react";
import "../../styles/Button.css";

export default function Button({ children, type = "button", onClick, disabled }) {
  return (
    <button className="button" type={type} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
