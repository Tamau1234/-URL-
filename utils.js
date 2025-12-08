/**
 * URL変換ユーティリティ関数
 * フィッシングレポートで使用される無効化されたURLを有効なURLに変換します
 */

/**
 * 無効化されたURLを有効なURLに変換する
 * @param {string} defangedUrl - 無効化されたURL (例: hxxp://example[.]com)
 * @returns {string} - 有効なURL (例: http://example.com)
 *
 * サポートされる変換パターン:
 * - hxxp:// → http://
 * - hxxps:// → https://
 * - [.] → .
 * - (.) → .
 * - [@] → @
 * - [://] → ://
 * - [/] → /
 */
export function defangToValid(defangedUrl) {
  if (!defangedUrl || typeof defangedUrl !== 'string') {
    return '';
  }

  let url = defangedUrl.trim();

  // 空文字列の場合は早期リターン
  if (url === '') {
    return '';
  }

  // hxxp/hxxps を http/https に変換（大文字小文字を区別しない）
  url = url.replace(/hxxp(s?)/gi, 'http$1');

  // 各種ブラケット表記を通常の文字に変換
  url = url.replace(/\[\.\]/g, '.');     // [.] → .
  url = url.replace(/\(\.\)/g, '.');     // (.) → .
  url = url.replace(/\[@\]/g, '@');      // [@] → @
  url = url.replace(/\[:\]/g, ':');      // [:] → :
  url = url.replace(/\[\/\/\]/g, '//');  // [://] → ://
  url = url.replace(/\[\/\]/g, '/');     // [/] → /

  // プロトコルが含まれていない場合、http:// を追加
  if (!/^https?:\/\//i.test(url)) {
    url = 'http://' + url;
  }

  return url;
}

/**
 * URLが有効かどうかを検証する
 * @param {string} urlString - 検証するURL文字列
 * @returns {boolean} - 有効なURLの場合true、それ以外false
 */
export function isValidUrl(urlString) {
  if (!urlString || typeof urlString !== 'string') {
    return false;
  }

  try {
    const url = new URL(urlString);
    // http または https プロトコルのみを許可
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (error) {
    return false;
  }
}

/**
 * テストケース（開発用）
 *
 * テストパターン:
 * 1. hxxp://example[.]com → http://example.com
 * 2. hxxps://test[.]example[.]com → https://test.example.com
 * 3. example[.]com → http://example.com
 * 4. HxXpS://ExAmPlE[.]CoM → https://example.com
 * 5. hxxps://user[@]example[.]com:8080/path?query=value → https://user@example.com:8080/path?query=value
 * 6. hxxp://192[.]168[.]1[.]1 → http://192.168.1.1
 * 7. https://already-valid.com → https://already-valid.com (変更なし)
 */
