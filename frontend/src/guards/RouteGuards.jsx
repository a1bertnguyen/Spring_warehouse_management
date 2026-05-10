import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import ApiService from "../services/ApiService";
import { PATHS } from "../constants/paths";


export const ProtectedRoute = ({element: Component}) => {
    const location = useLocation();
    return ApiService.isAuthenticated() ? (
        Component
    ):(
        <Navigate to={PATHS.login} replace state={{from: location}}/>
    );
};

export const AdminRoute = ({element:Component}) => {
    const location = useLocation();
    if (!ApiService.isAuthenticated()) {
        return <Navigate to={PATHS.login} replace state={{from: location}}/>;
    }

    return ApiService.isAdmin() ? (
        Component
    ):(
        <Navigate to={PATHS.dashboard} replace />
    );
};

export const PublicRoute = ({element: Component}) => {
    return ApiService.isAuthenticated() ? (
        <Navigate to={PATHS.dashboard} replace />
    ) : (
        Component
    );
};
