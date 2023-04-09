import { GithubOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-components';
import { useIntl } from 'umi';

const Footer: React.FC = () => {
  const intl = useIntl();
  const defaultMessage = intl.formatMessage({
    id: 'app.copyright.produced',
  });

  const currentYear = new Date().getFullYear();

  return (
    <DefaultFooter
      copyright={`${currentYear} ${defaultMessage}`}
      links={[
        {
          key: 'react',
          title: '前端项目代码',
          href: 'https://github.com/CoplenSasbian/pps-react',
          blankTarget: true,
        },
        {
          key: 'github',
          title: <GithubOutlined />,
          href: 'https://github.com/CoplenSasbian',
          blankTarget: true,
        },
        {
          key: 'backken',
          title: '后台项目',
          href: 'https://github.com/CoplenSasbian/pps-django',
          blankTarget: true,
        },
      ]}
    />
  );
};

export default Footer;
