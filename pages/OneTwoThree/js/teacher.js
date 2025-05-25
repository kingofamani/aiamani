document.addEventListener('DOMContentLoaded', () => {
    const gameStatusElement = document.getElementById('gameStatus');
    const gamePlayersAreaElement = document.getElementById('gamePlayersArea');
    const messageLogElement = document.getElementById('messageLog');
    const teacherIconDisplayElement = document.getElementById('teacherIconDisplay');
    const commandTextDisplayElement = document.getElementById('commandTextDisplay');
    const teacherStatusCircleElement = document.getElementById('teacherStatusCircle');
    const toastContainer = document.getElementById('toastContainer');
    const studentStatusListElement = document.getElementById('studentStatusList');

    const btnStartGame = document.getElementById('btnStartGame');
    const btnCycleCommand = document.getElementById('btnCycleCommand');
    const btnEndGame = document.getElementById('btnEndGame');

    let teacherClientId = generateUniqueId('teacher_');
    let connectedStudents = {}; // { clientId: { name, circleElement, position: {x, y} } }
    let studentColorIndex = 0;
    let MAX_PROGRESS = 110; // 預設值，會被重新計算
    let teacherIsLooking = false; // 老師是否正在看 (即"木頭人"狀態)

    const commands = ["1", "2", "3", "木頭人"];
    let currentCommandIndex = -1; // 初始為-1，第一次按鈕會是 "1"

    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        toastContainer.appendChild(toast);
        
        // 3秒後移除toast
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    function logMessage(message, type = 'info') {
        const p = document.createElement('p');
        p.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        if (type === 'error') {
            p.style.color = 'red';
        } else if (type === 'event') {
            p.style.color = 'blue';
        } else if (type === 'success') {
            p.style.color = 'green';
        }
        if (messageLogElement) {
            messageLogElement.appendChild(p);
            messageLogElement.scrollTop = messageLogElement.scrollHeight;
        } else {
            console.log(`Log (${type}): ${message}`);
        }
    }

    function updateGameStatus(status, toastType = 'info') {
        // 不再更新gameStatusElement，改用toast
        showToast(status, toastType);
        logMessage(`遊戲狀態更新: ${status}`, 'event');
    }

    function updateTeacherIconAndCommand(command) {
        teacherIsLooking = (command === "木頭人");
        if (teacherIconDisplayElement && teacherStatusCircleElement && commandTextDisplayElement) {
            commandTextDisplayElement.textContent = command;

            // 移除舊的狀態 class
            commandTextDisplayElement.classList.remove('safe', 'dangerous');
            teacherStatusCircleElement.classList.remove('looking');

            if (command === "") { // 初始或重置狀態
                teacherIconDisplayElement.textContent = '🧍‍♂️🔙';
                // 不需要添加 'safe' 或 'dangerous' class，保持中性外觀
            } else if (teacherIsLooking) { // "木頭人" 狀態
                teacherIconDisplayElement.textContent = '👀';
                teacherStatusCircleElement.classList.add('looking');
                commandTextDisplayElement.classList.add('dangerous');
            } else { // "1", "2", "3" 狀態 (安全)
                teacherIconDisplayElement.textContent = '🧍‍♂️🔙';
                commandTextDisplayElement.classList.add('safe');
            }
        }
    }

    function cycleCommand() {
        currentCommandIndex = (currentCommandIndex + 1) % commands.length;
        const currentCommand = commands[currentCommandIndex];
        updateTeacherIconAndCommand(currentCommand);

        const isSafe = (currentCommand !== "木頭人");
        const message = {
            type: 'COMMAND_UPDATE',
            senderId: teacherClientId,
            role: 'teacher',
            command: currentCommand,
            isSafe: isSafe,
            timestamp: Date.now()
        };
        publishMessage(MQTT_TOPIC, message);
        logMessage(`發送口令: ${currentCommand}, 安全狀態: ${isSafe}`, 'event');
        // 口令直接顯示在 commandTextDisplayElement，不再使用toast
        // updateGameStatus(`口令: ${currentCommand}`, isSafe ? 'info' : 'warning');
    }

    function getStudentPosition() {
        // 學生在底部排列，不需要隨機位置
        return {
            progress: 0 // 記錄學生的前進進度
        };
    }

    function addStudentToArea(clientId, name) {
        if (connectedStudents[clientId] || !gamePlayersAreaElement) return;

        const circle = document.createElement('div');
        circle.className = `student-circle color-${(studentColorIndex % 8) + 1}`;
        circle.id = `student-${clientId}`;

        const studentName = document.createElement('div');
        studentName.className = 'student-name';
        studentName.textContent = name;

        const catchBtn = document.createElement('button');
        catchBtn.className = 'catch-btn';
        catchBtn.textContent = '✕';
        catchBtn.onclick = (e) => {
            e.stopPropagation();
            if (mqttClient && mqttClient.connected) {
                const caughtMessage = {
                    type: 'PLAYER_CAUGHT',
                    senderId: teacherClientId,
                    role: 'teacher',
                    playerId: clientId,
                    playerName: name,
                    timestamp: Date.now()
                };
                publishMessage(MQTT_TOPIC, caughtMessage);
                logMessage(`已標記 ${name} (${clientId.substring(0,8)}) 被抓到了。`, 'success');
                circle.classList.add('caught');
            } else {
                logMessage('MQTT 未連線，無法標記學生。', 'error');
            }
        };

        circle.appendChild(studentName);
        circle.appendChild(catchBtn);

        // 添加到flex容器中，學生會自動排列在底部
        gamePlayersAreaElement.appendChild(circle);

        const position = getStudentPosition();
        connectedStudents[clientId] = { 
            name: name, 
            circleElement: circle, 
            progress: 0, // 初始進度為0
            yTranslate: 0, 
            statusListItem: updateStudentStatusEntry(clientId, name, '等待開始') // 初始狀態
        };
        
        studentColorIndex++;
        logMessage(`${name} (ID: ${clientId.substring(0,8)}) 已加入遊戲。`, 'success');
    }

    function moveStudentUp(clientId, playerName) {
        if (connectedStudents[clientId]) {
            const studentData = connectedStudents[clientId];
            const circle = studentData.circleElement;

            if (circle.classList.contains('finished')) {
                return; // 已經完成的學生，不再處理移動
            }

            // 核心邏輯：如果老師正在看，任何移動都會導致被抓
            if (teacherIsLooking) {
                markStudentAsCaughtOnDisplay(clientId, playerName); // 在老師端標記為被抓
                const caughtMessage = {
                    type: 'PLAYER_CAUGHT',
                    senderId: teacherClientId,
                    role: 'teacher',
                    playerId: clientId,
                    playerName: playerName,
                    timestamp: Date.now()
                };
                publishMessage(MQTT_TOPIC, caughtMessage); // 通知學生和其他人
                showToast(`${playerName} 在老師看時移動，被抓到了！`, 'error');
                logMessage(`${playerName} 在老師看時移動，被抓！`, 'warning');
                return; // 被抓後，不進行後續的移動或完成判斷
            }

            // 正常移動邏輯
            studentData.yTranslate -= 10; 
            studentData.progress += 10;
            circle.style.transform = `translateY(${studentData.yTranslate}px)`;
            logMessage(`${playerName} 向前移動了！進度: ${studentData.progress}/${MAX_PROGRESS}`, 'event');
            // 只有在遊戲進行中才更新進度文字，避免重置時被覆蓋
            if (teacherIsLooking === false || studentData.progress < MAX_PROGRESS) { 
                updateStudentStatusEntry(clientId, playerName, `進度: ${studentData.progress}/${MAX_PROGRESS}`);
            }

            // 檢查是否抵達終點
            if (studentData.progress >= MAX_PROGRESS) {
                logMessage(`${playerName} 抵達終點！`, 'success');
                // 確保精確停在終點線上
                studentData.yTranslate = -MAX_PROGRESS;
                studentData.progress = MAX_PROGRESS;
                circle.style.transform = `translateY(${studentData.yTranslate}px)`;
                
                circle.style.setProperty('--final-y', studentData.yTranslate + 'px');
                circle.classList.add('finished');
                showToast(`${playerName} 成功過關！🎉`, 'success');
                updateStudentStatusEntry(clientId, playerName, '🎉 過關!', 'finished');
                
                const finishedMessage = {
                    type: 'PLAYER_FINISHED',
                    senderId: teacherClientId,
                    role: 'teacher',
                    playerId: clientId,
                    playerName: playerName,
                    timestamp: Date.now()
                };
                publishMessage(MQTT_TOPIC, finishedMessage);
            }
        }
    }

    function removeStudentCircleAndData(clientId) { // 新函數：移除圓圈和內部資料
        if (connectedStudents[clientId]) {
            const studentName = connectedStudents[clientId].name;
            if (gamePlayersAreaElement && connectedStudents[clientId].circleElement) {
                connectedStudents[clientId].circleElement.remove();
            }
            delete connectedStudents[clientId];
            logMessage(`學生 ${studentName} (${clientId.substring(0,8)}) 的圓圈和遊戲資料已移除。`, 'event');
            return studentName; // 返回學生姓名供日誌使用
        }
        return null;
    }

    function markStudentAsCaughtOnDisplay(playerId, playerNameFromMessage) {
        if (connectedStudents[playerId]) {
            const studentData = connectedStudents[playerId];
            studentData.circleElement.classList.add('caught');
            logMessage(`${playerNameFromMessage || studentData.name} 被抓了！`, 'event');
            updateStudentStatusEntry(playerId, playerNameFromMessage || studentData.name, '🤕 被抓了!', 'caught');
        }
    }

    function removeStudentStatusEntry(clientId, studentNameForLog = '未知學生') { // 修改簽名並更新日誌
        logMessage(`嘗試從狀態列表移除 ${studentNameForLog} (ID: ${clientId.substring(0,8)})`, 'info');
        if (!studentStatusListElement) {
            logMessage(`studentStatusListElement 為空，無法移除 ${studentNameForLog} 的狀態項。`, 'warn');
            return;
        }
        const listItem = document.getElementById(`status-${clientId}`);
        if (listItem) {
            listItem.remove();
            logMessage(`${studentNameForLog} (ID: ${clientId.substring(0,8)}) 的狀態項已成功移除。`, 'success');
        } else {
            logMessage(`${studentNameForLog} (ID: ${clientId.substring(0,8)}) 的狀態項 (ID: status-${clientId}) 未找到。可能已被移除。`, 'warn');
        }
    }

    function onMqttConnect(assignedClientId) {
        teacherClientId = assignedClientId;
        updateGameStatus('已連線，等待學生加入...', 'success');
        logMessage(`老師端 MQTT 已連線，Client ID: ${teacherClientId}`, 'success');
        if(gamePlayersAreaElement) gamePlayersAreaElement.innerHTML = '';
        if(studentStatusListElement) studentStatusListElement.innerHTML = ''; // 清空狀態列表
        connectedStudents = {};
        studentColorIndex = 0;
        currentCommandIndex = -1; // 重設口令索引
        updateTeacherIconAndCommand(""); // 初始不顯示口令，或者可以設置為 "準備"

        // 動態計算MAX_PROGRESS
        const gpaHeight = gamePlayersAreaElement.clientHeight;
        if (gpaHeight > 150) { // 確保有足夠的空間移動
            MAX_PROGRESS = gpaHeight - 150;
        } else {
            MAX_PROGRESS = 30; // 如果空間太小，設置一個較小的步數作為備用
        }
        console.log(`[GameSetup] gamePlayersArea Height: ${gpaHeight}px, Calculated MAX_PROGRESS: ${MAX_PROGRESS}px`);
    }

    function onMqttMessage(topic, message) {
        logMessage(`收到訊息: ${JSON.stringify(message)}`);
        if (message.senderId === teacherClientId) return;

        switch (message.type) {
            case 'PLAYER_JOIN':
                if (message.role === 'student' && message.name && message.clientId) {
                    addStudentToArea(message.clientId, message.name);
                }
                break;
                
            case 'PLAYER_MOVE':
                if (message.role === 'student' && message.playerId) {
                    moveStudentUp(message.playerId, message.playerName || message.senderId);
                }
                break;
                
            case 'PLAYER_CAUGHT': 
                if (message.playerId) {
                    markStudentAsCaughtOnDisplay(message.playerId, message.playerName);
                }
                break;
                
            case 'PLAYER_LEAVE':
                if (message.role === 'student' && message.clientId) {
                    const studentIdToRemove = message.clientId;
                    // 嘗試先從 connectedStudents 中獲取名字，如果不存在，則使用訊息中的名字
                    let studentName = connectedStudents[studentIdToRemove] ? connectedStudents[studentIdToRemove].name : message.name;
                    if (!studentName || studentName === 'undefined') studentName = '未知學生'; // 確保名字有效

                    logMessage(`收到 ${studentName} (ID: ${studentIdToRemove.substring(0,8)}) 的離開訊息。`, 'event');

                    // 移除圓圈和內部資料
                    removeStudentCircleAndData(studentIdToRemove);

                    // 無論學生是否仍在 connectedStudents 中，都嘗試從右側狀態列表移除
                    removeStudentStatusEntry(studentIdToRemove, studentName);
                }
                break;
                
            default:
                break;
        }
    }

    function onMqttError(error) {
        updateGameStatus('MQTT 連線錯誤', 'error');
        logMessage(`MQTT 連線錯誤: ${error.message}`, 'error');
    }

    if (btnStartGame) {
        btnStartGame.addEventListener('click', () => {
            if (mqttClient && mqttClient.connected) {
                const startGameMessage = {
                    type: 'GAME_START',
                    senderId: teacherClientId,
                    role: 'teacher',
                    timestamp: Date.now()
                };
                publishMessage(MQTT_TOPIC, startGameMessage);
                updateGameStatus('遊戲開始！', 'success');
                logMessage('遊戲已開始', 'event');
                // 遊戲開始時，可以自動喊第一個口令 "1"
                if (currentCommandIndex === -1) { // 確保只在未開始喊口令時自動喊
                    cycleCommand();
                }
            } else {
                logMessage('MQTT 未連線，無法開始遊戲。', 'error');
                showToast('MQTT 未連線，請檢查網路。', 'error');
            }
        });
    }

    if (btnCycleCommand) {
        btnCycleCommand.addEventListener('click', cycleCommand);
    }

    if (btnEndGame) {
        btnEndGame.addEventListener('click', () => {
            if (mqttClient && mqttClient.connected) {
                const endGameMessage = { type: 'GAME_END', senderId: teacherClientId, role: 'teacher', timestamp: Date.now() };
                publishMessage(MQTT_TOPIC, endGameMessage);
                updateGameStatus('遊戲已結束。準備新回合...', 'info');
                updateTeacherIconAndCommand(""); 
                teacherIsLooking = false; 
                currentCommandIndex = -1; // 重置口令循環索引
                logMessage('遊戲結束！', 'event');

                // 重置所有學生的狀態和位置
                for (const studentId in connectedStudents) {
                    const studentData = connectedStudents[studentId];
                    studentData.progress = 0;
                    studentData.yTranslate = 0;
                    studentData.circleElement.style.transform = 'translateY(0px)';
                    studentData.circleElement.classList.remove('caught', 'finished');
                    studentData.circleElement.style.setProperty('--final-y', '0px'); 
                    updateStudentStatusEntry(studentId, studentData.name, '等待開始');
                }
                showToast('新回合已準備好，可按開始遊戲！', 'success');
            } else { 
                updateGameStatus('MQTT 未連線，無法結束遊戲。', 'error');
                logMessage('MQTT 未連線，無法結束遊戲。', 'error'); 
            }
        });
    }

    // 監聽鍵盤空白鍵
    document.addEventListener('keydown', (event) => {
        if (event.code === 'Space') {
            event.preventDefault(); // 防止頁面滾動等預設行為
            if (btnCycleCommand) { // 確保按鈕存在
                 cycleCommand();
            }
        }
    });

    // 初始化 MQTT 連線
    connectMqtt(onMqttConnect, onMqttMessage, onMqttError, teacherClientId);

    // 新增：更新右側學生狀態列表的函數
    function updateStudentStatusEntry(clientId, name, statusText, statusClass = '') {
        if (!studentStatusListElement) return;

        let listItem = document.getElementById(`status-${clientId}`);
        if (!listItem) {
            listItem = document.createElement('li');
            listItem.id = `status-${clientId}`;
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'student-name-status';
            listItem.appendChild(nameSpan);

            const progressSpan = document.createElement('span');
            progressSpan.className = 'student-progress-status';
            listItem.appendChild(progressSpan);
            
            studentStatusListElement.appendChild(listItem);
        }
        
        listItem.className = statusClass; // 'caught', 'finished'
        listItem.querySelector('.student-name-status').textContent = name;
        listItem.querySelector('.student-progress-status').textContent = statusText;
    }
}); 