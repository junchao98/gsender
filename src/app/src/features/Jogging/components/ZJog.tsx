import zLabelsTop from 'app/features/Jogging/assets/zLabelsTop.svg';
import zLabelsBottom from 'app/features/Jogging/assets/zLabelsBottom.svg';
import cn from 'classnames';
import {
    continuousJogAxis,
    JoggerProps,
    stopContinuousJog,
    zMinusJog,
    zPlusJog,
} from 'app/features/Jogging/utils/Jogging.ts';
import { usePostHog } from 'posthog-js/react';
import { useLongPress } from 'use-long-press';
import controller from 'app/lib/controller';
import Tooltip from 'app/components/Tooltip';

export function ZJog({
    feedrate,
    distance,
    canClick,
    threshold = 200,
}: JoggerProps) {
    const posthog = usePostHog();

    const zPlusJogHandlers = useLongPress(
        () => {
            continuousJogAxis({ Z: 1 }, feedrate);
            posthog.capture('jog_z_plus', {
                distance,
                feedrate,
                continuous: true,
            });
        },
        {
            threshold,
            onCancel: () => {
                zPlusJog(distance, feedrate, false);
                posthog.capture('jog_z_plus', {
                    distance,
                    feedrate,
                    continuous: false,
                });
            },
            onFinish: stopContinuousJog,
        },
    )();
    const zMinusJogHandlers = useLongPress(
        () => {
            continuousJogAxis({ Z: -1 }, feedrate);
            posthog.capture('jog_z_minus', {
                distance,
                feedrate,
                continuous: true,
            });
        },
        {
            threshold,
            onCancel: () => {
                zMinusJog(distance, feedrate, false);
                posthog.capture('jog_z_minus', {
                    distance,
                    feedrate,
                    continuous: false,
                });
            },
            onFinish: stopContinuousJog,
        },
    )();

    const handleKeyDown = (
        e: React.KeyboardEvent,
        action: (
            distance: number,
            feedrate: number,
            isContinuous: boolean,
        ) => void,
    ) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            action(distance, feedrate, false);
        }
    };

    return (
        <div className="relative flex flex-col items-center w-[54px] portrait:w-[62px] h-[202px] portrait:h-[234px]">
            {/* Z+ — shifted up 20px */}
            <div className="relative w-full -translate-y-[20px]" style={{ height: 'calc(50% - 10px)' }}>
                <TabJogHalf
                    isTop={true}
                    canClick={canClick}
                    handlers={zPlusJogHandlers}
                    onKeyDown={(e) => handleKeyDown(e, zPlusJog)}
                    label="Jog Z plus"
                    testId="Z+"
                    labelsImg={zLabelsTop}
                />
            </div>

            {/* P button — centered between Z+ and Z- */}
            <Tooltip content="Move Z to safe height (G53 G0 Z-10)">
                <button
                    type="button"
                    onClick={() => controller.command('gcode', ['G53 G0 Z-10'])}
                    disabled={!canClick}
                    aria-label="Park Z to safe height"
                    className="w-full h-10 shrink-0 rounded bg-gray-700 hover:bg-gray-900 active:bg-black text-white text-xl font-bold flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    P
                </button>
            </Tooltip>

            {/* Z- — shifted down 20px */}
            <div className="relative w-full translate-y-[20px]" style={{ height: 'calc(50% - 10px)' }}>
                <TabJogHalf
                    isTop={false}
                    canClick={canClick}
                    handlers={zMinusJogHandlers}
                    onKeyDown={(e) => handleKeyDown(e, zMinusJog)}
                    label="Jog Z minus"
                    testId="Z-"
                    labelsImg={zLabelsBottom}
                />
            </div>
        </div>
    );
}

// Renders half of the TabJog button (top or bottom) as a standalone SVG,
// with the matching half of the zLabels overlay on top.
function TabJogHalf({
    isTop,
    canClick,
    handlers,
    onKeyDown,
    label,
    testId,
    labelsImg,
}: {
    isTop: boolean;
    canClick?: boolean;
    handlers: object;
    onKeyDown: (e: React.KeyboardEvent) => void;
    label: string;
    testId: string;
    labelsImg: string;
}) {
    const standardColourClass =
        'hover:fill-blue-600 fill-blue-500 active:fill-blue-700';
    const disabledColorClass =
        'fill-gray-400 hover:fill-gray-400 dark:fill-gray-700 dark:hover:fill-gray-600 pointer-events-none';

    // The original TabJog uses viewBox 0 0 50 187 with the top half spanning
    // y 0.5–88.5 and the bottom half y 98.5–186.5. Here we crop the viewBox
    // to just one half so it fills the container without distortion.
    const path = isTop
        ? 'M0.5 10C0.5 4.75329 4.75329 0.5 10 0.5H40C45.2467 0.5 49.5 4.7533 49.5 10V88.5H0.5V10Z'
        : 'M0.5 0.5H49.5V79C49.5 84.2467 45.2467 88.5 40 88.5H10C4.75329 88.5 0.5 84.2467 0.5 79V0.5Z';

    return (
        <div className="relative w-full h-full">
            <svg
                viewBox="0 0 50 89"
                preserveAspectRatio="none"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={cn('w-full h-full', {
                    'cursor-pointer': canClick,
                    'cursor-not-allowed': !canClick,
                })}
            >
                <path
                    role="button"
                    tabIndex={canClick ? 0 : -1}
                    aria-label={label}
                    d={path}
                    fill="#3F85C7"
                    className={cn(
                        canClick ? standardColourClass : disabledColorClass,
                    )}
                    onKeyDown={onKeyDown}
                    {...handlers}
                    data-testid={testId}
                />
            </svg>
            <img
                src={labelsImg}
                alt={isTop ? 'Z+ label' : 'Z- label'}
                className="absolute top-0 left-0 pointer-events-none w-full h-full"
            />
        </div>
    );
}

