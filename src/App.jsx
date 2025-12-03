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

const App = () => {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            {/* заглушки для будущих роутов */}
            <Route path="/company/vacancies/new" element={<div>New vacancy</div>} />
            <Route path="/company/vacancies" element={<div>Your vacancies</div>} />
            <Route path="/company/employees" element={<div>All workers</div>} />
            <Route path="/vacancies" element={<div>Vacancies list</div>} />
            <Route path="/employee/responses" element={<div>Your responses</div>} />
            <Route path="/chat" element={<div>Chat page</div>} />
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
        </Routes>
    );
};

export default App;
