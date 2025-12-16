import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage/HomePage";
import LoginPage from "./pages/LoginRegister/LoginPage";
import RegisterPage from "./pages/LoginRegister/RegisterPage";
import About from "./pages/About";
import Contact from "./pages/Contact";
import ProfilePage from "./pages/Profile/ProfilePage";
import EmployeeBasic from "./pages/Profile/Employee/EmployeeBasic";
import EmployeeCategories from "./pages/Profile/Employee/EmployeeCategories";
import EmployeeContacts from "./pages/Profile/Employee/EmployeeContacts";
import EmployeeAdditional from "./pages/Profile/Employee/EmployeeAdditional";
import EmployeeUploadResume from "./pages/Profile/Employee/EmployeeUploadResume";
import EmployeeUploadPhoto from "./pages/Profile/Employee/EmployeeUploadPhoto";
import EmployeeProfilePage from "./pages/Profile/Employee/EmployeeProfilePage";
import EmployeeProfileEdit from "./pages/Profile/Employee/EmployeeProfileEdit";
import CompanyProfilePage from "./pages/Profile/Company/CompanyProfilePage";
import CompanyVacancyNewBasic from "./pages/Vacancy/CompanyVacancyNewBasic";
import CompanyVacancyAdditional from "./pages/Vacancy/CompanyVacancyAdditional";
import CompanyVacancyPhoto from "./pages/Vacancy/CompanyVacancyPhoto";
import VacancyListPage from "./pages/Vacancy/VacancyListPage";
import VacancyDetailsPage from "./pages/Vacancy/VacancyDetailsPage";
import CompanyVacancyEditBasic from "./pages/Vacancy/CompanyVacancyEditBasic";
import CompanyVacancyEditAdditional from "./pages/Vacancy/CompanyVacancyEditAdditional";
import CompanyVacancyEditPhoto from "./pages/Vacancy/CompanyVacancyEditPhoto";
import EmployeeResponsesPage from "./pages/Responses/EmployeeResponsesPage";
import CompanyResponsesPage from "./pages/Responses/CompanyResponsesPage";
import ChatListPage from "./pages/Chat/ChatListPage";
import ChatPage from "./pages/Chat/ChatPage";
import AdminAnalyticsPage from "./pages/Admin/AdminAnalyticsPage";

const App = () => {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />

            <Route path="/profile" element={<ProfilePage />} />
                <Route path="/profile/employee/basic" element={<EmployeeBasic />} />
                <Route path="/profile/employee/categories" element={<EmployeeCategories />} />
                <Route path="/profile/employee/contacts" element={<EmployeeContacts />} />
                <Route path="/profile/employee/additional" element={<EmployeeAdditional />} />
                <Route path="/profile/employee/upload-resume" element={<EmployeeUploadResume />} />
                <Route path="/profile/employee/upload-photo" element={<EmployeeUploadPhoto />} />
            <Route
                path="/profile/employee/view"
                element={<EmployeeProfilePage />}
            />
            <Route
                path="/profile/employee/edit"
                element={<EmployeeProfileEdit />}
            />
            <Route path="/profile/company" element={<CompanyProfilePage />} />

            {/* список и просмотр вакансий — через listing-service */}
            <Route path="/vacancies" element={<VacancyListPage />} />
            <Route path="/vacancies/:id" element={<VacancyDetailsPage />} />

            {/* создание вакансии — через vacancy-service */}
            <Route path="/company/vacancies/new" element={<CompanyVacancyNewBasic />} />
            <Route path="/company/vacancies/new/additional" element={<CompanyVacancyAdditional />} />
            <Route path="/company/vacancies/new/photo" element={<CompanyVacancyPhoto />} />

            <Route
                path="/company/vacancies/:id/edit/basic"
                element={<CompanyVacancyEditBasic />}
            />
            <Route
                path="/company/vacancies/:id/edit/additional"
                element={<CompanyVacancyEditAdditional />}
            />
            <Route
                path="/company/vacancies/:id/edit/photo"
                element={<CompanyVacancyEditPhoto />}
            />

            <Route path="/responses" element={<EmployeeResponsesPage />} />
            <Route path="/company/responses" element={<CompanyResponsesPage />} />

            <Route path="/chats" element={<ChatListPage />} />
            <Route path="/chats/:chatId" element={<ChatPage />} />
            <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
        </Routes>
    );
};

export default App;
