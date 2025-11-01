import { Card, Form, Input, Button, Switch, Select, Space } from 'antd';

const { Option } = Select;

const Settings = () => {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log('表单数据:', values);
  };

  return (
    <div>
      <h1 style={{ fontSize: 28, marginBottom: 24 }}>系统设置</h1>
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            siteName: 'Ant Design 演示',
            language: 'zh-CN',
            notifications: true,
            autoSave: true,
          }}
        >
          <Form.Item
            label="站点名称"
            name="siteName"
            rules={[{ required: true, message: '请输入站点名称' }]}
          >
            <Input placeholder="请输入站点名称" />
          </Form.Item>

          <Form.Item
            label="系统语言"
            name="language"
            rules={[{ required: true, message: '请选择系统语言' }]}
          >
            <Select>
              <Option value="zh-CN">简体中文</Option>
              <Option value="en-US">English</Option>
              <Option value="ja-JP">日本語</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="邮件通知"
            name="notifications"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label="自动保存"
            name="autoSave"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item label="系统管理员邮箱" name="adminEmail">
            <Input type="email" placeholder="admin@example.com" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                保存设置
              </Button>
              <Button htmlType="reset">
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Settings;
