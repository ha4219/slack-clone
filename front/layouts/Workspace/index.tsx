import { Channels, Chats, Header, MenuScroll, ProfileImg, RightMenu, WorkspaceName, Workspaces, WorkspaceWrapper } from '@layouts/Workspace/styles';
import { IUser } from '@typings/db';
import fetcher from '@utils/fetcher';
import axios from 'axios';
import React, { FC, useCallback, useState } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import useSWR from 'swr';
import gravatar from 'gravatar';
import loadable from '@loadable/component';
import Menu from '@components/Menu';

const Channel = loadable(() => import('@pages/Channel'));
const DirectMessage = loadable(() => import('@pages/DirectMessage'));


const Workspace: FC = ({children}) => {
  const {data: userData, mutate: revalidateUser } = useSWR<IUser | false>('/api/users/', fetcher);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const onClickUserProfile = useCallback(() => {
    setShowUserMenu(prev => !prev);
  }, []);

  const onLogout = useCallback(() => {
    axios.post('/api/users/logout')
    .then(() => {
      // mutate(false, false);
      revalidateUser();
    });
  }, []);

  if (userData === false) {
    return <Redirect to="/login" />;
  }

  return (
    <div>
      <Header>
        <RightMenu>
          <span onClick={onClickUserProfile}>
            icon
            {/* <ProfileImg src={gravatar.url(userData.email, { s: '28px', d: 'retro' })} alt={userData.nickname} /> */}
            {showUserMenu && 
              <Menu style={{ right: 0, top:38 }} show={showUserMenu} onCloseModal={onClickUserProfile}>
                profile menu
              </Menu>
            }
          </span>
        </RightMenu>
      </Header>
      <button onClick={onLogout}>로그아웃</button>
      <WorkspaceWrapper>
        <Workspaces>
          test
        </Workspaces>
        <Channels>
          <WorkspaceName>
            Slack-Clone
          </WorkspaceName>
          <MenuScroll>
            <ul>hi</ul>
          </MenuScroll>
        </Channels>
        <Chats>
          <Switch>
            <Route path='/workspace/channel' component={Channel}/>
            <Route path='/workspace/dm' component={DirectMessage}/>
          </Switch>
        </Chats>
      </WorkspaceWrapper>
      {children}
    </div>
  );
};

export default Workspace;