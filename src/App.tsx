import { ConfigProvider, theme } from "antd";
import zhCN from "antd/locale/zh_CN";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/MainLayout";
import Home from "./pages/Home";
import DashboardAnalytics from "./pages/DashboardAnalytics";
import DashboardMonitor from "./pages/DashboardMonitor";
import UsersList from "./pages/UsersList";
import UsersRoles from "./pages/UsersRoles";
import Team from "./pages/Team";
import DocumentsGuides from "./pages/DocumentsGuides";
import DocumentsApi from "./pages/DocumentsApi";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: "#1890ff",
          borderRadius: 6,
        },
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="dashboard/analytics" element={<DashboardAnalytics />} />
            <Route path="dashboard/monitor" element={<DashboardMonitor />} />
            <Route path="users/list" element={<UsersList />} />
            <Route path="users/roles" element={<UsersRoles />} />
            <Route path="team" element={<Team />} />
            <Route path="documents/guides" element={<DocumentsGuides />} />
            <Route path="documents/api" element={<DocumentsApi />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  </QueryClientProvider>
);

export default App;
