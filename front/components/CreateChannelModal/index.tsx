import Modal from '@components/Modal';
import useInput from '@hooks/useInput';
import { Button, Input, Label } from '@pages/Signup/styles';
import { IChannel, IUser } from '@typings/db';
import fetcher from '@utils/fetcher';
import axios from 'axios';
import React, { useCallback, VFC } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import useSWR from 'swr';

interface Props {
  show: boolean;
  onCloseModal: () => void;
  setShowCreateChannelModal: (flag: boolean) => void;
};

interface Params {
  workspace?: string;
};

const CreateChannelModal: VFC<Props> = ({show, onCloseModal, setShowCreateChannelModal}) => {
  const [newChannel, setNewChannel, onChangeNewChannel] = useInput('');
  const {workspace} = useParams<Params>();
  // const { data: userData } = useSWR<IUser | false>('/api/users', fetcher);
  const {data: userData, mutate: revalidateUser } = useSWR<IUser | false>('/api/users/', fetcher);

  const {mutate: revalidateChannel} = useSWR<IChannel[]>(
    userData ? `/api/workspaces/${workspace}/channels` : null,
    fetcher,
  );

  const onCreateChannel = useCallback((e) => {    
    e.preventDefault();
    if (!newChannel || !newChannel.trim()) {
      return;
    }
    axios.post(`/api/workspaces/${workspace}/channels`, {
      name: newChannel,
    }).then(() => {
      revalidateChannel();
      setShowCreateChannelModal(false);
      setNewChannel('');
    }).catch((e) => {
      console.dir(e);
      toast.error(e.response?.data, {position: 'bottom-center'});
    });
  }, [newChannel, revalidateChannel, setNewChannel, setShowCreateChannelModal, workspace]);
  
  if (!show) return null;

  return (
    <Modal show={show} onCloseModal={onCloseModal}>
      <form onSubmit={onCreateChannel}>
        <Label id='channel-label'>
          <span>channel</span>
          <Input id="channel" value={newChannel} onChange={onChangeNewChannel} />
        </Label>
        <Button type='submit'>create</Button>
      </form>
    </Modal>
  );
};

export default CreateChannelModal;