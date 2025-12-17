import React, { useEffect, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import Header from "../../../components/layout/Header"
import Footer from "../../../components/layout/Footer";
import "../../Profile/Employee/EmployeePage.css"
import { apiFetch } from "../../../api/apiClient"

const CompanyProfilePage = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const { id } = useParams() // /profile/company/view/:id

    const isViewMode = !!id
    const companyId = id ? Number(id) : null

    // строго: редактирование только на /profile/company
    const isOwnEditRoute = location.pathname === "/profile/company"

    let user = null
    let storedProfile = null

    try {
        const storedUser = localStorage.getItem("th_user")
        user = storedUser ? JSON.parse(storedUser) : null

        const storedCompany = localStorage.getItem("company_profile")
        storedProfile = storedCompany ? JSON.parse(storedCompany) : null
    } catch (e) {
        console.error("Cannot parse localStorage", e)
    }

    const role = user?.role
    const login = user?.login

    const [name, setName] = useState(storedProfile?.name || "")
    const [city, setCity] = useState(storedProfile?.city || "")
    const [address, setAddress] = useState(storedProfile?.address || "")

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    // редактирование разрешаем только company и только в режиме "свой профиль"
    const [isEditMode, setIsEditMode] = useState(isOwnEditRoute)

    // ====== Загрузка компании в режиме просмотра по id ======
    useEffect(() => {
        let cancelled = false

        const loadCompany = async () => {
            if (!isViewMode || !companyId) return

            try {
                setLoading(true)
                setError("")
                setSuccess("")

                const res = await apiFetch(`/api/profile/employee/view/${companyId}`, { method: "GET" })

                if (!res.ok) {
                    const txt = await res.text()
                    throw new Error(txt || "Не удалось загрузить профиль компании")
                }

                const data = await res.json()
                if (cancelled) return

                setName(data.name || data.companyName || "")
                setCity(data.city || "")
                setAddress(data.address || "")

                setError("")
            } catch (e) {
                console.error(e)
                if (!cancelled) setError(e.message || "Failed to fetch")
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        loadCompany()

        return () => {
            cancelled = true
        }
    }, [isViewMode, companyId])

    // ====== Гварды ======
    if (!user) {
        return (
            <div className="emp-page">
                <div className="emp-bg" />
                <Header />
                <div className="emp-content">
                    <section className="emp-card emp-card--profile">
                        <h1 className="emp-title">COMPANY PROFILE</h1>
                        <p className="emp-profile-text">Для доступа нужно войти в систему.</p>
                    </section>
                </div>
            </div>
        )
    }

    // Просмотр по id разрешаем employee/company.
    // Редактирование своего профиля — только ROLE_COMPANY
    if (!isViewMode && role !== "ROLE_COMPANY") {
        return (
            <div className="emp-page">
                <div className="emp-bg" />
                <Header />
                <div className="emp-content">
                    <section className="emp-card emp-card--profile">
                        <h1 className="emp-title">COMPANY PROFILE</h1>
                        <p className="emp-profile-text">Только компания может редактировать свой профиль.</p>
                    </section>
                </div>
            </div>
        )
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setSuccess("")

        if (!name || !city || !address) {
            setError("Заполните все поля")
            return
        }

        setLoading(true)

        try {
            const formData = new FormData()
            formData.append("name", name)
            formData.append("city", city)
            formData.append("address", address)

            const res = await apiFetch("/api/profile/company", {
                method: "POST",
                headers: {
                    "X-User-Login": login,
                    "X-User-Role": role,
                },
                body: formData,
            })

            if (!res.ok) {
                const text = await res.text()
                throw new Error(text || "Ошибка при сохранении профиля компании")
            }

            const data = await res.json()

            setName(data.name || "")
            setCity(data.city || "")
            setAddress(data.address || "")

            localStorage.setItem("company_profile", JSON.stringify(data))

            setSuccess("Профиль компании успешно сохранён")

            if (isOwnEditRoute) {
                navigate("/")
            } else {
                setIsEditMode(false)
            }
        } catch (err) {
            console.error(err)
            setError(err.message || "Ошибка подключения к серверу")
        } finally {
            setLoading(false)
        }
    }

    const pageTitle = isViewMode ? "COMPANY" : "COMPANY PROFILE"

    return (
        <div className="emp-page">
            <div className="emp-bg" />
            <Header />

            <div className="emp-content">
                <section className="emp-card emp-card--profile">
                    <h1 className="emp-title">{pageTitle}</h1>

                    {loading && <div className="emp-profile-text">Загрузка...</div>}
                    {error && <div className="emp-error">{error}</div>}
                    {success && <div className="emp-profile-text" style={{ color: "#b9ffb9" }}>{success}</div>}

                    {/* ===== ПРОСМОТР (по id всегда только просмотр) ===== */}
                    {(!isEditMode || isViewMode) && (
                        <>
                            <div className="emp-profile-header">
                                <div className="emp-profile-avatar">{name ? name.charAt(0).toUpperCase() : "C"}</div>
                                <div className="emp-profile-main">
                                    <h2 className="emp-profile-subtitle">{name || "Название компании не указано"}</h2>
                                    <p className="emp-profile-text">{city || "Город не указан"}</p>
                                    <p className="emp-profile-text">{address || "Адрес не указан"}</p>
                                </div>
                            </div>

                            <div className="emp-profile-sections">
                                <div className="emp-profile-block">
                                    <h3 className="emp-profile-subtitle">Основная информация</h3>
                                    <div className="emp-profile-grid">
                                        <div>
                                            <div className="emp-label">Название компании</div>
                                            <div className="emp-value">{name || "—"}</div>
                                        </div>
                                        <div>
                                            <div className="emp-label">Город</div>
                                            <div className="emp-value">{city || "—"}</div>
                                        </div>
                                        <div>
                                            <div className="emp-label">Адрес</div>
                                            <div className="emp-value">{address || "—"}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* кнопка редактирования только для компании и только НЕ в режиме view/:id */}
                                {!isViewMode && role === "ROLE_COMPANY" && (
                                    <button
                                        type="button"
                                        className="emp-btn emp-btn--small"
                                        onClick={() => setIsEditMode(true)}
                                    >
                                        Редактировать профиль
                                    </button>
                                )}
                            </div>
                        </>
                    )}

                    {/* ===== РЕДАКТИРОВАНИЕ (только своя компания) ===== */}
                    {isEditMode && !isViewMode && (
                        <form className="emp-form" onSubmit={handleSubmit}>
                            <div className="emp-row">
                                <input
                                    type="text"
                                    className="emp-input"
                                    placeholder="Название компании"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            <div className="emp-row">
                                <input
                                    type="text"
                                    className="emp-input"
                                    placeholder="Город"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                />
                            </div>

                            <div className="emp-row">
                                <input
                                    type="text"
                                    className="emp-input"
                                    placeholder="Адрес"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                />
                            </div>

                            <button type="submit" className="emp-btn" disabled={loading}>
                                {loading ? "Сохранение..." : "Сохранить профиль"}
                            </button>
                        </form>
                    )}
                </section>
            </div>
            <Footer />
        </div>
    )
}

export default CompanyProfilePage
