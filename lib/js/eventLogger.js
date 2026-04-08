import { ClientActionType } from './consts.js';
import { isOffline } from './env.js';
import { LogType } from './log.js';
import { Readiant } from './readiant.js';
import { Stream } from './stream.js';
const targetOrigin = '*';
let dispatchComponentEvent;
export function registerComponentDispatcher(fn) {
    dispatchComponentEvent = fn;
}
export function notifyComponent(type, detail) {
    dispatchComponentEvent?.(type, detail);
}
function logToEvent(log) {
    switch (log.type) {
        case LogType.Ready:
            return ['document-loaded', { documentId: log.documentId, isReady: true }];
        case LogType.AddAnnotations:
            return [
                'annotations-added',
                { annotations: log.annotations, count: log.annotations.length },
            ];
        case LogType.Annotation:
            return [
                'annotation-added',
                { annotations: log.annotations, page: log.page },
            ];
        case LogType.AudioPause:
            return ['audio-pause', { isPlaying: false, action: 'pause' }];
        case LogType.AudioPlay:
            return ['audio-play', { isPlaying: true, action: 'play' }];
        case LogType.ChangeAudioHighlighting:
            return [
                'audio-highlighting-changed',
                { audioHighlightingLevel: log.audioHighlightingLevel },
            ];
        case LogType.ChangeColorBlindFilter:
            return ['color-blind-filter-changed', { filter: log.colorBlindFilter }];
        case LogType.ChangeCountdown:
            return ['countdown-changed', { countdownLevel: log.countdownLevel }];
        case LogType.ChangeFont:
            return ['font-changed', { font: log.font }];
        case LogType.ChangeFontSize:
            return ['font-size-changed', { fontSize: log.fontSize }];
        case LogType.ChangeImageQuality:
            return [
                'image-quality-changed',
                {
                    imageQualityLevel: log.imageQualityLevel,
                    imageQuality: log.imageQuality,
                },
            ];
        case LogType.ChangeLetterSpacing:
            return ['letter-spacing-changed', { letterSpacing: log.letterSpacing }];
        case LogType.ChangeLineHeight:
            return ['line-height-changed', { lineHeight: log.lineHeight }];
        case LogType.ChangePlaybackRate:
            return ['playback-rate-changed', { playbackRate: log.playbackRate }];
        case LogType.ChangeReadStop:
            return ['read-stop-changed', { readStopLevel: log.readStopLevel }];
        case LogType.ChangeScreenMode:
            return ['theme-changed', { theme: log.screenModeLevel }];
        case LogType.ChangeSubtitle:
            return ['subtitle-changed', { subtitleLevel: log.subtitleLevel }];
        case LogType.ChangeSubtitleFontSize:
            return [
                'subtitle-font-size-changed',
                { subtitleFontSize: log.subtitleFontSize },
            ];
        case LogType.ChangeTextMode:
            return ['text-mode-changed', { textModeLevel: log.textModeLevel }];
        case LogType.ChangeWordSpacing:
            return ['word-spacing-changed', { wordSpacing: log.wordSpacing }];
        case LogType.ChangeZoomLevel:
            return ['zoom-changed', { zoom: log.zoomLevel }];
        case LogType.ClosingPage:
            return ['page-closed', { pages: log.pages }];
        case LogType.GotoPage:
        case LogType.InitialPage:
            return ['page-changed', { pages: log.pages }];
        case LogType.NextPage:
            return [
                'page-changed',
                {
                    pages: log.pages,
                    direction: 'next',
                    previous: log.previous,
                },
            ];
        case LogType.PreviousPage:
            return [
                'page-changed',
                {
                    pages: log.pages,
                    direction: 'previous',
                    previous: log.previous,
                },
            ];
        case LogType.Print:
            return ['print', { pages: log.pages }];
        case LogType.ReportIssue:
            return [
                'issue-reported',
                {
                    documentType: log.documentType,
                    issueType: log.issueType,
                    pageOrChapter: log.pageOrChapter,
                },
            ];
        case LogType.Resize:
            return ['resize', { height: log.height, width: log.width }];
        case LogType.ShouldAddAvailableAudio:
            return [
                'audio-added',
                {
                    page: log.page,
                    provider: log.provider,
                    language: log.language,
                    voiceId: log.voiceId,
                },
            ];
        case LogType.StartHighlighting:
            return ['highlighting-started', { indices: log.indices }];
        case LogType.StopHighlighting:
            return ['highlighting-stopped', { action: 'stop' }];
        case LogType.SwitchAudio:
            return ['audio-switched', { key: log.key }];
        case LogType.ToggleFullscreen:
            return ['fullscreen-changed', { isFullscreen: log.isFullscreen }];
        case LogType.ToggleOrientation:
            return [
                'orientation-changed',
                { action: 'toggle', orientation: log.orientation },
            ];
        case LogType.Translate:
            return ['translate', { language: log.language, text: log.text }];
        default:
            return null;
    }
}
export function eventLogger(toLog) {
    if (isOffline) {
        Readiant.windowContext.dispatchEvent(new CustomEvent('log', {
            detail: toLog,
        }));
    }
    else
        Readiant.windowContext.parent.postMessage(toLog, targetOrigin);
    if (!Readiant.preview)
        Stream.send({
            type: ClientActionType.Log,
            logData: toLog,
        });
    if (typeof dispatchComponentEvent !== 'undefined') {
        const mapped = logToEvent(toLog);
        if (mapped !== null)
            dispatchComponentEvent(mapped[0], mapped[1]);
    }
}
