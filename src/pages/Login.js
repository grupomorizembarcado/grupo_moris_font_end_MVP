import React, { useState } from "react";
import "../styles/Login.css";
import { useNavigate } from "react-router-dom";
import logo from "../assets/avatar.png";
import Input from "../components/ui/Input";
import PasswordInput from "../components/ui/PasswordInput";
import Button from "../components/ui/Button";


function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({ email: "", password: "" });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate(); 
    
    const validateForm = () => {
        let valid = true;
        const errors = { email: "", password: "" };

        if (!email) {
            errors.email = "E-mail é obrigatório.";
            valid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            errors.email = "Por favor, insira um e-mail válido.";
            valid = false;
        }

        if (!password) {
            errors.password = "Senha é obrigatória.";
            valid = false;
        }

        setErrors(errors);
        return valid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);


        setTimeout(() => {
            setIsLoading(false);
            console.log({ email, password });
            setEmail("");
            setPassword("");

            navigate("/dashboard");
        }, 2000);
    };

    return (
        <div className="login-container">
            <div className="login-left">
                <img src={logo} alt="FarmMon" className="login-logo" />

                <h1>Conecte-se</h1>
                <p>Faça login no seu painel de controle</p>

                <form className="login-form" onSubmit={handleSubmit}>
                    <Input
                        label="E-mail"
                        id="email"
                        type="email"
                        placeholder="Digite seu e-mail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={errors.email}
                    />
                    <PasswordInput
                        label="Senha"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={errors.password}
                    />
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Conectando..." : "Conectar-se"}
                    </Button>
                </form>
            </div>

            <div className="login-right">
                <div className="login-illustration" />
                <div className="login-illustration-bottom" />
            </div>
        </div>
    );
}

export default Login;
