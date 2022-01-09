import React, { useCallback, useEffect, useRef } from 'react';
import { Container, Header } from './styles';
import gravatar from 'gravatar';
import useSWR from 'swr';
import fetcher from '@utils/fetcher';
import { useParams } from 'react-router-dom';
import ChatList from '@components/ChatList';
import ChatBox from '@components/ChatBox';
import useInput from '@hooks/useInput';
import axios from 'axios';
import { IDM } from '@typings/db';
import makeSection from '@utils/makeSection';
import useSWRInfinite from 'swr/infinite';
import Scrollbars from 'react-custom-scrollbars-2';
import useSocket from '@hooks/useSocket';

const PAGE_SIZE = 20;

const DirectMessage = () => {
  const { workspace, id } = useParams<{ workspace: string; id: string }>();
  const { data: userData } = useSWR(`/api/workspaces/${workspace}/users/${id}`, fetcher);
  const {data: myData} = useSWR('/api/users', fetcher);
  const [chat, setChat, onChangeChat] = useInput('');
  const scrollbarRef = useRef<Scrollbars>(null);
  const {data: chatData, mutate: mutateChat, setSize} = useSWRInfinite<IDM[]>(
    (index) => `/api/workspaces/${workspace}/dms/${id}/chats?perPage=${PAGE_SIZE}&page=${index + 1}`,
    fetcher
  );
  const [socket] = useSocket(workspace);

  const isEmpty = chatData?.[0]?.length === 0;
  const isReachingEnd = isEmpty || (chatData && chatData[chatData.length - 1]?.length < PAGE_SIZE);
  const onSubmitForm = useCallback((e) => {
    e.preventDefault();
    if (chat?.trim() && chatData) {
      const savedChat = chat;
      mutateChat((prevChatData) => {
        prevChatData?.[0].unshift({
          id: (chatData[0][0]?.id || 0) + 1,
          content: savedChat,
          SenderId: myData.id,
          Sender: myData,
          ReceiverId: userData.id,
          Receiver: userData,
          createdAt: new Date(),
        });
        return prevChatData;
      }, false)
      .then(() => {
        setChat('');
        scrollbarRef.current?.scrollToBottom();
      })
      axios.post(`/api/workspaces/${workspace}/dms/${id}/chats`, {
        content: chat,
      })
      .catch(console.error);
    }
    setChat('');
  }, [chat, chatData, myData, userData, workspace, id]);

  useEffect(() => {
    if (chatData?.length === 1) {
      scrollbarRef.current?.scrollToBottom();
    }
  }, [chatData]);

  const onMessage = useCallback((data: IDM) => {
    if (data.SenderId === Number(id) && myData.id !== Number(id)) {
      mutateChat((chatData) => {
        chatData?.[0].unshift(data);
        return chatData;
      }, false).then(() => {
        if (scrollbarRef.current) {
          if (scrollbarRef.current.getScrollHeight() < scrollbarRef.current.getClientHeight() + scrollbarRef.current.getScrollTop() + 150
          ) {
            setTimeout(() => {
              scrollbarRef.current?.scrollToBottom();
            }, 100);
          }
        }
      })
    }
  }, []);

  useEffect(() => {
    socket?.on('dm', onMessage);
    return () => {
      socket?.off('dm', onMessage);
    };
  }, [socket, onMessage]);

  if (!userData || !myData) {
    return null;
  }

  const chatSections = makeSection(chatData ? ([] as IDM[]).concat(...chatData).reverse() : []);
  
  return (
    <Container>
      <Header>
        <img src={gravatar.url(userData.email, {s:'24px', d:'retro'})} alt={userData.nickname}/>
        <span>{userData.nickname}</span>
      </Header>
      <ChatList chatSections={chatSections} scrollbarRef={scrollbarRef} isEmpty={isEmpty} isReachingEnd={isReachingEnd} setSize={setSize}/>
      <ChatBox chat={chat} onChangeChat={onChangeChat} onSubmitForm={onSubmitForm} data={[]}/>
    </Container>
  );
};

export default DirectMessage;