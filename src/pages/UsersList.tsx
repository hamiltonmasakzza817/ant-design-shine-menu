import { Table, Tag, Space, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

interface UserType {
  key: string;
  name: string;
  age: number;
  email: string;
  role: string;
  status: string;
}

const columns: ColumnsType<UserType> = [
  {
    title: '姓名',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '年龄',
    dataIndex: 'age',
    key: 'age',
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: '角色',
    dataIndex: 'role',
    key: 'role',
    render: (role: string) => {
      const color = role === '管理员' ? 'red' : role === '编辑' ? 'blue' : 'green';
      return <Tag color={color}>{role}</Tag>;
    },
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    render: (status: string) => {
      const color = status === '在线' ? 'success' : 'default';
      return <Tag color={color}>{status}</Tag>;
    },
  },
  {
    title: '操作',
    key: 'action',
    render: () => (
      <Space size="middle">
        <Button type="link" icon={<EditOutlined />}>编辑</Button>
        <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
      </Space>
    ),
  },
];

const data: UserType[] = [
  {
    key: '1',
    name: '张三',
    age: 32,
    email: 'zhangsan@example.com',
    role: '管理员',
    status: '在线',
  },
  {
    key: '2',
    name: '李四',
    age: 28,
    email: 'lisi@example.com',
    role: '编辑',
    status: '在线',
  },
  {
    key: '3',
    name: '王五',
    age: 25,
    email: 'wangwu@example.com',
    role: '用户',
    status: '离线',
  },
  {
    key: '4',
    name: '赵六',
    age: 30,
    email: 'zhaoliu@example.com',
    role: '编辑',
    status: '在线',
  },
];

const UsersList = () => {
  return (
    <div style={{ background: 'red', padding: '24px' }}>
      <h1 style={{ fontSize: 28, marginBottom: 24, color: 'white' }}>用户列表</h1>
      <style>{`
        .spaced-table .ant-table {
          background: transparent !important;
        }
        .spaced-table .ant-table-container {
          background: transparent !important;
        }
        .spaced-table .ant-table-content table {
          border-collapse: separate !important;
          border-spacing: 0 10px !important;
        }
        .spaced-table .ant-table-tbody > tr > td {
          background: #f5f5f5 !important;
          border: none !important;
        }
        .spaced-table .ant-table-thead > tr > th {
          background: #f5f5f5 !important;
          border: none !important;
        }
      `}</style>
      <Table 
        columns={columns} 
        dataSource={data} 
        className="spaced-table"
      />
    </div>
  );
};

export default UsersList;
