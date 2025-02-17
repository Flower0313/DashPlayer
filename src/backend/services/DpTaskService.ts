import {eq} from 'drizzle-orm';
import db from '@/backend/db/db';
import {DpTask, dpTask, DpTaskState, InsertDpTask} from '@/backend/db/tables/dpTask';

import LRUCache from "lru-cache";
import TimeUtil from "@/common/utils/TimeUtil";
import ProcessService from "@/backend/services/ProcessService";


const cache: LRUCache<number, InsertDpTask> = new LRUCache({
    maxSize: 2000,
    sizeCalculation: (value, key) => {
        return 1
    },
})
export const CANCEL_MSG = 'dp-用户取消';
export default class DpTaskService {
    public static upQueue: Map<number, InsertDpTask> = new Map();
    public static cancelQueue: Set<number> = new Set();
    static {
        setInterval(async () => {
            if (this.upQueue.size > 0) {
                for (const [key, value] of this.upQueue) {
                    await db
                        .update(dpTask)
                        .set({
                            ...value,
                            updated_at: TimeUtil.timeUtc(),
                        })
                        .where(eq(dpTask.id, key));
                    this.upQueue.delete(key);
                }
            }
        }, 3000);
    }

    public static async detail(
        id: number
    ): Promise<DpTask | undefined> {

        if (cache.has(id)) {
            console.log('temp task');
            return cache.get(id) as DpTask;
        }

        const tasks: DpTask[] = await db
            .select()
            .from(dpTask)
            .where(eq(dpTask.id, id));

        if (tasks.length === 0) {
            return undefined;
        }
        return tasks[0];
    }

    public static async details(ids: number[]): Promise<Map<number, DpTask>> {
        const map = new Map<number, DpTask>();
        await Promise.all(ids.map(async id => {
                const task = await this.detail(id);
                if (task) {
                    map.set(id, task);
                }
            }
        ));
        return map;
    }


    public static async create() {
        const task: DpTask[] = await db
            .insert(dpTask)
            .values({
                status: DpTaskState.INIT,
                progress: '任务创建成功',
            }).returning();
        const taskId = task[0].id;
        cache.set(taskId, {
            id: taskId,
            status: DpTaskState.INIT,
            progress: '任务创建成功',
            created_at: TimeUtil.timeUtc(),
            updated_at: TimeUtil.timeUtc(),
        });
        return taskId;
    }

    public static update(
        task: InsertDpTask
    ) {
        if (task.id === undefined || task.id === null) {
            return;
        }
        if (cache.has(task.id)) {
            cache.set(task.id, {
                ...cache.get(task.id),
                ...task,
                updated_at: TimeUtil.timeUtc()
            })
        }
        this.upQueue.set(task.id, {
            ...task,
            updated_at: TimeUtil.timeUtc(),
        });
    }

    static cancel(id: number) {
        this.cancelQueue.add(id);
        ProcessService.killTask(id);
    }
    static checkCancel(id: number) {
        if (this.cancelQueue.has(id)) {
            this.update({
                id,
                status: DpTaskState.CANCELLED,
                progress: '任务取消',
            })
            throw new Error(CANCEL_MSG);
        }
    }
}
