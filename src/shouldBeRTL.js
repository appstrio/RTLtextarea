/*
 * RTLText
 * Copyright 2012 Twitter and other contributors
 * Released under the MIT license
 *
 * What it does:
 *
 * This module will set the direction of a textarea to RTL when a threshold
 * of RTL characters has been reached (rtlThreshold). It also applies Twitter-
 * specific RTL rules regarding the placement of @ signs, # tags, and URLs.
 *
 * How to use:
 *
 * Bind keyup and keydown to RTLText.onTextChange. If you have initial text,
 * call RTLText.setText(textarea, initial_string) to set markers on that
 * initial text.
 */
var RTLText = function () {
  'use strict';

  var that = {};
  var rtlThreshold = 0.3;

  /*
   * Right-to-left Unicode blocks for modern scripts are:
   *
   * Consecutive range of the main letters:
   * U+0590  to U+05FF  - Hebrew
   * U+0600  to U+06FF  - Arabic
   * U+0700  to U+074F  - Syriac
   * U+0750  to U+077F  - Arabic Supplement
   * U+0780  to U+07BF  - Thaana
   * U+07C0  to U+07FF  - N'Ko
   * U+0800  to U+083F  - Samaritan
   *
   * Arabic Extended:
   * U+08A0  to U+08FF  - Arabic Extended-A
   *
   * Consecutive presentation forms:
   * U+FB1D  to U+FB4F  - Hebrew presentation forms
   * U+FB50  to U+FDFF  - Arabic presentation forms A
   *
   * More Arabic presentation forms:
   * U+FE70  to U+FEFF  - Arabic presentation forms B
   */
  var rtlChar = /[\u0590-\u083F]|[\u08A0-\u08FF]|[\uFB1D-\uFDFF]|[\uFE70-\uFEFF]/mg;
  var dirMark = /\u200e|\u200f/mg;
  var ltrMark = "\u200e";
  var rtlMark = "\u200f";
  var keyConstants = {
    BACKSPACE: 8,
    DELETE: 46
  };
  var twLength = 0;
  var DEFAULT_TCO_LENGTH = 22;
  var tcoLength = null;
  var isRTL = false;
  var originalText = "";
  var originalDir = "";
  // Can't use trim cause of IE. Regex from here: http://stackoverflow.com/questions/2308134/trim-in-javascript-not-working-in-ie
  var trimRegex = /^\s+|\s+$/g;

  var setManually = false;
  var heldKeyCodes =  { '91': false,
                        '16': false,
                        '88': false,
                        '17': false };
  var useCtrlKey = navigator.userAgent.indexOf('Mac') === -1;

  /* Private methods */


  function shouldBeRTL (plainText) {
    var matchedRtlChars = plainText.match(rtlChar);
    // Remove original placeholder text from this
    plainText = plainText.replace(originalText, "");
    var urlMentionsLength = 0;
    var trimmedText = plainText.replace(trimRegex, '');
    var defaultDir = originalDir;

    if (!trimmedText || !trimmedText.replace(/#/g, '')) {
      return defaultDir === 'rtl' ? true : false; // No text, use default.
    }

    if (!matchedRtlChars) {
      return false; // No RTL chars, use LTR
    }

    if (plainText) {
      var mentions = twttr.txt.extractMentionsWithIndices(plainText);
      var mentionsLength = mentions.length;
      var i;

      for (i = 0; i < mentionsLength; i++) {
        urlMentionsLength += mentions[i].screenName.length + 1;
      }

      var urls = twttr.txt.extractUrlsWithIndices(plainText);
      var urlsLength = urls.length;

      for (i = 0; i < urlsLength; i++) {
        urlMentionsLength += urls[i].url.length + 2;
      }

    }
    var length = trimmedText.length - urlMentionsLength;
    return length > 0 && matchedRtlChars.length / length > rtlThreshold;
  }

  /* Public Methods */

  // For determining if text should be RTL (returns boolean)
  that.shouldBeRTL = function (s) {
    return shouldBeRTL(s);
  };


  return that;

}();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = RTLText;
}

