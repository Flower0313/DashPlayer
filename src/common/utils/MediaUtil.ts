// ".mp4,.webm,.wav,.srt"

import {strBlank} from "@/common/utils/Util";

export const ACCEPTED_FILE_TYPES = '.mp4,.webm,.wav,.srt,.mp3,.m4a';
export const AudioFormats = ["mp3", "wav", "ogg", "flac", "m4a", "wma", "aac"];
export const VideoFormats = ["mp4", "mkv", "avi", "mov", "wmv", "flv", "webm"];
export const SubtitleFormats = ["srt"];

export default class MediaUtil {
    public static isSrt(path: string): boolean {
        if (strBlank(path)) {
            return false;
        }
        return path.endsWith('.srt');
    }


    public static isVideo(path: string): boolean {
        if (strBlank(path)) {
            return false;
        }
        return path.endsWith('.mp4') || path.endsWith('.webm') || path.endsWith('.wav');
    }

    public static isAudio(path: string): boolean {
        if (strBlank(path)) {
            return false;
        }
        return path.endsWith('.mp3') || path.endsWith('.m4a');
    }
    public static isMedia(path: string): boolean {
        return MediaUtil.isVideo(path) || MediaUtil.isAudio(path);
    }

    public static fileName(path: string): string {
        if (strBlank(path)) {
            return '';
        }
        const fileSeparator = path.lastIndexOf('/') > 0 ? '/' : '\\';
        return path.substring(path.lastIndexOf(fileSeparator) + 1);
    }
}
