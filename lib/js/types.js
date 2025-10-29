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
export var DocumentType;
(function (DocumentType) {
    DocumentType["ePub"] = "ePub";
    DocumentType["PDF"] = "PDF";
})(DocumentType || (DocumentType = {}));
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
export var PageProgressionDirection;
(function (PageProgressionDirection) {
    PageProgressionDirection["Ltr"] = "ltr";
    PageProgressionDirection["Rtl"] = "rtl";
})(PageProgressionDirection || (PageProgressionDirection = {}));
export var Layout;
(function (Layout) {
    Layout["Reflowable"] = "reflowable";
    Layout["PrePaginated"] = "pre-paginated";
})(Layout || (Layout = {}));
export var SpeechMarkType;
(function (SpeechMarkType) {
    SpeechMarkType["Sentence"] = "sentence";
    SpeechMarkType["Word"] = "word";
})(SpeechMarkType || (SpeechMarkType = {}));
