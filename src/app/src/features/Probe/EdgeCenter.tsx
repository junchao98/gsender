/*
 * Copyright (C) 2026 Sienci Labs Inc.
 *
 * This file is part of gSender.
 *
 * gSender is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, under version 3 of the License.
 *
 * gSender is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with gSender.  If not, see <https://www.gnu.org/licenses/>.
 *
 * Contact for information regarding this program and its license
 * can be sent through gSender@sienci.com or mailed to the main office
 * of Sienci Labs Inc. in Waterloo, Ontario, Canada.
 *
 */

import { Target } from 'lucide-react';

import { Input } from 'app/components/shadcn/Input';
import { Button } from 'app/components/Button';
import Tooltip from 'app/components/Tooltip';
import { METRIC_UNITS } from '../../constants';
import { Actions, State } from './definitions';

type Props = {
    state: State;
    actions: Actions;
};

// Edge-center probing sub-panel for the Probe widget.
// Shown only when the selected touchplate is a 3D probe (see Probe.tsx).
// Probes two opposite edges along an axis and sets the active WCS zero at
// the midpoint. Direction convention: the probe starts OUTSIDE edge 1 on
// the -axis side; edge 1 is probed toward +axis, edge 2 toward -axis.
const EdgeCenter = ({ state, actions }: Props) => {
    const { canClick, units } = state;
    const unitLabel = units === METRIC_UNITS ? 'mm' : 'in';

    return (
        <div className="w-full flex flex-col gap-2 p-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <Target size={16} />
                <span className="text-sm font-semibold">
                    Edge Center (3D Probe)
                </span>
            </div>

            <div className="grid grid-cols-3 gap-2 items-center">
                <label
                    className="text-xs text-gray-700 dark:text-gray-300"
                    title="Workpiece dimension along the chosen axis (edge-to-edge)"
                >
                    Work Size
                </label>
                <Input
                    type="number"
                    min={0}
                    step="any"
                    value={state.edgeWorkSize ?? ''}
                    onChange={(e) =>
                        actions.handleEdgeWorkSizeChange(
                            e as unknown as Event,
                        )
                    }
                    className="h-8 text-xs"
                    title="Workpiece dimension along the chosen axis (edge-to-edge)"
                    aria-label="Edge center work size"
                />
                <span className="text-xs text-gray-500">{unitLabel}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 items-center">
                <label
                    className="text-xs text-gray-700 dark:text-gray-300"
                    title="Z lift distance to safely clear the workpiece when crossing to the opposite edge"
                >
                    Z-Lift
                </label>
                <Input
                    type="number"
                    min={0}
                    step="any"
                    value={state.edgeZLift ?? ''}
                    onChange={(e) =>
                        actions.handleEdgeZLiftChange(
                            e as unknown as Event,
                        )
                    }
                    className="h-8 text-xs"
                    title="Z lift distance to safely clear the workpiece when crossing to the opposite edge"
                    aria-label="Edge center Z lift"
                />
                <span className="text-xs text-gray-500">{unitLabel}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 items-center">
                <label
                    className="text-xs text-gray-700 dark:text-gray-300"
                    title="Fast probe travel distance toward each edge. Slow probe and retraction are derived (slow = D/5, retract = D/10)."
                >
                    Probe Depth
                </label>
                <Input
                    type="number"
                    min={0}
                    step="any"
                    value={state.edgeProbeDepth ?? ''}
                    onChange={(e) =>
                        actions.handleEdgeProbeDepthChange(
                            e as unknown as Event,
                        )
                    }
                    className="h-8 text-xs"
                    title="Fast probe travel distance toward each edge. Slow probe and retraction are derived (slow = D/5, retract = D/10)."
                    aria-label="Edge center probe depth"
                />
                <span className="text-xs text-gray-500">{unitLabel}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-1">
                <Tooltip content="Probe two opposite edges along the Y axis and set Y0 at the midpoint. Start the probe OUTSIDE the lower edge (-Y side).">
                    <Button
                        onClick={() => actions.runEdgeCenter('y')}
                        disabled={!canClick}
                        className="h-8 text-xs"
                    >
                        Center Y
                    </Button>
                </Tooltip>
                <Tooltip content="Probe two opposite edges along the X axis and set X0 at the midpoint. Start the probe OUTSIDE the left edge (-X side).">
                    <Button
                        onClick={() => actions.runEdgeCenter('x')}
                        disabled={!canClick}
                        className="h-8 text-xs"
                    >
                        Center X
                    </Button>
                </Tooltip>
            </div>
        </div>
    );
};

export default EdgeCenter;
