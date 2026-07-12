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

declare class DiceResultViewer {
    #private;
    readonly canvas: HTMLCanvasElement;
    constructor(options?: ViewerOptions);
    init(): Promise<this>;
    display(request: DisplayRequest): Promise<DisplayResult>;
    clear(): void;
    updateOptions(options: ViewerOptions): Promise<void>;
    resize(): void;
    dispose(): void;
}
export { DiceResultViewer }
export default DiceResultViewer;

export declare type DiceSides = 2 | 4 | 6 | 8 | 10 | 12 | 20 | 100;

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

export declare const isDisplayCancelledError: (error: unknown) => error is DisplayCancelledError;

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

declare interface ThemeMaterialConfig {
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
    readonly wallPadding?: number;
    readonly colliderScale?: number;
    readonly spawnSpacing?: number;
    readonly spawnHeightStep?: number;
    readonly friction?: number;
    readonly restitution?: number;
    readonly linearDamping?: number;
    readonly angularDamping?: number;
    readonly settleTimeout?: number;
    readonly physicsWasmUrl?: string;
    readonly onCollision?: (event: CollisionEvent) => void;
    readonly onThemeConfigLoaded?: (theme: ResolvedThemeConfig) => void;
    readonly onThemeLoaded?: (theme: ResolvedThemeConfig) => void;
}

export { }
