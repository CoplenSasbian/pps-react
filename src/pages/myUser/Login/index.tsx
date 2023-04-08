import { useRef, useState } from 'react';
import './index.less';
import { currentUser, has, has_email, refine } from '@/services/login/api';
import { login, registered } from '@/services/login/login';
import { useHistory, useIntl, useLocation, useModel } from 'umi';
function App() {
  const intl = useIntl();
  const [stept, setStept] = useState(0);
  const [hasUser, setHasUser] = useState(true);
  const [logstate, setLogstate] = useState(true);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [conpassword, setConpassword] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [firstname, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [regMessage, setRegMessage] = useState('');
  const eif = useRef<HTMLIFrameElement>(null);
  const { initialState, setInitialState } = useModel('@@initialState');
  const history = useHistory();
  const heightList = [440, 440, 590, 460];

  async function log_acc() {
    if (username) {
      const res = await has(username);
      if (res.state) {
        setStept(1);
      }

      setHasUser(res.state);
    }
  }

  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();
    if (userInfo) {
      await setInitialState((s: any) => ({
        ...s,
        currentUser: userInfo,
      }));
    }
  };
  async function login_acc() {
    if (username && password) {
      const res = await login(username, password);
      if (res.state) {
        completLogin();
      } else {
        setLogstate(false);
      }
    }
  }
  async function reg_acc() {
    setRegMessage('');
    if (!username.length) {
      setRegMessage(getIntl('pages.login.username.required'));
      return;
    }

    if (!password.length || password.length > 16 || password.length < 6) {
      setRegMessage(getIntl('pages.login.passverify'));
      return;
    }
    if (conpassword != password) {
      setRegMessage(getIntl('pages.login.passncomp'));
      return;
    }
    const eReg = /^\w+@\w+.\w+/;

    if (!email.length || !eReg.test(email)) {
      setRegMessage(getIntl('The message cannot be empty and has a legitimate email address!'));
      return;
    }
    const hu: API.Response<string> = await has(username);
    if (!hu || hu.state == undefined || hu.state) {
      setRegMessage(
        `${getIntl('pages.login.username.placeholder')} ${username} ${getIntl(
          'pages.login.hasreg',
        )}!`,
      );
      return;
    }

    const he: API.Response<string> = await has_email(email);
    if (!he || he.state == undefined || he.state) {
      setRegMessage(getIntl('pages.login.ehasreg'));
      return;
    }
    const reg: API.Response<string> = await registered(username, password, email);
    if (reg.state) {
      setStept(3);
      return;
    }
    setRegMessage(getIntl('pages.login.registfiald') + reg.message);
  }
  async function refine_acc() {
    setRegMessage('');
    if (!firstname.length) {
      setRegMessage(getIntl('pages.login.pleaseenter') + getIntl('pages.login.firstname'));
      return;
    }
    if (!lastName.length) {
      setRegMessage(getIntl('pages.login.pleaseenter') + getIntl('pages.login.lastname'));
      return;
    }
    const refin: API.Response<string> = await refine(username, firstname, lastName);
    if (refin.state) {
      completLogin();
      return;
    }
  }

  async function completLogin() {
    await fetchUserInfo();
    const { query } = history.location;
    const { redirect } = query as { redirect: string };
    history.push(redirect || '/');
  }

  function getIntl(id: string) {
    return intl.formatMessage({ id: id });
  }
  return (
    <>
      <div id="lb" style={{ height: heightList[stept] + 'px', overflow: 'hidden', zIndex: 10001 }}>
        <img id="logo" src="/logo.png" />
        <div className="row-box">
          <div className="displayPlace" style={{ transform: 'translateX(' + stept * -500 + 'px)' }}>
            <div className="pg">
              <p>{getIntl('pages.login.title')}</p>
              {hasUser ? (
                <span style={{ width: '2px', height: '1.5em' }} />
              ) : (
                <span style={{ color: 'red' }}>
                  {getIntl('pages.login.accnexist')}
                  <a
                    href="javascript:void()"
                    onClick={() => {
                      setStept(2);
                    }}
                  >
                    {getIntl('pages.login.getnewacc')}
                  </a>
                  !
                </span>
              )}
              <input
                value={username}
                placeholder={getIntl('pages.login.username.placeholder')}
                type="text"
                onChange={(env) => {
                  setUsername(env.target.value);
                }}
                onKeyDown={(env) => {
                  if (env.key == 'Enter') log_acc();
                }}
              />
              <span>
                {getIntl('pages.login.hsanacc')}
                <a
                  href="javascript:void()"
                  onClick={() => {
                    setStept(2);
                  }}
                >
                  {getIntl('pages.login.regone')}
                </a>
              </span>
              <div>
                <button onClick={log_acc}>{getIntl('pages.login.next')}</button>
              </div>
            </div>
            <div className="pg">
              <p>{getIntl('pages.login.password.placeholder')}</p>
              {logstate ? (
                <span style={{ width: '2px', height: '1.5em' }} />
              ) : (
                <span style={{ color: 'red' }}>
                  {getIntl('pages.login.passerr')}
                  <a
                    href="javascript:void()"
                    onClick={() => {
                      setStept(2);
                    }}
                  >
                    {getIntl('pages.login.findpass')}
                  </a>
                  !
                </span>
              )}
              <input
                value={password}
                placeholder={getIntl('pages.login.password.placeholder')}
                type="password"
                onChange={(env) => {
                  setPassword(env.target.value);
                }}
                onKeyDown={(env) => {
                  if (env.key == 'Enter') login_acc();
                }}
              />
              <span>
                {getIntl('pages.login.forgotPassword')}
                <a
                  href="javascript:void()"
                  onClick={() => {
                    setStept(0);
                  }}
                >
                  {getIntl('pages.login.findpass')}
                </a>
              </span>
              <div>
                <button
                  onClick={() => {
                    setStept(0);
                  }}
                >
                  {getIntl('pages.login.otheracc')}
                </button>
                <button onClick={login_acc}>{getIntl('pages.login.submit')}</button>
              </div>
            </div>
            <div className="pg">
              <p>{getIntl('pages.login.registerAccount')}</p>
              <span style={{ textAlign: 'left', height: '2.5em', color: '#f00' }}>
                {regMessage}
              </span>
              <input
                value={username}
                placeholder={getIntl('pages.login.username.placeholder')}
                type="text"
                onChange={(env) => {
                  setUsername(env.target.value);
                }}
                onKeyDown={(env) => {
                  if (env.key == 'Enter') reg_acc();
                }}
              />
              <input
                value={password}
                placeholder={getIntl('pages.login.password.placeholder')}
                type="password"
                onChange={(env) => {
                  setPassword(env.target.value);
                }}
                onKeyDown={(env) => {
                  if (env.key == 'Enter') reg_acc();
                }}
              />
              <input
                value={conpassword}
                placeholder={getIntl('pages.login.confpass')}
                type="password"
                onChange={(env) => {
                  setConpassword(env.target.value);
                }}
                onKeyDown={(env) => {
                  if (env.key == 'Enter') reg_acc();
                }}
              />
              <input
                value={email}
                placeholder={getIntl('pages.login.emailplace')}
                type="email"
                onChange={(env) => {
                  setEmail(env.target.value);
                }}
                onKeyDown={(env) => {
                  if (env.key == 'Enter') reg_acc();
                }}
              />
              <span>
                {getIntl('pages.login.hasacc')}
                <a
                  href="javascript:void()"
                  onClick={() => {
                    setStept(0);
                  }}
                >
                  {getIntl('pages.login.submit')}!
                </a>
              </span>
              <div>
                <button onClick={reg_acc}>{getIntl('pages.login.next')}</button>
              </div>
            </div>
            <div className="pg">
              <p>{getIntl('pages.login.refine')}</p>
              <span style={{ textAlign: 'left', height: '1.5em', color: '#f00' }}>
                {regMessage}
              </span>
              <input
                value={firstname}
                placeholder={getIntl('pages.login.firstname')}
                type="text"
                onChange={(env) => {
                  setFirstName(env.target.value);
                }}
                onKeyDown={(env) => {
                  if (env.key == 'Enter') refine_acc();
                }}
              />
              <input
                value={lastName}
                placeholder={getIntl('pages.login.lastname')}
                type="text"
                onChange={(env) => {
                  setLastName(env.target.value);
                }}
                onKeyDown={(env) => {
                  if (env.key == 'Enter') refine_acc();
                }}
              />
              <div>
                <button onClick={refine_acc}>{getIntl('pages.login.complete')}</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        id="bg"
        style={{
          background: 'url(https://baotangguo.cn:8081/) no-repeat center center',
          backgroundSize: '100%',
          zIndex: '1000',
        }}
      />
    </>
  );
}

export default App;
