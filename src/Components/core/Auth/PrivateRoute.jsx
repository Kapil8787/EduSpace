import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({children}) => {
    const { token } = useSelector((state) => state.auth);
    const { user } = useSelector((state) => state.profile);

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (user?.accountType === "Instructor" && user?.approved === false) {
        return <Navigate to="/pending-approval" replace />;
    }

    if (user?.active === false) {
        return <Navigate to="/signup" replace />;
    }

    return children;
}

export default PrivateRoute
