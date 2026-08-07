import type React from 'react';
import { useState } from 'react';
import { playMoveSound } from '@/lib/chess/sounds';

export type AppSettings = {
    // Gameplay
    enableUndo: boolean;
    enablePremove: boolean;
    autoPromoteToQueen: boolean;

    // Board
    showNotation: boolean;
    soundEnabled: boolean;

    // Board Highlights
    isOverdefended: boolean;
    isUnderdefended: boolean;
    showCheckHighlights: boolean;
};

interface SettingsPanelProps {
    boardColors: { light: string; dark: string };
    onChangeColors: (colors: { light: string; dark: string }) => void;
    animationDuration: number;
    onChangeAnimation: (ms: number) => void;
    appSettings: AppSettings;
    onChangeSettings: (settings: AppSettings) => void;
    onClose: () => void;
}

type Tab = 'Game' | 'Appearance' | 'Board Highlights' | 'Sound';

const BOARD_THEMES: { name: string; light: string; dark: string }[] = [
    { name: 'Classic', light: '#e1e1e1', dark: '#8A909A' },
    { name: 'Wood', light: '#f0d9b5', dark: '#b58863' },
    { name: 'Emerald', light: '#ebecd0', dark: '#739552' },
    { name: 'Midnight', light: '#a8b6c7', dark: '#3a4a63' },
    { name: 'Ocean', light: '#dee3e6', dark: '#8ca2ad' },
    { name: 'Sand', light: '#f5ead9', dark: '#c8a47b' },
    { name: 'Slate', light: '#dde3e9', dark: '#7a8ba6' },
    { name: 'Rose', light: '#f5d5d5', dark: '#c07b7b' },
];

