export declare interface ClassifyTimelineEvent extends DiceTimelineEventBase {
    readonly type: 'classify';
    readonly outcome: 'success' | 'failure' | 'neutral' | 'critical-success' | 'critical-failure';
}

export declare interface CoinFaceTheme {
    readonly value: 1 | 2;
    readonly texture: string;
}

export declare interface CoinTheme {
    readonly front: CoinFaceTheme;
    readonly back: CoinFaceTheme;
    readonly edgeColor?: string;
    readonly diameter?: number;
    readonly thickness?: number;
}

export declare interface CollisionEvent {
    readonly action: 'collision';
    readonly body0Id?: string;
    readonly body1Id?: string;
    readonly force: number;
}

export declare const DEFAULT_TIMELINE_OPTIONS: NormalizedTimelineOptions;

declare class DiceResultViewer {
    #private;
    readonly canvas: HTMLCanvasElement;
    constructor(options?: ViewerOptions);
    init(): Promise<this>;
    display(request: DisplayRequest): Promise<DisplayResult>;
    displayTimeline(request: DisplayTimelineRequest): Promise<DisplayTimelineResult>;
    clear(): void;
    updateOptions(options: ViewerOptions): Promise<void>;
    resize(): void;
    dispose(): void;
}
export { DiceResultViewer }
export default DiceResultViewer;

export declare type DiceSides = 2 | 4 | 6 | 8 | 10 | 12 | 20 | 100;

export declare type DiceTimelineEvent = RollTimelineEvent | RerollTimelineEvent | ExplodeTimelineEvent | TransformTimelineEvent | IncludeTimelineEvent | ExcludeTimelineEvent | ClassifyTimelineEvent;

declare interface DiceTimelineEventBase {
    readonly sequence: number;
    readonly subject?: 'die';
    readonly dieId: string;
    readonly parentDieId: string | null;
    readonly rollIndex: number;
    readonly sourceNodeId: string;
}

export declare const DISPLAY_CANCELLED_CODE: "DISPLAY_CANCELLED";

export declare class DisplayCancelledError extends Error {
    readonly code: "DISPLAY_CANCELLED";
    constructor(message?: string);
}

export declare type DisplayMode = 'kinematic' | 'physics';

export declare interface DisplayRequest {
    readonly id: string;
    readonly dice: readonly ResolvedDie[];
    readonly seed?: string;
    readonly mode?: DisplayMode;
}

export declare interface DisplayResult {
    readonly id: string;
    readonly dice: readonly ResolvedDie[];
    readonly durationMs: number;
}

export declare interface DisplayTimelineRequest {
    readonly id: string;
    readonly dice: readonly TimelineDieDefinition[];
    readonly events: readonly DiceTimelineEvent[];
    readonly seed?: string;
    readonly mode?: DisplayMode;
}

export declare interface DisplayTimelineResult extends DisplayResult {
    readonly eventCount: number;
    readonly phaseCount: number;
    readonly degraded: boolean;
}

export declare interface ExcludeTimelineEvent extends DiceTimelineEventBase {
    readonly type: 'exclude';
    readonly reason: 'drop' | 'keep' | 'compound-absorbed';
}

export declare interface ExplodeTimelineEvent extends DiceTimelineEventBase {
    readonly type: 'explode';
    readonly childDieId: string;
    readonly value: number;
    readonly reason: 'explode' | 'compound' | 'penetrate';
}

export declare interface IncludeTimelineEvent extends DiceTimelineEventBase {
    readonly type: 'include';
    readonly contribution: number;
}

export declare const isDisplayCancelledError: (error: unknown) => error is DisplayCancelledError;

declare interface NormalizedTimelineBadgeEffectOptions extends NormalizedTimelineEffectOptions {
    readonly showBadge: boolean;
}

declare interface NormalizedTimelineCriticalEffectOptions extends NormalizedTimelineEffectOptions {
    readonly pulses: number;
}

declare interface NormalizedTimelineEffectOptions {
    readonly enabled: boolean;
    readonly delayMs: number;
    readonly durationMs: number;
    readonly intensity: number;
    readonly color: string;
}

