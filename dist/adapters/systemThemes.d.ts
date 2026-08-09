import { DisplayMode, DisplayRequest, ResolvedDie } from './types';
export declare const SYSTEM_THEME_PROFILES: Readonly<{
    readonly 'vampire-v5-normal-d10': Readonly<{
        theme: "vampire-v5-normal";
        themeColor: "#20242e";
        sides: 10;
    }>;
    readonly 'vampire-v5-hunger-d10': Readonly<{
        theme: "vampire-v5-hunger";
        themeColor: "#761827";
        sides: 10;
    }>;
    readonly 'assimilation-d6': Readonly<{
        theme: "assimilation";
        themeColor: "#123b4a";
        sides: 6;
    }>;
    readonly 'assimilation-d10': Readonly<{
        theme: "assimilation";
        themeColor: "#123b4a";
        sides: 10;
    }>;
    readonly 'assimilation-d12': Readonly<{
        theme: "assimilation";
        themeColor: "#123b4a";
        sides: 12;
    }>;
    readonly 'fate-df': Readonly<{
        theme: "fate";
        themeColor: "#315d9b";
        sides: 6;
    }>;
    readonly 'daggerheart-hope-d12': Readonly<{
        theme: "default-v2";
        themeColor: "#ff0a7a";
        sides: 12;
    }>;
    readonly 'daggerheart-fear-d12': Readonly<{
        theme: "default-v2";
        themeColor: "#00f585";
        sides: 12;
    }>;
}>;
export type SystemDiceProfileId = keyof typeof SYSTEM_THEME_PROFILES;
export interface SystemDiePresentationInput {
    readonly id: string;
    readonly sourceDieId?: string;
    readonly sides: number;
    readonly value: number;
    readonly profileId: string;
    readonly discarded?: boolean;
}
export interface SystemDicePresentationOptions {
    /**
     * Assimilação selection IDs. When supplied, every non-selected die is
     * presented as discarded. Both semantic IDs and sourceDieIds are accepted.
     */
    readonly keptIds?: readonly string[];
    readonly themeColors?: Readonly<Partial<Record<SystemDiceProfileId, string>>>;
}
export interface SystemDisplayRequestInput extends SystemDicePresentationOptions {
    readonly id: string;
    readonly dice: readonly SystemDiePresentationInput[];
    readonly seed?: string;
    readonly mode?: DisplayMode;
}
export interface MixedDiePresentationInput {
    readonly id: string;
    readonly sides: number | string;
    readonly value: number;
    readonly rawValue?: number;
    readonly physicalValue?: number;
    readonly profileId?: string | null;
    readonly included?: boolean;
    readonly discarded?: boolean;
    readonly theme?: string;
    readonly themeColor?: string;
}
export interface MixedDicePresentationOptions extends SystemDicePresentationOptions {
    /**
     * Unsupported generic dice (for example dF or d7) are omitted by default.
     * System profiles are always validated and never silently omitted.
     */
    readonly unsupportedDice?: 'omit' | 'error';
    readonly theme?: string;
    readonly themeColor?: string;
}
export interface MixedDisplayRequestInput extends MixedDicePresentationOptions {
    readonly id: string;
    readonly dice: readonly MixedDiePresentationInput[];
    readonly seed?: string;
    readonly mode?: DisplayMode;
}
export declare const isSystemDiceProfileId: (value: unknown) => value is SystemDiceProfileId;
export declare const getSystemThemeProfile: (profileId: string) => Readonly<{
    theme: "vampire-v5-normal";
    themeColor: "#20242e";
    sides: 10;
}> | Readonly<{
    theme: "vampire-v5-hunger";
    themeColor: "#761827";
    sides: 10;
}> | Readonly<{
    theme: "assimilation";
    themeColor: "#123b4a";
    sides: 6;
}> | Readonly<{
    theme: "assimilation";
    themeColor: "#123b4a";
    sides: 10;
}> | Readonly<{
    theme: "assimilation";
    themeColor: "#123b4a";
    sides: 12;
}> | Readonly<{
    theme: "fate";
    themeColor: "#315d9b";
    sides: 6;
}> | Readonly<{
    theme: "default-v2";
    themeColor: "#ff0a7a";
    sides: 12;
}> | Readonly<{
    theme: "default-v2";
    themeColor: "#00f585";
    sides: 12;
}>;
export declare const toSystemResolvedDie: (die: SystemDiePresentationInput, options?: SystemDicePresentationOptions) => ResolvedDie;
export declare const toSystemResolvedDice: (dice: readonly SystemDiePresentationInput[], options?: SystemDicePresentationOptions) => readonly ResolvedDie[];
/**
 * Converts the structural SystemDieResult contract from @erpg/dicecore into
 * the display-only request consumed by DiceResultViewer.
 */
export declare const createSystemDisplayRequest: (input: SystemDisplayRequestInput) => DisplayRequest;
/**
 * Converts the flattened `rollMixedDice().dice` contract into one 3D request.
 * Generic and profiled dice preserve their original order and physical faces.
 */
export declare const toMixedResolvedDice: (dice: readonly MixedDiePresentationInput[], options?: MixedDicePresentationOptions) => readonly ResolvedDie[];
export declare const createMixedDisplayRequest: (input: MixedDisplayRequestInput) => DisplayRequest;