const TABS: { id: Tab; icon: string }[] = [
    { id: 'Game', icon: 'sports_esports' },
    { id: 'Appearance', icon: 'palette' },
    { id: 'Board Highlights', icon: 'auto_awesome' },
    { id: 'Sound', icon: 'volume_up' },
];

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
    boardColors,
    onChangeColors,
    animationDuration,
    onChangeAnimation,
    appSettings,
    onChangeSettings,
    onClose,
}) => {
    const [localColors, setLocalColors] = useState(boardColors);
    const [localAnimation, setLocalAnimation] = useState(animationDuration);
    const [localSettings, setLocalSettings] = useState(appSettings);
    const [activeTab, setActiveTab] = useState<Tab>('Game');

    const updateSetting = (key: keyof AppSettings, value: boolean) => {
        setLocalSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        onChangeColors(localColors);
        onChangeAnimation(localAnimation);
        onChangeSettings(localSettings);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="relative flex flex-col md:flex-row w-full max-w-[820px] max-h-[90vh] bg-surface-container border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
                {/* Left Column: Navigation Tabs */}
                <div className="md:w-64 shrink-0 bg-surface-dim/60 border-b md:border-b-0 md:border-r border-white/5 p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-black tracking-tighter text-white">Settings</h2>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 text-neutral-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                            aria-label="Close settings"
                        >
                            <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                    </div>

                    <nav className="flex flex-col gap-1.5 grow">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all text-left ${
                                    activeTab === tab.id
                                        ? 'bg-white/10 text-white border border-white/10'
                                        : 'text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent'
                                }`}
                            >
                                <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                                {tab.id}
                            </button>
                        ))}
                    </nav>

                    <div className="mt-8 space-y-3">
                        <button
                            type="button"
                            onClick={handleSave}
                            className="w-full py-3 bg-white text-black rounded-2xl text-sm font-bold transition-all hover:bg-neutral-200 active:scale-[0.98]"
                        >
                            Save Changes
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full py-3 bg-transparent hover:bg-white/5 text-neutral-400 hover:text-white text-sm font-medium rounded-2xl transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>

                {/* Right Column: Options */}
                <div className="flex-1 p-6 md:p-8 overflow-y-auto">
                    {activeTab === 'Game' && (
                        <div className="space-y-6">
                            <Toggle label="Enable Undo Capability" description="Allow undoing your own moves" checked={localSettings.enableUndo} onChange={(v) => updateSetting('enableUndo', v)} />
                            <Toggle label="Enable Premoves" description="Queue your next move while the engine is thinking" checked={localSettings.enablePremove} onChange={(v) => updateSetting('enablePremove', v)} />
                            <Toggle label="Auto-Promote to Queen" description="Skip the promotion dialog and always promote to queen" checked={localSettings.autoPromoteToQueen} onChange={(v) => updateSetting('autoPromoteToQueen', v)} />
                        </div>
                    )}

                    {activeTab === 'Appearance' && (
                        <div className="space-y-8">
                            <section>
                                <SectionLabel title="Board Theme" />
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {BOARD_THEMES.map(theme => {
                                        const selected =
                                            localColors.light === theme.light &&
                                            localColors.dark === theme.dark;
                                        return (
                                            <button
                                                type="button"
                                                key={theme.name}
                                                onClick={() => setLocalColors({ light: theme.light, dark: theme.dark })}
                                                className={`group flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                                                    selected
                                                        ? 'bg-white/10 border-white/30'
                                                        : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                                                }`}
                                            >
                                                <span
                                                    className="flex shrink-0 rounded-md overflow-hidden border border-white/10"
                                                    style={{ width: 40, height: 40 }}
                                                >
                                                    <span className="flex-1" style={{ backgroundColor: theme.light }} />
                                                    <span className="flex-1" style={{ backgroundColor: theme.dark }} />
                                                </span>
                                                <span className={`text-xs font-semibold ${selected ? 'text-white' : 'text-neutral-400 group-hover:text-white'}`}>
                                                    {theme.name}
                                                </span>
                                                {selected && (
                                                    <span className="ml-auto material-symbols-outlined text-sm text-white">check</span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </section>

                            <section>
                                <SectionLabel title="Custom Colors" />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <ColorField
                                        label="Light Square"
                                        value={localColors.light}
                                        onChange={(v) => setLocalColors({ ...localColors, light: v })}
                                    />
                                    <ColorField
                                        label="Dark Square"
                                        value={localColors.dark}
                                        onChange={(v) => setLocalColors({ ...localColors, dark: v })}
                                    />
                                </div>
                            </section>

                            <section>
                                <SectionLabel title="Board" />
                                <Toggle label="Show Coordinates" description="Display file and rank labels on the board" checked={localSettings.showNotation} onChange={(v) => updateSetting('showNotation', v)} />
                                <div className="mt-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-medium text-neutral-200">Animation Speed</span>
                                        <span className="text-sm font-mono text-neutral-400 tabular-nums">{localAnimation}ms</span>
                                    </div>
                                    <input
                                        type="range"
                                        min={0}
                                        max={800}
                                        step={50}
                                        value={localAnimation}
                                        onChange={(e) => setLocalAnimation(Number(e.target.value))}
                                        className="w-full accent-white cursor-pointer"
                                    />
                                    <div className="flex justify-between text-[10px] text-neutral-600 mt-1">
                                        <span>Instant</span>
                                        <span>Smooth</span>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'Board Highlights' && (
                        <div className="space-y-6">
                            <p className="text-sm text-neutral-400 leading-relaxed">
                                Highlight the board dynamically to spot tactics faster.
                            </p>
                            <Toggle label="Highlight Checks" description="Glow the target squares of moves that deliver check" checked={localSettings.showCheckHighlights} onChange={(v) => updateSetting('showCheckHighlights', v)} />
                            <Toggle label="Overdefended Pieces" description="Glow pieces defended by more pieces than attack them" checked={localSettings.isOverdefended} onChange={(v) => updateSetting('isOverdefended', v)} />
                            <Toggle label="Underdefended Pieces" description="Glow pieces attacked by more pieces than defend them" checked={localSettings.isUnderdefended} onChange={(v) => updateSetting('isUnderdefended', v)} />
                        </div>
                    )}

                    {activeTab === 'Sound' && (
                        <div className="space-y-8">
                            <div className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/5">
                                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-2xl text-white">
                                        {localSettings.soundEnabled ? 'volume_up' : 'volume_off'}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-white">Sound Effects</p>
                                    <p className="text-xs text-neutral-500 mt-0.5">
                                        Move, capture, check and game-over sounds
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={localSettings.soundEnabled}
                                    onClick={() => updateSetting('soundEnabled', !localSettings.soundEnabled)}
                                    className={`w-11 h-6 rounded-full transition-colors duration-200 relative shrink-0 ${
                                        localSettings.soundEnabled ? 'bg-white' : 'bg-neutral-700'
                                    }`}
                                >
                                    <span
                                        className={`absolute top-[2px] left-[2px] w-5 h-5 rounded-full bg-black transition-transform duration-200 ${
                                            localSettings.soundEnabled ? 'translate-x-5' : ''
                                        }`}
                                    />
                                </button>
                            </div>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => playMoveSound({})}
                                    disabled={!localSettings.soundEnabled}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <span className="material-symbols-outlined text-base">play_arrow</span>
                                    Test Sound
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

function SectionLabel({ title }: { title: string }) {
    return (
        <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-4">
            {title}
        </h4>
    );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    const id = `color-${label.toLowerCase().replace(/\s+/g, "-")}`;
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-neutral-200 mb-2">{label}</label>
            <div className="flex items-center gap-3 rounded-2xl bg-white/5 border border-white/10 p-2.5">
                <input
                    id={id}
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-10 h-10 p-0 border-0 rounded-lg cursor-pointer bg-transparent"
                />
                <span className="text-sm font-mono text-neutral-400">{value}</span>
            </div>
        </div>
    );
}

// Reusable toggle component for settings
function Toggle({ label, description, checked, onChange }: { label: string; description?: string; checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <label className="flex items-start gap-4 cursor-pointer group">
            <div className="relative mt-0.5 shrink-0">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    className="sr-only"
                />
                <div className={`w-11 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-white' : 'bg-neutral-700'}`} />
                <div className={`absolute top-[2px] left-[2px] w-5 h-5 rounded-full bg-black transition-transform duration-200 ${checked ? 'translate-x-5' : ''}`} />
            </div>
            <div>
                <span className="block text-sm font-medium text-neutral-200 group-hover:text-white transition-colors">{label}</span>
                {description && <span className="block text-xs text-neutral-500 mt-0.5">{description}</span>}
            </div>
        </label>
    );
}
