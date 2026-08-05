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

import { useEffect } from 'react';
import { Target } from 'lucide-react';

import { Input } from 'app/components/shadcn/Input';
import { Button } from 'app/components/Button';
import Tooltip from 'app/components/Tooltip';
import { useTypedSelector } from 'app/hooks/useTypedSelector';
import { METRIC_UNITS } from '../../constants';
import { Actions, State } from './definitions';
import ProbeCircuitStatus from './ProbeCircuitStatus';

type Props = {
    state: State;
    actions: Actions;
};

// Edge-center probing sub-panel for the Probe widget.
// Shown only when the selected touchplate is a 3D probe (see Probe.tsx).
// Probes two opposite edges along an axis and sets the active WCS zero at
// the midpoint. Direction convention: the probe starts OUTSIDE edge 1 on
// the -axis side; edge 1 is probed toward +axis, edge 2 toward -axis.
//
// Mirrors the connectivity-check workflow of RunProbe.tsx: on mount it
// starts a connectivity test and the action buttons stay disabled until
// the user manually triggers the probe needle once (green indicator).
const EdgeCenter = ({ state, actions }: Props) => {
    const { canClick, units, connectionMade } = state;
    const unitLabel = units === METRIC_UNITS ? 'mm' : 'in';

    const probePinStatus = useTypedSelector(
        (reduxState) =>
            reduxState.controller.state.status?.pinState.P ?? false,
    );

    // Start the connectivity test when the panel is shown, and reset it
    // whenever the probe pin is confirmed triggered (same pattern as
    // RunProbe.tsx lines 71-77).
    useEffect(() => {
        actions.startConnectivityTest();
        return () => {
            actions.setProbeConnectivity(false);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // If the probe is currently triggered (e.g. user is holding the needle),
    // mark connectivity as confirmed — matches RunProbe's behaviour.
    useEffect(() => {
        if (probePinStatus) {
            actions.setProbeConnectivity(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [probePinStatus]);

    const probeActive = actions.returnProbeConnectivity();
    // Buttons are enabled only when connected AND the probe circuit has been
    // confirmed by a manual trigger.
    const buttonsEnabled = canClick && connectionMade;

    return (
        <div className="w-full flex flex-col gap-2 p-2">
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

            {/* Connectivity check — user must trigger the probe needle once
                before the action buttons are enabled. Same UX as the single
                probe dialog (RunProbe.tsx). */}
            <div className="flex items-center justify-center">
                <ProbeCircuitStatus
                    connected={canClick}
                    probeActive={probeActive}
                />
            </div>
            {!connectionMade && canClick && (
                <p className="text-xs text-center text-gray-500">
                    Gently push the probe needle to confirm the circuit, then
                    choose an axis.
                </p>
            )}

            <div className="grid grid-cols-2 gap-2 mt-1">
                <Tooltip content="Probe two opposite edges along the Y axis and set Y0 at the midpoint. Start the probe OUTSIDE the lower edge (-Y side).">
                    <Button
                        onClick={() => actions.runEdgeCenter('y')}
                        disabled={!buttonsEnabled}
                        className="h-8 text-xs"
                    >
                        {connectionMade ? 'Center Y' : 'Waiting...'}
                    </Button>
                </Tooltip>
                <Tooltip content="Probe two opposite edges along the X axis and set X0 at the midpoint. Start the probe OUTSIDE the left edge (-X side).">
                    <Button
                        onClick={() => actions.runEdgeCenter('x')}
                        disabled={!buttonsEnabled}
                        className="h-8 text-xs"
                    >
                        {connectionMade ? 'Center X' : 'Waiting...'}
                    </Button>
                </Tooltip>
            </div>
        </div>
    );
};

export default EdgeCenter;
