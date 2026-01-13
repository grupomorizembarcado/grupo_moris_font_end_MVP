import React from "react";
import "../styles/Login.css";
import logo from "../assets/avatar.png";

function Login() {
    return (
        <div className="login-container">
            {/* Coluna esquerda */}
            <div className="login-left">
                <img src={logo} alt="FarmMon" className="login-logo" />

                <h1>Conecte-se</h1>
                <p>Faça login no seu painel de controle</p>

                <form className="login-form">
                    <label htmlFor="email">E-mail</label>
                    <input
                        id="email"
                        type="email"
                        placeholder="Digite seu e-mail"
                    />

                    <label htmlFor="password">Senha</label>
                    <input
                        id="password"
                        type="password"
                        placeholder="Digite sua senha"
                    />

                    <button type="submit">Conectar-se</button>
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
