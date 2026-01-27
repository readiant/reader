import { ClientActionType, IssueType } from './consts.js';
import { CLASS_BLOCK_DISABLE, ContentType } from './consts.js';
import { eventLogger } from './eventLogger.js';
import { LogType } from './log.js';
import { Navigation } from './navigation.js';
import { Stream } from './stream.js';
import { Readiant } from './readiant.js';
export class Issues {
    static get buttons() {
        return Readiant.root.querySelectorAll('.rdnt__issue');
    }
    static register() {
        for (const button of this.buttons)
            button.addEventListener('click', (event) => {
                event.preventDefault();
                this.report(event);
            });
        Navigation.addHandler(() => {
            for (const button of this.buttons) {
                const issueType = button.getAttribute('data-issue');
                const pageOrChapter = Readiant.type === ContentType.SVG
                    ? Navigation.currentPage
                    : Navigation.chapterIndex + 1;
                switch (issueType) {
                    case IssueType.Audio: {
                        if (this.audio.has(pageOrChapter))
                            button.classList.add(CLASS_BLOCK_DISABLE);
                        else
                            button.classList.remove(CLASS_BLOCK_DISABLE);
                        break;
                    }
                    case IssueType.Content: {
                        if (this.content.has(pageOrChapter))
                            button.classList.add(CLASS_BLOCK_DISABLE);
                        else
                            button.classList.remove(CLASS_BLOCK_DISABLE);
                        break;
                    }
                    case IssueType.Visual: {
                        if (this.visual.has(pageOrChapter))
                            button.classList.add(CLASS_BLOCK_DISABLE);
                        else
                            button.classList.remove(CLASS_BLOCK_DISABLE);
                        break;
                    }
                }
            }
        });
    }
    static report(event) {
        const input = event.currentTarget;
        const issueType = input.getAttribute('data-issue');
        const pageOrChapter = Readiant.type === ContentType.SVG
            ? Navigation.currentPage
            : Navigation.chapterIndex + 1;
        Stream.send({
            type: ClientActionType.IssueRequest,
            issueType,
            pageOrChapter,
        });
        switch (issueType) {
            case IssueType.Audio: {
                this.audio.add(pageOrChapter);
                break;
            }
            case IssueType.Content: {
                this.content.add(pageOrChapter);
                break;
            }
            case IssueType.Visual: {
                this.visual.add(pageOrChapter);
                break;
            }
        }
        input.classList.add(CLASS_BLOCK_DISABLE);
        eventLogger({
            type: LogType.ReportIssue,
            documentType: Readiant.type === ContentType.SVG ? 'PDF' : 'ePub',
            issueType,
            pageOrChapter,
        });
    }
}
Issues.audio = new Set();
Issues.content = new Set();
Issues.visual = new Set();
