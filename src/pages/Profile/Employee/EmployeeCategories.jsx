"use client"

import React, { useState } from "react"
import "./EmployeePage.css"
import Header from "../../../components/layout/Header"
import Footer from "../../../components/layout/Footer";
import { WORK_CATEGORIES } from "../../../constants/workCategories"
import { useNavigate, useLocation } from "react-router-dom"
import { apiFetch } from "../../../api/apiClient"

const EmployeeCategories = () => {
    const nav = useNavigate()
    const location = useLocation()

    const params = new URLSearchParams(location.search)
    const isRegisterFlow = params.get("flow") === "register"

    const [selected, setSelected] = useState([])
    const [error, setError] = useState("")

    const toggle = (cat) => {
        setSelected((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]))
    }

    const save = async () => {
        if (selected.length === 0) {
            setError("Выберите хотя бы одну категорию")
            return
        }

        try {
            const res = await apiFetch("/api/profile/employee/set-work-categories", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ workCategories: selected }),
            })

            const text = await res.text()
            console.log("set-work-categories:", res.status, text)

            if (!res.ok) {
                setError(text || "Ошибка сохранения категорий")
                return
            }

            if (isRegisterFlow) {
                nav("/profile/employee/contacts?flow=register")
            } else {
                nav("/profile")
            }
        } catch (e) {
            console.error(e)
            setError("Ошибка подключения к серверу")
        }
    }

    return (
        <div className="emp-page">
            <div className="emp-bg" />
            <Header />

            <div className="emp-content">
                <section className="emp-card emp-card--with-footer">
                    <h1 className="emp-title">CATEGORIES</h1>

                    <div className="emp-grid emp-grid--scroll">
                        {WORK_CATEGORIES.map((cat) => (
                            <div
                                key={cat}
                                className={"emp-tile" + (selected.includes(cat) ? " emp-tile--active" : "")}
                                onClick={() => toggle(cat)}
                            >
                                {cat.replaceAll("_", " ")}
                            </div>
                        ))}
                    </div>

                    {error && <div className="emp-error">{error}</div>}

                    <div className="emp-actions">
                        <button className="emp-btn" onClick={save}>
                            Continue
                        </button>
                    </div>
                </section>
            </div>
            <Footer />
        </div>
    )
}

export default EmployeeCategories
