import { LoadingOutlined, UploadOutlined } from '@ant-design/icons';
import { Card, Checkbox, Descriptions, UploadProps } from 'antd';
import {
  Button,
  Divider,
  Layout,
  Typography,
  Anchor,
  Table,
  Upload,
  Tooltip,
  Select,
  Radio,
  Collapse,
  Spin,
  Switch,
  Form,
  Input,
  InputNumber,
  Empty,
  message,
} from 'antd';
import { Content } from 'antd/es/layout/layout';
import { AddWebClinet } from '@/services/model/ws';
import React from 'react';

import './AddModel.less';
import { PageContainer } from '@ant-design/pro-layout';

import { useIntl, useModel } from 'umi';
import { Line } from '@ant-design/charts';
import { bin2String, getCol, zip } from '@/services/utils';
const { useState, useRef, useEffect } = React;
const { Text } = Typography;

/**
 * 分箱范围
 */
// interface Bin {
//     closed: string
//     closed_left: boolean
//     closed_right: boolean
//     is_empty: boolean
//     left: number
//     length: number
//     mid: number
//     open_left: boolean
//     open_right: boolean
//     right: number
// }

// interface LableUse {
//     title: string
//     use: boolean
// }

export default function Training() {
  // const dispatch = useAppDispatch()
  const intl = useIntl();
  const wsCilne = useRef(new AddWebClinet());
  const [descript, SetDescript] = useState(new Array<DescriptItem>());
  const [info, setInfo] = useState(new Array<Info>());
  const [dataType, setDataType] = useState(new Array<DataType>());
  const [missingInfo, setMissingInfo] = useState(new Array<MIssingInfo>());
  const [currentFile, setCurrentFile] = useState(
    intl.formatMessage({ id: 'addmodel.havenotload' }),
  );
  const [fileDesc, setFileDesc] = useState('');
  const [missingFixsingData, setMissingFixsingData] = useState(new Array<MissingFixing>());
  const [yLable, setYlable] = useState('');
  const [binning, setBinning] = useState(new Array<Binning>());
  const [binningLoading, setBinningLoading] = useState(false);
  const [labbleUseMap, setLableUseMap] = useState(new Map<string, boolean>());
  const [hasGenModel, setHasGenModel] = useState(false);
  const [messageApi, contextHoler] = message.useMessage();
  const [rocData, setRocData] = useState(new Array<rocData>());
  const [rocArea, setRocArea] = useState(0.0);
  const [genModeling, setGenModel] = useState(false);
  const { refresh } = useModel('@@initialState');
  const igenoreIndex = useRef(true);
  const [coefficient,setCoefficient] = useState(new Array<number>());
  const [intercept,setIntercept] = useState(new Array<number>());
  const [modelPreset,setModelPreset] = useState([{name:'base',value:500},{name:'pdo',value:20},{name:'odds',value:5}]);
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
  /**
   * 信息表格结构
   */
  const infoCol = [
    getCol(intl.formatMessage({ id: 'addmodel.descript.col' }), 'title'),
    getCol(intl.formatMessage({ id: 'addmodel.descript.datatype' }), 'type'),
    getCol(intl.formatMessage({ id: 'addmodel.descript.nullcount' }), 'null'),
    getCol(intl.formatMessage({ id: 'addmodel.descript.total' }), 'total'),
  ];
  /**
   * 缺失信息表格结构
   */
  const missingInfoFormCol = [
    getCol(intl.formatMessage({ id: 'addmodel.null.col' }), 'title'),
    getCol(intl.formatMessage({ id: 'addmodel.null.method' }), 'option'),
  ];
  /**
   * 单个分箱信息表格结构
   */
  const binningCol = [
    getCol(intl.formatMessage({ id: 'addmodel.binning.bin' }), 'bin'),
    getCol(intl.formatMessage({ id: 'addmodel.binning.woe' }), 'woe'),
    getCol(intl.formatMessage({ id: 'addmodel.binning.iv' }), 'iv'),
  ];
  /**
   * 折线图配置
   */
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
        // console.log(data[0]?.data);
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

  function resetComponent() {
    SetDescript(new Array<DescriptItem>());
    setInfo(new Array<Info>());
    setDataType(new Array<DataType>());
    setMissingInfo(new Array<MIssingInfo>());
    setCurrentFile(intl.formatMessage({ id: 'addmodel.havenotload' }));
    setFileDesc('');
    setMissingFixsingData(new Array<MissingFixing>());
    setYlable('');
    setBinning(new Array<Binning>());
    setBinningLoading(false);
    setLableUseMap(new Map<string, boolean>());
    setHasGenModel(false);
    setRocData(new Array<rocData>());
    setRocArea(0);
  }

  /**
   * 组件渲染完成Hook
   */
  useEffect(() => {
    /**
     * 向父组件输出 锚点组件
     */

    wsCilne.current.onError(() => {
      messageApi.error(`An error occurred, model info will be reset!`);
      resetComponent();
    });
    wsCilne.current.onClose(() => {
      messageApi.error(`connect clos`);
      resetComponent();
    });
  }, [messageApi]);

  /**
   * 上传文件拦截（进行自行处理）
   * @param file
   * @param list
   * @returns
   */
  const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    setCurrentFile('');
    const fileReader = new FileReader();
    fileReader.addEventListener('load', () => {
      wsCilne.current
        .connect()
        .then(() => {
          if (fileReader.result) {
            let type = '';
            if (file.type == 'application/vnd.ms-excel') {
              type = 'xls';
            } else if (file.type == 'text/csv') {
              type = 'csv';
            } else {
              messageApi.error('Unknow file type :' + file.type);
              return false;
            }

            wsCilne.current
              .setData(fileReader.result, type ? type : '', igenoreIndex.current)
              .then(() => {
                setCurrentFile(file.name);
                setFileDesc(
                  intl.formatMessage({ id: 'addmodel.datatype' }) +
                    file.type +
                    '\n' +
                    intl.formatMessage({ id: 'addmodel.size' }) +
                    file.size +
                    intl.formatMessage({ id: 'addmodel.byte' }),
                );
                setupInfo();
                resetWoeInfo();
              });
          }
          return false;
        })
        .catch(() => {
          messageApi.error(`Websocket connect failed!`);
          resetComponent();
        });
    });
    fileReader.readAsDataURL(file);
    return false;
  };

  function resetWoeInfo() {
    setYlable('');
    setBinning(new Array<Binning>());
    setHasGenModel(false);
  }
  function setupInfo() {
    setupDescript();
    setupDataType();
    setupMissingInfo();
  }
  /**
   * 获取数据基本描述
   */
  function setupDescript() {
    wsCilne.current
      .getDescript()
      .then((res: any) => {
        const arr = new Array<DescriptItem>();
        Object.keys(res).forEach((v) => {
          const a = { ...res[v] };
          a.title = v;
          arr.push(a);
        });
        SetDescript(arr);
      })
      .catch((mess: any) => {
        console.error(mess);
      });
  }
  /**
   * 获取数据列的类型
   */
  function setupDataType() {
    wsCilne.current.dataType().then((res: any) => {
      const arr = new Array<DataType>();
      Object.keys(res).forEach((v) => {
        const a = { type: res[v] } as DataType;
        a.title = v;
        arr.push(a);
      });
      setDataType(arr);
    });
  }
  /**
   * 空值方法改变
   * @param missingInfo  改变的MIssingInfo项
   * @param value 变成的新处理方法
   */

  // eslint-disable-next-line @typescript-eslint/no-shadow
  function optionChange(missingInfo: MIssingInfo, value: string) {
    if (value === '自定义') {
      const def = window.prompt(intl.formatMessage({ id: 'addmodel.defpro' }));
      if (def) wsCilne.current.setMissingMethod(missingInfo.title, value, def);
    } else {
      wsCilne.current.setMissingMethod(missingInfo.title, value, '');
    }
    setupMissingInfo();
  }
  /**
   * 获取数据缺失值信息，包括处理方法
   */
  function setupMissingInfo() {
    wsCilne.current.missingInfo().then((res: any) => {
      const arr = new Array<MIssingInfo>();
      const fix = new Array<MissingFixing>();
      Object.keys(res).forEach((v) => {
        const a = { ...res[v] };
        a.title = v;
        arr.push(a);
        const x = {
          title: v,
          missingMethod: res[v].missingMethod,
          option: (
            <div key={v}>
              <Radio.Group
                disabled={res[v].nullCount === 0}
                onChange={(env) => {
                  optionChange(a, env.target.value);
                }}
                defaultValue={res[v].missingMethod}
              >
                <Radio value="自成分箱">{intl.formatMessage({ id: 'addmodel.becomeabin' })}</Radio>
                <Radio value="预测填充">{intl.formatMessage({ id: 'addmodel.forecast' })}</Radio>
                <Radio value="中位数">{intl.formatMessage({ id: 'addmodel.median' })}</Radio>
                <Radio value="众数">{intl.formatMessage({ id: 'addmodel.mode' })}</Radio>
                <Radio value="自定义">{intl.formatMessage({ id: 'addmodel.custom' })}</Radio>
              </Radio.Group>
              {res[v].missingMethod === '自定义' ? '默认值:' + res[v].default : ''}
            </div>
          ),
        };
        fix.push(x);
      });
      setMissingInfo(arr);
      setMissingFixsingData(fix);
    });
  }
  /**
   * 分箱按钮点击事件
   * 获取分箱信息
   */
  function onBinning() {
    setBinningLoading(true);
    wsCilne.current.getBinner().then((res: any) => {
      const obj: any = JSON.parse(res);
      const arr = new Array<Binning>();
      Object.keys(obj).forEach((k) => {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        const info = {} as Binning;
        info.title = k;
        let iv = 0;
        let woe = 0;
        info.bins = new Array<BinningInfo>();
        for (let i = 0; i < Object.keys(obj[k].bin).length; i++) {
          const bin = {} as BinningInfo;
          bin.bin = bin2String(obj[k].bin[i]);
          bin.woe = obj[k].woe[i];
          bin.iv = obj[k].iv[i];
          iv += bin.iv;
          woe += bin.woe;
          info.bins.push(bin);
        }
        info.iv = iv;
        info.woe = woe;
        arr.push(info);
      });
      setBinning(arr);
      setupLableUsed();
    });
  }
  function setupLableUsed() {
    wsCilne.current.getLableUsed().then((res: any) => {
      const arr = new Map<string, boolean>();
      Object.keys(res).forEach((k) => {
        arr.set(k, res[k]);
      });
      setLableUseMap(arr);
      setBinningLoading(false);
    });
  }
  /**
   * 处理Ylabel change事件、
   * 设置数据中的结果列
   * @param yLable
   */
  function yChange(yLable: string) {
    wsCilne.current.setYlable(yLable).then((_: any) => {
      setYlable(yLable);
      getOdds();
    });
  }

  /**
   * 设置该列是否参与模型生成与使用
   * @param lable
   * @param use
   */
  const setLableUse = (lable: string, use: boolean) => {
    wsCilne.current.useLable(lable, use).then(() => {
      setupLableUsed();
    });
  };
  /**
   * missingInfo、dataType 改变后Hook
   * 将missingInfo（缺失信息）、dataType（数据类型）整合成一个 数组供显示
   */
  useEffect(() => {
    if (missingInfo.length == dataType.length && missingInfo.length > 0) {
      const arr = new Array<Info>();
      for (let i = 0; i < dataType.length; i++) {
        // console.log(missingInfo[i]);
        const a = {
          title: dataType[i].title,
          type: dataType[i].type,
          null: missingInfo[i].nullCount,
          total: missingInfo[i].total,
        } as Info;
        arr.push(a);
      }
      setInfo(arr);
    }
  }, [missingInfo, dataType]);

  function generateModel(value: any) {
    setGenModel(true);
    wsCilne.current.generateModel(value).then(() => {
      getRocAndAuc();
      getParameter()

    });
  }
  /*
    获取默认的Odds ，Odds 一般需要根据经验人为设定
  */
  function getOdds(){
      wsCilne.current.getOdds().then((res:any)=>{
          setModelPreset((per)=>{
              const nper = [...per];
              return nper.map((item)=>{
                  if(item.name == 'odds'){
                    return {...item,value:res/(1-res)};
                  }
                  return item;
              })
          })
      })
  }
  function getRocAndAuc() {
    wsCilne.current.testModel().then((res: any) => {
      const ip = zip(res.fpr, res.tpr);
      const data = ip.map((e) => {
        return { truePositiveRate: e[0], falsePositiveRate: e[1] } as unknown as rocData;
      });
      setHasGenModel(true);
      setRocData(data);
      setRocArea(res.roc_auc);
      setGenModel(false);
    });
  }
  function getParameter(){
    wsCilne.current.getInterceptCoefficient().then((res: any)=>{
      setCoefficient( res.coefficient)
      setIntercept(res.intercept)
    })
  }
  async function saveModel(value: any) {
    const name = value.name;
    await wsCilne.current.saveModel(name);
    refresh();
    resetComponent();
  }

  return (
    <>
      <PageContainer>
        {contextHoler}
        <Layout>
          <Layout>
            <Content>
              <Content>
                <Divider orientation="left">
                  {intl.formatMessage({ id: 'addmodel.setdata' })}
                </Divider>
                <Upload beforeUpload={beforeUpload} accept=".xls,.csv" showUploadList={false}>
                  <Button icon={<UploadOutlined />}>
                    {intl.formatMessage({ id: 'addmodel.setdata.button' })}
                  </Button>
                </Upload>
                <Checkbox
                  defaultChecked={igenoreIndex.current}
                  onChange={(env) => {
                    igenoreIndex.current = env.target.checked;
                  }}
                  id="cbignorefc"
                  style={{ marginLeft: '10px' }}
                >
                  {intl.formatMessage({ id: 'addmodel.ingorefco' })}
                </Checkbox>
                <br />
                <br />
                <Text className="addModel-filename">
                  {currentFile === '' ? (
                    <>
                      {intl.formatMessage({ id: 'addmodel.loading' })}
                      <LoadingOutlined />
                    </>
                  ) : (
                    <>
                      {intl.formatMessage({ id: 'addmodel.setdata.currentfile' })}
                      <Tooltip title={fileDesc}>
                        <span>{currentFile}</span>
                      </Tooltip>
                    </>
                  )}
                </Text>
              </Content>
              <Content>
                <Divider orientation="left">
                  {intl.formatMessage({ id: 'addmodel.descript' })}
                </Divider>
                <Table
                  dataSource={info}
                  columns={infoCol}
                  rowKey={(res) => res.title}
                  size="small"
                />
                <Table dataSource={descript} columns={descriptCol} rowKey={(res) => res.title} />
              </Content>
              <Content>
                <Divider orientation="left">{intl.formatMessage({ id: 'addmodel.null' })}</Divider>
                <Table
                  dataSource={missingFixsingData}
                  columns={missingInfoFormCol}
                  rowKey={(res) => res.title}
                  size="small"
                />
              </Content>
              <Content>
                <Divider orientation="left">{intl.formatMessage({ id: 'addmodel.y' })}</Divider>
                <Text>{intl.formatMessage({ id: 'addmodel.y.select' })}</Text>
                <Select
                  value={yLable}
                  style={{ width: 120 }}
                  onChange={yChange}
                  options={dataType.map((r: { title: any }) => {
                    return { value: r.title, lable: r.title };
                  })}
                />
              </Content>
              <Content>
                <Divider orientation="left">
                  {intl.formatMessage({ id: 'addmodel.binning' })}
                </Divider>
                <Button disabled={!yLable} onClick={onBinning} type="primary">
                  {intl.formatMessage({ id: 'addmodel.binning.binning' })}
                </Button>
                <span> </span>
                <Spin spinning={binningLoading} indicator={<LoadingOutlined />} />
                <div style={{ height: '20px' }} />
                {binning.length === 0 ? (
                  <Empty />
                ) : (
                  <Collapse>
                    {binning.map((b: any) => {
                      return (
                        <Collapse.Panel
                          header={
                            <span>
                              <Text style={{ display: 'inline-block', width: '25%' }}>
                                {intl.formatMessage({
                                  id: 'addmodel.binning.col',
                                  defaultMessage: '列',
                                })}
                                ：{b.title}
                              </Text>
                              <Text style={{ display: 'inline-block', width: '25%' }}>
                                {intl.formatMessage({
                                  id: 'addmodel.binning.iv',
                                  defaultMessage: 'IV值',
                                })}
                                :{b.iv}
                              </Text>
                              <Text style={{ display: 'inline-block', width: '25%' }}>
                                {intl.formatMessage({
                                  id: 'addmodel.binning.woe',
                                  defaultMessage: 'WOE值',
                                })}
                                ：{b.woe}
                              </Text>
                            </span>
                          }
                          extra={
                            <>
                              <Text>{intl.formatMessage({ id: 'admodel.binning.feture' })}</Text>
                              <Switch
                                checkedChildren={
                                  <Text>{intl.formatMessage({ id: 'admodel.binning.use' })}</Text>
                                }
                                unCheckedChildren={
                                  <Text>{intl.formatMessage({ id: 'admodel.binning.unuse' })}</Text>
                                }
                                checked={labbleUseMap.get(b.title)}
                                onClick={() => {
                                  return false;
                                }}
                                onChange={(env: boolean) => {
                                  setLableUse(b.title, env);
                                }}
                              />
                            </>
                          }
                          key={b.title}
                          collapsible={'icon'}
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
                )}
              </Content>
              <Content>
                <Divider orientation="left">
                  {intl.formatMessage({ id: 'addmodel.generatermdoel' })}
                </Divider>
                <Form
                  name="basic"
                  labelCol={{ span: 8 }}
                  wrapperCol={{ span: 16 }}
                  style={{ maxWidth: '80%' }}
                  onFinish={generateModel}
                  autoComplete="off"
                  fields = {modelPreset}
                >
                  <Form.Item
                    label={intl.formatMessage({ id: 'addmodel.generatermdoel.base' })}
                    name="base"
                    rules={[
                      {
                        required: true,
                        message: intl.formatMessage({ id: 'addmodel.generatermdoel.basepro' }),
                      },
                    ]}
                    valuePropName="value"
                  >
                    <InputNumber />
                  </Form.Item>
                  <Form.Item
                    label={intl.formatMessage({ id: 'addmodel.generatermdoel.pdo' })}
                    name="pdo"
                    rules={[
                      {
                        required: true,
                        message: intl.formatMessage({ id: 'addmodel.generatermdoel.pdopro' }),
                      },
                    ]}
                    valuePropName="value"

                  >
                    <InputNumber max={60} min={20}/>
                  </Form.Item>
                  <Form.Item  label={intl.formatMessage({ id: 'addmodel.generatermdoel.odds' })} name='odds' rules={[
                      {
                        required: true,
                        message: intl.formatMessage({ id: 'addmodel.generatermdoel.oddspro' }),
                      },
                    ]} >
                      <InputNumber/>
                  </Form.Item>
                  <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                    <Button type="primary" htmlType="submit" disabled={binning.length === 0}>
                      {intl.formatMessage({ id: 'addmodel.generatermdoel.btn' })}
                    </Button>
                    <Spin spinning={genModeling} />
                  </Form.Item>
                </Form>
              </Content>
            </Content>
            <Content>
              <Divider orientation="left">
                {intl.formatMessage({ id: 'addmodel.prams' })}
              </Divider>
                <Descriptions  bordered >
                    <Descriptions.Item label={intl.formatMessage({ id: 'addmodel.coefficient' })}>{coefficient.join(' , ')}</Descriptions.Item>
                    <Descriptions.Item label={intl.formatMessage({ id: 'addmodel.intercept' })}>{intercept.join(' , ')}</Descriptions.Item>
                </Descriptions>
            </Content>
            <Content>
              <Divider orientation="left">
                {intl.formatMessage({ id: 'addmodel.modelevaluation' })}
              </Divider>
              {hasGenModel ? (
                <>
                  <div style={{ textAlign: 'center' }}>
                    <Text style={{ fontSize: '2em' }}>
                      {intl.formatMessage({ id: 'addmodel.ROC' })}
                    </Text>
                  </div>
                  <Line {...option} data={rocData} />
                </>
              ) : (
                <Empty />
              )}
            </Content>
            <Content>
              <Divider orientation="left">
                {intl.formatMessage({ id: 'addmodel.savemodel' })}
              </Divider>
              <Form
                name="basic"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                style={{ maxWidth: '80%' }}
                onFinish={saveModel}
                autoComplete="off"
                initialValues={{
                  maxscore: '100',
                  minscore: '0',
                }}
              >
                <Form.Item
                  label={intl.formatMessage({ id: 'addmodel.modelname' })}
                  name="name"
                  rules={[
                    {
                      required: true,
                      message: intl.formatMessage({ id: 'addmodel.modelnamepro' }),
                    },
                  ]}
                  valuePropName="value"
                >
                  <Input />
                </Form.Item>
                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                  <Button type="primary" htmlType="submit" disabled={binning.length === 0}>
                    {intl.formatMessage({ id: 'addmodel.savemodel.btn' })}
                  </Button>
                  <Button
                    onClick={() => {
                      resetComponent();
                      wsCilne.current.close();
                    }}
                  >
                    {intl.formatMessage({ id: 'addmodel.reset.btn' })}
                  </Button>
                </Form.Item>
              </Form>
            </Content>
          </Layout>
        </Layout>
      </PageContainer>
    </>
  );
}
