import { Card, Typography, Divider, Tag } from 'antd';

const { Paragraph, Title, Text } = Typography;

const DocumentsApi = () => {
  return (
    <div>
      <h1 style={{ fontSize: 28, marginBottom: 24 }}>API 文档</h1>
      <Card>
        <Typography>
          <Title level={3}>RESTful API 接口说明</Title>
          <Paragraph>
            本系统提供完整的 RESTful API 接口，方便第三方系统集成和开发。
          </Paragraph>

          <Divider />

          <Title level={4}>用户接口</Title>
          <div style={{ marginBottom: 16 }}>
            <Tag color="green">GET</Tag>
            <Text code>/api/users</Text>
            <Paragraph style={{ marginTop: 8 }}>
              获取用户列表，支持分页和筛选参数。
            </Paragraph>
          </div>

          <div style={{ marginBottom: 16 }}>
            <Tag color="blue">POST</Tag>
            <Text code>/api/users</Text>
            <Paragraph style={{ marginTop: 8 }}>
              创建新用户，需要提供用户名、邮箱等必要信息。
            </Paragraph>
          </div>

          <div style={{ marginBottom: 16 }}>
            <Tag color="orange">PUT</Tag>
            <Text code>/api/users/:id</Text>
            <Paragraph style={{ marginTop: 8 }}>
              更新指定用户信息，需要管理员权限。
            </Paragraph>
          </div>

          <div style={{ marginBottom: 16 }}>
            <Tag color="red">DELETE</Tag>
            <Text code>/api/users/:id</Text>
            <Paragraph style={{ marginTop: 8 }}>
              删除指定用户，需要管理员权限。
            </Paragraph>
          </div>

          <Divider />

          <Title level={4}>认证说明</Title>
          <Paragraph>
            所有 API 请求都需要在 Header 中携带 Authorization Token：
          </Paragraph>
          <Paragraph>
            <Text code>Authorization: Bearer YOUR_ACCESS_TOKEN</Text>
          </Paragraph>
        </Typography>
      </Card>
    </div>
  );
};

export default DocumentsApi;
