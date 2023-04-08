import { useIntl, useModel } from 'umi';
import { useEffect, useState } from 'react';
import { getDetail } from '@/services/model/http';
import { history } from 'umi';
import { Collapse, Descriptions, Layout, Table, Typography } from 'antd';
import { getUser } from '@/services/login/api';
import { Line } from '@ant-design/charts';
import './index.less';
import { bin2String, getCol, zip } from '@/services/utils';
import { getCoefficient, getIntercept } from '@/services/data/http';
const { Text } = Typography;

interface ShowModelProps {
  modelId: number;
}

const ShowModel: React.FC<ShowModelProps> = ({ modelId }) => {
  const intl = useIntl();
  const [modelInfo, setModelInfo] = useState<API.Model>();
  const [modelDescript, setModesDescript] = useState(new Array<DescriptItem>());
  const [user, setUser] = useState<API.CurrentUser>();
  const [dataType, setDataType] = useState(new Array<DataType>());
  const [missingInfo, setMissingInfo] = useState(new Array<MIssingInfo>());
  const [info, setInfo] = useState(new Array<InfoShow>());
  const [binning, setBinning] = useState(new Array<Binning>());
  const [rocData, setRocData] = useState(new Array<rocData>());
  const [rocArea, setRocArea] = useState(0.0);
  const [coefficient,setCoefficient] = useState(new Array<number>());
  const [intercept,setIntercept] = useState(new Array<number>());
  
  const option = {
    xField: 'truePositiveRate',
    yField: 'falsePositiveRate',
    xAxis: {
      title: {
        show: true,
        text: intl.formatMessage({ id: 'addmodel.truePositiveRate' }),
      },
    },
    yAxis: {
      title: {
        show: true,
        text: intl.formatMessage({ id: 'addmodel.falsePositiveRate' }),
      },
    },
    tooltip: {
      customContent: (title: any, data: any) => {
        return (
          <div
            style={{
              padding: '8px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '80px',
            }}
          >
            <h3>
              {intl.formatMessage({ id: 'addmodel.ROCCurve' })}(
              {intl.formatMessage({ id: 'addmodel.area' })} = {rocArea})
            </h3>
            <div>
              {intl.formatMessage({ id: 'addmodel.truePositiveRate' })} :
              {data[0]?.data?.truePositiveRate}
            </div>
            <div>
              {intl.formatMessage({ id: 'addmodel.falsePositiveRate' })} :
              {data[0]?.data?.falsePositiveRate}
            </div>
          </div>
        );
      },
    },
  };

  /**
   * 描述表格结果
   */
  const descriptCol = [
    getCol(intl.formatMessage({ id: 'addmodel.descript.col' }), 'title'),
    getCol('25%', '25%'),
    getCol('50%', '50%'),
    getCol('75%', '75%'),
    getCol(intl.formatMessage({ id: 'addmodel.descript.num' }), 'count'),
    getCol(intl.formatMessage({ id: 'addmodel.descript.max' }), 'max'),
    getCol(intl.formatMessage({ id: 'addmodel.descript.min' }), 'min'),
    getCol(intl.formatMessage({ id: 'addmodel.descript.avg' }), 'mean'),
    getCol(intl.formatMessage({ id: 'addmodel.descript.std' }), 'std'),
  ];
  const infoCol = [
    getCol(intl.formatMessage({ id: 'addmodel.descript.col' }), 'title'),
    getCol(intl.formatMessage({ id: 'sm.use' }), 'use'),
    getCol(intl.formatMessage({ id: 'addmodel.descript.datatype' }), 'type'),
    getCol(intl.formatMessage({ id: 'addmodel.descript.nullcount' }), 'null'),
    getCol(intl.formatMessage({ id: 'addmodel.descript.total' }), 'total'),
    getCol(intl.formatMessage({ id: 'addmodel.null.method' }), 'missingMethod'),
    getCol(intl.formatMessage({ id: 'sm.default' }), 'default'),
  ];
  /**
   * 单个分箱信息表格结构
   */
  const binningCol = [
    getCol(intl.formatMessage({ id: 'addmodel.binning.bin' }), 'bin'),
    getCol(intl.formatMessage({ id: 'addmodel.binning.woe' }), 'woe'),
    getCol(intl.formatMessage({ id: 'addmodel.binning.iv' }), 'iv'),
  ];
  function getIntl(id: string) {
    return intl.formatMessage({ id });
  }
  const { model, addModel } = useModel(
    'ModelData',
    (ret: { model: Map<number, API.Model>; addModels: any }) => {
      return {
        model: ret.model,
        addModel: ret.addModels,
      };
    },
  );

  useEffect(() => {
    if (model.has(modelId)) {
      const mo = model.get(modelId);
      setModelInfo(mo);
      // console.log(mo);
    } else {
      getDetail(modelId)
        .then((res: any) => {
          addModel(res[0].pk, res[0].fields);
          setModelInfo(res[0].fields);
        })
        .catch(() => {
          history.replace('/404');
        });
    }
  }, [modelId]);

  function setupUser() {
    if (modelInfo?.user) {
      getUser(modelInfo?.user).then((res) => {
        setUser(res.message);
      });
    }
  }
  function setupDescript() {
    const describe = JSON.parse(modelInfo?.descriptor);
    const arr = new Array<DescriptItem>();
    Object.keys(describe).forEach((k) => {
      const item = {
        ...describe[k],
        title: k,
      };
      arr.push(item);
    });

    setModesDescript(arr);
  }
  function setupDataType() {
    const describe = JSON.parse(modelInfo?.data_type);
    const arr = new Array<DataType>();
    Object.keys(describe).forEach((k) => {
      const d = {
        title: k,
        type: describe[k],
      };
      arr.push(d);
    });
    setDataType(arr);
  }

  function setupMissingInfo() {
    const describe = JSON.parse(modelInfo?.missing_info);
    const arr = new Array<MIssingInfo>();
    Object.keys(describe).forEach((k) => {
      const d = {
        title: k,
        ...describe[k],
      };
      arr.push(d);
    });
    setMissingInfo(arr);
  }
  function setupBinning() {
    const woe = JSON.parse(modelInfo?.woe_iv_table);
    const arr = new Array<Binning>();
    Object.keys(woe).forEach((k) => {
      const pr = JSON.parse(woe[k]);
      const bins = new Array<BinningInfo>();

      const preBins = Object.values(pr.bin);
      const preBinsWoe = Object.values(pr.woe);
      const preBinsIv = Object.values(pr.iv);
      let woesum = 0;
      let ivsum = 0;
      for (let index = 0; index < preBins.length; index++) {
        bins.push({
          bin: bin2String(preBins[index]),
          woe: preBinsWoe[index],
          iv: preBinsIv[index],
        } as BinningInfo);
        woesum += preBinsWoe[index] as number;
        ivsum += preBinsIv[index] as number;
      }

      const binnig = {
        title: k,
        woe: woesum,
        iv: ivsum,
        bins: bins,
      } as Binning;
      arr.push(binnig);
    });

    setBinning(arr);
  }
  function setupRoc() {
    if (modelInfo) {
      const roc: any = JSON.parse(modelInfo?.rocData);
      const ip = zip(roc.fpr, roc.tpr);
      const data = ip.map((e: any[]) => {
        return { truePositiveRate: e[0], falsePositiveRate: e[1] } as unknown as rocData;
      });
      setRocData(data);
      setRocArea(roc.roc_auc);
    }
  }
  function getParameter(){
    getCoefficient(modelId).then((res)=>{setCoefficient(res[0])})
    getIntercept(modelId).then((res)=>{setIntercept(res)})
  }
  useEffect(() => {
    if (!modelInfo) return;
    setupUser();
    getParameter();
    setupDataType();
    setupMissingInfo();
    setupDescript();
    setupBinning();
    setupRoc();
  }, [modelInfo]);

  useEffect(() => {
    if (missingInfo.length == dataType.length) {
      const arr = new Array<InfoShow>();
      for (let i = 0; i < dataType.length; i++) {
        function getMethod(miss: MIssingInfo) {
          return miss.nullCount > 0
            ? getIntl('sm.' + missingInfo[i].missingMethod)
            : getIntl('sm.nutnull');
        }
        const lableUse = JSON.parse(modelInfo?.lable_use);
        const a = {
          title: dataType[i].title,
          type: dataType[i].type,
          null: missingInfo[i].nullCount,
          total: missingInfo[i].total,
          missingMethod: getMethod(missingInfo[i]),
          default:
            missingInfo[i].missingMethod === '自定义'
              ? missingInfo[i].default
              : getIntl('sm.noneed'),
          use: lableUse[dataType[i].title] + '',
        } as InfoShow;
        arr.push(a);
      }
      setInfo(arr);
    }
  }, [missingInfo, dataType]);
  return (
    <>
      <Descriptions title={getIntl('sm.title') + modelInfo?.name} className="container" bordered>
        <Descriptions.Item label={getIntl('sm.username')}>{user?.username}</Descriptions.Item>
        <Descriptions.Item label={getIntl('sm.createdate')}>
          {modelInfo && new Date(modelInfo.create_date).toLocaleString()}
        </Descriptions.Item>
        <Descriptions.Item label={getIntl('sm.basescore')}>{modelInfo?.base_score}</Descriptions.Item>
        <Descriptions.Item label={getIntl('sm.pdoscore')}>{modelInfo?.pdo_score}</Descriptions.Item>
        <Descriptions.Item label={getIntl('sm.Y')}>{modelInfo?.ylable}</Descriptions.Item>
        <Descriptions.Item label='Odds'>{modelInfo?.odds}</Descriptions.Item>
        <Descriptions.Item label={getIntl('addmodel.intercept')}>{intercept.join(',')}</Descriptions.Item>
        <Descriptions.Item label={getIntl('addmodel.coefficient')}>{coefficient.join(' , ')}</Descriptions.Item>
      </Descriptions>
      <Layout className="container">
        <span> {getIntl('addmodel.ROC')}</span>
        <Line {...option} data={rocData} />
      </Layout>
      <Layout className="container">
        <span> {getIntl('sm.X')}</span>
        <Table columns={infoCol} dataSource={info} rowKey={(res) => res.title} />
      </Layout>

      <Layout className="container">
        <span> {getIntl('sm.descript')}</span>
        <Table columns={descriptCol} dataSource={modelDescript} rowKey={(res) => res.title} />
      </Layout>
      <Layout className="container">
        <span> {getIntl('sm.bininfo')}</span>
        <Collapse>
          {binning
            .filter((re) => info.find((i) => i.title === re.title)?.use === 'true')
            .map((b) => {
              return (
                <Collapse.Panel
                  header={
                    <span>
                      <Text style={{ display: 'inline-block', width: '25%' }}>
                        {getIntl('addmodel.binning.col')}：{b.title}
                      </Text>
                      <Text style={{ display: 'inline-block', width: '25%' }}>
                        {getIntl('addmodel.binning.iv')}:{b.iv}
                      </Text>
                    </span>
                  }
                  key={b.title}
                >
                  <Table
                    size="small"
                    dataSource={b.bins}
                    columns={binningCol}
                    rowKey={(res) => res.bin}
                  />
                </Collapse.Panel>
              );
            })}
        </Collapse>
      </Layout>
    </>
  );
};

export default ShowModel;
