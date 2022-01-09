import Chat from '@components/Chat';
import { IChat, IDM } from '@typings/db';
import React, { RefObject, useCallback, useRef, VFC } from 'react';
import { ChatZone, Section, StickyHeader } from './styles';
import {Scrollbars} from 'react-custom-scrollbars-2';

interface Props {
  chatSections: { [key: string]: (IDM)[] };
  setSize: (f: (size: number) => number) => Promise<(IDM)[][] | undefined>;
  isEmpty: boolean;
  isReachingEnd?: boolean;
  scrollbarRef: RefObject<Scrollbars>;
};

const ChatList: VFC<Props> = ({chatSections, setSize, isEmpty, isReachingEnd, scrollbarRef}) => {
  const onScroll = useCallback((values) => {
    if (values.scrollTop === 0 && !isReachingEnd) {
      setSize((prevSize) => prevSize + 1).then(() => {
        if (scrollbarRef?.current) {
          scrollbarRef.current?.scrollTop(scrollbarRef.current?.getScrollHeight() - values.crollHeight);
        }
      });
    }
  }, []);

  return (
    <ChatZone>
      <Scrollbars autoHide ref={scrollbarRef} onScrollFrame={onScroll}>
        {Object.entries(chatSections).map(([date, chats]) => {
          return (
            <Section className={`section-${date}`} key={date}>
              <StickyHeader>
                <button>{date}</button>
              </StickyHeader>
              {chats.map((chat) => (
                <Chat key={chat.id} data={chat}/>
              ))}
            </Section>
          );
        })}
      </Scrollbars>
    </ChatZone>
  );
};

export default ChatList;