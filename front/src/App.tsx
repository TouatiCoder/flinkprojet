import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from "./pages/AuthPages/SignIn";
// import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
// import UserProfiles from "./pages/UserProfiles";
// import Videos from "./pages/UiElements/Videos";
// import Images from "./pages/UiElements/Images";
// import Alerts from "./pages/UiElements/Alerts";
// import Badges from "./pages/UiElements/Badges";
// import Avatars from "./pages/UiElements/Avatars";
// import Buttons from "./pages/UiElements/Buttons";
// import LineChart from "./pages/Charts/LineChart";
// import BarChart from "./pages/Charts/BarChart";
// import Calendar from "./pages/Calendar";
// import BasicTables from "./pages/Tables/BasicTables";
// import FormElements from "./pages/Forms/FormElements";
// import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import Users from "./pages/Dashboard/Users";
import Publications from "./pages/Dashboard/Publications";
import Etablissements from "./pages/Dashboard/Etablissements";
import Test from "./pages/Dashboard/Test";
import { GuestRoute, ProtectedRoute } from "./middleware/authMiddleware";
import { useAuth } from "./context/AuthContext";
import Tags from "./pages/Dashboard/Tags";
import Role from "./pages/Dashboard/Role";
import Pays from "./pages/Location/Pays";
import Villes from "./pages/Location/Villes";
import Regions from "./pages/Location/Regions";
import Bonjour from "./pages/Dashboard/Bonjour";
import ForbiddenPage from "./pages/ForbiddenPage";
import Prospect from "./pages/Dashboard/Prospect";
import Equipe from "./pages/Dashboard/Equipe";
import Membres from "./pages/Dashboard/Membres";
import Payments from "./pages/Dashboard/Payments";
import WhatsappTemplates from "./pages/Dashboard/WhatsappTemplates";

export default function App() {
  const { isAuthenticated } = useAuth();
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route element={<AppLayout />}>
            <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
              <Route index path="/home" element={<Home />} />
              <Route index path="/prospect" element={<Prospect />} />
              <Route index path="/users" element={<Users />} />
              <Route index path="/etablissements" element={<Etablissements />} />
              <Route index path="/publications" element={<Publications />} />
              <Route index path="/tags" element={<Tags />} />
              <Route index path="/role" element={<Role />} />
              <Route index path="/pays" element={<Pays />} />
              <Route index path="/villes" element={<Villes />} />
              <Route index path="/regions" element={<Regions />} />
              <Route index path="/equipe" element={<Equipe />} />
              <Route index path="/membres" element={<Membres />} />
              <Route index path="/payments" element={<Payments/>} />
              <Route index path="/whatsapp/templates" element={<WhatsappTemplates />} />
              <Route index path="/" element={<Bonjour />} />
              <Route path="/403" element={<ForbiddenPage />} />
            </Route>



            <Route index path="/test" element={<Test />} />

            {/* Others Page */}
            {/* <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} /> */}

            {/* Forms */}
            {/* <Route path="/form-elements" element={<FormElements />} /> */}

            {/* Tables */}
            {/* <Route path="/basic-tables" element={<BasicTables />} /> */}

            {/* Ui Elements */}
            {/* <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} /> */}

            {/* Charts */}
            {/* <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} /> */}
          </Route>

          {/* Auth Layout */}
          {/* <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} /> */}
          <Route element={<GuestRoute isAuthenticated={isAuthenticated} />}>
            <Route path="/signin" element={<SignIn />} />
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
