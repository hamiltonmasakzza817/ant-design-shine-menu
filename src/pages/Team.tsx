import { Card, Avatar, Row, Col } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Meta } = Card;

const teamMembers = [
  { name: '张三', role: '产品经理', avatar: null },
  { name: '李四', role: '前端开发', avatar: null },
  { name: '王五', role: '后端开发', avatar: null },
  { name: '赵六', role: 'UI设计师', avatar: null },
  { name: '钱七', role: '测试工程师', avatar: null },
  { name: '孙八', role: '运维工程师', avatar: null },
];

const Team = () => {
  return (
    <div>
      <h1 style={{ fontSize: 28, marginBottom: 24 }}>团队协作</h1>
      <Row gutter={[16, 16]}>
        {teamMembers.map((member, index) => (
          <Col span={8} key={index}>
            <Card>
              <Meta
                avatar={<Avatar size={64} icon={<UserOutlined />} />}
                title={member.name}
                description={member.role}
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Team;
