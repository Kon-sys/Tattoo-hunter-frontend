import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import authBg from "../../assets/auth-bg.jpg";

const API_BASE_URL = "http://localhost:8080";

const RegisterPage = () => {
    const navigate = useNavigate();

    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [role, setRole] = useState("EMPLOYEE"); // EMPLOYEE или COMPANY
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMsg("");

        if (password !== confirm) {
            setError("Пароли не совпадают");
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/sign-up`, {
                login,
                password,
                role,
            });

            const { accessToken, refreshToken, role: respRole } = res.data || {};

            if (accessToken) {
                localStorage.setItem("th_accessToken", accessToken);
            }
            if (refreshToken) {
                localStorage.setItem("th_refreshToken", refreshToken);
            }
            localStorage.setItem(
                "th_user",
                JSON.stringify({
                    login,
                    role: respRole || role,
                })
            );

            setSuccessMsg("Аккаунт создан! Перенаправляем...");
            setTimeout(() => navigate("/"), 800);
        } catch (err) {
            console.error(err);
            if (
                err.response &&
                err.response.status === 400 &&
                typeof err.response.data === "string" &&
                err.response.data.includes("already exists")
            ) {
                setError("Пользователь с таким логином уже существует");
            } else {
                setError("Не удалось зарегистрировать. Попробуйте позже.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-black">
            <img
                src={authBg}
                alt="Tattoo background"
                className="absolute inset-0 w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-black/40" />

            <div className="relative z-10 flex min-h-screen items-center justify-center px-8">
                <div className="grid w-full max-w-6xl grid-cols-1 lg:grid-cols-[420px,1fr] gap-12">
                    {/* левая карточка регистрации */}
                    <div className="bg-white/80 backdrop-blur-md rounded-[32px] px-12 py-10 shadow-2xl">
                        <h1 className="text-[40px] leading-tight font-extrabold tracking-wide text-[#4b0f10]">
                            SIGN UP
                        </h1>
                        <p className="mt-1 text-sm uppercase tracking-[0.16em] text-[#4b0f10]">
                            создайте аккаунт в tattoo hunter
                        </p>

                        {error && (
                            <div className="mt-4 rounded-xl bg-[#4b0f10]/10 px-4 py-3 text-sm text-[#4b0f10]">
                                {error}
                            </div>
                        )}
                        {successMsg && (
                            <div className="mt-4 rounded-xl bg-emerald-600/10 px-4 py-3 text-sm text-emerald-200">
                                {successMsg}
                            </div>
                        )}

                        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                            {/* Login */}
                            <div>
                                <label className="block text-xs font-medium tracking-wide text-[#4b0f10] mb-2">
                                    Login
                                </label>
                                <div className="bg-[#c5c5c5] rounded-[26px] px-6 py-3">
                                    <input
                                        type="text"
                                        value={login}
                                        onChange={(e) => setLogin(e.target.value)}
                                        className="w-full bg-transparent outline-none text-[15px] text-[#3a3a3a] placeholder:text-[#5e5e5e]"
                                        placeholder="Придумайте логин"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-xs font-medium tracking-wide text-[#4b0f10] mb-2">
                                    Password
                                </label>
                                <div className="bg-[#c5c5c5] rounded-[26px] px-6 py-3">
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-transparent outline-none text-[15px] text-[#3a3a3a] placeholder:text-[#5e5e5e]"
                                        placeholder="Придумайте пароль"
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            {/* Confirm */}
                            <div>
                                <label className="block text-xs font-medium tracking-wide text-[#4b0f10] mb-2">
                                    Confirm password
                                </label>
                                <div className="bg-[#c5c5c5] rounded-[26px] px-6 py-3">
                                    <input
                                        type="password"
                                        value={confirm}
                                        onChange={(e) => setConfirm(e.target.value)}
                                        className="w-full bg-transparent outline-none text-[15px] text-[#3a3a3a] placeholder:text-[#5e5e5e]"
                                        placeholder="Повторите пароль"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Role */}
                            <div>
                <span className="block text-xs font-medium tracking-wide text-[#4b0f10] mb-2">
                  Role
                </span>
                                <div className="flex gap-4 text-[13px] text-[#4b0f10]">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="role"
                                            value="EMPLOYEE"
                                            checked={role === "EMPLOYEE"}
                                            onChange={(e) => setRole(e.target.value)}
                                        />
                                        <span>Employee (соискатель)</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="role"
                                            value="COMPANY"
                                            checked={role === "COMPANY"}
                                            onChange={(e) => setRole(e.target.value)}
                                        />
                                        <span>Company (студия)</span>
                                    </label>
                                </div>
                            </div>

                            {/* кнопка */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="mt-2 w-full rounded-[26px] bg-[#4c1010] py-3 text-center text-lg font-semibold text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] hover:bg-[#5a1515] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {loading ? "Signing up..." : "SIGN UP"}
                            </button>
                        </form>

                        <p className="mt-5 text-center text-[13px] text-white/80">
                            <span>Already have an account? </span>
                            <Link
                                to="/login"
                                className="text-[#762424] hover:underline"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>

                    {/* правая часть — можно оставить тот же блок с текстом */}
                    <div className="relative hidden lg:flex items-center justify-center">
                        <div className="relative">
                            <div className="absolute -top-32 -left-10 h-64 w-[140%] bg-[#64080880] rounded-[8px]" />
                            <div className="relative text-white text-[56px] font-extrabold tracking-[0.08em]">
                                TATTOO HUNTER
                            </div>
                            <div className="absolute top-6 left-4 text-transparent text-[56px] font-extrabold tracking-[0.08em] [-webkit-text-stroke:3px_#670f0f80] pointer-events-none select-none">
                                TATTOO HUNTER
                            </div>
                            <div className="absolute top-12 left-8 text-transparent text-[56px] font-extrabold tracking-[0.08em] [-webkit-text-stroke:4px_#670f0f66] pointer-events-none select-none">
                                TATTOO HUNTER
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
