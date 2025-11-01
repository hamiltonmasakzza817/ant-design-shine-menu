import { useState } from 'react';
import { Layout, Menu, Switch, theme } from 'antd';
import type { MenuProps } from 'antd';
import {
  HomeOutlined,
  UserOutlined,
  SettingOutlined,
  AppstoreOutlined,
  FileTextOutlined,
  TeamOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BulbOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

const menuItems: MenuItem[] = [
  {
    key: '/',
    icon: <HomeOutlined />,
    label: '首页',
  },
  {
    key: '/dashboard',
    icon: <AppstoreOutlined />,
    label: '仪表盘',
    children: [
      {
        key: '/dashboard/analytics',
        label: '数据分析',
      },
      {
        key: '/dashboard/monitor',
        label: '系统监控',
      },
    ],
  },
  {
    key: '/users',
    icon: <UserOutlined />,
    label: '用户管理',
    children: [
      {
        key: '/users/list',
        label: '用户列表',
      },
      {
        key: '/users/roles',
        label: '角色管理',
      },
    ],
  },
  {
    key: '/team',
    icon: <TeamOutlined />,
    label: '团队协作',
  },
  {
    key: '/documents',
    icon: <FileTextOutlined />,
    label: '文档中心',
    children: [
      {
        key: '/documents/guides',
        label: '使用指南',
      },
      {
        key: '/documents/api',
        label: 'API 文档',
      },
    ],
  },
  {
    key: '/settings',
    icon: <SettingOutlined />,
    label: '系统设置',
  },
];

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    navigate(e.key);
  };

  const toggleTheme = (checked: boolean) => {
    setDarkMode(checked);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
        theme={darkMode ? 'dark' : 'light'}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: darkMode ? '#fff' : '#1890ff',
            fontSize: collapsed ? 20 : 24,
            fontWeight: 'bold',
            transition: 'all 0.3s',
          }}
        >
          {collapsed ? 'AD' : 'Ant Design'}
        </div>
        <Menu
          theme={darkMode ? 'dark' : 'light'}
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={['/dashboard', '/users', '/documents']}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <div
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: 20,
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <BulbOutlined style={{ fontSize: 18 }} />
            <Switch
              checked={darkMode}
              onChange={toggleTheme}
              checkedChildren="暗"
              unCheckedChildren="亮"
            />
          </div>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
