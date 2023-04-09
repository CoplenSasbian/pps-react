import component from './zh-CN/component';
import globalHeader from './zh-CN/globalHeader';
import menu from './zh-CN/menu';
import pages from './zh-CN/pages';
import pwa from './zh-CN/pwa';
import settingDrawer from './zh-CN/settingDrawer';
import settings from './zh-CN/settings';
import addModel from './zh-CN/addModel';
import mylogin from './zh-CN/myLogin';
import showModel from './zh-CN/showModel';
import showData from './zh-CN/showData';
import Result from './zh-CN/result'
export default {
  'page.title': '贫困指数预测',
  'navBar.lang': '语言',
  'layout.user.link.help': '帮助',
  'layout.user.link.privacy': '隐私',
  'layout.user.link.terms': '条款',
  'app.copyright.produced': 'Futurvo 毕业设计 power by Ant Design Pro',
  'app.preview.down.block': '下载此页面到本地项目',
  'app.welcome.link.fetch-blocks': '获取全部区块',
  'app.welcome.link.block-list': '基于 block 开发，快速构建标准页面',
  'app.github.repository':'Github 仓库',
  'app.github.fornt':'前端项目',
  'app.github.back':'后端项目',
  ...pages,
  ...globalHeader,
  ...menu,
  ...settingDrawer,
  ...settings,
  ...pwa,
  ...component,
  ...addModel,
  ...mylogin,
  ...showModel,
  ...showData,
  ...Result,
};
