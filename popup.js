/**
 * Popup Script - イベントハンドラとブラウザAPI統合
 */

import { defangToValid, isValidUrl } from './utils.js';

// DOM要素の参照をキャッシュ
const inputTextarea = document.getElementById('input-url');
const outputDiv = document.getElementById('output-url');
const copyBtn = document.getElementById('copy-btn');
const checkBtn = document.getElementById('check-btn');
const feedbackDiv = document.getElementById('feedback');

// 現在の変換後URLを保持
let currentValidUrl = '';

/**
 * 初期化処理
 */
document.addEventListener('DOMContentLoaded', () => {
  // 入力フィールドにフォーカスを当てる
  inputTextarea.focus();
});

/**
 * リアルタイムURL変換
 * ユーザーが入力するたびに実行される
 */
inputTextarea.addEventListener('input', (e) => {
  const defangedUrl = e.target.value;

  // 空の場合は初期状態に戻す
  if (!defangedUrl.trim()) {
    resetOutput();
    return;
  }

  // URL変換を実行
  const validUrl = defangToValid(defangedUrl);
  currentValidUrl = validUrl;

  // 変換結果を表示
  displayOutput(validUrl);

  // URL検証と視覚的フィードバック
  if (isValidUrl(validUrl)) {
    markAsValid();
    enableButtons();
  } else {
    markAsInvalid();
    disableButtons();
  }
});

/**
 * コピーボタンのクリックハンドラ
 */
copyBtn.addEventListener('click', async () => {
  try {
    // Clipboard API を使用してコピー
    await navigator.clipboard.writeText(currentValidUrl);
    showFeedback('✅ URLをクリップボードにコピーしました', 'success');
  } catch (error) {
    // フォールバック: 従来の方法でコピー
    try {
      fallbackCopyToClipboard(currentValidUrl);
      showFeedback('✅ URLをクリップボードにコピーしました', 'success');
    } catch (fallbackError) {
      showFeedback('❌ コピーに失敗しました', 'error');
      console.error('Clipboard error:', fallbackError);
    }
  }
});

/**
 * 確認ボタンのクリックハンドラ
 */
checkBtn.addEventListener('click', () => {
  if (currentValidUrl && isValidUrl(currentValidUrl)) {
    // 新しいタブでURLを開く（バックグラウンドで開く）
    chrome.tabs.create({
      url: currentValidUrl,
      active: false
    });
    showFeedback('🔍 新しいタブでURLを開きました', 'success');
  }
});

/**
 * 出力エリアに変換後URLを表示
 * @param {string} url - 表示するURL
 */
function displayOutput(url) {
  outputDiv.textContent = url;
  outputDiv.classList.remove('placeholder');
}

/**
 * 出力エリアを初期状態にリセット
 */
function resetOutput() {
  outputDiv.innerHTML = '<span class="placeholder">ここに変換結果が表示されます</span>';
  outputDiv.classList.remove('valid', 'invalid');
  currentValidUrl = '';
  disableButtons();
}

/**
 * 有効なURLとしてマーク（緑色の枠線）
 */
function markAsValid() {
  outputDiv.classList.add('valid');
  outputDiv.classList.remove('invalid');
}

/**
 * 無効なURLとしてマーク（赤色の枠線）
 */
function markAsInvalid() {
  outputDiv.classList.add('invalid');
  outputDiv.classList.remove('valid');
}

/**
 * ボタンを有効化
 */
function enableButtons() {
  copyBtn.disabled = false;
  checkBtn.disabled = false;
}

/**
 * ボタンを無効化
 */
function disableButtons() {
  copyBtn.disabled = true;
  checkBtn.disabled = true;
}

/**
 * フィードバックメッセージを表示
 * @param {string} message - 表示するメッセージ
 * @param {string} type - メッセージタイプ ('success' または 'error')
 */
function showFeedback(message, type = 'success') {
  feedbackDiv.textContent = message;
  feedbackDiv.className = `feedback ${type}`;
  feedbackDiv.classList.remove('hidden');

  // 3秒後に自動的に非表示
  setTimeout(() => {
    feedbackDiv.classList.add('hidden');
  }, 3000);
}

/**
 * フォールバック: クリップボードへのコピー（古いブラウザ用）
 * @param {string} text - コピーするテキスト
 */
function fallbackCopyToClipboard(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();

  const success = document.execCommand('copy');
  document.body.removeChild(textarea);

  if (!success) {
    throw new Error('execCommand failed');
  }
}

/**
 * キーボードショートカット
 */
document.addEventListener('keydown', (e) => {
  // Ctrl+Enter または Cmd+Enter でコピー
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    if (!copyBtn.disabled) {
      copyBtn.click();
    }
  }

  // Ctrl+Shift+Enter または Cmd+Shift+Enter で確認
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Enter') {
    if (!checkBtn.disabled) {
      checkBtn.click();
    }
  }
});
