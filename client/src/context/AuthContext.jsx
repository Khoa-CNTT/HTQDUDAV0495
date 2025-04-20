import { createContext, useContext, useEffect, useState } from "react";
import { isAuthenticated } from "../utils/jwtUtils";

const AuthContext = createContext();

// Provider
export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);
  const logout = () => {
    localStorage.removeItem("token"); // hoặc cái key bạn dùng để lưu
    setIsLoggedIn(false); // Xóa trạng thái login trong context
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => useContext(AuthContext);
