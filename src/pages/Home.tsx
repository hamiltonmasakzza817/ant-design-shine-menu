import { Card, Row, Col, Statistic } from 'antd';
import { UserOutlined, TeamOutlined, FileTextOutlined, SettingOutlined } from '@ant-design/icons';

const Home = () => {
  return (
    <div>
      <h1 style={{ fontSize: 28, marginBottom: 24 }}>欢迎使用 Ant Design 演示项目</h1>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="用户总数"
              value={1128}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="团队数量"
              value={93}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="文档数量"
              value={258}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="系统配置"
              value={45}
              prefix={<SettingOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>
      <Card style={{ marginTop: 24 }}>
        <h2>功能特性</h2>
        <ul style={{ fontSize: 16, lineHeight: 2 }}>
          <li>✅ 响应式侧边栏布局，支持折叠/展开</li>
          <li>✅ 树形菜单结构，支持多层级导航</li>
          <li>✅ 主题切换功能（亮色/暗色模式）</li>
          <li>✅ 路由集成，点击菜单自动高亮当前页面</li>
          <li>✅ 基于 Ant Design 5.x 最新版本</li>
        </ul>
      </Card>
    </div>
  );
};

export default Home;
