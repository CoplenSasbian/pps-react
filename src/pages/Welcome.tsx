import { PageContainer } from '@ant-design/pro-components';
import { Button, Card, Descriptions, Input, Switch } from 'antd';
import React, { useEffect, useState } from 'react';
import { Link, useIntl, useModel } from 'umi';
import  './Welcome.less';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { updateCurrent } from '@/services/login/login';



const Welcome: React.FC = () => {
  const intl = useIntl();
  const state = useModel('@@initialState')
   function getIntl (id: string) {
      return intl.formatMessage({id});
  }
  const [edit,setEdit] = useState(false);
  const [user,setUser] = useState({} as API.CurrentUser)
  
  useEffect(()=>{
    if(state.initialState?.currentUser)
      setUser(state.initialState?.currentUser);

      console.log(state.initialState?.currentUser)
  },[state.initialState?.currentUser])

  function updateUser(){
    setUser(pre=>{
      return {...pre};
    })
  }
  function toggleChange(){
    setEdit(!edit);
    if(edit)
      updateCurrent(user).then(()=>{state.refresh()}).catch(()=>{
        state.refresh()
      })

  }
  return (
    <PageContainer>
      <Card>
        <div style={{float:'right'}}><Button onClick={toggleChange}>{!edit?getIntl('welcome.edit'):getIntl('welcome.save')}</Button></div>
        <Descriptions title={getIntl('welcome.userinfo')} labelStyle={{lineHeight:'28px'}}>
          <Descriptions.Item label={getIntl('welcome.username')} className='desc-label'>
            { user?.username}
          </Descriptions.Item >
          <Descriptions.Item label="Email" className='desc-label'>
            { edit? <Input value={user.email} onChange={(env)=>{user.email = env.target.value; updateUser()}}/> : user?.email}
          </Descriptions.Item >
          <Descriptions.Item label={getIntl('welcome.name')} className='desc-label'>  
          { edit?<>
            <Input value={user.firstname} placeholder={getIntl('pages.login.firstname')} onChange={(env)=>{user.firstname = env.target.value; updateUser()}}/>-
            <Input value={user.lastname} placeholder={getIntl('pages.login.lastname')}  onChange={(env)=>{user.lastname = env.target.value; updateUser()}}/>
          </> 
          :user?.fullname}
          </Descriptions.Item>
          <Descriptions.Item label={getIntl('welcome.deatjoin')} className='desc-label'> {user?.join_date&& new Date(user?.join_date).toLocaleString()}</Descriptions.Item>
          <Descriptions.Item label={getIntl('welcome.isadmin')} className='desc-label'><span style={{fontSize:'1.3em'}}>{user?.is_superuser?<CheckOutlined />:<CloseOutlined />}</span></Descriptions.Item>
        </Descriptions>
      </Card>
      <br/>
      <Card>
        <h2>{getIntl('welcome.function')}</h2>
        <Link to={'/model/training'}>{getIntl('menu.model.training')}</Link>
      </Card>
    </PageContainer>
  );
};

export default Welcome;