declare interface NormalizedTimelineExplodeEffectOptions extends NormalizedTimelineEffectOptions {
    readonly origin: 'source' | 'edge';
    readonly burstHeight: number;
    readonly spread: number;
}

declare interface NormalizedTimelineOptions {
    readonly enabled: boolean;
    readonly maxEvents: number;
    readonly maxDurationMs: number;
    readonly phaseGapMs: number;
    readonly effects: {
        readonly explode: NormalizedTimelineExplodeEffectOptions;
        readonly compound: NormalizedTimelineBadgeEffectOptions;
        readonly penetrate: NormalizedTimelineBadgeEffectOptions;
        readonly reroll: NormalizedTimelineRerollEffectOptions;
        readonly unique: NormalizedTimelineRerollEffectOptions;
        readonly keep: NormalizedTimelineEffectOptions;
        readonly drop: NormalizedTimelineEffectOptions;
        readonly success: NormalizedTimelineEffectOptions;
        readonly failure: NormalizedTimelineEffectOptions;
        readonly neutral: NormalizedTimelineEffectOptions;
        readonly criticalSuccess: NormalizedTimelineCriticalEffectOptions;
        readonly criticalFailure: NormalizedTimelineCriticalEffectOptions;
    };
}

declare interface NormalizedTimelineRerollEffectOptions extends NormalizedTimelineEffectOptions {
    readonly style: 'hop' | 'edge' | 'spin';
    readonly hopHeight: number;
}

export declare interface RerollTimelineEvent extends DiceTimelineEventBase {
    readonly type: 'reroll';
    readonly from: number;
    readonly to: number;
    readonly reason: 'reroll' | 'reroll-once' | 'unique' | 'unique-once';
}

export declare interface ResolvedDie {
    readonly id: string;
    readonly sides: DiceSides;
    readonly value: number;
    readonly discarded?: boolean;
    readonly theme?: string;
    readonly themeColor?: string;
}

export declare interface ResolvedThemeConfig extends ThemeConfig {
    readonly theme: string;
    readonly basePath: string;
    readonly meshName: string;
    readonly meshFilePath: string;
    readonly coin: CoinTheme;
}

export declare interface RollTimelineEvent extends DiceTimelineEventBase {
    readonly type: 'roll';
    readonly value: number;
}

export declare interface ThemeConfig {
    readonly name?: string;
    readonly systemName?: string;
    readonly extends?: string;
    readonly meshFile?: string;
    readonly material: ThemeMaterialConfig;
    readonly diceAvailable: readonly string[];
    readonly coin?: CoinTheme;
    readonly [key: string]: unknown;
}

export declare interface ThemeMaterialConfig {
    readonly type: 'color' | 'standard';
    readonly diffuseTexture?: string | Readonly<{
        light: string;
        dark: string;
    }>;
    readonly bumpTexture?: string;
    readonly specularTexture?: string;
    readonly diffuseLevel?: number;
    readonly bumpLevel?: number;
    readonly specularPower?: number;
}

export declare interface TimelineBadgeEffectOptions extends TimelineEffectOptions {
    readonly showBadge?: boolean;
}

export declare interface TimelineCriticalEffectOptions extends TimelineEffectOptions {
    readonly pulses?: number;
}

export declare interface TimelineDieDefinition {
    readonly id: string;
    readonly sides: DiceSides;
    readonly theme?: string;
    readonly themeColor?: string;
}

export declare type TimelineEffectName = keyof NormalizedTimelineOptions['effects'];

export declare interface TimelineEffectOptions {
    readonly enabled?: boolean;
    readonly delayMs?: number;
    readonly durationMs?: number;
    readonly intensity?: number;
    readonly color?: string;
}

