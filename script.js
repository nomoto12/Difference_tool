
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
        Array.from(dataRowsContainer.children).forEach((row, index) => {
            const span = row.querySelector('span');
            if (span) {
                const labels = ["前回", "前々回", "3回前"];
                span.textContent = labels[index] || `${index + 1}回目`;
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

            // Retrieve the stored randomBBG for this row
            const randomBBG = parseFloat(row.querySelector('.bb-input').dataset.randomBbg) || 0;

            // Calculate individual row's digestG
            let individualRowDigestG = 0;
            if (!(hama === 0 && bb === 0)) {
                individualRowDigestG = hama + (bb * randomBBG);
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
            const hama = parseFloat(firstRow.querySelector('.hama-input').value) || 0;
            const bb = parseFloat(firstRow.querySelector('.bb-input').value) || 0;
            const newRow = createRow(hama, bb); // createRow will generate a new randomBBG for this new row
            dataRowsContainer.insertBefore(newRow, firstRow);
            firstRow.remove(); // 元の最初の行を削除
            updateRowNumbers();
            updateCumulativeValues();
        }
    });

    // 「クリア」ボタンのイベントリスナー
    clearAllButton.addEventListener('click', () => {
        dataRowsContainer.innerHTML = ''; // すべての行を削除
        // 初期行を3つ追加
        dataRowsContainer.appendChild(createRow());
        dataRowsContainer.appendChild(createRow());
        dataRowsContainer.appendChild(createRow());
        updateRowNumbers();
        updateCumulativeValues();
    });

    // 初期表示時の更新
    updateCumulativeValues();
});
