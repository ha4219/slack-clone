import { AddButton, Channels, Chats, Header, LogOutButton, MenuScroll, ProfileImg, RightMenu, WorkspaceButton, WorkspaceModal, WorkspaceName, Workspaces, WorkspaceWrapper } from '@layouts/Workspace/styles';
import { IChannel, IUser } from '@typings/db';
import fetcher from '@utils/fetcher';
import axios from 'axios';
import React, { VFC, useCallback, useState, useEffect } from 'react';
import { Link, Redirect, Route, Switch, useParams } from 'react-router-dom';
import useSWR from 'swr';
import gravatar from 'gravatar';
import loadable from '@loadable/component';
import Menu from '@components/Menu';
import Modal from '@components/Modal';
import { Button, Input, Label } from '@pages/Signup/styles';
import useInput from '@hooks/useInput';
import { toast, ToastContainer } from 'react-toastify';
import CreateChannelModal from '@components/CreateChannelModal';
import InviteWorkspaceModal from '@components/InviteWorkspaceModal';
import InviteChannelModal from '@components/InviteChannelModal';
import ChannelList from '@components/ChannelList';
import DMList from '@components/DMList';
import useSocket from '@hooks/useSocket';

const Channel = loadable(() => import('@pages/Channel'));
const DirectMessage = loadable(() => import('@pages/DirectMessage'));

interface Params {
  workspace: string;
};