export declare interface TimelineEffectsOptions {
    readonly explode?: TimelineExplodeEffectOptions;
    readonly compound?: TimelineBadgeEffectOptions;
    readonly penetrate?: TimelineBadgeEffectOptions;
    readonly reroll?: TimelineRerollEffectOptions;
    readonly unique?: TimelineRerollEffectOptions;
    readonly keep?: TimelineEffectOptions;
    readonly drop?: TimelineEffectOptions;
    readonly success?: TimelineEffectOptions;
    readonly failure?: TimelineEffectOptions;
    readonly neutral?: TimelineEffectOptions;
    readonly criticalSuccess?: TimelineCriticalEffectOptions;
    readonly criticalFailure?: TimelineCriticalEffectOptions;
}

export declare interface TimelineExplodeEffectOptions extends TimelineEffectOptions {
    readonly origin?: 'source' | 'edge';
    readonly burstHeight?: number;
    readonly spread?: number;
}

export declare interface TimelineOptions {
    readonly enabled?: boolean;
    readonly maxEvents?: number;
    readonly maxDurationMs?: number;
    readonly phaseGapMs?: number;
    readonly effects?: TimelineEffectsOptions;
}

export declare interface TimelineProgressDie {
    readonly id: string;
    readonly value: number;
    readonly discarded: boolean;
}

/**
 * Immutable snapshot emitted only after the corresponding visual work has
 * settled. `phaseIndex` is zero-based and is `null` for the initial and final
 * snapshots.
 */
export declare interface TimelineProgressEvent {
    readonly id: string;
    readonly stage: TimelineProgressStage;
    readonly phaseIndex: number | null;
    readonly phaseCount: number;
    readonly phaseId: string | null;
    readonly effect: TimelineEffectName | null;
    readonly revealedDieIds: readonly string[];
    readonly dice: readonly TimelineProgressDie[];
    readonly completedEventSequences: readonly number[];
}

export declare type TimelineProgressStage = 'initial' | 'phase' | 'complete';

export declare interface TimelineRerollEffectOptions extends TimelineEffectOptions {
    readonly style?: 'hop' | 'edge' | 'spin';
    readonly hopHeight?: number;
}

export declare interface TransformTimelineEvent extends DiceTimelineEventBase {
    readonly type: 'transform';
    readonly from: number;
    readonly to: number;
    readonly reason: 'minimum' | 'maximum' | 'penetrate' | 'compound';
}

export declare interface ViewerOptions {
    readonly id?: string;
    readonly container?: string | HTMLElement | null;
    readonly assetPath?: string;
    readonly origin?: string;
    readonly mode?: DisplayMode;
    readonly theme?: string;
    readonly preloadThemes?: readonly string[];
    readonly externalThemes?: Readonly<Record<string, string>>;
    readonly themeColor?: string;
    readonly maxDice?: number;
    readonly enableShadows?: boolean;
    readonly shadowTransparency?: number;
    readonly shadowResolution?: number;
    readonly lightIntensity?: number;
    readonly antialias?: boolean;
    readonly scale?: number;
    readonly duration?: number;
    readonly delay?: number;
    readonly gravity?: number;
    readonly mass?: number;
    readonly startingHeight?: number;
    readonly spinForce?: number;
    readonly throwForce?: number;
    /** Seeded per-presentation chance (0..1) of using the high-energy launch tail. */
    readonly aggressiveThrowChance?: number;
    /** @deprecated Use aggressiveThrowChance. This never guarantees a wall collision. */
    readonly wallBounceChance?: number;
    readonly wallPadding?: number;
    readonly colliderScale?: number;
    readonly spawnSpacing?: number;
    readonly spawnHeightStep?: number;
    /** Extra off-screen margin, expressed as a fraction of the body radius. */
    readonly spawnOverscan?: number;
    readonly friction?: number;
    readonly restitution?: number;
    readonly linearDamping?: number;
    readonly angularDamping?: number;
    readonly settleTimeout?: number;
    readonly physicsWasmUrl?: string;
    readonly onCollision?: (event: CollisionEvent) => void;
    readonly onThemeConfigLoaded?: (theme: ResolvedThemeConfig) => void;
    readonly onThemeLoaded?: (theme: ResolvedThemeConfig) => void;
    readonly onTimelineProgress?: (event: TimelineProgressEvent) => void;
    readonly timeline?: TimelineOptions;
}

export { }
