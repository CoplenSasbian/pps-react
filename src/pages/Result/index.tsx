import ModelData from '@/models/ModelData';
import { getCoefficient, getIntercept } from '@/services/data/http';
import { saveModelSocre } from '@/services/model/http';
import { base64Decode, o2num } from '@/services/utils';
import { Column } from '@ant-design/charts';
import { BarChartOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Button, Input, InputNumber, Modal, Slider, Tooltip, message } from 'antd';

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
  const history = useHistory();
  const modelId = useRef(0);
  const [showDescription, setShowDescription] = useState(false);
  const [distributionData, setDistributionData] = useState(
    new Array<{ type: string; score: number }>(),
  );
  const [baseScore, setBaseScore] = useState(0);
  const [pdoSocre, setPdoScore] = useState(0);
  const chagModel = useRef(false);
  function getIntl(id: string) {
    return intl.formatMessage({ id: id });
  }
  // const { model } = useModel('ModelData');
  useEffect(loadData, [props.match.params.res, baseScore, pdoSocre, res]);
  useEffect(()=>{
    chagModel.current = true;
  },[res,props.match.params.res,]);
  function loadData() {
    const name = base64Decode(res);
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
        if (baseScore === 0 || pdoSocre === 0) {
          setBaseScore(resultObj.base_score);
          setPdoScore(resultObj.pdo_score);
        }
        if(chagModel.current){
          setBaseScore(resultObj.base_score);
          setPdoScore(resultObj.pdo_score);
          chagModel.current =false;
        }
        const odds: number = resultObj.odds;
        let count = -1;

        Object.values(lableUse).forEach((value: any) => {
          if (value === true) {
            count++;
          }
        });

        const arr = resultArr.map((probertly, index) => {
          const obj = {} as any; //:Math.round(baseScore-pdoSocre*Math.log(score/(1-score)))

          let coeficientIndex = 0;
          let y = intercept[0];
          Object.keys(woeTable).forEach((k) => {
            if (lableUse[k]) {
              obj[k] = woeTable[k]?.[index];
              y += woeTable[k]?.[index] * coefficient[coeficientIndex++];
            } else obj[k] = woeTable[k]?.[index];
          });

          const b = pdoSocre / Math.log(2);
          const baseodds = odds;
          const logOdds = Math.log(baseodds);
          const a = baseScore + b * logOdds;
          const score = a - b * Math.log(probertly / (1 - probertly));
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
          if (tableAction.current) {
            tableAction.current.reload();
          }

          return cols;
        });
      })();
    }
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
  function deleteResult() {
    if (confirm(getIntl('res.isdelete'))) {
      const name = base64Decode(res);
      localStorage.removeItem(name);
      history.replace('/data/show/' + modelId.current);
    }
  }

  function showDistribution() {
    const minScore = Math.min(...object.map((o) => o.score));
    const maxScore = Math.max(...object.map((o) => o.score));
    const interval = (maxScore - minScore) / 12;
    const result = new Array(12).fill(0);
    for (let i = 0; i < object.length; i++) {
      let index = Math.floor((object[i].score - minScore) / interval);
      if (index === 12) index--;
      result[index]++;
    }
    console.log(minScore, maxScore, interval, result);

    setDistributionData(
      result.map((v, i) => {
        return {
          type: Math.ceil(minScore + interval * i) + '-' + Math.ceil(minScore + interval * (i + 1)),
          score: v,
        };
      }),
    );
    setShowDescription(true);
  }
  function saveScore(){
    saveModelSocre(modelId.current,baseScore,pdoSocre).then(_=>{
      message.success('👌')
    }).catch(err=>{
      message.success(err)
    })
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
            <Button key="3" type="text" onClick={deleteResult} shape="circle">
              <DeleteOutlined color="red" />
            </Button>
          </Tooltip>,
          <Tooltip title={getIntl('res.distribution')}>
            <Button key="3" type="text" onClick={showDistribution} shape="circle">
              <BarChartOutlined />
            </Button>
          </Tooltip>,
          <>
            {intl.formatMessage({ id: 'addmodel.generatermdoel.base' })}
            <InputNumber
              value={baseScore}
              onChange={(env) => {
                if (env) setBaseScore(env);
              }}
              placeholder={intl.formatMessage({ id: 'addmodel.generatermdoel.base' })}
              style={{ width: '60px' }}
            />
          </>,
          <>
            {intl.formatMessage({ id: 'addmodel.generatermdoel.pdo' })}
            <InputNumber
              value={pdoSocre}
              onChange={(env) => {
                if (env) setPdoScore(env);
              }}
              placeholder={intl.formatMessage({ id: 'addmodel.generatermdoel.pdo' })}
              style={{ width: '60px' }}
            />
          </>,
           <Tooltip title={getIntl('res.savesocre')}>
           <Button key="3" type="text" onClick={saveScore} shape="circle">
           <SaveOutlined />
           </Button>
         </Tooltip>,
        ]}
      />

      <Modal
        title={intl.formatMessage({ id: 'res.distribution.charm' })}
        open={showDescription}
        onCancel={() => setShowDescription(false)}
        footer={null}
      >
        <Column data={distributionData} xField="type" yField="score" />
      </Modal>
    </PageContainer>
  );
};

export default Result;
