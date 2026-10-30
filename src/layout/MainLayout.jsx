
import React from "react";
import { Outlet, useLocation } from "react-router-dom";

import NewFooter from "../components/footer/NewFooter";
import Navigation from "../components/navigation/Navigation";
import ScrollToTop from "../context/ScrollToTop";
import BottomMobileNav from "../components/navigation/BottomMobileNav";

const MainLayout = () => {
  const { pathname } = useLocation();

  const isLandingPage =
    pathname === "/" || pathname.startsWith("/lp/");

  return (
    <div>
      <ScrollToTop />

      {!isLandingPage && <Navigation />}

      <Outlet />

      {!isLandingPage && (
        <>
          <BottomMobileNav />
          <NewFooter />
        </>
      )}
    </div>
  );
};

export default MainLayout;
