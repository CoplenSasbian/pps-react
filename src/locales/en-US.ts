import addModel from './en-US/addModel';
import component from './en-US/component';
import globalHeader from './en-US/globalHeader';
import menu from './en-US/menu';
import pages from './en-US/pages';
import pwa from './en-US/pwa';
import settingDrawer from './en-US/settingDrawer';
import settings from './en-US/settings';
import mylogin from './en-US/myLogin';
import showModel from './en-US/showModel';
import showData from './en-US/showData';
import Result from './en-US/result'
export default {
  'page.title': 'Poverty Index Prediction System',
  'navBar.lang': 'Languages',
  'layout.user.link.help': 'Help',
  'layout.user.link.privacy': 'Privacy',
  'layout.user.link.terms': 'Terms',
  'app.copyright.produced': 'Futurvo 毕业设计 power by Ant Design Pro',
  'app.preview.down.block': 'Download this page to your local project',
  'app.welcome.link.fetch-blocks': 'Get all block',
  'app.welcome.link.block-list': 'Quickly build standard, pages based on `block` development',
  'app.github.repository':'Github repository',
  'app.github.fornt':'Front-end project',
  'app.github.back' :'Back-end project',
  ...globalHeader,
  ...menu,
  ...settingDrawer,
  ...settings,
  ...pwa,
  ...component,
  ...pages,
  ...addModel,
  ...mylogin,
  ...showModel,
  ...showData,
  ...Result,
};
