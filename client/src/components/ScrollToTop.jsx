import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Har page switch hone par screen automatically top par chali jayegi
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;