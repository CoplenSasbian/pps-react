import { Settings as LayoutSettings } from '@ant-design/pro-components';

const Settings: LayoutSettings & {
  pwa?: boolean;
  logo?: string;
} = {
  colorWeak: false,
  title: 'Futurvo',
  logo: '/logo.png',
  iconfontUrl: '',
  navTheme: 'light',
  primaryColor: '#59a1dd',
  layout: 'mix',
  contentWidth: 'Fluid',
  fixedHeader: false,
  fixSiderbar: true,
  pwa: false,
  headerHeight: 48,
  splitMenus: false,
};

export default Settings;
