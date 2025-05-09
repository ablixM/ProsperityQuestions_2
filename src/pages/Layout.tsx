import { Outlet } from "react-router-dom";
import LandingHeader from "../components/LandingHeader";

function Layout() {
  return (
    <>
      <LandingHeader />
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default Layout;
