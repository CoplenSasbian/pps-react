import Footer from '@/components/Footer';
import RightContent from '@/components/RightContent';
import type { MenuDataItem, Settings as LayoutSettings } from '@ant-design/pro-components';
import { PageLoading, SettingDrawer } from '@ant-design/pro-components';
import type { RunTimeLayoutConfig } from 'umi';
import { history } from 'umi';
import defaultSettings from '../config/defaultSettings';
import { currentUser as queryCurrentUser } from './services/login/api';
import { getModelList } from './services/model/http';
import { base64Encode } from './services/utils';

const loginPath = '/user/login';

/** 获取用户信息比较慢的时候会展示一个 loading */
export const initialStateConfig = {
  loading: <PageLoading />,
};

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
  modelList?: API.DataBaseData<API.Model>[];
}> {
  const list = await getModelList();
  const fetchUserInfo = async () => {
    try {
      const msg = await queryCurrentUser();
      return msg.message;
    } catch (error) {
      history.push(loginPath);
    }
    return undefined;
  };
  // 如果不是登录页面，执行
  if (history.location.pathname !== loginPath) {
    const currentUser = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentUser,
      settings: defaultSettings,
      modelList: list,
    };
  }
  return {
    fetchUserInfo,
    settings: defaultSettings,
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = async ({ initialState, setInitialState }) => {
  return {
    menuDataRender: (menuList: MenuDataItem[]) => {
      for (const item of menuList) {
        if (item.path === '/model' || item.path === '/data') {
          initialState?.modelList?.forEach((it: API.DataBaseData<API.Model>) => {
            let path = '';
            if (item.path === '/model') path = '/model/show/' + it.pk;
            else path = '/data/show/' + it.pk;
            item.children?.push({
              name: it.fields.name,
              path: path,
              locale: false,
            } as MenuDataItem);
          });
        } else if (item.path === '/result') {
          for (let index = 0; index < localStorage.length; index++) {
            const key = localStorage.key(index);
            if (key && key.startsWith('result-')) {
              item.children?.push({
                name: key.replace('result-', ''),
                path: '/result/show/' + encodeURIComponent(key),
                locale: false,
              });
            }
          }
        }
      }

      return menuList;
    },
    rightContentRender: () => <RightContent />,
    disableContentMargin: false,
    waterMarkProps: {
      content: initialState?.currentUser?.username,
    },
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && location.pathname !== loginPath) {
        // document.location.href = loginPath;
        history.push(loginPath);
        return;
      }
    },
    links: [],
    menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children: any, props: { location: { pathname: string | string[] } }) => {
      // if (initialState?.loading) return <PageLoading />;
      return (
        <>
          {children}
          {!props.location?.pathname?.includes('/login') && (
            <SettingDrawer
              disableUrlParams
              enableDarkTheme={true}
              settings={initialState?.settings}
              // eslint-disable-next-line @typescript-eslint/no-shadow
              onSettingChange={(settings) => {
                setInitialState((preInitialState) => ({
                  ...preInitialState,
                  settings,
                }));
              }}
            />
          )}
        </>
      );
    },
    ...initialState?.settings,
  };
};
