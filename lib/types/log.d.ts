export var LogType;
(function (LogType) {
    LogType["AddAnnotations"] = "add_annotations";
    LogType["Annotation"] = "annotation";
    LogType["AudioPause"] = "audio_pause";
    LogType["AudioPlay"] = "audio_play";
    LogType["ChangeAudioHighlighting"] = "change_audio_highlighting";
    LogType["ChangeColorBlindFilter"] = "change_color_blind_filter";
    LogType["ChangeCountdown"] = "change_countdown";
    LogType["ChangeFont"] = "change_font";
    LogType["ChangeFontSize"] = "change_font_size";
    LogType["ChangeImageQuality"] = "change_image_quality";
    LogType["ChangeLetterSpacing"] = "change_letter_spacing";
    LogType["ChangeLineHeight"] = "change_line_height";
    LogType["ChangePlaybackRate"] = "change_playback_rate";
    LogType["ChangeReadStop"] = "change_read_stop";
    LogType["ChangeScreenMode"] = "change_screen_mode";
    LogType["ChangeSubtitle"] = "change_subtitle";
    LogType["ChangeSubtitleFontSize"] = "change_subtitle_font_size";
    LogType["ChangeTextMode"] = "change_text_mode";
    LogType["ChangeWordSpacing"] = "change_word_spacing";
    LogType["ChangeZoomLevel"] = "change_zoom_level";
    LogType["ClosingPage"] = "closing_page";
    LogType["GotoPage"] = "goto_page";
    LogType["InitialPage"] = "initial_page";
    LogType["NextPage"] = "next_page";
    LogType["PreviousPage"] = "previous_page";
    LogType["Print"] = "print";
    LogType["Ready"] = "ready";
    LogType["ReportIssue"] = "report_issue";
    LogType["Resize"] = "resize";
    LogType["ToggleFullscreen"] = "toggle_fullscreen";
    LogType["ToggleOrientation"] = "toggle_orientation";
    LogType["Translate"] = "translate";
    LogType["ShouldAddAvailableAudio"] = "should_add_available_audio";
    LogType["SwitchAudio"] = "switch_audio";
    LogType["StartHighlighting"] = "start_highlighting";
    LogType["StopHighlighting"] = "stop_highlighting";
})(LogType || (LogType = {}));
export const EventMapper = new Map([
    ['rdnt__colorblind--grayscale', 'Grayscale'],
    ['rdnt__colorblind--protanopia', 'Protonopia'],
    ['rdnt__colorblind--protanomaly', 'Protanomaly'],
    ['rdnt__colorblind--deuteranopia', 'Deuteranopia'],
    ['rdnt__colorblind--deuteranomaly', 'Deuteranomaly'],
    ['rdnt__colorblind--tritanopia', 'Tritanopia'],
    ['rdnt__colorblind--tritanomaly', 'Tritanomaly'],
    ['rdnt__colorblind--achromatopsia', 'Achromatopsia'],
    ['rdnt__colorblind--achromatomaly', 'Achromatomaly'],
    ['rdnt__font--original', 'Original'],
    ['rdnt__font--dyslexia', 'Dyslexia'],
    ['rdnt__font--lora', 'Lora'],
    ['rdnt__font--merriweather', 'Merriweather'],
    ['rdnt__font--mulish', 'Mulish'],
    ['rdnt__font--mukta', 'Mukta'],
    ['rdnt__font--roboto', 'Roboto'],
]);
