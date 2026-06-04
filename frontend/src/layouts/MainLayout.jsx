// Learning note: MainLayout gives protected pages the common app chrome:
// role-aware sidebar on the left and page content on the right.
import React from "react";
import Sidebar from "../components/navigation/Sidebar";

const MainLayout = ({children}) =>{
    return(
        <div className="layout">
            <Sidebar/>
            <div className="main-content">
                {children}
            </div>
        </div>
    );
}

export default MainLayout;
