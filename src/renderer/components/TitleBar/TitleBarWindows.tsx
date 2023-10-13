import React from 'react';
import { HiOutlineMenu } from 'react-icons/hi';
import {
    VscChromeClose,
    VscChromeMaximize,
    VscChromeMinimize,
    VscChromeRestore,
} from 'react-icons/vsc';
import useSystem from '../../hooks/useSystem';

export interface TitleBarWindowsProps {
    hasSubtitle?: boolean;
    title?: string;
    maximizable?: boolean;
    className?: string;
    buttonClassName?: string;
    hasSettings?: boolean;
}

const api = window.electron;

const TitleBarWindows = ({
    title,
    hasSubtitle,
    maximizable,
    className,
    buttonClassName,
    hasSettings,
}: TitleBarWindowsProps) => {
    const windowState = useSystem((s) => s.windowState);
    const setWindowState = useSystem((s) => s.setWindowState);

    const maximize = () => {
        setWindowState('maximized');
    };

    const unMaximize = () => {
        setWindowState('normal');
    };

    const onMinimize = async () => {
        setWindowState('minimized');
    };

    const onClose = async () => {
        setWindowState('closed');
    };

    const onMenu = async () => {
        await api.openMenu();
    };

    return (
        <div
            className={`select-none w-full drag h-6 flex justify-between items-center text-titlebarText gap-x-2 drop-shadow ${className}`}
        >
            {hasSettings && (
                <HiOutlineMenu
                    className={`no-drag w-6 h-6 p-1 ${buttonClassName}`}
                    onClick={onMenu}
                />
            )}
            <div>{title}</div>
            <div className="no-drag flex h-full justify-center items-center">
                <VscChromeMinimize
                    className={` w-6 h-6 p-1 ${buttonClassName}`}
                    onClick={onMinimize}
                />
                {maximizable && windowState === 'maximized' && (
                    <VscChromeRestore
                        className={` w-6 h-6 p-1 ${buttonClassName}`}
                        onClick={unMaximize}
                    />
                )}
                {maximizable && !(windowState === 'maximized') && (
                    <VscChromeMaximize
                        className={` w-6 h-6 p-1 ${buttonClassName}`}
                        onClick={maximize}
                    />
                )}

                <VscChromeClose
                    className={` w-6 h-6 p-1 ${buttonClassName}`}
                    onClick={onClose}
                />
            </div>
            {hasSubtitle && (
                <>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 1 1"
                        className="absolute top-0 right-0 w-1 h-1 fill-scrollbarTrack -translate-x-2 translate-y-6 rotate-180"
                    >
                        <path d="M 0 0 L 0 1 L 1 1 C 0 1 0 0 0 0 Z" />
                    </svg>
                </>
            )}
        </div>
    );
};

TitleBarWindows.defaultProps = {
    hasSubtitle: false,
    maximizable: true,
    title: '',
    className: '',
    buttonClassName: '',
    hasSettings: true,
};
export default TitleBarWindows;