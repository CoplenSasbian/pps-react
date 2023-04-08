import { getCoefficient, getIntercept } from '@/services/data/http';
import { o2num } from '@/services/utils';
import { DeleteOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Button, Tooltip } from 'antd';

import { useEffect, useRef, useState } from 'react';
import { useHistory, useIntl, useParams } from 'umi';
interface ResultShowProps {
  match: {
    params: {
      res: string;
    };
  };
}

const Result: React.FC<ResultShowProps> = (props) => {
  const { res } = useParams<{ res: string }>();
  const [object, setObject] = useState(new Array<any>());
  const [tableCol, setTableCol] = useState(new Array<ProColumns<any>>());
  const tableAction = useRef<ActionType>();
  const [pageCount, setPageCount] = useState(0);
  const intl = useIntl();
  const history = useHistory()
  const modelId= useRef(0)
  function getIntl(id: string){
    return intl.formatMessage({id:id});
  }
  // const { model } = useModel('ModelData');
  useEffect(loadData,[props.match.params.res])

  function loadData () {
    const name = decodeURIComponent(res);
    const result = localStorage.getItem(name);
    if (result) {
      const resultObj = JSON.parse(result);
      modelId.current = resultObj.modelId;
      (async () => {
        const coefficient = (await getCoefficient(resultObj.modelId))[0];
        const intercept = await getIntercept(resultObj.modelId);

        const woeTable = resultObj.woeTable;
        const lableUse = JSON.parse(resultObj.useLable);
        const resultArr: number[] = resultObj.result ?? [];
        const baseScore: number= resultObj.base_score;
        const pdoSocre: number = resultObj.pdo_score;
        const odds: number = resultObj.odds;
        let count = -1;

        Object.values(lableUse).forEach((value: any) => {
          if (value === true) {
            count++;
          }
        });

        const arr = resultArr.map((probertly, index) => {
          const obj = { } as any;//:Math.round(baseScore-pdoSocre*Math.log(score/(1-score)))

          let coeficientIndex = 0;
          let y=intercept[0];
          Object.keys(woeTable).forEach((k) => {

            if (lableUse[k]) {
              obj[k] = woeTable[k]?.[index];
              y+= woeTable[k]?.[index]*coefficient[coeficientIndex++]
            }
            else obj[k] = woeTable[k]?.[index];
          });

        const b = pdoSocre / Math.log(2);
        const baseodds = odds;
        const logOdds = Math.log(baseodds);
        const a = baseScore + b * logOdds;
        const score =  a - b * Math.log(probertly/(1-probertly));
          obj.score = Math.round(score);
          return obj;
        });
        setObject(arr);
        setTableCol(() => {
          const cols = Object.keys(woeTable).map((k) => {
            return {
              title: k,
              dataIndex: k,
              sorter: true,
              filters: true,
            } as ProColumns<any>;
          });
          cols.push({ title: 'Score', dataIndex: 'score', sorter: true, filters: true });
          return cols;
        });
      })();
    }
    setTimeout(()=>{
      if(tableAction.current){
         tableAction.current.reload();
      }
      },300)
  }

  async function getData(params: any, sort: any, filter: any) {
    return new Promise((rs, rj) => {
      const page = params.current;
      const pageSize = params.pageSize;
      const start = (page - 1) * pageSize;


      const records = object.filter((row: any) => {
        let flag = true;
        Object.keys(params)
          .filter((k) => !['current', 'pageSize'].includes(k))
          .forEach((k) => {
            const v = row[k];
            if (typeof v === 'string') {
              flag &&= v.includes(params[k]);
            } else {
              flag &&= v === params[k];
            }
          });
        return flag;
      });
      const key = Object.keys(sort)[0];
      if (key) {
        const sortType = sort[key];

        records.sort((a: any, b: any) => {
          if (typeof a[key] === 'number' || typeof a[key] === 'bigint')
            return sortType == 'ascend' ? a[key] - b[key] : b[key] - a[key];
          else
            return sortType == 'ascend'
              ? o2num(a[key]) - o2num(b[key])
              : o2num(b[key]) - o2num(a[key]);
        });
      }
      const recordSize = records.length;
      const end = Math.min(start + pageSize, recordSize);
      setPageCount(recordSize);
      rs({
        success: true,
        data: records.slice(start, end),
      });
    });
  }
  function deleteResult(){
      if(confirm(getIntl('res.isdelete'))){
        const name = decodeURIComponent(res);
        localStorage.removeItem(name);
        history.replace("/data/show/"+modelId.current)
      }
  }
  return (
    <PageContainer>
      <ProTable<any>
        actionRef={tableAction}
        pagination={{ total: pageCount }}
        request={getData}
        columns={tableCol}
        rowKey={(row) => JSON.stringify(row)}
        toolBarRender={() => [
               <Tooltip title={getIntl('res.delete')}>
                    <Button key="3" type='text' onClick={deleteResult} shape="circle">
                      <DeleteOutlined color='red'/>
                    </Button>
                    </Tooltip>
                  ]}

      />
    </PageContainer>
  );
};

export default Result;
