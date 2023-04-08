import { PageContainer } from '@ant-design/pro-components';
import ShowData from './ShowData';

const Model: React.FC<Record<string, any>> = (prop) => {
  const params = prop.match.params;

  return (
    <PageContainer>
      <ShowData modelId={parseInt(params.id)} />
    </PageContainer>
  );
};

export default Model;
