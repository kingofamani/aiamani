document.addEventListener('DOMContentLoaded', () => {
    const joinGameSection = document.getElementById('joinGameSection');
    const gameplaySection = document.getElementById('gameplaySection');
    const inputStudentName = document.getElementById('inputStudentName');
    const btnJoinGame = document.getElementById('btnJoinGame');
    const displayStudentNameElement = document.getElementById('displayStudentName');
    const gameStatusElement = document.getElementById('gameStatus');
    const messageLogElement = document.getElementById('messageLog');
    
    // 新增的視覺元素
    const avatarTextElement = document.getElementById('avatarText');
    const studentStatusElement = document.getElementById('studentStatus');
    const statusIconElement = document.getElementById('statusIcon');
    const statusTextElement = document.getElementById('statusText');
    const gameStatusIconElement = document.getElementById('gameStatusIcon');
    const teacherStatusAreaElement = document.getElementById('teacherStatusArea');
    const teacherStatusIconElement = document.getElementById('teacherStatusIcon');
    const teacherStatusTextElement = document.getElementById('teacherStatusText');
    const teacherCommandDisplayElement = document.getElementById('teacherCommandDisplay');

    // 移動控制
    const movementControlsElement = document.getElementById('movementControls');
    const btnMove = document.getElementById('btnMove');

    let studentClientId = null; 
    let studentName = '';
    let amCaught = false;
    let canMove = false; // 控制是否可以移動
    let isGameStarted = false;
    let hasFinished = false; // 新增：追蹤是否過關
    let currentTeacherCommand = ""; // 新增，追蹤老師當前口令
    let isSafeToMove = false; // 新增，根據老師口令判斷是否安全

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
        messageLogElement.appendChild(p);
        messageLogElement.scrollTop = messageLogElement.scrollHeight;
    }

    function updateGameStatus(status, icon = '⏳') {
        gameStatusElement.textContent = status;
        gameStatusIconElement.textContent = icon;
        logMessage(`遊戲狀態更新: ${status}`, 'event');
    }

    function updateStudentStatus(status, icon, className) {
        statusIconElement.textContent = icon;
        statusTextElement.textContent = status;
        studentStatusElement.className = `student-status ${className}`;
    }

    function updateMoveButton(enabled) {
        if (btnMove) {
            // 按鈕是否啟用，現在只判斷 遊戲開始、未被抓、未完成
            // isSafeToMove 的判斷會移到點擊事件中
            const shouldEnable = enabled && isGameStarted && !amCaught && !hasFinished;
            btnMove.disabled = !shouldEnable;
            // canMove 變數現在主要反映按鈕是否 दिखने में enabled，實際能否安全移動由 isSafeToMove 決定
            canMove = shouldEnable; 
            if (shouldEnable) {
                btnMove.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            } else {
                btnMove.style.background = '#95a5a6';
            }
        }
    }

    function updateTeacherStatusDisplay(command, isSafe) {
        currentTeacherCommand = command;
        isSafeToMove = isSafe; // isSafeToMove 還是要正確設定，供點擊事件判斷

        if (teacherStatusAreaElement && teacherStatusIconElement && teacherCommandDisplayElement && teacherStatusTextElement) {
            teacherCommandDisplayElement.textContent = command; 
            if (!isSafe) { 
                teacherStatusIconElement.textContent = '👀';
                teacherStatusTextElement.textContent = '老師在看！';
                teacherStatusAreaElement.classList.add('looking');
                teacherCommandDisplayElement.classList.add('dangerous');
                teacherCommandDisplayElement.classList.remove('safe');
                if (isGameStarted && !amCaught && !hasFinished) {
                    updateStudentStatus('危險！試著保持不動！', '⚠️', 'danger'); // 提示文字微調
                }
            } else { 
                teacherStatusIconElement.textContent = '🧍‍♂️🔙';
                teacherStatusTextElement.textContent = '老師背對著';
                teacherStatusAreaElement.classList.remove('looking');
                teacherCommandDisplayElement.classList.add('safe');
                teacherCommandDisplayElement.classList.remove('dangerous');
                if (isGameStarted && !amCaught && !hasFinished) {
                    updateStudentStatus('安全，可以移動', '✅', 'safe');
                }
            }
        }
        // 更新移動按鈕狀態：此處的 enabled 參數傳遞 true，因為按鈕本身保持啟用
        // 實際能否安全移動由 isSafeToMove 在點擊時判斷
        updateMoveButton(isGameStarted && !amCaught && !hasFinished); 
    }

    function updateAvatar(name) {
        if (avatarTextElement) {
            // 使用名字的第一個字或預設頭像
            const firstChar = name.substring(0, 1).toUpperCase();
            avatarTextElement.textContent = firstChar || '👤';
        }
    }

    function markAsCaught() {
        amCaught = true;
        updateStudentStatus('被抓了', '❌', 'caught');
        updateGameStatus('你被老師抓到了！遊戲結束。', '💥');
        updateMoveButton(false);
        hasFinished = false; // 被抓了就不算過關
        
        // 讓頭像變灰
        if (avatarTextElement && avatarTextElement.parentElement) {
            avatarTextElement.parentElement.style.filter = 'grayscale(100%)';
            avatarTextElement.parentElement.style.opacity = '0.7';
        }
        
        // 隱藏移動控制
        if (movementControlsElement) {
            movementControlsElement.style.display = 'none';
        }
    }

    // MQTT 連線成功後的回呼
    function onMqttConnect(assignedClientId) {
        studentClientId = assignedClientId;
        logMessage(`學生端 MQTT 已連線，Client ID: ${studentClientId}`, 'success');
        
        // 更新頭像
        updateAvatar(studentName);
        hasFinished = false; // 重置過關狀態
        
        // 發送加入遊戲訊息
        const joinMessage = {
            type: 'PLAYER_JOIN',
            senderId: studentClientId,
            role: 'student',
            name: studentName,
            clientId: studentClientId,
            timestamp: Date.now()
        };
        publishMessage(MQTT_TOPIC, joinMessage);
        logMessage(`已發送加入遊戲請求，暱稱: ${studentName}`, 'success');

        joinGameSection.style.display = 'none';
        gameplaySection.style.display = 'block';
        displayStudentNameElement.textContent = studentName;
        updateGameStatus('已成功加入遊戲，等待老師開始...', '✅');
        updateStudentStatus('已連線', '🟢', 'safe');
        updateTeacherStatusDisplay("", true); // 初始顯示為安全，無口令
        updateMoveButton(false);
        isGameStarted = false;
    }

    // 收到 MQTT 訊息的回呼
    function onMqttMessage(topic, message) {
        logMessage(`收到訊息: ${JSON.stringify(message)}`);

        if ((amCaught || hasFinished) && message.type !== 'GAME_END' && message.type !== 'GAME_START' && message.type !== 'COMMAND_UPDATE') {
            return;
        }
        if (message.senderId === studentClientId) return;

        switch (message.type) {
            case 'GAME_START':
                isGameStarted = true;
                amCaught = false; 
                hasFinished = false; 
                updateGameStatus('遊戲開始！', '🏁');
                logMessage('遊戲開始！', 'success');
                if (avatarTextElement && avatarTextElement.parentElement) {
                    avatarTextElement.parentElement.style.filter = 'none';
                    avatarTextElement.parentElement.style.opacity = '1';
                }
                if (movementControlsElement) {
                    movementControlsElement.style.display = 'block'; 
                }
                // 遊戲開始時，按鈕狀態依賴於 COMMAND_UPDATE，但由於 updateMoveButton 內部邏輯改變，
                // 可以先呼叫一次，確保在第一個 COMMAND_UPDATE 前按鈕是基於遊戲狀態的正確可視狀態
                updateMoveButton(true);
                break;

            case 'COMMAND_UPDATE': 
                if (message.command !== undefined && typeof message.isSafe === 'boolean') {
                    updateTeacherStatusDisplay(message.command, message.isSafe);
                    logMessage(`老師口令: ${message.command}, 安全: ${message.isSafe}`, 'event');
                    // updateMoveButton 會在 updateTeacherStatusDisplay 內部被調用，此處無需重複
                }
                break;
            
            case 'PLAYER_CAUGHT':
                if (message.playerId === studentClientId) {
                    markAsCaught();
                    logMessage('你被淘汰了！', 'error');
                } else if (message.playerName) {
                    logMessage(`${message.playerName} 被抓了！`, 'event');
                }
                break;
                
            case 'PLAYER_FINISHED':
                if (message.playerId === studentClientId) {
                    updateGameStatus('恭喜你成功抵達終點！🎉', '🏆');
                    updateStudentStatus('成功過關', '🏆', 'safe'); 
                    updateMoveButton(false); 
                    hasFinished = true; 
                    logMessage('你成功過關了！', 'success');
                }
                break;
                
            case 'GAME_END':
                isGameStarted = false;
                amCaught = false;
                hasFinished = false;

                updateGameStatus('遊戲結束。等待老師開始新回合...', '⏳');
                updateStudentStatus('等待開始', '🧘', 'safe');
                
                if (avatarTextElement && avatarTextElement.parentElement) {
                    avatarTextElement.parentElement.style.filter = 'none';
                    avatarTextElement.parentElement.style.opacity = '1';
                }
                if (movementControlsElement) {
                    movementControlsElement.style.display = 'block'; 
                }
                if (studentStatusElement) {
                    studentStatusElement.className = 'student-status safe'; 
                }

                updateTeacherStatusDisplay("遊戲結束", true); 
                updateMoveButton(false); // 遊戲結束，明確禁用按鈕
                logMessage('老師已結束遊戲。新回合準備中。', 'event');
                break;
                
            default:
                break;
        }
    }

    function onMqttError(error) {
        updateGameStatus('MQTT 連線錯誤', '❌');
        updateStudentStatus('連線失敗', '❌', 'caught');
        logMessage(`MQTT 連線錯誤: ${error.message}`, 'error');
        joinGameSection.style.display = 'block';
        gameplaySection.style.display = 'none';
    }

    btnJoinGame.addEventListener('click', () => {
        studentName = inputStudentName.value.trim();
        if (!studentName) {
            alert('請輸入你的暱稱！');
            inputStudentName.focus();
            return;
        }
        if (studentName.length > 20) {
            alert('暱稱請勿超過20個字元!');
            inputStudentName.focus();
            return;
        }

        studentClientId = generateUniqueId('student_');
        amCaught = false;
        canMove = false;
        isGameStarted = false; // 加入時遊戲尚未開始
        hasFinished = false; // 重置過關狀態
        
        // 重設視覺狀態
        if (avatarTextElement && avatarTextElement.parentElement) {
            avatarTextElement.parentElement.style.filter = 'none';
            avatarTextElement.parentElement.style.opacity = '1';
        }
        
        if (movementControlsElement) {
            movementControlsElement.style.display = 'block';
        }
        
        connectMqtt(onMqttConnect, onMqttMessage, onMqttError, studentClientId);
        updateGameStatus('正在加入遊戲並連線中...', '🔄');
    });

    // 移動按鈕事件
    if (btnMove) {
        btnMove.addEventListener('click', () => {
            if (!mqttClient || !mqttClient.connected || !isGameStarted || amCaught || hasFinished) {
                logMessage('無法移動：MQTT未連線或遊戲未開始/已結束/已被抓/已完成。', 'warn');
                return;
            }

            // 即使在 !isSafeToMove (例如 "木頭人" 狀態) 時，我們仍然允許發送移動訊息。
            // 老師端會判斷此移動是否違規。
            if (!isSafeToMove) {
                logMessage('警告：嘗試在老師看時移動！此移動可能會被判定為犯規。', 'warn');
                // 不再 return，允許訊息發送
            }

            const moveMessage = {
                type: 'PLAYER_MOVE',
                senderId: studentClientId,
                role: 'student',
                playerId: studentClientId,
                playerName: studentName,
                timestamp: Date.now()
            };
            publishMessage(MQTT_TOPIC, moveMessage);
            logMessage('已發送移動請求。', 'event');
        });
    }

    // 處理 Enter 鍵加入遊戲
    inputStudentName.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            btnJoinGame.click();
        }
    });

    // 處理頁面卸載時的 MQTT 斷線
    window.addEventListener('beforeunload', () => {
        if (mqttClient && mqttClient.connected && studentClientId) {
            const leaveMessage = { 
                type: 'PLAYER_LEAVE',
                senderId: studentClientId, 
                role: 'student', 
                clientId: studentClientId,
                name: studentName,
                timestamp: Date.now() 
            };
            publishMessage(MQTT_TOPIC, leaveMessage, 0, false); 
        }
        disconnectMqtt();
    });
}); 