import { Card, Row, Col } from 'antd';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: '一月', 访问量: 4000, 销售额: 2400 },
  { name: '二月', 访问量: 3000, 销售额: 1398 },
  { name: '三月', 访问量: 2000, 销售额: 9800 },
  { name: '四月', 访问量: 2780, 销售额: 3908 },
  { name: '五月', 访问量: 1890, 销售额: 4800 },
  { name: '六月', 访问量: 2390, 销售额: 3800 },
];

const DashboardAnalytics = () => {
  return (
    <div>
      <h1 style={{ fontSize: 28, marginBottom: 24 }}>数据分析</h1>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="访问量趋势">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="访问量" stroke="#1890ff" fill="#1890ff" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={24}>
          <Card title="销售额统计">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="销售额" stroke="#52c41a" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardAnalytics;
