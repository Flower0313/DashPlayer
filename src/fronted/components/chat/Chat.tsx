'use client';

import * as React from 'react';
import {cn} from '@/common/utils/Util';
import usePlayerController from '@/fronted/hooks/usePlayerController';
import {motion} from 'framer-motion';
import ChatLeftWords from "@/fronted/components/chat/ChatLeftWords";
import ChatLeftPhrases from "@/fronted/components/chat/ChatLeftPhrases";
import ChatLeftGrammers from "@/fronted/components/chat/ChatLeftGrammers";
import ChatRightSentences from "@/fronted/components/chat/ChatRightSentences";
import ChatCenter from "@/backend/services/ChatCenter";

const Chat = () => {
    const sentenceT = usePlayerController(state => state.currentSentence);

    return (
        <motion.div
            className={cn('fixed top-0 right-0  w-full h-full z-[999] bg-foreground/90')}
            initial={{opacity: 0}}
            animate={{
                opacity: 1,
                transition: {
                    duration: 0.3,
                    type: 'just'
                }
            }}
            exit={{opacity: 0}}
        >
            <motion.div
                className={cn(
                    'focus:outline-none flex flex-col fixed top-[44px] z-[998] right-0 w-full bg-background pb-4 select-text',
                    'border rounded-t-[10px] border-background shadow-lg'
                )}
                style={{
                    height: 'calc(100vh - 44px)'
                }}
                // 从下往上弹出
                initial={{y: '100%'}}
                animate={{
                    y: 0,
                    transition: {
                        duration: 0.3,
                        type: 'just'
                    }
                }}
                exit={{
                    y: '100%',
                    transition: {
                        duration: 0.3,
                        type: 'just'
                    }
                }}
            >
                <div className={cn('grid gap-1.5 p-4 text-center sm:text-left')}>
                    <div className={cn('text-lg font-semibold leading-none tracking-tight')}>Are you absolutely sure?
                    </div>
                    <div className={cn('text-sm text-muted-foreground')}>This action cannot be undone.</div>
                </div>
                <div
                    className={cn('w-full h-0 flex-1 grid gap-10 grid-cols-3 overflow-y-auto')}
                    style={{
                        gridTemplateColumns: '1fr 1.75fr 1fr',
                        gridTemplateRows: '100%'
                    }}
                >
                    <div className={cn('w-full flex overflow-y-auto h-full flex-col gap-4 pl-6 pr-10')}>

                        <ChatLeftWords className={cn('flex-shrink-0')}/>
                        <ChatLeftPhrases className={cn('flex-shrink-0')}/>
                        <ChatLeftGrammers className={cn('flex-shrink-0')}/>
                    </div>
                    <ChatCenter originalSentence={sentenceT} topicSentence={sentenceT?.text} />
                    <div className={cn('w-full flex flex-col gap-4 pr-6 px-10 overflow-y-auto')}>
                        {/*<ChatRightSumary sentenceT={sentence} points={points}*/}
                        {/*                 className={cn('flex-shrink-0', className)}/>*/}
                        <ChatRightSentences className={cn('flex-shrink-0')}/>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

Chat.defaultProps = {
    orientation: 'horizontal',
    className: ''
};

export default Chat;
