import React from 'react';
// eslint-disable-next-line import/no-cycle
import { FiPlayCircle } from 'react-icons/fi';
import { BsArrowRepeat } from 'react-icons/bs';
import SentenceT from '../lib/param/SentenceT';

interface SideSentenceNewParam {
    sentence: SentenceT;
    onClick: (sentence: SentenceT) => void;
    isCurrent: boolean;
    isRepeat: boolean;
}

export default function SideSentence({
    sentence,
    onClick,
    isCurrent,
    isRepeat,
}: SideSentenceNewParam) {
    const show = isCurrent ? 'visible' : 'invisible';
    const s = [sentence.text, sentence.textZH, sentence.msTranslate].find(
        (i) => i !== undefined && i !== ''
    );
    return (
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions,jsx-a11y/click-events-have-key-events
        <div
            className="
                m-1.5
                py-2
                border-0
                flex
                content-start
                rounded-lg
                bg-neutral-700
                hover:shadow-inner
                hover:shadow-neutral-500
                hover:bg-neutral-600
                hover:drop-shadow-lg
                text-lg
                drop-shadow
                "
            onClick={() => {
                onClick(sentence);
            }}
        >
            {isRepeat ? (
                <BsArrowRepeat
                    className={` mx-2 w-8 h-8 text-red-600 ${show}`}
                />
            ) : (
                <FiPlayCircle
                    className={`mx-2 p-0.5 w-8 h-8 text-red-600 ${show}`}
                />
            )}
            <div className="w-full text-center">{s ?? ''}</div>
        </div>
    );
}
