// MQTT Broker 設定
const MQTT_BROKER_HOST = 'broker.emqx.io';
const MQTT_TOPIC = 'onetwothree/all';
let mqttClient = null;

// 根據 protocol 決定 MQTT 連線方式
function getMqttConnectionOptions(providedClientId) {
    const protocol = window.location.protocol;
    let wsProtocol = 'ws';
    let wsPort = 8083;

    if (protocol === 'https:') {
        wsProtocol = 'wss';
        wsPort = 8084;
    }
    const mqttBrokerUrl = `${wsProtocol}://${MQTT_BROKER_HOST}:${wsPort}/mqtt`;

    // 如果未提供 clientId，則生成一個隨機的
    const clientId = providedClientId || 'mqttjs_' + Math.random().toString(16).substr(2, 8);

    return {
        brokerUrl: mqttBrokerUrl,
        options: {
            clientId: clientId,
            keepalive: 60,
            reconnectPeriod: 1000, // ms
            connectTimeout: 30 * 1000, // ms
            // username: 'your_username', // 如有需要
            // password: 'your_password', // 如有需要
            clean: true, // true: 清理會話, false: 保留會話
        }
    };
}

// 連線到 MQTT Broker
function connectMqtt(onConnectCallback, onMessageCallback, onErrorCallback, specificClientId) {
    // 如果 mqttClient 已存在且已連線，先斷開舊的連線
    if (mqttClient && mqttClient.connected) {
        console.log('MQTT 已連線，將先斷開舊連線再重新連線...');
        mqttClient.end(true, () => {
            console.log('舊的 MQTT 連線已斷開。');
            // 確保 clientId 是最新的
            const connectionDetails = getMqttConnectionOptions(specificClientId);
            console.log(`嘗試重新連線到 MQTT Broker: ${connectionDetails.brokerUrl} 使用 Client ID: ${connectionDetails.options.clientId}`);
            mqttClient = mqtt.connect(connectionDetails.brokerUrl, connectionDetails.options);
            setupMqttEventHandlers(onConnectCallback, onMessageCallback, onErrorCallback);
        });
        return specificClientId || (mqttClient.options ? mqttClient.options.clientId : getMqttConnectionOptions().options.clientId); // 返回預期使用的 clientId
    } else if (mqttClient) {
        // 如果存在但未連線 (例如之前嘗試連線失敗或已斷開)
        console.log('MQTT 客戶端實例已存在但未連線，嘗試結束並重新建立...');
        mqttClient.end(true, () => {
            const connectionDetails = getMqttConnectionOptions(specificClientId);
            console.log(`嘗試連線到 MQTT Broker: ${connectionDetails.brokerUrl} 使用 Client ID: ${connectionDetails.options.clientId}`);
            mqttClient = mqtt.connect(connectionDetails.brokerUrl, connectionDetails.options);
            setupMqttEventHandlers(onConnectCallback, onMessageCallback, onErrorCallback);
        });
        return specificClientId || getMqttConnectionOptions().options.clientId; // 返回預期使用的 clientId
    }

    // 首次連線或 mqttClient 為 null
    const connectionDetails = getMqttConnectionOptions(specificClientId);
    console.log(`首次嘗試連線到 MQTT Broker: ${connectionDetails.brokerUrl} 使用 Client ID: ${connectionDetails.options.clientId}`);
    mqttClient = mqtt.connect(connectionDetails.brokerUrl, connectionDetails.options);
    setupMqttEventHandlers(onConnectCallback, onMessageCallback, onErrorCallback);
    
    return connectionDetails.options.clientId; // 返回實際使用的 clientId
}

// 設定 MQTT 事件處理器
function setupMqttEventHandlers(onConnectCallback, onMessageCallback, onErrorCallback) {
    // 清除舊的監聽器，避免重複觸發
    if (mqttClient) {
        mqttClient.removeAllListeners('connect');
        mqttClient.removeAllListeners('message');
        mqttClient.removeAllListeners('error');
        mqttClient.removeAllListeners('reconnect');
        mqttClient.removeAllListeners('close');
        mqttClient.removeAllListeners('offline');
    }

    mqttClient.on('connect', () => {
        console.log('成功連線到 MQTT Broker!');
        subscribeToTopic(MQTT_TOPIC);
        if (onConnectCallback) {
            onConnectCallback(mqttClient.options.clientId); // 將 clientId 回傳給回呼函式
        }
    });

    mqttClient.on('message', (topic, message) => {
        if (onMessageCallback) {
            try {
                onMessageCallback(topic, JSON.parse(message.toString()));
            } catch (e) {
                console.error('無法解析收到的 JSON 訊息:', message.toString(), e);
                onMessageCallback(topic, message.toString()); // 回傳原始字串
            }
        }
    });

    mqttClient.on('error', (err) => {
        console.error('MQTT 連線錯誤:', err);
        if (onErrorCallback) {
            onErrorCallback(err);
        }
    });

    mqttClient.on('reconnect', () => {
        console.log('MQTT 重新連線中...');
    });

    mqttClient.on('close', () => {
        console.log('MQTT 連線已關閉。');
    });

    mqttClient.on('offline', () => {
        console.log('MQTT 客戶端離線。');
    });
}

// 訂閱 TOPIC
function subscribeToTopic(topic) {
    if (mqttClient && mqttClient.connected) {
        mqttClient.subscribe(topic, { qos: 0 }, (err) => {
            if (err) {
                console.error(`訂閱 Topic '${topic}' 失敗: `, err);
            } else {
                console.log(`成功訂閱 Topic: ${topic}`);
            }
        });
    } else {
        console.warn('MQTT 未連線，無法訂閱 Topic。');
    }
}

// 發佈訊息
function publishMessage(topic, messageObject, qos = 0, retain = false) {
    if (mqttClient && mqttClient.connected) {
        const messageString = JSON.stringify(messageObject);
        mqttClient.publish(topic, messageString, { qos, retain }, (err) => {
            if (err) {
                console.error(`發佈訊息到 Topic '${topic}' 失敗: `, err);
            } else {
                // console.log(`成功發佈訊息到 Topic: ${topic}, Message: ${messageString}`);
            }
        });
    } else {
        console.warn('MQTT 未連線，無法發佈訊息。訊息內容:', messageObject);
    }
}

// 斷開 MQTT 連線
function disconnectMqtt() {
    if (mqttClient) {
        mqttClient.end();
        // console.log('MQTT 連線已手動斷開。');
    }
}

// 提供一個獲取目前 clientId 的方法 (如果已連線)
function getCurrentClientId() {
    if (mqttClient && mqttClient.options) {
        return mqttClient.options.clientId;
    }
    return null;
}

// 產生唯一的 clientId
function generateUniqueId(prefix = 'user_') {
    return prefix + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
} 