const Workspace: VFC = () => {
  const {workspace} = useParams<Params>();

  const {data: userData, mutate: revalidateUser } = useSWR<IUser | false>('/api/users/', fetcher);
  const {data: channelData, mutate: revalidateChannel} = useSWR<IChannel[]>(userData ? `/api/workspaces/${workspace}/channels` : null, fetcher);

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCreateWorkspaceModal, setShowCreateWorkSpaceModal] = useState(false);
  const [newWorkspace, setNewWorkspace, onChangeNewWorkspace] = useInput('');
  const [newWorkspaceUrl, setNewWorkspaceUrl, onChangeNewWorkspaceUrl] = useInput('');
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
  const [showInviteWorkspaceModal, setShowInviteWorkspaceModal] = useState(false);
  const [showInviteChannelModal, setShowInviteChannelModal] = useState(false);
  const [socket, disconnect] = useSocket(workspace);

  useEffect(() => {
    if (channelData && userData && socket) {
      socket.emit('login', {id:userData.id, channels: channelData.map((v) => v.id)});
    }
  }, [socket, channelData, userData]);

  useEffect(() => {
    return () => {
      disconnect();
    }
  }, [workspace, disconnect]);

  const onClickUserProfile = useCallback((e) => {
    e.stopPropagation();
    setShowUserMenu(prev => !prev);
  }, []);

  const onLogout = useCallback(() => {
    axios.post('/api/users/logout')
    .then(() => {
      // mutate(false, false);
      revalidateUser();
    });
  }, []);

  const onClickCreateWorkspace = useCallback(() => {
    setShowCreateWorkSpaceModal(prev => !prev);
  }, []);

  const onCloseModal = useCallback(() => {
    setShowCreateWorkSpaceModal(false);
    setShowCreateChannelModal(false);
    setShowInviteChannelModal(false);
    setShowInviteWorkspaceModal(false);
  }, []);

  const onCreateWorkspace = useCallback((e) => {
    e.preventDefault();
    console.warn(newWorkspace, newWorkspaceUrl);
    
    if (!newWorkspace || !newWorkspace.trim()) return;
    if (!newWorkspaceUrl || !newWorkspaceUrl.trim()) return;

    axios.post('/api/workspaces', {
      workspace: newWorkspace,
      url: newWorkspaceUrl,
    },{
      withCredentials: true,
    }).then(() => {
      revalidateUser();
      setShowCreateWorkSpaceModal(false);
      setNewWorkspace('');
      setNewWorkspaceUrl('');
    }).catch((e) => {
      console.dir(e);
      toast.error(e.response?.data, {position: 'bottom-center'});
    });
  }, [newWorkspace, newWorkspaceUrl]);

  const toggleWorkspaceModal = useCallback(() => {    
    setShowWorkspaceModal((prev) => !prev);
  }, []);

  const onClickAddChannel = useCallback(() => {
    setShowCreateChannelModal(true);
  }, []);

  const onClickInviteWorkspace = useCallback(() => {
    setShowInviteWorkspaceModal(true);
  }, []);

  if (userData === false) {
    return <Redirect to="/login" />;
  }

  return (
    <div>
      <Header>
        {userData && (
          <RightMenu>
            <span onClick={onClickUserProfile}>
              <ProfileImg src={gravatar.url(userData.email, { s: '28px', d: 'retro' })} alt={userData.nickname} />
              {showUserMenu && 
                <Menu style={{ right: 0, top:38 }} show={showUserMenu} onCloseModal={onClickUserProfile}>
                  <img src={gravatar.url(userData.email, { s: '36px', d: 'retro' })} alt={userData.nickname} />
                  <div>
                    <span id="profile-name">{userData?.nickname}</span>
                    <span id="profile-active">Active</span>
                  </div>
                  <LogOutButton onClick={onLogout}>logout</LogOutButton>
                </Menu>
              }
            </span>
          </RightMenu>
        )}
      </Header>
      <WorkspaceWrapper>
        <Workspaces>
          {userData?.Workspaces.map(ws => {
            return (
              <Link key={ws.id} to={`/workspace/${ws.id}/channel/일반`}>
                <WorkspaceButton>{ws.name.slice(0,1).toUpperCase()}</WorkspaceButton>
              </Link>
            );
          })}
          <AddButton onClick={onClickCreateWorkspace}>+</AddButton>
        </Workspaces>
        <Channels>
          <WorkspaceName onClick={toggleWorkspaceModal}>
            Slack-Clone
          </WorkspaceName>
          <MenuScroll>
            <Menu style={{top:95, left:80}} show={showWorkspaceModal} onCloseModal={toggleWorkspaceModal}>
              <WorkspaceModal>
                <h2>Slack-Clone</h2>
                <button onClick={onClickInviteWorkspace}>invite user in workspace</button>
                <button onClick={onClickAddChannel}>create channel</button>
                <button onClick={onLogout}>logout</button>
              </WorkspaceModal>
            </Menu>
            <ChannelList/>
            <DMList/>
          </MenuScroll>
        </Channels>
        <Chats>
          <Switch>
            <Route path='/workspace/:workspace/channel/:channel' component={Channel}/>
            <Route path='/workspace/:workspace/dm/:id' component={DirectMessage}/>
          </Switch>
        </Chats>
      </WorkspaceWrapper>
      <Modal show={showCreateWorkspaceModal} onCloseModal={onCloseModal}>
        <form onSubmit={onCreateWorkspace}>
          <Label>
            <span id="workspace-label">
              workspace name
            </span>
            <Input id='workspace' value={newWorkspace} onChange={onChangeNewWorkspace}/>
          </Label>
          <Label id='workspace-url-label'>
            <span>
              workspace url
            </span>
            <Input id='workspace' value={newWorkspaceUrl} onChange={onChangeNewWorkspaceUrl}/>
          </Label>
          <Button type='submit'>Create</Button>
        </form>
      </Modal>
      <CreateChannelModal
        show={showCreateChannelModal}
        onCloseModal={onCloseModal} 
        setShowCreateChannelModal={setShowCreateChannelModal}
      />
      <InviteWorkspaceModal
        show={showInviteWorkspaceModal}
        onCloseModal={onCloseModal}
        setShowInviteWorkspaceModal={setShowInviteWorkspaceModal}
      />
      <InviteChannelModal
        show={showInviteChannelModal}
        onCloseModal={onCloseModal}
        setShowInviteChannelModal={setShowInviteChannelModal}
      />
      <ToastContainer position='bottom-center'/>
    </div>
  );
};

export default Workspace;