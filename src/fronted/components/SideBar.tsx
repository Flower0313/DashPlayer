import { useLocation, useNavigate } from 'react-router-dom';
import React, { cloneElement, ReactElement } from 'react';
import { cn } from '@/fronted/lib/utils';
import logoLight from '../../../assets/logo-light.png';
import logoDark from '../../../assets/logo-dark.png';
import useFile from '../hooks/useFile';
import useSetting from '@/fronted/hooks/useSetting';
import { Captions, Settings, User, Video } from 'lucide-react';

export interface SideBarProps {
    compact?: boolean;
}

const SideBar = ({ compact }: SideBarProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const videoId = useFile((s) => s.videoId);
    const theme = useSetting((s) => s.values.get('appearance.theme'));
    const item = (
        text: string,
        path: string,
        key: string,
        icon: ReactElement
    ) => {
        return (
            <div
                onMouseDown={() => navigate(path)}
                className={cn(
                    'w-full px-2 flex justify-start items-center gap-2 rounded-xl h-10',
                    location.pathname.includes(key)
                        ? 'bg-stone-50 drop-shadow dark:bg-neutral-600'
                        : 'hover:bg-black/10',
                    compact && 'justify-center'
                )}
            >
                {cloneElement(icon, {
                    className: cn('w-5 h-5 text-yellow-600 text-yellow-500 flex-shrink-0')
                })}
                {!compact && (
                    <div className={cn('text-base text-foreground  truncate w-0 flex-1')}>
                        {text}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={cn('w-full h-full flex flex-col text-black ')}>
            <div
                className={cn(
                    'flex-1 flex items-center justify-center min-h-fit py-10'
                )}
            >
                <img
                    className={cn(
                        'w-24 h-24 user-drag-none',
                        compact && 'w-14 h-14'
                    )}
                    src={theme === 'dark' ? logoDark : logoLight}
                />
            </div>
            <div className={cn('basis-3/4 flex flex-col p-3 gap-1')}>
                {/* {item('Home', '/home', 'home', <HiOutlineHome />)} */}
                {item(
                    'Player',
                    `/player/${videoId}?sideBarAnimation=false`,
                    'player',
                    <Video />
                )}
                {item(
                    'Transcript',
                    '/transcript',
                    'transcript',
                    <Captions />
                )}
                {item(
                    'Split',
                    '/split',
                    'split',
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                         className="lucide lucide-square-split-horizontal">
                        <path d="M8 19H5c-1 0-2-1-2-2V7c0-1 1-2 2-2h3" />
                        <path d="M16 5h3c1 0 2 1 2 2v10c0 1-1 2-2 2h-3" />
                        <line x1="12" x2="12" y1="4" y2="20" />
                    </svg>
                )}
                {item(
                    'Download',
                    '/download',
                    'download',
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                         className="lucide lucide-cloud-download">
                        <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                        <path d="M12 12v9" />
                        <path d="m8 17 4 4 4-4" />
                    </svg>
                )}
                {item('Setting', '/settings', 'settings', <Settings />)}
                {item('About', '/about', 'about', <User />)}
            </div>
        </div>
    );
};

SideBar.defaultProps = {
    compact: false
};

export default SideBar;
