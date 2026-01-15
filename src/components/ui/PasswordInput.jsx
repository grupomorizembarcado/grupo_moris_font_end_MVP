import React, { useState } from "react";
import Input from "./Input";
// import "../../styles/Input.css";

function EyeIcon({ open }) {
  return open ? "🙈" : "👁️";

}

export default function PasswordInput({
  label = "Senha",
  id = "password",
  placeholder = "Digite sua senha",
  value,
  onChange,
  name,
}) {
  const [show, setShow] = useState(false);

  return (
    <Input
      label={label}
      id={id}
      name={name}
      type={show ? "text" : "password"}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      rightIcon={<EyeIcon open={show} />}
      onRightIconClick={() => setShow((s) => !s)}
    />
  );
}
