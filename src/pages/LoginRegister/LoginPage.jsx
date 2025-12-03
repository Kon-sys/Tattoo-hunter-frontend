import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LoginPage.css";
import Header from "../../components/layout/Header";

const LoginPage = () => {
    const navigate = useNavigate();

    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("http://localhost:8080/api/auth/sign-in", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    login,      // если у тебя поле называется иначе (email/username) – переименуй
                    password,
                }),
            });

            if (!res.ok) {
                // 401, 400 и т.п.
                setError("Неверный логин или пароль");
                setLoading(false);
                return;
            }

            const data = await res.json();
            console.log("Auth response:", data);

            /**
             * ОЧЕНЬ ВАЖНО:
             * Тут я предполагаю, что контроллер возвращает JSON вида:
             * {
             *   "accessToken": "...",
             *   "refreshToken": "...",
             *   "role": "EMPLOYEE",
             *   "login": "user@example.com"
             * }
             *
             * Если поля называются иначе — просто поправь ключи ниже.
             */

            localStorage.setItem("token", data.token);
            if (data.refreshToken) {
                localStorage.setItem("refreshToken", data.refreshToken);
            }

            setLoading(false);

            // после успешного логина отправляем на профиль (можешь поменять на / или на роль-зависимый маршрут)
            navigate("/");
        } catch (err) {
            console.error(err);
            setError("Ошибка подключения к серверу");
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            {/* основной фон */}
            <div className="login-page__bg" />

            <Header/>

            <div className="login-page__content">
                {/* Левая карточка */}
                <section className="login-card">
                    <div className="login-card__header">
                        <h1 className="login-card__title">SIGN IN</h1>
                        <p className="login-card__subtitle">
                            РАДЫ ВИДЕТЬ ВАС СНОВА&nbsp;!
                        </p>
                    </div>

                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="login-field">
                            <input
                                type="text"
                                name="login"
                                placeholder="Login"
                                className="login-field__input"
                                value={login}
                                onChange={(e) => setLogin(e.target.value)}
                            />
                        </div>

                        <div className="login-field">
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                className="login-field__input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {error && (
                            <div className="login-error">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="login-form__submit"
                            disabled={loading}
                        >
                            {loading ? "Loading..." : "SIGN IN"}
                        </button>
                    </form>

                    <p className="login-card__bottom">
                        <span className="login-card__bottom-text">
                            Still not connected?
                        </span>{" "}
                        <Link to="/register" className="login-card__bottom-link">
                            Sign up
                        </Link>
                    </p>
                </section>
            </div>
        </div>
    );
};

export default LoginPage;
