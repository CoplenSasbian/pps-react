import { useRef, useEffect, useState } from 'react';
import './index.less';
import { Select } from 'antd';
import { useIntl } from 'umi';
interface Props {
  data: any[];
  dataType: DataType[];
  ylable?: string;
  onchange?: (map: Map<string, string>) => void;
}

export const ImportDataMapping: React.FC<Props> = ({ data, dataType, ylable, onchange }) => {
  // const [dataKey, setDataKey] = useState(new Array<string>());
  const columMap = useRef(new Map<string, string>());
  const intl = useIntl();
  const dataKey = Object.keys(data[0]);
  useEffect(() => {
    dataType.forEach((item) => {
      columMap.current.set(item.title, dataKey.includes(item.title) ? item.title : '');
    });
    if (onchange) onchange(columMap.current);
  }, []);
  return (
    <>
      <div className="container">
        {dataType
          .filter((it) => it.title !== ylable)
          .map((item) => {
            return (
              <div key={item.title} className="select-row">
                <label htmlFor={'sel' + item.title}>{item.title}</label>
                <Select
                  className="select"
                  id={'sel' + item.title}
                  onChange={(env: string) => {
                    columMap.current.set(item.title, env);
                    if (onchange) onchange(columMap.current);
                  }}
                  defaultValue={dataKey.includes(item.title) ? item.title : ''}
                  options={[
                    {
                      label: `(${intl.formatMessage({ id: 'sd.empty' })})`,
                      value: '',
                    },
                  ].concat(
                    dataKey.map((key) => {
                      return {
                        label: key,
                        value: key,
                      };
                    }),
                  )}
                />
              </div>
            );
          })}
      </div>
    </>
  );
};
