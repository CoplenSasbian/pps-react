import { QuestionCircleOutlined } from '@ant-design/icons';
import { Space } from 'antd';
import React, { ReactNode, useEffect, useState } from 'react';
import { SelectLang, history, useModel } from 'umi';
import HeaderSearch from '../HeaderSearch';
import Avatar from './AvatarDropdown';
import styles from './index.less';
import { DefaultOptionType } from 'antd/lib/select';
import { useIntl } from 'umi';
import { base64Encode } from '@/services/utils';

export type SiderTheme = 'light' | 'dark';

const GlobalHeaderRight: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const [option,setOpetion] = useState(new Array<DefaultOptionType>())
  const intl = useIntl()

  useEffect(()=>{
    const opt: DefaultOptionType[] =
    [
      { label: <a href="https://github.com/CoplenSasbian">{intl.formatMessage({id:'app.github.repository'})}</a>, value:intl.formatMessage({id:'app.github.repository'})  },
      {
        label: <a href="https://github.com/CoplenSasbian/pps-react">{intl.formatMessage({id:'app.github.fornt'})}</a>,
        value: intl.formatMessage({id:'app.github.fornt'}),
      },
      {
        label: <a href="https://github.com/CoplenSasbian/pps-django">{intl.formatMessage({id:'app.github.back'})}</a>,
        value: intl.formatMessage({id:'app.github.back'}),
      },
      {
        label: <a  onClick={()=>{history.push('/model/training')}}>{intl.formatMessage({id:'menu.model.training'})}</a>,
        value: intl.formatMessage({id:'menu.model.training'}),
      },
    ]
    
    for (let i=0;i< localStorage.length;i++){
        const key = localStorage.key(i)
        if(key?.startsWith('result-')){
          const it = {
            value:key,
            label:<a onClick={()=>{history.push('/result/show/'+base64Encode(key))}}>{intl.formatMessage({id:'menu.result'})}:{key.replace('result-','')}</a>
          } as DefaultOptionType;
          opt.push(it)
        }
    }

    setOpetion(() => {
      let newOpt: DefaultOptionType[] = [];
      const modelOpt = initialState?.modelList?.map(item=>{return {value:"model"+item.fields.name,label:<a onClick={()=>{history.push(`/model/show/${item.pk}`)}} >{intl.formatMessage({id:'menu.model'})}:{item.fields.name}</a>} as DefaultOptionType;} );
      const dataOpt = initialState?.modelList?.map(item=>{return {value:"data"+item.fields.name,label:<a onClick={()=>{history.push(`/data/show/${item.pk}`)}} >{intl.formatMessage({id:'menu.data'})}:{item.fields.name}</a>} as DefaultOptionType;} );
      if(modelOpt){
        newOpt = newOpt.concat(modelOpt);
      }
      if(dataOpt){
        newOpt = newOpt.concat(dataOpt);
      }
      newOpt = newOpt.concat(opt);
      return newOpt;
    })
  },[initialState?.modelList, intl])

  if (!initialState || !initialState.settings) {
    return null;
  }

  const { navTheme, layout } = initialState.settings;
  let className = styles.right;

  if ((navTheme === 'dark' && layout === 'top') || layout === 'mix') {
    className = `${styles.right}  ${styles.dark}`;
  }

  
  return (
    <Space className={className}>
      <HeaderSearch
        className={`${styles.action} ${styles.search}`}
        placeholder="Search"
        
        options={option}
        onChange={(env)=>{
          option.forEach(item=>{
            if(item.value === env ){
              const a: any = item.label;
              if(a?.props?.href){
                location.href = a?.props?.href
              }else if(a.props.onClick){
                
                  a.props.onClick()
              }
            }
          })
        }}
      />
      <span
        className={styles.action}
        onClick={() => {
          window.open('https://pro.ant.design/docs/getting-started');
        }}
      >
        <QuestionCircleOutlined />
      </span>
      <Avatar />
      <SelectLang className={styles.action} />
    </Space>
  );
};
export default GlobalHeaderRight;
