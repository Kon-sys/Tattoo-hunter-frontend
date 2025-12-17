"use client"

import React, { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import Header from "../../../components/layout/Header"
import Footer from "../../../components/layout/Footer";
import "./EmployeePage.css"

const EmployeeUploadPhoto = () => {
    const nav = useNavigate()
    const location = useLocation()

    const params = new URLSearchParams(location.search)
    const isRegisterFlow = params.get("flow") === "register"

    const [file, setFile] = useState(null)
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const onFileChange = (e) => {
        setFile(e.target.files[0] || null)
        setError("")
    }

    const onSubmit = async () => {
        if (!file) {
            setError("Пожалуйста, выберите фотографию")
            return
        }

        setLoading(true)
        setError("")

        try {
            const token = localStorage.getItem("token")

            const formData = new FormData()
            formData.append("file", file)

            const res = await fetch("http://localhost:8080/api/profile/employee/set-photo", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            })

            const text = await res.text()
            console.log("set-photo:", res.status, text)

            if (!res.ok) {
                let message = text
                try {
                    const json = JSON.parse(text)
                    if (json.message) message = json.message
                    else if (json.error) message = json.error
                } catch (_) {}

                setError(message || "Ошибка загрузки фото")
                setLoading(false)
                return
            }

            setLoading(false)
            if (isRegisterFlow) {
                nav("/")
            } else {
                nav("/profile")
            }
        } catch (e) {
            console.error(e)
            setError("Ошибка подключения к серверу")
            setLoading(false)
        }
    }

    return (
        <div className="emp-page">
            <div className="emp-bg" />
            <Header />

            <div className="emp-content">
                <section className="emp-card">
                    <h1 className="emp-title">UPLOAD PHOTO</h1>

                    <div className="emp-form">
                        <p style={{ color: "#fff", fontSize: 14, marginBottom: 8 }}>Загрузите вашу главную фотографию (портрет).</p>

                        <input type="file" accept="image/*" className="emp-input emp-input--file" onChange={onFileChange} />

                        {file && <p style={{ color: "#fff", fontSize: 12, marginTop: 6 }}>Выбран файл: {file.name}</p>}

                        {error && (
                            <div className="emp-error" style={{ marginTop: 8 }}>
                                {error}
                            </div>
                        )}

                        <button className="emp-btn" onClick={onSubmit} disabled={loading}>
                            {loading ? "Uploading..." : "Finish"}
                        </button>
                    </div>
                </section>
            </div>
            <Footer />
        </div>
    )
}

export default EmployeeUploadPhoto
