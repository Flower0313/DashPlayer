import { spawn } from 'child_process';
import DpTaskService from '@/backend/services/DpTaskService';
import { DpTaskState } from '@/backend/db/tables/dpTask';
import LocationService from '@/backend/services/LocationService';
import { DlProgress } from '@/common/types/dl-progress';
import iconv from 'iconv-lite';
import path from 'path';
import fs from 'fs';
import FfmpegService from '@/backend/services/FfmpegService';
import ProcessService from '@/backend/services/ProcessService';
import SystemService from '@/backend/services/SystemService';

export default class DlVideoService {
    public static async dlVideo(taskId: number, url: string, savePath: string) {
        const result: {
            ref: DlProgress
            so: string[]
        } = {
            ref: {
                name: '',
                progress: 0,
                stdOut: ''
            },
            so: []
        };
        result.so.push(`System: downloading video from ${url}`);
        result.ref.stdOut = result.so.join('\n');
        DpTaskService.update({
            id: taskId,
            status: DpTaskState.IN_PROGRESS,
            progress: '正在下载',
            result: JSON.stringify(result.ref)
        });
        try {
            const vName = await DlVideoService.doDlVideoFileName(taskId, result, url)
                .then((name) => {
                    result.ref.name = path.basename(name, path.extname(name)) + '.mp4';
                    return name;
                });
            await DlVideoService.doDlVideo(taskId, result, url, savePath);
            if (!vName.endsWith('.mp4')) {
                const vPath = path.join(savePath, vName);
                if (fs.existsSync(vPath)) {
                    result.so.push('System: converting video to mp4');
                    result.ref.stdOut = result.so.join('\n');
                    DpTaskService.update({
                        id: taskId,
                        status: DpTaskState.IN_PROGRESS,
                        progress: '正在转换',
                        result: JSON.stringify(result.ref)
                    });
                    await FfmpegService.toMp4({
                        inputFile: vPath,
                        onProgress: (progress) => {
                            result.ref.progress = progress;
                            result.so.push(`System: converting video to mp4 ${progress}%`);
                            result.ref.stdOut = result.so.join('\n');
                            DpTaskService.update({
                                id: taskId,
                                status: DpTaskState.IN_PROGRESS,
                                progress: `正在转换 ${progress}%`,
                                result: JSON.stringify(result.ref)
                            });
                        }
                    });
                    fs.unlinkSync(vPath);
                    result.so.push('System: video converted to mp4');
                    result.ref.stdOut = result.so.join('\n');
                    result.ref.name = path.basename(vPath, path.extname(vPath)) + '.mp4';
                    DpTaskService.update({
                        id: taskId,
                        status: DpTaskState.IN_PROGRESS,
                        progress: '转换完成',
                        result: JSON.stringify(result.ref)
                    });
                }
            }
        } catch (e) {
            DpTaskService.update({
                id: taskId,
                status: DpTaskState.FAILED,
                progress: '下载失败',
                result: JSON.stringify(result.ref)
            });
            return;
        }
        DpTaskService.update({
            id: taskId,
            status: DpTaskState.DONE,
            progress: '下载完成',
            result: JSON.stringify(result.ref)
        });
    }

