import ShowModel from './ShowModel';
import { FC } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
const Model: FC<Record<string, any>> = (prop) => {
  const params = prop.match.params;

  return (
    <PageContainer>
      <ShowModel modelId={parseInt(params.id)} />
    </PageContainer>
  );
};

export default Model;
