import { PageHeaderWrapper } from '@ant-design/pro-components';
import {Skeleton } from 'antd';
import React from 'react';
import { useIntl } from 'umi';

const Admin: React.FC = () => {
  const intl = useIntl();
  return (
      <Skeleton />
  );
};

export default Admin;
