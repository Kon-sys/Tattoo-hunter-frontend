import React from "react";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Просто покажем в консоли, что было до
        console.log("BEFORE LOGOUT:", {
            ...localStorage
        });

        // Самый простой и надежный вариант — очистить всё
        localStorage.clear();
        sessionStorage.clear();

        console.log("AFTER LOGOUT:", {
            ...localStorage
        });

        // Переходим на страницу логина
        navigate("/login");
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                backgroundColor: "#111",
                color: "#fff",
                padding: "16px",
            }}
        >
            <p>Profile page</p>
            <button
                onClick={handleLogout}
                style={{
                    marginTop: "20px",
                    padding: "10px 24px",
                    borderRadius: "999px",
                    border: "none",
                    cursor: "pointer",
                }}
            >
                Log out
            </button>
        </div>
    );
};

export default ProfilePage;
