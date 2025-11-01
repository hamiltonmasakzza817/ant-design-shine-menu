import { Card, Descriptions, Tag } from 'antd';

const UsersRoles = () => {
  return (
    <div>
      <h1 style={{ fontSize: 28, marginBottom: 24 }}>角色管理</h1>
      <Card title="管理员" style={{ marginBottom: 16 }}>
        <Descriptions bordered column={1}>
          <Descriptions.Item label="权限级别">
            <Tag color="red">最高权限</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="可访问模块">
            所有模块
          </Descriptions.Item>
          <Descriptions.Item label="人数">5</Descriptions.Item>
          <Descriptions.Item label="描述">
            拥有系统的完全控制权限，可以管理所有用户和设置
          </Descriptions.Item>
        </Descriptions>
      </Card>
      <Card title="编辑" style={{ marginBottom: 16 }}>
        <Descriptions bordered column={1}>
          <Descriptions.Item label="权限级别">
            <Tag color="blue">中等权限</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="可访问模块">
            仪表盘、文档中心
          </Descriptions.Item>
          <Descriptions.Item label="人数">12</Descriptions.Item>
          <Descriptions.Item label="描述">
            可以编辑和管理内容，但不能修改系统设置
          </Descriptions.Item>
        </Descriptions>
      </Card>
      <Card title="普通用户">
        <Descriptions bordered column={1}>
          <Descriptions.Item label="权限级别">
            <Tag color="green">基础权限</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="可访问模块">
            首页、文档中心（只读）
          </Descriptions.Item>
          <Descriptions.Item label="人数">156</Descriptions.Item>
          <Descriptions.Item label="描述">
            只能查看内容，不能进行编辑操作
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default UsersRoles;
