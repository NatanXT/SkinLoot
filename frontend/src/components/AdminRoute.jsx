import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

export default function AdminRoute() {
    const { user, isCheckingAuth } = useAuth();

    if (isCheckingAuth) return null; // Aguarda carregar

    // 1. Se não tá logado -> Login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // 2. Se tá logado mas NÃO é admin -> Redireciona para home ou 403
    // (Verifique se o backend manda 'ADMIN' ou 'ROLE_ADMIN')
    if (user.role !== 'ADMIN') {
        return <Navigate to="/" replace />;
    }

    // 3. É Admin -> Passa
    return <Outlet />;
};
