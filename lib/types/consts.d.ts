export var ClientActionType;
(function (ClientActionType) {
    ClientActionType["AudioRequest"] = "audioRequest";
    ClientActionType["BlueprintRequest"] = "blueprintRequest";
    ClientActionType["CacheRequest"] = "cacheRequest";
    ClientActionType["ChapterRequest"] = "chapterRequest";
    ClientActionType["ClientInfo"] = "clientInfo";
    ClientActionType["CoverRequest"] = "coverRequest";
    ClientActionType["DefinitionRequest"] = "definitionRequest";
    ClientActionType["HTMLHrefRequest"] = "htmlHrefRequest";
    ClientActionType["IssueRequest"] = "issueRequest";
    ClientActionType["Log"] = "log";
    ClientActionType["Search"] = "search";
    ClientActionType["SpeechMarkRequest"] = "speechMarkRequest";
    ClientActionType["TextContentRequest"] = "textContentRequest";
    ClientActionType["TranslateRequest"] = "translateRequest";
})(ClientActionType || (ClientActionType = {}));
export var ServerActionType;
(function (ServerActionType) {
    ServerActionType["Audio"] = "audio";
    ServerActionType["Blueprint"] = "blueprint";
    ServerActionType["Close"] = "close";
    ServerActionType["Connected"] = "connected";
    ServerActionType["Definitions"] = "definitions";
    ServerActionType["Elements"] = "elements";
    ServerActionType["EPUBChapter"] = "epubChapter";
    ServerActionType["EPUBCover"] = "epubCover";
    ServerActionType["EPUBDocumentInfo"] = "epubDocInfo";
    ServerActionType["InvalidHref"] = "invalidHref";
    ServerActionType["PDFDocumentInfo"] = "pdfDocInfo";
    ServerActionType["SearchResult"] = "searchResult";
    ServerActionType["SpeechMark"] = "speechMark";
    ServerActionType["StreamFile"] = "streamFile";
    ServerActionType["TextContent"] = "textContent";
    ServerActionType["Translate"] = "translate";
})(ServerActionType || (ServerActionType = {}));
export var NavigationActionType;
(function (NavigationActionType) {
    NavigationActionType[NavigationActionType["PreviousChapter"] = 0] = "PreviousChapter";
    NavigationActionType[NavigationActionType["NextChapter"] = 1] = "NextChapter";
    NavigationActionType[NavigationActionType["FirstLoad"] = 2] = "FirstLoad";
    NavigationActionType[NavigationActionType["Directly"] = 3] = "Directly";
    NavigationActionType[NavigationActionType["Href"] = 4] = "Href";
    NavigationActionType[NavigationActionType["SearchResult"] = 5] = "SearchResult";
})(NavigationActionType || (NavigationActionType = {}));
export var DocumentType;
(function (DocumentType) {
    DocumentType["ePub"] = "ePub";
    DocumentType["PDF"] = "PDF";
})(DocumentType || (DocumentType = {}));
export var Layout;
(function (Layout) {
    Layout["Reflowable"] = "reflowable";
    Layout["PrePaginated"] = "pre-paginated";
})(Layout || (Layout = {}));
export var ContentType;
(function (ContentType) {
    ContentType[ContentType["SVG"] = 0] = "SVG";
    ContentType[ContentType["HTML"] = 1] = "HTML";
})(ContentType || (ContentType = {}));
export var PageProgressionDirection;
(function (PageProgressionDirection) {
    PageProgressionDirection["Ltr"] = "ltr";
    PageProgressionDirection["Rtl"] = "rtl";
})(PageProgressionDirection || (PageProgressionDirection = {}));
export var Direction;
(function (Direction) {
    Direction[Direction["Ltr"] = 0] = "Ltr";
    Direction[Direction["Rtl"] = 1] = "Rtl";
})(Direction || (Direction = {}));
export var Container;
(function (Container) {
    Container["Annotations"] = "rdnt__annotations";
    Container["BarSettings"] = "rdnt__bottom-bar-settings";
    Container["Chapters"] = "rdnt__chapters";
    Container["ScreenSettings"] = "rdnt__screen-settings";
    Container["Search"] = "rdnt__search";
    Container["Settings"] = "rdnt__settings";
})(Container || (Container = {}));
export var Fn;
(function (Fn) {
    Fn["AdvancedSettings"] = "advanced";
    Fn["Animations"] = "animations";
    Fn["Annotations"] = "annotations";
    Fn["Print"] = "print";
    Fn["Search"] = "search";
})(Fn || (Fn = {}));
export var AnnotationPosition;
(function (AnnotationPosition) {
    AnnotationPosition["Left"] = "left";
    AnnotationPosition["Right"] = "right";
})(AnnotationPosition || (AnnotationPosition = {}));
export var AudioPlayingState;
(function (AudioPlayingState) {
    AudioPlayingState["Initial"] = "initial";
    AudioPlayingState["Paused"] = "paused";
    AudioPlayingState["Playing"] = "playing";
    AudioPlayingState["Stopped"] = "stopped";
})(AudioPlayingState || (AudioPlayingState = {}));
export var OrientationMode;
(function (OrientationMode) {
    OrientationMode["Landscape"] = "landscape";
    OrientationMode["Portrait"] = "portrait";
})(OrientationMode || (OrientationMode = {}));
export var PageChangeType;
(function (PageChangeType) {
    PageChangeType[PageChangeType["Close"] = 0] = "Close";
    PageChangeType[PageChangeType["Next"] = 1] = "Next";
    PageChangeType[PageChangeType["Previous"] = 2] = "Previous";
    PageChangeType[PageChangeType["Other"] = 3] = "Other";
})(PageChangeType || (PageChangeType = {}));
export var PagePosition;
(function (PagePosition) {
    PagePosition[PagePosition["Left"] = 0] = "Left";
    PagePosition[PagePosition["Right"] = 1] = "Right";
})(PagePosition || (PagePosition = {}));
export var TouchDirection;
(function (TouchDirection) {
    TouchDirection[TouchDirection["Left"] = 0] = "Left";
    TouchDirection[TouchDirection["Right"] = 1] = "Right";
    TouchDirection[TouchDirection["Up"] = 2] = "Up";
    TouchDirection[TouchDirection["Down"] = 3] = "Down";
})(TouchDirection || (TouchDirection = {}));
export var TouchHandlerAction;
(function (TouchHandlerAction) {
    TouchHandlerAction[TouchHandlerAction["Start"] = 0] = "Start";
    TouchHandlerAction[TouchHandlerAction["Move"] = 1] = "Move";
    TouchHandlerAction[TouchHandlerAction["End"] = 2] = "End";
})(TouchHandlerAction || (TouchHandlerAction = {}));
export var SpeechMarkType;
(function (SpeechMarkType) {
    SpeechMarkType["Sentence"] = "sentence";
    SpeechMarkType["Word"] = "word";
})(SpeechMarkType || (SpeechMarkType = {}));
export var IssueType;
(function (IssueType) {
    IssueType["Audio"] = "audio";
    IssueType["Content"] = "content";
    IssueType["Visual"] = "visual";
})(IssueType || (IssueType = {}));
export var EffectiveConnectionType;
(function (EffectiveConnectionType) {
    EffectiveConnectionType["SlowTwoG"] = "slow-2g";
    EffectiveConnectionType["TwoG"] = "2g";
    EffectiveConnectionType["ThreeG"] = "3g";
    EffectiveConnectionType["FourG"] = "4g";
})(EffectiveConnectionType || (EffectiveConnectionType = {}));
export var AcceptedTypes;
(function (AcceptedTypes) {
    AcceptedTypes["Boolean"] = "boolean";
    AcceptedTypes["Number"] = "number";
    AcceptedTypes["String"] = "string";
    AcceptedTypes["StringArray"] = "string[]";
})(AcceptedTypes || (AcceptedTypes = {}));
export const CLASS_ACTIVE = 'active';
export const CLASS_ANIMATE_LEFT = 'animate-left';
export const CLASS_ANIMATE_RIGHT = 'animate-right';
export const CLASS_BLOCK_ACTIVE = 'rdnt__block-button--active';
export const CLASS_BLOCK_DISABLE = 'rdnt__block-button--disabled';
export const CLASS_BLOCK_TITLE_DISABLE = 'rdnt__block-title--disabled';
export const CLASS_BUTTON_ACTIVE = 'rdnt__button--active';
export const CLASS_BUTTON_DISABLE = 'rdnt__button--disable';
export const CLASS_DISABLED = 'disabled';
export const CLASS_HIDDEN = 'hidden';
export const CLASS_HIGHLIGHT_ACTIVE = 'rdnt__highlight--active';
export const CLASS_HIGHLIGHT_IGNORE = 'rdnt__highlight--ignore';
export const CLASS_HIGHLIGHT_SYNTAX_ACTIVE = 'rdnt__highlight-syntax--active';
export const CLASS_HIGHLIGHT_SYNTAX_WORD_ACTIVE = 'rdnt__highlight-syntax-word--active';
export const CLASS_HIGHLIGHT_WORD = 'rdnt__highlight-word';
export const CLASS_HIGHLIGHT_WORD_ACTIVE = 'rdnt__highlight-word--active';
export const CLASS_NAVIGATION_NEXT_ACTIVE = 'rdnt__navigation--next--active';
export const CLASS_PREVIEW = 'rdnt__preview';
export const CLASS_ROUND_BUTTON_ACTIVE = 'rdnt__block-round-button--active';
export const CLASS_SINGLE = 'single';
export const CLASS_TOOLTIP = 'rdnt__tooltip';
export const CLASS_VISUALLY_HIDDEN = 'visually-hidden';
export const NAMESPACE_SVG = 'http://www.w3.org/2000/svg';
export const NAMESPACE_XLINK = 'http://www.w3.org/1999/xlink';
