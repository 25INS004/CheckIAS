import { Navigate, useLocation } from "react-router-dom";

const AdminStripper = () => {
  const location = useLocation();

  // Remove `/admin` prefix
  const newPath = location.pathname.replace(/^\/admin/, "") || "/";

  return <Navigate to={newPath + location.search} replace />;
};

export default AdminStripper;
