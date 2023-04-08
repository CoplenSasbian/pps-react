export default [
  {
    path: '/user',
    layout: false,

    routes: [
      {
        name: 'login',
        path: '/user/login',
        component: './myUser/Login',
        layout: false,
      },
      {
        component: './404',
      },
    ],
  },
  {
    path: '/welcome',
    name: 'welcome',
    icon: 'smile',
    component: './Welcome',
  },
  {
    path: '/model',
    name: 'model',
    icon: 'DeploymentUnit',
    routes: [
      {
        name: 'training',
        path: '/model/training',
        component: './Model/Training',
        icon:'AppstoreAdd'
      },
      {
        name: 'showmodel',
        path: '/model/show/:id',
        component: './Model',
        hideInMenu: true,
      },
      {
        component: './404',
      },
    ],
  },
  {
    path: '/data',
    name: 'data',
    icon:'Database',
    routes: [
      {
        name: 'showdata',
        path: '/data/show/:id',
        component: './Data',
        hideInMenu: true,
      },
      {
        component: './404',
      },
    ],
  },
  {
    path: '/result',
    name: 'result',
    icon:'Save',
    routes: [
      {
        name: 'showresult',
        path: '/result/show/:res',
        component: './Result',
        hideInMenu: true,
      },
      {
        component: './404',
      },
    ],
  },
  {
    path: '/',
    redirect: '/welcome',
  },
  {
    component: './404',
  },
];
