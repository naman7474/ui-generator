
import { StyleChange } from '../ground-truth/types';
import { removeOverride } from './css-patcher';
import { OverrideManager } from './override-generator';

/**
 * Rollback a specific change.
 */
export const rollbackChange = async (
    overridesPath: string,
    change: StyleChange
): Promise<void> => {
    // removeOverride expects selector/property, not a StyleChange object
    await removeOverride(overridesPath, change.cssSelector, change.property);
};

/**
 * Rollback all changes from a specific iteration.
 */
export const rollbackIteration = async (
    siteDir: string,
    iteration: number
): Promise<void> => {
    const manager = new OverrideManager(siteDir);
    await manager.load();
    manager.rollbackIteration(iteration);
    await manager.save();
};

/**
 * Rollback to a specific iteration state.
 */
export const rollbackToIteration = async (
    siteDir: string,
    targetIteration: number
): Promise<void> => {
    const manager = new OverrideManager(siteDir);
    await manager.load();

    // Remove all changes from iterations after target
    for (let i = targetIteration + 1; i < 100; i++) {
        manager.rollbackIteration(i);
    }

    await manager.save();
};
