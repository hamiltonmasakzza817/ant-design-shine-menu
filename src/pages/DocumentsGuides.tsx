import { Card, Typography, Divider } from 'antd';

const { Paragraph, Title } = Typography;

const DocumentsGuides = () => {
  return (
    <div>
      <h1 style={{ fontSize: 28, marginBottom: 24 }}>使用指南</h1>
      <Card>
        <Typography>
          <Title level={3}>快速开始</Title>
          <Paragraph>
            欢迎使用本系统！本指南将帮助您快速了解系统的基本功能和使用方法。
          </Paragraph>

          <Divider />

          <Title level={4}>1. 导航菜单</Title>
          <Paragraph>
            左侧为主导航菜单，支持多层级结构。点击菜单项可以切换不同的功能模块，当前选中的菜单项会高亮显示。
          </Paragraph>

          <Title level={4}>2. 侧边栏折叠</Title>
          <Paragraph>
            点击顶部的折叠按钮可以收起或展开侧边栏，在小屏幕设备上使用时特别方便。
          </Paragraph>

          <Title level={4}>3. 主题切换</Title>
          <Paragraph>
            顶部右侧提供了主题切换开关，您可以在亮色和暗色主题之间自由切换，选择最适合您的视觉体验。
          </Paragraph>

          <Title level={4}>4. 响应式布局</Title>
          <Paragraph>
            系统采用响应式设计，能够自动适配不同尺寸的屏幕，在手机、平板和桌面电脑上都能获得良好的使用体验。
          </Paragraph>
        </Typography>
      </Card>
    </div>
  );
};

export default DocumentsGuides;
