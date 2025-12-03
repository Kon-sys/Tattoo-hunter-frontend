import React from "react";
import EmployeeProfilePage from "./Employee/EmployeeProfilePage";
import Header from "../../components/layout/Header";
import "../Profile/Employee/EmployeePage.css";

const ProfilePage = () => {
    let user = null;
    try {
        const stored = localStorage.getItem("th_user");
        user = stored ? JSON.parse(stored) : null;
    } catch (e) {
        console.error("Cannot parse th_user", e);
    }

    const role = user?.role;

    if (role === "ROLE_EMPLOYEE") {
        return <EmployeeProfilePage />;
    }

    // заглушка для компании / админа
    return (
        <div className="emp-page">
            <div className="emp-bg" />
            <Header />
            <div className="emp-content">
                <section className="emp-card">
                    <h1 className="emp-title">PROFILE</h1>
                    <p className="emp-profile-text">
                        Профиль для этой роли пока не реализован.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default ProfilePage;
