import type { Props } from 'tippy.js';

// client-side catalog search config
export const SEARCH_DELAY_TIME_MS = 500;

// client-side catalog search constants
export const BOOLEAN_SEARCH_OPERATORS_REGEX = new RegExp(/[@+\-><()~*"]/);

// search tooltip configs
export const programSelectorTooltipConfig: Partial<Props> = {
  arrow: false,
  placement: 'right-start',
  theme: 'light-border',
  allowHTML: true,
  content:
    'Which program to associate the searched courses with. ' +
    "<u>The search is restricted to the selected program's catalog.</u>",
  hideOnClick: false
};

export const fieldSelectorTooltipConfig: Partial<Props> = {
  arrow: false,
  placement: 'right-start',
  theme: 'light-border',
  allowHTML: true,
  content:
    '<div class="whitespace-pre-wrap">' +
    'Which part of the course to search on.' +
    '\n\n<strong>Course ID: </strong>The ID of the course (e.g. "CPE101"). ' +
    'Note that <u>there is no space</u> in the course ID.' +
    '\n\n<strong>Course Name: </strong>The name of the course' +
    '\n(e.g. "Fundamentals of Computer Science").' +
    '</div>',
  hideOnClick: false
};

export const searchHelpTooltipConfig: Partial<Props> = {
  arrow: false,
  placement: 'bottom',
  theme: 'light-border',
  allowHTML: true,
  content:
    '<div class="whitespace-pre-wrap">' +
    'If you cannot find the courses you are looking for, here are some course searching tips:' +
    '\n\n1. Make sure your query is spelled correctly. The search tool does not support misspelled queries.' +
    '\n\n2. If you are searching on Course ID, ensure that there are no spaces in between the letters and numbers of the ID.' +
    "\n\n3. Verify that the course you are trying to add is in the selected Program's catalog. Only courses from this catalog are displayed in search results." +
    '</div>',
  hideOnClick: false
};
