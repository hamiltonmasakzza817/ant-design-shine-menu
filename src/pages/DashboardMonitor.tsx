import { Card, Progress, Row, Col, Tag } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const DashboardMonitor = () => {
  return (
    <div>
      <h1 style={{ fontSize: 28, marginBottom: 24 }}>系统监控</h1>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="CPU 使用率">
            <Progress percent={65} status="active" />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="内存使用率">
            <Progress percent={82} status="active" strokeColor="#ff4d4f" />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="磁盘使用率">
            <Progress percent={45} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="网络流量">
            <Progress percent={58} status="active" strokeColor="#52c41a" />
          </Card>
        </Col>
        <Col span={24}>
          <Card title="服务状态">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Web 服务器</span>
                <Tag icon={<CheckCircleOutlined />} color="success">运行中</Tag>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>数据库服务</span>
                <Tag icon={<CheckCircleOutlined />} color="success">运行中</Tag>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>缓存服务</span>
                <Tag icon={<CloseCircleOutlined />} color="error">已停止</Tag>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>消息队列</span>
                <Tag icon={<CheckCircleOutlined />} color="success">运行中</Tag>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardMonitor;
