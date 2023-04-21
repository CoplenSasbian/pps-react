import { useModel } from 'umi';
import { useEffect, useRef, useState } from 'react';
import { getDetail } from '@/services/model/http';
import { history, useIntl } from 'umi';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { addDatas, dataToJson, getData, pridictData } from '@/services/data/http';
import type { SortOrder } from 'antd/lib/table/interface';
import {
  Badge,
  Button,
  Form,
  Input,
  Modal,
  Spin,
  Table,
  Upload,
  message,
  notification,
} from 'antd';
import { addData } from '@/services/data/http';

import './index.less';
import type { RcFile } from 'antd/lib/upload';
import { ImportDataMapping } from '../ImportDataMapping';
import { DatabaseOutlined, LoadingOutlined } from '@ant-design/icons';
import { base64Encode } from '@/services/utils';
type ShowDataProc = {
  modelId: number;
};

const ShowData: React.FC<ShowDataProc> = ({ modelId }) => {
  const intl = useIntl();
  const { model } = useModel(
    'ModelData',
    (ret: { model: Map<number, API.Model>; addModels: any }) => {
      return {
        model: ret.model,
        // addModel: ret.addModels,
      };
    },
  );
  const modelInfo = useRef<API.Model>();
  const datatype = useRef(new Array<DataType>());
  const [tableCol, setTableCol] = useState(new Array<ProColumns<any>>());
  const [pageCount, setPageCount] = useState(0);
  const [messageApi, messageCtx] = message.useMessage();
  const [addForm] = Form.useForm();
  const nullable = useRef(new Map<string, boolean>());
  const [data, setData] = useState(new Array<any>());
  const [importOpen, setImportOpen] = useState(false);
  const mappingMap = useRef(new Map<string, string>());
  const [importing, setImporting] = useState(false);
  const missingInfo = useRef(new Array<MIssingInfo>());
  const tableAction = useRef<ActionType>();

  const [selectOpen, setSelectOpen] = useState(false);
  const [selectTableCol, setSelectTableCol] = useState(new Array<any>());
  const { selectRowMap, addRow, deleteRow, removeAll } = useModel('useMultiSelectRowMap');
  const [noticApi, contextHolder] = notification.useNotification();
  const pageData = useRef(new Array<any>());
  const { refresh } = useModel('@@initialState');
  useEffect(() => {
    if (model.has(modelId)) {
      modelInfo.current = model.get(modelId);
      setupInfo();
      return;
    }
    getDetail(modelId)
      .then((res) => {
        modelInfo.current = res[0].fields;
        setupInfo();
      })
      .catch(() => {
        history.replace('/404');
      });
  }, [model]);

  function setupInfo() {
    setupDataType();
    setupTableCol();
    setupNullable();
    setupMissing();
  }
  function setupMissing() {
    const describe = JSON.parse(modelInfo.current?.missing_info);
    const arr = new Array<MIssingInfo>();
    Object.keys(describe).forEach((k) => {
      const d = {
        title: k,
        ...describe[k],
      };
      arr.push(d);
    });
    missingInfo.current = arr;
  }
  function setupNullable() {
    const missing: any = JSON.parse(modelInfo.current?.missing_info);
    // console.log(missing);

    Object.keys(missing).forEach((k) => {
      let n = false;
      const miss: MIssingInfo = missing[k];
      n = miss.nullCount > 0 && miss.missingMethod == '自成分箱';
      nullable.current.set(k, n);
    });
  }
  function setupTableCol() {
    const arr = new Array<ProColumns<any>>();
    const arr2 = new Array<any>();
    datatype.current
      .filter((i) => i.title != modelInfo.current?.ylable)
      .forEach((v) => {
        const app: ProColumns<any> = {
          title: v.title + '(' + v.type + ')',
          dataIndex: v.title,
          sorter: true,
          filters: true,
        };
        const selTal = {
          title: v.title,
          dataIndex: v.title,
        };
        arr2.push(selTal);
        arr.push(app);
      });

    arr2.push({
      title: intl.formatMessage({ id: 'sd.option' }),
      render: (row: any) => {
        return (
          <Button
            type="link"
            onClick={() => {
              deleteRow(modelId, row);
            }}
          >
            {intl.formatMessage({ id: 'sd.deleterow' })}
          </Button>
        );
      },
    });

    arr.push({
      title: intl.formatMessage({ id: 'sd.option' }),
      key: 'option',
      render: (row: any) => {
        return (
          <>
            <Button
              type="link"
              onClick={() => {
                addRow(
                  modelId,
                  row,
                  () => {
                    let str = '';
                    Object.keys(row).forEach((k) => {
                      str += row[k] + ' ';
                    });
                    noticApi.success({
                      message: intl.formatMessage({ id: 'sd.addsucc' }),
                      description: str,
                      key: str,
                    });
                  },
                  () => {
                    messageApi.error(intl.formatMessage({ id: 'sd.currentrowexitx' }));
                  },
                );
              }}
            >
              {intl.formatMessage({ id: 'sd.selectrow' })}
            </Button>
          </>
        );
      },
    });
    setTableCol(arr);
    setSelectTableCol(arr2);
  }
  function setupDataType() {
    const describe = JSON.parse(modelInfo.current?.data_type);
    const arr = new Array<DataType>();
    Object.keys(describe).forEach((k) => {
      const d = {
        title: k,
        type: describe[k],
      };
      arr.push(d);
    });
    datatype.current = arr;
  }

  function requestData(
    params: any,
    sorter: Record<string, SortOrder>,
    _filter: Record<string, any>,
  ) {
    // console.log(params, sorter, filter);
    const sort = {
      col: Object.keys(sorter)[0],
      type: sorter[Object.keys(sorter)[0]],
    };
    const nf = new Array<{ col: string; value: string }>();
    Object.keys(params)
      .filter((k) => !['current', 'pageSize'].includes(k))
      .map((k) => {
        nf.push({
          col: k,
          value: params[k],
        });
      });
    const queryData = {
      modelId,
      ...{ pagenum: params.current, pageSize: params.pageSize },
      ...sort,
      filter: nf,
    };

    // return new Promise<any>((rs) => {
    //   rs([]);
    // });
    const Rowres = getData(modelId, queryData)
      .then((res) => {
        setPageCount(res.count);
        const rowData: any[] = res.data.map((item: any) => item.fields);
        return rowData;
      })
      .then((res) => {
        pageData.current = res;
        return {
          data: res,
          success: true,
        };
      });
    Rowres.catch(() => {
      messageApi.error(intl.formatMessage({ id: 'sd.errorpram' }));
    });

    return Rowres;
  }

  function add(value: any) {
    addData(modelId, value)
      .then((res) => {
        if (res === 'Success') {
          messageApi.success('👌');
          addForm.resetFields();
          tableReflush();
        } else {
          messageApi.error(res + '😣');
        }
      })
      .catch((err) => {
        messageApi.error(err + '');
      });
  }

  function uploadFile(file: RcFile, _fileList: RcFile[]) {
    const filereader = new FileReader();
    filereader.addEventListener('load', () => {
      if (filereader.result && typeof filereader.result == 'string') {
        setImporting(true);
        let dataType = '';
        if (file.type == 'application/vnd.ms-excel') {
          dataType = 'xls';
        } else if (file.type == 'text/csv') {
          dataType = 'csv';
        } else {
          messageApi.error('Unknow file type :' + file.type);
          return false;
        }

        dataToJson(filereader.result, dataType).then((res) => {
          const layble = Object.keys(res);
          const length = Object.keys(res[layble[0]]).length;
          // console.log(layble, res[layble[0]]);
          const arr = new Array<any>();
          for (let index = 0; index < length; index++) {
            const row = {};
            for (const k of layble) {
              row[k] = res[k][index];
            }
            // console.log(row);
            arr.push(row);
          }
          setData(arr);
          setImportOpen(true);
          setImporting(false);
        });
      }
    });
    filereader.readAsDataURL(file);
    return false;
  }

  function conformMapping() {
    let flag = true;
    datatype.current.forEach((item) => {
      if(item.title === modelInfo.current?.ylable)return;
      const i = mappingMap.current.get(item.title);
      if (i == undefined || i.length == 0) {
        const index = missingInfo.current.at(
          missingInfo.current.findIndex((miss) => miss.title === item.title),
        );
        if (index?.missingMethod !== '自成分箱' || index?.nullCount === 0) {
          flag = false;
          messageApi.error(item.title + intl.formatMessage({ id: 'sd.notmatch' }));
        }
      }
    });
    if (flag) {
      const arr = new Array<any>();
      data.map((item) => {
        const obj = {};
        datatype.current.forEach((feild) => {
          const mapKey = mappingMap.current.get(feild.title);
          if (mapKey) obj[feild.title] = item[mapKey];
        });
        arr.push(obj);
      });
      addDatas(modelId, arr)
        .then(() => {
          messageApi.success('Data insertion successful!👌');
          setImportOpen(false);
          tableReflush();
        })
        .catch((err) => {
          messageApi.error('Data insertion failed!' + err + '😣');
        });
    }
  }
  function tableReflush() {
    tableAction.current?.reload();
  }

  function showSelect() {
    setSelectOpen(true);
  }
  function perdict() {
    const  rows = selectRowMap.get(modelId)
    if(rows)
    pridictData(modelId, rows).then((res) => {
      const name =  'result-' + modelInfo.current?.name + '-' + new Date().toLocaleString();
      localStorage.setItem(
       name,
        JSON.stringify({
          ...res,
          modelId,
          base_score:modelInfo.current?.base_score,
          pdo_score:modelInfo.current?.pdo_score,
          useLable:modelInfo.current?.lable_use,
          odds:modelInfo.current?.odds,
        }),
      );
      setSelectOpen(false);
      refresh();
      history.push("/result/show/"+base64Encode(name))
    });
  }
  function addCurrentpage() {
    let succ = 0,
      failed = 0;
    pageData.current.forEach((e) => {
      addRow(
        modelId,
        e,
        () => {
          succ += 1;
        },
        () => {
          failed += 1;
        },
      );
    });
    setTimeout(() => {
      const des = `${intl.formatMessage({ id: 'sm.success' })}: ${succ}     ${intl.formatMessage({
        id: 'sm.failed',
      })}: ${failed}`;
      noticApi.info({
        message: intl.formatMessage({ id: 'sd.optioncmp' }),
        description: des,
        key: new Date().getUTCMilliseconds() + '',
      });
    }, 200);
  }
  return (
    <>
      {messageCtx}
      {contextHolder}
      <ProTable<any>
        toolBarRender={() => {
          return (
            <>
              <Badge count={selectRowMap.get(modelId)?.length} overflowCount={999}>
                <Button onClick={showSelect}>
                  <DatabaseOutlined />
                </Button>
              </Badge>
              <Button onClick={addCurrentpage}>
                {intl.formatMessage({ id: 'sd.addcurrentpage' })}
              </Button>
            </>
          );
        }}
        columns={tableCol}
        request={requestData}
        pagination={{ total: pageCount }}
        actionRef={tableAction}
        rowKey={(row: any) => {
          return JSON.stringify(row);
        }}
      />
      <div className="container">
        <Form
          form={addForm}
          name={modelInfo.current?.name}
          labelCol={{ span: 3 }}
          wrapperCol={{ span: 14 }}
          onFinish={add}

          // autoComplete="off"
        >
          {datatype.current
            .filter((res) => res.title !== modelInfo.current?.ylable)
            .map((d) => {
              return (
                <Form.Item
                  label={`${d.title}(${d.type})`}
                  key={d.title}
                  name={d.title}
                  required={!nullable.current.get(d.title)}
                >
                  <Input type={d.type} />
                </Form.Item>
              );
            })}
          <Form.Item
            label={intl.formatMessage({ id: 'sd.add' })}
            wrapperCol={{ offset: 6, span: 16 }}
          >
            <Button type="primary" htmlType="submit">
              {intl.formatMessage({ id: 'sd.addbtn' })}
            </Button>
            <Button
              htmlType="reset"
              onClick={() => {
                addForm.resetFields();
              }}
            >
              {intl.formatMessage({ id: 'sd.resetbtn' })}
            </Button>
            <Upload accept=".csv,.xls" beforeUpload={uploadFile} showUploadList={false}>
              <Button type="primary" danger>
                {intl.formatMessage({ id: 'sd.bulkimport' })}
                {importing && <LoadingOutlined spin />}
              </Button>
            </Upload>
          </Form.Item>
        </Form>
      </div>
      <Modal
        open={importOpen}
        // destroyOnClose={true}
        onCancel={() => {
          setImportOpen(false);
        }}
        onOk={conformMapping}
      >
        <ImportDataMapping
          data={data}
          dataType={datatype.current}
          ylable={modelInfo.current?.ylable}
          onchange={(map) => {
            mappingMap.current = map;
          }}
        />
      </Modal>
      <Modal
        open={selectOpen}
        cancelText=""
        onCancel={() => setSelectOpen(false)}
        footer={<></>}
        width={1000}
        // destroyOnClose={true}
      >
        <h3>{intl.formatMessage({ id: 'sm.waitlist' })}</h3>
        <Table
          columns={selectTableCol}
          dataSource={selectRowMap.get(modelId)}
          size="small"
          rowKey={(row) => {
            return JSON.stringify(Object.values(row));
          }}
        />
        <div>
          <Button type="primary" onClick={perdict}>
            {intl.formatMessage({ id: 'sd.perdict' })}
          </Button>
          <Button
            type="primary"
            danger
            onClick={() => {
              removeAll(modelId);
            }}
          >
            {intl.formatMessage({ id: 'sd.removeall' })}
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default ShowData;
