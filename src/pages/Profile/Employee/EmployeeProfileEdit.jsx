import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/layout/Header";
import "./EmployeePage.css";

const EmployeeProfileEdit = () => {
    const navigate = useNavigate();

    return (
        <div className="emp-page">
            <div className="emp-bg" />
            <Header />

            <div className="emp-content">
                <section className="emp-card emp-card--profile">
                    <h1 className="emp-title">EDIT PROFILE</h1>

                    <p className="emp-profile-text">
                        Выберите раздел профиля, который хотите изменить.
                    </p>

                    <div className="emp-edit-grid">
                        <button
                            className="emp-btn emp-btn--full"
                            onClick={() => navigate("/profile/employee/basic")}
                        >
                            Basic info
                        </button>
                        <button
                            className="emp-btn emp-btn--full"
                            onClick={() =>
                                navigate("/profile/employee/categories")
                            }
                        >
                            Work categories
                        </button>
                        <button
                            className="emp-btn emp-btn--full"
                            onClick={() =>
                                navigate("/profile/employee/contacts")
                            }
                        >
                            Contacts
                        </button>
                        <button
                            className="emp-btn emp-btn--full"
                            onClick={() =>
                                navigate("/profile/employee/additional")
                            }
                        >
                            Additional info
                        </button>
                        <button
                            className="emp-btn emp-btn--full"
                            onClick={() =>
                                navigate("/profile/employee/upload-resume")
                            }
                        >
                            Upload resume
                        </button>
                        <button
                            className="emp-btn emp-btn--full"
                            onClick={() =>
                                navigate("/profile/employee/upload-photo")
                            }
                        >
                            Upload photo
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default EmployeeProfileEdit;