    public static async doDlVideo(taskId: number, result: {
        ref: DlProgress,
        so: string[]
    }, url: string, savePath: string) {
        result.so.push('System: downloading video');
        result.ref.stdOut = result.so.join('\n');
        DpTaskService.update({
            id: taskId,
            status: DpTaskState.IN_PROGRESS,
            progress: '正在下载',
            result: JSON.stringify(result.ref)
        });
        return new Promise<void>((resolve, reject) => {
            //yt-dlp -f "bestvideo[height<=1080][height>=?720]" --merge-output-format mp4 https://www.youtube.com/watch?v=EVEIl0V-5QE
            const task = spawn(LocationService.ytDlPath(), [
                '--ffmpeg-location', LocationService.libPath(),
                '-f', 'bestvideo[height<=1080][height>=?720]+bestaudio/best',
                // '--simulate',
                '--merge-output-format', 'mp4',
                '-P', savePath,
                url
            ]);
            ProcessService.registerTask({
                taskId,
                process: [task]
            });
            let progress = 0;
            task.stdout.on('data', (data) => {
                const output = data.toString();
                console.log(output); // 打印 yt-dlp 的输出

                // 正则表达式匹配下载进度
                const progressMatch = output.match(/\[download\]\s+(\d+\.?\d*)%/);
                if (progressMatch) {
                    // console.log(`Download progress: ${progressMatch[1]}%`);
                    progress = parseFloat(progressMatch[1]);
                }
                result.so.push(data.toString().trim());
                result.ref.stdOut = result.so.join('\n');
                result.ref.progress = progress;
                DpTaskService.update({
                    id: taskId,
                    status: DpTaskState.IN_PROGRESS,
                    progress: `正在下载 ${progress}%`,
                    result: JSON.stringify(result.ref)
                });
            });

            task.stderr.on('data', (data) => {
                console.error(`stderr: ${data}`);
                result.so.push(data.toString().trim());
                result.ref.stdOut = result.so.join('\n');
                DpTaskService.update({
                    id: taskId,
                    status: DpTaskState.IN_PROGRESS,
                    progress: '下载失败',
                    result: JSON.stringify(result.ref)
                });
            });

            task.on('close', (code) => {
                console.log(`child process exited with code ${code}`);
                if (code === 0) {
                    resolve();
                } else {
                    DpTaskService.update({
                        id: taskId,
                        status: DpTaskState.FAILED,
                        progress: '下载失败',
                        result: JSON.stringify(result.ref)
                    });
                    reject(`child process exited with code ${code}`);
                }
            });
        });
    }

    /**
     * yt-dlp -f "bestvideo[height<=1080][height>=?720]" --get-filename --merge-output-format mp4 https://www.youtube.com/watch?v=EVEIl0V-5QE
     * @param taskId
     * @param result
     * @param url
     */
    public static async doDlVideoFileName(taskId: number, result: {
        ref: DlProgress,
        so: string[]
    }, url: string): Promise<string> {
        // 获取yt-dlp的路径和ffmpeg的路径
        const ytDlpPath = LocationService.ytDlPath();
        const ffmpegPath = LocationService.libPath();

        result.so.push('System: fetching video file name');
        result.ref.stdOut = result.so.join('\n');
        DpTaskService.update({
            id: taskId,
            status: DpTaskState.IN_PROGRESS,
            progress: '正在获取文件名',
            result: JSON.stringify(result.ref)
        });
        return new Promise<string>((resolve, reject) => {
            const process = spawn(ytDlpPath, [
                '--ffmpeg-location', ffmpegPath,
                '-f', 'bestvideo[height<=1080][height>=?720]',
                '--get-filename',
                '--merge-output-format', 'mp4',
                url
            ]);
            ProcessService.registerTask({
                taskId,
                process: [process]
            });
            let output = '';
            process.stdout.on('data', (d: Buffer) => {
                let encoding = 'utf8';
                if (SystemService.isWindows()) {
                    encoding = 'cp936';
                }
                const data = iconv.decode(d, encoding);
                output += data;
                // 如果有视频文件扩展名，说明获取到了文件名
                const videoExtensions = ['.mp4', '.mkv', '.flv', '.avi', '.mov', '.wmv', 'webm'];
                if (videoExtensions.some(ext => output.trim().endsWith(ext))) {
                    resolve(output.trim());
                }
                result.so.push(data.toString().trim());
                result.ref.stdOut = result.so.join('\n');
                DpTaskService.update({
                    id: taskId,
                    status: DpTaskState.IN_PROGRESS,
                    progress: '正在获取文件名',
                    result: JSON.stringify(result.ref)
                });
            });

            process.stderr.on('data', (data: Buffer) => {
                console.error('Error:', data.toString());
                result.so.push(data.toString().trim());
                result.ref.stdOut = result.so.join('\n');
                DpTaskService.update({
                    id: taskId,
                    status: DpTaskState.IN_PROGRESS,
                    progress: '正在获取文件名',
                    result: JSON.stringify(result.ref)
                });
            });

            process.on('close', (code: number) => {
                if (code === 0 && output.trim().endsWith('.mp4')) {
                    resolve(output.trim());
                } else {
                    reject(`yt-dlp process exited with code ${code}`);
                }
            });
        });
    }
}
