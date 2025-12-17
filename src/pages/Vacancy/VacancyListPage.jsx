"use client"

import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Header from "../../components/layout/Header"
import Footer from "../../components/layout/Footer.jsx"
import "./VacancyList.css"
import { apiFetch } from "../../api/apiClient"

const VacancyListPage = () => {
    const [vacancies, setVacancies] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const [filtersVisible, setFiltersVisible] = useState(false)
    const [companiesDropdownOpen, setCompaniesDropdownOpen] = useState(false)

    const [searchTitle, setSearchTitle] = useState("")
    const [income, setIncome] = useState("")
    const [busy, setBusy] = useState("")
    const [workSchedule, setWorkSchedule] = useState("")
    const [workType, setWorkType] = useState("")
    const [minExperience, setMinExperience] = useState("")
    const [maxExperience, setMaxExperience] = useState("")
    const [minWorkingHours, setMinWorkingHours] = useState("")
    const [maxWorkingHours, setMaxWorkingHours] = useState("")
    const [companies, setCompanies] = useState([])
    const [selectedCompanyIds, setSelectedCompanyIds] = useState([])

    let user = null
    try {
        const stored = localStorage.getItem("th_user")
        user = stored ? JSON.parse(stored) : null
    } catch (e) {
        console.error("Cannot parse th_user", e)
    }

    const role = user?.role
    const login = user?.login

    const loadInitialVacancies = async (currentRole, currentLogin) => {
        try {
            setLoading(true)
            setError("")

            let res
            if (currentRole === "ROLE_COMPANY") {
                res = await apiFetch("/api/vacancy/company", {
                    method: "GET",
                    headers: {
                        X_User_Login: currentLogin,
                        X_User_Role: currentRole,
                    },
                })
            } else {
                res = await apiFetch("/api/vacancies", {
                    method: "GET",
                })
            }

            if (!res.ok) {
                const text = await res.text()
                throw new Error(text || "Ошибка загрузки вакансий")
            }

            const data = await res.json()
            setVacancies(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error(err)
            setError("Не удалось загрузить вакансии")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        let cancelled = false

        const load = async () => {
            await loadInitialVacancies(role, login)
        }

        if (!cancelled) {
            load()
        }

        return () => {
            cancelled = true
        }
    }, [role, login])

    useEffect(() => {
        if (role !== "ROLE_EMPLOYEE") return

        let cancelled = false

        const loadCompanies = async () => {
            try {
                const res = await apiFetch("/api/vacancies/company", {
                    method: "GET",
                    headers: {
                        X_User_Role: role,
                    },
                })

                if (!res.ok) {
                    const text = await res.text()
                    console.error("Ошибка загрузки компаний:", text)
                    return
                }

                const data = await res.json()
                if (!cancelled) {
                    setCompanies(Array.isArray(data) ? data : [])
                }
            } catch (err) {
                console.error("Не удалось загрузить компании:", err)
            }
        }

        loadCompanies()

        return () => {
            cancelled = true
        }
    }, [role])

    const toggleCompany = (companyId) => {
        setSelectedCompanyIds((prev) =>
            prev.includes(companyId) ? prev.filter((id) => id !== companyId) : [...prev, companyId],
        )
    }

    const handleSearch = async (e) => {
        e.preventDefault()
        if (role !== "ROLE_EMPLOYEE") return

        if (!searchTitle.trim()) {
            await loadInitialVacancies(role, login)
            return
        }

        try {
            setLoading(true)
            setError("")

            const params = new URLSearchParams()
            params.append("title", searchTitle.trim())

            const res = await apiFetch(`/api/vacancies/search?${params.toString()}`, {
                method: "GET",
                headers: {
                    X_User_Role: role,
                },
            })

            if (!res.ok) {
                const text = await res.text()
                throw new Error(text || "Ошибка поиска вакансий")
            }

            const data = await res.json()
            setVacancies(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error(err)
            setError("Не удалось выполнить поиск")
        } finally {
            setLoading(false)
        }
    }

    const handleApplyFilters = async (e) => {
        e.preventDefault()
        if (role !== "ROLE_EMPLOYEE") return

        try {
            setLoading(true)
            setError("")

            const params = new URLSearchParams()

            if (income.trim()) params.append("income", income.trim())
            if (busy) params.append("busy", busy)
            if (workSchedule) params.append("workSchedule", workSchedule)
            if (workType) params.append("workType", workType)

            if (minExperience) params.append("minExperience", minExperience)
            if (maxExperience) params.append("maxExperience", maxExperience)
            if (minWorkingHours) params.append("minWorkingHours", minWorkingHours)
            if (maxWorkingHours) params.append("maxWorkingHours", maxWorkingHours)

            selectedCompanyIds.forEach((id) => {
                params.append("companyIds", id)
            })

            console.log("Selected companies:", selectedCompanyIds)
            console.log("Filter query string:", params.toString())

            const qs = params.toString()
            const url = qs ? `/api/vacancies/filter?${qs}` : "/api/vacancies"

            const options = url.startsWith("/api/vacancies/filter")
                ? {
                    method: "GET",
                    headers: {
                        X_User_Role: role,
                    },
                }
                : {
                    method: "GET",
                }

            const res = await apiFetch(url, options)

            if (!res.ok) {
                const text = await res.text()
                throw new Error(text || "Ошибка фильтрации вакансий")
            }

            const data = await res.json()
            setVacancies(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error(err)
            setError("Не удалось применить фильтры")
        } finally {
            setLoading(false)
        }
    }

    const handleResetFilters = async () => {
        setSearchTitle("")
        setIncome("")
        setBusy("")
        setWorkSchedule("")
        setWorkType("")
        setMinExperience("")
        setMaxExperience("")
        setMinWorkingHours("")
        setMaxWorkingHours("")
        setSelectedCompanyIds([])
        await loadInitialVacancies(role, login)
    }

    const titleText = role === "ROLE_COMPANY" ? "Ваши вакансии" : "Вакансии"

    const selectedCompaniesText =
        selectedCompanyIds.length === 0
            ? "Выберите компании"
            : selectedCompanyIds.length === 1
                ? companies.find((c) => c.id === selectedCompanyIds[0])?.name || "1 компания выбрана"
                : `Выбрано: ${selectedCompanyIds.length}`

    return (
        <div className="vacancy-page">
            <div className="vacancy-bg" />
            <Header />

            <div className="vacancy-content">
                <section className="vacancy-card">
                    <h1 className="vacancy-title">{titleText}</h1>

                    {role === "ROLE_EMPLOYEE" && (
                        <>
                            <button
                                type="button"
                                className={`filter-toggle-btn ${filtersVisible ? "open" : ""}`}
                                onClick={() => setFiltersVisible(!filtersVisible)}
                            >
                                <span>{filtersVisible ? "Скрыть фильтры" : "Показать фильтры"}</span>
                                <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M8 11L3 6h10l-5 5z" />
                                </svg>
                            </button>

                            <div className={`filter-container ${!filtersVisible ? "collapsed" : ""}`}>
                                <div className="filter-row filter-row--equal">
                                    <select className="filter-select" value={busy} onChange={(e) => setBusy(e.target.value)}>
                                        <option value="">Занятость: любая</option>
                                        <option value="FULL_EMPLOYMENT">Полная занятость</option>
                                        <option value="PRIVATE_EMPLOYMENT">Частичная занятость</option>
                                    </select>

                                    <select
                                        className="filter-select"
                                        value={workSchedule}
                                        onChange={(e) => setWorkSchedule(e.target.value)}
                                    >
                                        <option value="">График: любой</option>
                                        <option value="TWO_DAYS_ON_TWO_DAYS_OFF">2/2</option>
                                        <option value="FIVE_DAYS_ON_TWO_DAYS_OFF">5/2</option>
                                        <option value="SIX_DAYS_ON_ONE_DAY_OFF">6/1</option>
                                        <option value="SHIFT_DAY_NIGHT">Сменный (день/ночь)</option>
                                        <option value="FLEXIBLE">Гибкий</option>
                                    </select>

                                    <select className="filter-select" value={workType} onChange={(e) => setWorkType(e.target.value)}>
                                        <option value="">Формат: любой</option>
                                        <option value="AT_STUDIO">В студии</option>
                                        <option value="REMOTE">Удалённо</option>
                                        <option value="HYBRID">Гибрид</option>
                                    </select>
                                </div>

                                <div className="filter-row--split">
                                    <input
                                        type="text"
                                        className="filter-input"
                                        placeholder="Доход (например: от 2000 BYN)"
                                        value={income}
                                        onChange={(e) => setIncome(e.target.value)}
                                    />

                                    {companies.length > 0 && (
                                        <div className="companies-dropdown">
                                            <button
                                                type="button"
                                                className={`companies-dropdown-button ${companiesDropdownOpen ? "open" : ""}`}
                                                onClick={() => setCompaniesDropdownOpen(!companiesDropdownOpen)}
                                            >
                                                <span>{selectedCompaniesText}</span>
                                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                    <path d="M8 11L3 6h10l-5 5z" />
                                                </svg>
                                            </button>
                                            {companiesDropdownOpen && (
                                                <div className="companies-dropdown-menu">
                                                    {companies.map((c) => (
                                                        <div key={c.id} className="company-checkbox-item" onClick={() => toggleCompany(c.id)}>
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedCompanyIds.includes(c.id)}
                                                                onChange={() => toggleCompany(c.id)}
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                            <label onClick={(e) => e.stopPropagation()}>{c.name}</label>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="filter-row">
                                    <input
                                        type="number"
                                        className="filter-input"
                                        placeholder="Опыт, от (лет)"
                                        value={minExperience}
                                        onChange={(e) => setMinExperience(e.target.value)}
                                    />
                                    <input
                                        type="number"
                                        className="filter-input"
                                        placeholder="Опыт, до (лет)"
                                        value={maxExperience}
                                        onChange={(e) => setMaxExperience(e.target.value)}
                                    />
                                </div>

                                <div className="filter-row">
                                    <input
                                        type="number"
                                        className="filter-input"
                                        placeholder="Часы в день, от"
                                        value={minWorkingHours}
                                        onChange={(e) => setMinWorkingHours(e.target.value)}
                                    />
                                    <input
                                        type="number"
                                        className="filter-input"
                                        placeholder="Часы в день, до"
                                        value={maxWorkingHours}
                                        onChange={(e) => setMaxWorkingHours(e.target.value)}
                                    />
                                </div>

                                <form onSubmit={handleSearch} className="search-section">
                                    <input
                                        type="text"
                                        className="search-input"
                                        placeholder="Поиск по названию вакансии..."
                                        value={searchTitle}
                                        onChange={(e) => setSearchTitle(e.target.value)}
                                    />
                                    <button type="submit" className="btn btn-primary">
                                        Найти
                                    </button>
                                </form>

                                <div className="filter-actions">
                                    <button type="button" className="btn btn-primary" onClick={handleApplyFilters}>
                                        Применить фильтры
                                    </button>
                                    <button type="button" className="btn btn-secondary" onClick={handleResetFilters}>
                                        Сбросить
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {loading && <div className="loading">Загрузка...</div>}
                    {error && <div className="error">{error}</div>}

                    {!loading && !error && vacancies.length === 0 && <div className="empty">Вакансии не найдены</div>}

                    {!loading && !error && vacancies.length > 0 && (
                        <div className="vacancy-list">
                            {vacancies.map((v) => (
                                <Link key={v.id} to={`/vacancies/${v.id}`} className="vacancy-item">
                                    <h3 className="vacancy-item-title">{v.title}</h3>
                                    <div className="vacancy-item-info">
                                        {v.income && (
                                            <div className="vacancy-item-row">
                                                <span className="vacancy-item-label">Доход:</span>
                                                <span className="vacancy-item-value">{v.income}</span>
                                            </div>
                                        )}
                                        {v.companyName && (
                                            <div className="vacancy-item-row">
                                                <span className="vacancy-item-label">Компания:</span>
                                                <span className="vacancy-item-value">{v.companyName}</span>
                                            </div>
                                        )}
                                        {v.workType && (
                                            <div className="vacancy-item-row">
                                                <span className="vacancy-item-label">Формат:</span>
                                                <span className="vacancy-item-value">{v.workType}</span>
                                            </div>
                                        )}
                                        {v.busy && (
                                            <div className="vacancy-item-row">
                                                <span className="vacancy-item-label">Занятость:</span>
                                                <span className="vacancy-item-value">{v.busy}</span>
                                            </div>
                                        )}
                                        {v.workSchedule && (
                                            <div className="vacancy-item-row">
                                                <span className="vacancy-item-label">График:</span>
                                                <span className="vacancy-item-value">{v.workSchedule}</span>
                                            </div>
                                        )}
                                        {v.experience !== undefined && (
                                            <div className="vacancy-item-row">
                                                <span className="vacancy-item-label">Опыт:</span>
                                                <span className="vacancy-item-value">{v.experience} лет</span>
                                            </div>
                                        )}
                                        {v.workingHours !== undefined && (
                                            <div className="vacancy-item-row">
                                                <span className="vacancy-item-label">Часов/день:</span>
                                                <span className="vacancy-item-value">{v.workingHours}</span>
                                            </div>
                                        )}
                                    </div>
                                    {v.description && <div className="vacancy-item-description">{v.description}</div>}
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            </div>
            <Footer />
        </div>
    )
}

export default VacancyListPage
