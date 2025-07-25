
// script.js - 推測に基づいて作成されたプレースホルダー

document.addEventListener('DOMContentLoaded', () => {
    const dataRowsContainer = document.getElementById('dataRows');
    const addRowButton = document.getElementById('addRow');
    const shiftDownButton = document.getElementById('shiftDown');
    const clearAllButton = document.getElementById('clearAll');
    const currentCumulativeDiffSpan = document.getElementById('currentCumulativeDiff');

    let rowCounter = 0; // 行の識別用

    // 新しい行を作成する関数
    const createRow = (hama = 0.0, bb = 0.0) => {
        const row = document.createElement('div');
        row.classList.add('data-row');
        row.dataset.id = rowCounter++;

        // BB連のランダム消化Gを生成し、データ属性として保存
        const initialRandomBBG = Math.floor(Math.random() * (34 - 31 + 1)) + 31;

        row.innerHTML = `
            <span>${dataRowsContainer.children.length + 1}回目</span>
            <input type="number" class="hama-input" value="${parseInt(hama)}">
            <input type="number" class="bb-input" value="${parseInt(bb)}" data-random-bbg="${initialRandomBBG}">
            <span class="current-digest-g">[ - ]0</span>
            <span class="digest-g">[ - ]0</span>
            <span class="cumulative-diff">0.0</span>
            <button class="delete-row">削除</button>
        `;

        // イベントリスナーをアタッチ
        const hamaInput = row.querySelector('.hama-input');
        const bbInput = row.querySelector('.bb-input');
        const deleteButton = row.querySelector('.delete-row');

        // 入力変更時のイベントリスナー
        const handleInputChange = () => {
            updateCumulativeValues(); // 全体の累積値を更新
        };

        hamaInput.addEventListener('input', handleInputChange);
        bbInput.addEventListener('input', handleInputChange);

        deleteButton.addEventListener('click', () => {
            row.remove();
            updateRowNumbers();
            updateCumulativeValues(); // 行が削除されたら再計算
        });

        return row;
    };

    // 行番号を更新する関数
    const updateRowNumbers = () => {
        const rows = Array.from(dataRowsContainer.children);
        rows.forEach((row, index) => {
            const span = row.querySelector('span');
            if (span) {
                if (index === rows.length - 1) {
                    span.textContent = '当該';
                } else {
                    span.textContent = `${index + 1}回目`;
                }
            }
        });
    };

    // 全ての累積値を更新する関数
    const updateCumulativeValues = () => {
        let runningCumulativeTotalDiff = 0;
        let runningCumulativeDigestG = 0;

        Array.from(dataRowsContainer.children).forEach(row => {
            const hama = parseInt(row.querySelector('.hama-input').value) || 0;
            const bb = parseInt(row.querySelector('.bb-input').value) || 0;
            const currentDigestGSpan = row.querySelector('.current-digest-g');
            const cumulativeDigestGSpan = row.querySelector('.digest-g');
            const cumulativeDiffSpan = row.querySelector('.cumulative-diff');

            // Calculate individual row's digestG
            let individualRowDigestG = 0;
            if (!(hama === 0 && bb === 0)) {
                individualRowDigestG = hama + (bb * 40);
            }
            currentDigestGSpan.textContent = (hama === 0 && bb === 0) ? '0' : `${Math.floor(individualRowDigestG)}`;

            // Accumulate for cumulative digestG
            runningCumulativeDigestG += individualRowDigestG;
            cumulativeDigestGSpan.textContent = (hama === 0 && bb === 0) ? '0' : `${Math.floor(runningCumulativeDigestG)}`;


            // Calculate individual row diff
            const currentRowDiff = (bb * 114.5 - hama * 1.35);
            runningCumulativeTotalDiff += currentRowDiff; // Accumulate for cumulative diff

            // Update cumulative diff span
            cumulativeDiffSpan.textContent = Math.round(runningCumulativeTotalDiff);
        });
        updateTotalCumulativeDiff();
    };

    // digestGのテキストから数値をパースするヘルパー関数
    const parseDigestG = (text) => {
        if (text.includes('[ - ]')) {
            return 0;
        }
        return parseInt(text.replace('[ + ]', '')) || 0;
    };

    // 直近差枚の合計を更新する関数（最終行の累積差枚を表示）
    const updateTotalCumulativeDiff = () => {
        const allRows = Array.from(dataRowsContainer.children);
        const lastRow = allRows[allRows.length - 1];

        if (lastRow) {
            const lastRowCumulativeDiff = parseFloat(lastRow.querySelector('.cumulative-diff').textContent) || 0;
            const lastRowDigestGText = lastRow.querySelector('.digest-g').textContent;
            const lastRowDigestG = parseDigestG(lastRowDigestGText);

            let finalCumulativeDiff = lastRowCumulativeDiff;

            const remainingG = lastRowDigestG - 1600;

            if (remainingG >= 0) {
                for (let i = 0; i < allRows.length; i++) {
                    const row = allRows[i];
                    const currentRowDigestGText = row.querySelector('.digest-g').textContent;
                    const currentRowDigestG = parseDigestG(currentRowDigestGText);
                    const currentRowCumulativeDiff = parseFloat(row.querySelector('.cumulative-diff').textContent) || 0;

                    if (currentRowDigestG >= remainingG) {
                        finalCumulativeDiff = lastRowCumulativeDiff - currentRowCumulativeDiff;
                        break;
                    }
                }
            }

            currentCumulativeDiffSpan.textContent = Math.round(finalCumulativeDiff);
            if (finalCumulativeDiff > 0) {
                currentCumulativeDiffSpan.classList.remove('negative');
                currentCumulativeDiffSpan.classList.add('positive');
            } else if (finalCumulativeDiff < 0) {
                currentCumulativeDiffSpan.classList.remove('positive');
                currentCumulativeDiffSpan.classList.add('negative');
            } else {
                currentCumulativeDiffSpan.classList.remove('positive', 'negative');
            }
        } else {
            currentCumulativeDiffSpan.textContent = '0.0';
            currentCumulativeDiffSpan.classList.remove('positive', 'negative');
        }

        // 狙い目G数の計算と表示
        const recommendedGSpan = document.getElementById('recommendedG');
        const playableStatusSpan = document.getElementById('playableStatus');
        let recommendedGValue = 0;
        let recommendedGText = '-';
        const finalDiff = parseFloat(currentCumulativeDiffSpan.textContent) || 0;

        if (finalDiff >= 1500) {
            recommendedGText = '670G～';
            recommendedGValue = 670;
        } else if (finalDiff >= 1250) {
            recommendedGText = '640G～';
            recommendedGValue = 640;
        } else if (finalDiff >= 1000) {
            recommendedGText = '620G～';
            recommendedGValue = 620;
        } else if (finalDiff >= 750) {
            recommendedGText = '580G～';
            recommendedGValue = 580;
        } else if (finalDiff >= 500) {
            recommendedGText = '540G～';
            recommendedGValue = 540;
        } else if (finalDiff >= 250) {
            recommendedGText = '510G～';
            recommendedGValue = 510;
        } else if (finalDiff >= 0) {
            recommendedGText = '480G～';
            recommendedGValue = 480;
        } else if (finalDiff >= -250) {
            recommendedGText = '450G～';
            recommendedGValue = 450;
        } else if (finalDiff >= -500) {
            recommendedGText = '430G～';
            recommendedGValue = 430;
        } else if (finalDiff >= -750) {
            recommendedGText = '400G～';
            recommendedGValue = 400;
        } else if (finalDiff >= -1000) {
            recommendedGText = '380G～';
            recommendedGValue = 380;
        } else if (finalDiff >= -1250) {
            recommendedGText = '350G～';
            recommendedGValue = 350;
        } else {
            recommendedGText = '330G～';
            recommendedGValue = 330;
        }
        recommendedGSpan.textContent = recommendedGText;

        // 「打てる！」の判定と表示
        if (lastRow) {
            const currentDigestG = parseInt(lastRow.querySelector('.current-digest-g').textContent) || 0;
            if (currentDigestG >= recommendedGValue) {
                playableStatusSpan.textContent = '打てる！';
                playableStatusSpan.style.color = 'green';
            } else {
                playableStatusSpan.textContent = '';
            }
        } else {
            playableStatusSpan.textContent = '';
        }
    };

    // 初期行のイベントリスナーを設定
    Array.from(dataRowsContainer.children).forEach(row => {
        const hamaInput = row.querySelector('.hama-input');
        const bbInput = row.querySelector('.bb-input');
        const deleteButton = row.querySelector('.delete-row');

        // Ensure initial randomBBG is set for pre-existing rows in HTML
        if (!bbInput.dataset.randomBbg) {
            bbInput.dataset.randomBbg = Math.floor(Math.random() * (34 - 31 + 1)) + 31;
        }

        const handleInputChange = () => {
            updateCumulativeValues();
        };

        hamaInput.addEventListener('input', handleInputChange);
        bbInput.addEventListener('input', handleInputChange);

        deleteButton.addEventListener('click', () => {
            row.remove();
            updateRowNumbers();
            updateCumulativeValues();
        });
    });

    // 「行を追加」ボタンのイベントリスナー
    addRowButton.addEventListener('click', () => {
        dataRowsContainer.appendChild(createRow());
        updateRowNumbers();
        updateCumulativeValues();
    });

    // 「下にシフト」ボタンのイベントリスナー
    shiftDownButton.addEventListener('click', () => {
        const firstRow = dataRowsContainer.firstElementChild;
        if (firstRow) {
            const hama = parseInt(firstRow.querySelector('.hama-input').value) || 0;
            const bb = parseInt(firstRow.querySelector('.bb-input').value) || 0;
            const newRow = createRow(hama, bb); // createRow will generate a new randomBBG for this new row
            dataRowsContainer.insertBefore(newRow, firstRow);
            updateRowNumbers();
            updateCumulativeValues();
        }
    });

    // 「クリア」ボタンのイベントリスナー
    clearAllButton.addEventListener('click', () => {
        Array.from(dataRowsContainer.children).forEach(row => {
            row.querySelector('.hama-input').value = 0;
            row.querySelector('.bb-input').value = 0;
        });
        updateCumulativeValues();
    });

    // 初期表示時の更新
    updateCumulativeValues();
});
