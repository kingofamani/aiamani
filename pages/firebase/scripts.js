// 網站資料
const websiteData = {
    // 功能比較表格資料
    features: [
        { feature: "A/B Testing", spark: "免費", blaze: "免費" },
        { feature: "Analytics", spark: "免費", blaze: "免費" },
        { feature: "App Check", spark: "免費，但受配額限制", blaze: "免費，但受配額限制" },
        { feature: "App Distribution", spark: "免費", blaze: "免費" },
        { feature: "Authentication", spark: "基本功能免費，有MAU限制", blaze: "完整功能，按量計費" },
        { feature: "Cloud Firestore", spark: "有存儲與操作限制", blaze: "無限制，按量計費" },
        { feature: "Cloud Functions", spark: "不適用", blaze: "按調用次數與計算資源計費" },
        { feature: "Cloud Messaging (FCM)", spark: "免費", blaze: "免費" },
        { feature: "Cloud Storage", spark: "有存儲與下載限制", blaze: "無限制，按量計費" },
        { feature: "Crashlytics", spark: "免費", blaze: "免費" },
        { feature: "Firebase ML", spark: "基本功能", blaze: "完整功能，包括Cloud Vision APIs" },
        { feature: "Realtime Database", spark: "有連接數與存儲限制", blaze: "無限制，按量計費" },
        { feature: "Remote Config", spark: "免費", blaze: "免費" },
        { feature: "Test Lab", spark: "有每日測試次數限制", blaze: "按使用時間計費" }
    ],
    
    // 資源限制表格資料
    limits: [
        { category: "Authentication", limit: "每月活躍用戶 (MAU)", spark: "最多50K", blaze: "無限制，超過50K按階梯收費" },
        { category: "Authentication", limit: "每日活躍用戶 (DAU)", spark: "最多3K", blaze: "無限制" },
        { category: "Authentication", limit: "電話驗證", spark: "不可用", blaze: "可用，按SMS發送計費" },
        { category: "Authentication", limit: "SAML/OIDC提供商", spark: "最多50 MAU", blaze: "無限制，超過50按量收費" },
        { category: "Cloud Firestore", limit: "存儲空間", spark: "總共1 GiB", blaze: "無限制，超過1 GiB按量收費" },
        { category: "Cloud Firestore", limit: "網路出口", spark: "10 GiB/月", blaze: "無限制，超過10 GiB/月按量收費" },
        { category: "Cloud Firestore", limit: "文件寫入", spark: "20K/天", blaze: "無限制，超過20K/天按量收費" },
        { category: "Cloud Firestore", limit: "文件讀取", spark: "50K/天", blaze: "無限制，超過50K/天按量收費" },
        { category: "Cloud Firestore", limit: "文件刪除", spark: "20K/天", blaze: "無限制，超過20K/天按量收費" },
        { category: "Cloud Storage", limit: "存儲空間", spark: "5 GB", blaze: "無限制，超過5 GB按量收費" },
        { category: "Cloud Storage", limit: "下載流量", spark: "1 GB/天", blaze: "無限制，超過1 GB/天按量收費" },
        { category: "Cloud Storage", limit: "上傳操作", spark: "20K/天", blaze: "無限制，超過20K/天按量收費" },
        { category: "Cloud Storage", limit: "下載操作", spark: "50K/天", blaze: "無限制，超過50K/天按量收費" },
        { category: "Cloud Storage", limit: "多存儲桶", spark: "不支持", blaze: "支持" },
        { category: "Realtime Database", limit: "同時連接數", spark: "100", blaze: "200K/數據庫" },
        { category: "Realtime Database", limit: "存儲空間", spark: "1 GB", blaze: "無限制，按量收費" },
        { category: "Realtime Database", limit: "下載流量", spark: "10 GB/月", blaze: "無限制，按量收費" },
        { category: "Realtime Database", limit: "多數據庫", spark: "不支持", blaze: "支持" },
        { category: "Cloud Functions", limit: "調用次數", spark: "不適用", blaze: "免費使用高達2M/月，然後$0.40/百萬" },
        { category: "Cloud Functions", limit: "GB-秒", spark: "不適用", blaze: "免費使用高達400K/月，然後按量收費" },
        { category: "Cloud Functions", limit: "CPU-秒", spark: "不適用", blaze: "免費使用高達200K/月，然後按量收費" },
        { category: "Cloud Functions", limit: "出站網絡", spark: "不適用", blaze: "免費使用高達5 GB/月，然後$0.12/GB" }
    ],
    
    // 計費模式表格資料
    pricing: [
        { category: "計費模式", spark: "完全免費，無需信用卡", blaze: "按量付費，需綁定信用卡" },
        { category: "免費額度", spark: "有限的資源配額", blaze: "包含Spark方案的所有免費額度" },
        { category: "超出限制", spark: "服務可能暫停或降級", blaze: "僅對超出免費額度的部分收費" },
        { category: "最低消費", spark: "無", blaze: "無最低消費要求" },
        { category: "計費週期", spark: "不適用", blaze: "每月，月底結算" },
        { category: "費率基礎", spark: "不適用", blaze: "按照底層Google Cloud基礎設施的費率計費" }
    ],
    
    // Spark方案使用場景
    sparkUseCases: [
        {
            title: "開發與測試環境",
            description: "在開發階段使用，無需擔心費用問題，可以自由測試各種功能。"
        },
        {
            title: "個人專案",
            description: "適合個人開發者的小型應用或實驗性專案，完全免費使用。"
        },
        {
            title: "低流量應用",
            description: "月活躍用戶少於限制值的應用（如Authentication的50K MAU），可以長期免費運行。"
        },
        {
            title: "學習與教學",
            description: "學習Firebase功能或用於教學示範，無需擔心產生費用。"
        },
        {
            title: "概念驗證",
            description: "驗證應用概念或功能可行性的初期階段，快速構建原型。"
        }
    ],
    
    // Blaze方案使用場景
    blazeUseCases: [
        {
            title: "生產環境應用",
            description: "已上線且有實際用戶使用的應用，需要穩定可靠的服務。"
        },
        {
            title: "需要進階功能的專案",
            description: "需要使用Spark方案不提供的功能（如電話驗證、Cloud Functions等）。"
        },
        {
            title: "成長型應用",
            description: "預期用戶量或資料量會持續增長的應用，需要無限擴展能力。"
        },
        {
            title: "企業級應用",
            description: "需要SLA保障或企業支援的商業應用，確保服務品質。"
        },
        {
            title: "高流量服務",
            description: "預期會超過Spark方案限制的高流量服務，需要更大的資源配額。"
        },
        {
            title: "多區域部署",
            description: "需要在多個地理區域部署的全球性應用，提供更好的用戶體驗。"
        }
    ],
    
    // Spark方案計費詳情
    sparkPricing: [
        {
            title: "完全免費",
            description: "Spark方案完全免費，無需信用卡，適合開發、測試或小型應用。"
        },
        {
            title: "明確的使用限制",
            description: "所有資源都有明確的使用限制，例如：<br>- Authentication: 50K MAU<br>- Firestore: 1 GiB 存儲，20K 寫入/天<br>- Storage: 5 GB 存儲，1 GB 下載/天"
        },
        {
            title: "超出限制的處理",
            description: "超出限制時，服務可能會暫停或降級，直到下一個計費週期（通常是每天或每月重置）。"
        },
        {
            title: "無隱藏費用",
            description: "不會產生任何費用，是真正的免費方案，適合預算有限的專案。"
        }
    ],
    
    // Blaze方案計費詳情
    blazePricing: [
        {
            title: "按量付費模式",
            description: "只對實際使用的資源收費，無最低消費要求，適合各種規模的應用。"
        },
        {
            title: "包含免費額度",
            description: "包含Spark方案的所有免費額度，僅對超出部分收費，例如：<br>- Authentication: 前50K MAU免費<br>- Firestore: 前1 GiB存儲，前20K寫入/天免費<br>- Storage: 前5 GB存儲，前1 GB下載/天免費"
        },
        {
            title: "階梯式定價",
            description: "許多服務採用階梯式定價，使用量越大，單位成本越低，例如：<br>- Authentication: $0.0055/MAU (50K-100K)，$0.0046/MAU (100K-1M)<br>- Cloud Functions: 前2M調用/月免費，然後$0.40/百萬"
        },
        {
            title: "預算控制",
            description: "可以設置預算提醒和限制，避免意外費用，隨時監控使用量和支出。"
        }
    ],
    
    // 通用建議
    generalTips: [
        "使用Firebase Local Emulator Suite進行開發與測試，在本地模擬Firebase服務，避免產生實際費用。",
        "在Google Cloud Billing中創建預算並設置多個提醒閾值（如50%、80%、100%），確保關鍵團隊成員能收到提醒郵件。",
        "定期在Firebase控制台的「使用量和結算」信息中心查看使用情況，關注接近限制的服務，及時調整。",
        "在應用代碼中實施限流機制，對高成本操作設置硬性限制，避免意外費用。"
    ],
    
    // 數據庫相關建議
    databaseTips: [
        "為查詢添加限制，始終使用.limit()防止返回過多結果，避免頻繁的全集合掃描。",
        "設計合理的數據模型減少讀寫操作，使用複合查詢減少多次請求。",
        "使用分頁加載大量數據，避免一次性加載全部數據，減少不必要的讀取費用。",
        "利用Firestore的緩存功能減少重複讀取，設置適當的緩存策略。"
    ],
    
    // Cloud Functions相關建議
    functionsTips: [
        "謹慎設計函數間的觸發關係，防止函數互相觸發造成無限循環。",
        "為長時間運行的函數設置合理的超時時間，避免因錯誤導致函數長時間運行。",
        "減少不必要的計算和API調用，使用緩存減少重複操作，優化代碼效率。",
        "使用冷啟動優化技術減少函數初始化時間，降低計算資源使用。"
    ],
    
    // Storage相關建議
    storageTips: [
        "上傳前壓縮大文件，考慮分片上傳超大文件，控制文件大小。",
        "使用安全規則限制未授權的下載，防止惡意用戶大量下載產生費用。",
        "設置合理的文件過期策略，自動刪除不再需要的文件，減少存儲費用。",
        "使用Firebase Storage的CDN功能提高下載速度，同時減少出站流量費用。"
    ],
    
    // Spark方案建議
    sparkRecommendations: [
        "開發與測試階段，可以自由嘗試各種功能而不產生費用。",
        "個人或小型專案，預算有限但功能需求不複雜。",
        "確定使用量不會超過免費限制，如月活躍用戶少於50K。",
        "不需要電話驗證、Cloud Functions等高級功能。",
        "希望完全免費使用Firebase服務，無需擔心任何費用。"
    ],
    
    // Blaze方案建議
    blazeRecommendations: [
        "生產環境應用，需要穩定可靠的服務和更大的資源配額。",
        "需要使用電話驗證、Cloud Functions等Spark方案不提供的功能。",
        "預期用戶量或數據量會超過Spark限制，需要無限擴展能力。",
        "需要多區域部署或多存儲桶/數據庫，提供更好的全球性能。",
        "需要企業級支持或SLA保障，確保服務品質。"
    ],
    
    // 升級建議
    upgradeRecommendations: [
        "接近或已達到Spark方案的資源限制，如Authentication的50K MAU。",
        "需要使用Spark方案不提供的功能，如電話驗證或Cloud Functions。",
        "應用進入生產階段並開始獲得實際用戶，需要更穩定的服務。",
        "需要更好的可擴展性和靈活性，應對用戶增長和數據擴展。",
        "業務增長需要更多資源支持，願意為更好的服務支付合理費用。"
    ]
};

// 費用計算器邏輯
const calculator = {
    // 計算Blaze方案費用
    calculateBlazeCost: function(inputs) {
        let totalCost = 0;
        const breakdown = [];
        
        // Authentication費用
        const authUsers = inputs.authUsers;
        let authCost = 0;
        if (authUsers > 50000) {
            const extraUsers = authUsers - 50000;
            if (extraUsers <= 50000) {
                authCost = extraUsers * 0.0055;
                breakdown.push({
                    service: "Authentication",
                    details: `前50K MAU免費，額外${extraUsers.toLocaleString()} MAU @ $0.0055/MAU`,
                    cost: authCost.toFixed(2)
                });
            } else if (extraUsers <= 950000) {
                authCost = 50000 * 0.0055 + (extraUsers - 50000) * 0.0046;
                breakdown.push({
                    service: "Authentication",
                    details: `前50K MAU免費，接下來50K @ $0.0055/MAU，剩餘${(extraUsers - 50000).toLocaleString()} @ $0.0046/MAU`,
                    cost: authCost.toFixed(2)
                });
            } else {
                authCost = 50000 * 0.0055 + 900000 * 0.0046 + (extraUsers - 950000) * 0.0032;
                breakdown.push({
                    service: "Authentication",
                    details: `前50K MAU免費，接下來50K @ $0.0055/MAU，接下來900K @ $0.0046/MAU，剩餘${(extraUsers - 950000).toLocaleString()} @ $0.0032/MAU`,
                    cost: authCost.toFixed(2)
                });
            }
            totalCost += authCost;
        } else {
            breakdown.push({
                service: "Authentication",
                details: `${authUsers.toLocaleString()} MAU（在免費額度內）`,
                cost: "0.00"
            });
        }
        
        // Storage費用
        const storageGB = inputs.storageGB;
        let storageCost = 0;
        if (storageGB > 5) {
            storageCost = (storageGB - 5) * 0.026;
            totalCost += storageCost;
            breakdown.push({
                service: "Cloud Storage",
                details: `前5 GB免費，額外${(storageGB - 5).toFixed(1)} GB @ $0.026/GB`,
                cost: storageCost.toFixed(2)
            });
        } else {
            breakdown.push({
                service: "Cloud Storage",
                details: `${storageGB.toFixed(1)} GB（在免費額度內）`,
                cost: "0.00"
            });
        }
        
        // Firestore讀取費用
        const dbReads = inputs.databaseReads * 30; // 每月
        let readsCost = 0;
        if (dbReads > 50000 * 30) {
            readsCost = (dbReads - 50000 * 30) * 0.06 / 100000;
            totalCost += readsCost;
            breakdown.push({
                service: "Firestore 讀取",
                details: `前${(50000 * 30).toLocaleString()}次/月免費，額外${(dbReads - 50000 * 30).toLocaleString()}次 @ $0.06/100K`,
                cost: readsCost.toFixed(2)
            });
        } else {
            breakdown.push({
                service: "Firestore 讀取",
                details: `${dbReads.toLocaleString()}次/月（在免費額度內）`,
                cost: "0.00"
            });
        }
        
        // Firestore寫入費用
        const dbWrites = inputs.databaseWrites * 30; // 每月
        let writesCost = 0;
        if (dbWrites > 20000 * 30) {
            writesCost = (dbWrites - 20000 * 30) * 0.18 / 100000;
            totalCost += writesCost;
            breakdown.push({
                service: "Firestore 寫入",
                details: `前${(20000 * 30).toLocaleString()}次/月免費，額外${(dbWrites - 20000 * 30).toLocaleString()}次 @ $0.18/100K`,
                cost: writesCost.toFixed(2)
            });
        } else {
            breakdown.push({
                service: "Firestore 寫入",
                details: `${dbWrites.toLocaleString()}次/月（在免費額度內）`,
                cost: "0.00"
            });
        }
        
        // Cloud Functions費用
        const functionsInvocations = inputs.functionsInvocations;
        let functionsCost = 0;
        if (functionsInvocations > 2000000) {
            functionsCost = (functionsInvocations - 2000000) * 0.40 / 1000000;
            totalCost += functionsCost;
            breakdown.push({
                service: "Cloud Functions 調用",
                details: `前2M次/月免費，額外${(functionsInvocations - 2000000).toLocaleString()}次 @ $0.40/百萬`,
                cost: functionsCost.toFixed(2)
            });
        } else {
            breakdown.push({
                service: "Cloud Functions 調用",
                details: `${functionsInvocations.toLocaleString()}次/月（在免費額度內）`,
                cost: "0.00"
            });
        }
        
        // 出站流量費用
        const bandwidthGB = inputs.bandwidthGB;
        let bandwidthCost = 0;
        if (bandwidthGB > 10) {
            bandwidthCost = (bandwidthGB - 10) * 0.12;
            totalCost += bandwidthCost;
            breakdown.push({
                service: "出站流量",
                details: `前10 GB/月免費，額外${(bandwidthGB - 10).toFixed(1)} GB @ $0.12/GB`,
                cost: bandwidthCost.toFixed(2)
            });
        } else {
            breakdown.push({
                service: "出站流量",
                details: `${bandwidthGB.toFixed(1)} GB/月（在免費額度內）`,
                cost: "0.00"
            });
        }
        
        return {
            totalCost: totalCost.toFixed(2),
            breakdown: breakdown
        };
    }
};

// 頁面載入時執行
document.addEventListener('DOMContentLoaded', function() {
    // 生成功能比較表格
    generateFeaturesTable();
    
    // 生成資源限制表格
    generateLimitsTable();
    
    // 生成計費模式表格
    generatePricingTable();
    
    // 生成使用場景卡片
    generateUseCaseCards();
    
    // 生成計費詳情
    generatePricingDetails();
    
    // 生成注意事項
    generateTips();
    
    // 生成方案建議
    generateRecommendations();
    
    // 設置標籤頁切換
    setupTabs();
    
    // 設置計算器
    setupCalculator();
    
    // 添加滾動動畫
    addScrollAnimations();
});

// 生成功能比較表格
function generateFeaturesTable() {
    const tableContainer = document.getElementById('features-table');
    
    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>功能/服務</th>
                    <th>Spark方案（免費）</th>
                    <th>Blaze方案（按量付費）</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    websiteData.features.forEach(item => {
        tableHTML += `
            <tr>
                <td>${item.feature}</td>
                <td>${item.spark}</td>
                <td>${item.blaze}</td>
            </tr>
        `;
    });
    
    tableHTML += `
            </tbody>
        </table>
    `;
    
    tableContainer.innerHTML = tableHTML;
}

// 生成資源限制表格
function generateLimitsTable() {
    const tableContainer = document.getElementById('limits-table');
    
    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>服務</th>
                    <th>限制類型</th>
                    <th>Spark方案（免費）</th>
                    <th>Blaze方案（按量付費）</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    let currentCategory = '';
    
    websiteData.limits.forEach(item => {
        if (item.category !== currentCategory) {
            currentCategory = item.category;
            tableHTML += `
                <tr>
                    <td colspan="4" style="background-color: rgba(0, 0, 0, 0.05); font-weight: bold;">${currentCategory}</td>
                </tr>
            `;
        }
        
        tableHTML += `
            <tr>
                <td></td>
                <td>${item.limit}</td>
                <td>${item.spark}</td>
                <td>${item.blaze}</td>
            </tr>
        `;
    });
    
    tableHTML += `
            </tbody>
        </table>
    `;
    
    tableContainer.innerHTML = tableHTML;
}

// 生成計費模式表格
function generatePricingTable() {
    const tableContainer = document.getElementById('pricing-table');
    
    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>計費特性</th>
                    <th>Spark方案（免費）</th>
                    <th>Blaze方案（按量付費）</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    websiteData.pricing.forEach(item => {
        tableHTML += `
            <tr>
                <td>${item.category}</td>
                <td>${item.spark}</td>
                <td>${item.blaze}</td>
            </tr>
        `;
    });
    
    tableHTML += `
            </tbody>
        </table>
    `;
    
    tableContainer.innerHTML = tableHTML;
}

// 生成使用場景卡片
function generateUseCaseCards() {
    const sparkContainer = document.getElementById('spark-use-cases');
    const blazeContainer = document.getElementById('blaze-use-cases');
    
    let sparkHTML = '';
    websiteData.sparkUseCases.forEach(item => {
        sparkHTML += `
            <div class="use-case-card">
                <h4>${item.title}</h4>
                <p>${item.description}</p>
            </div>
        `;
    });
    
    let blazeHTML = '';
    websiteData.blazeUseCases.forEach(item => {
        blazeHTML += `
            <div class="use-case-card">
                <h4>${item.title}</h4>
                <p>${item.description}</p>
            </div>
        `;
    });
    
    sparkContainer.innerHTML = sparkHTML;
    blazeContainer.innerHTML = blazeHTML;
}

// 生成計費詳情
function generatePricingDetails() {
    const sparkContainer = document.getElementById('spark-pricing');
    const blazeContainer = document.getElementById('blaze-pricing');
    
    let sparkHTML = '';
    websiteData.sparkPricing.forEach(item => {
        sparkHTML += `
            <div class="pricing-item">
                <h4>${item.title}</h4>
                <p>${item.description}</p>
            </div>
        `;
    });
    
    let blazeHTML = '';
    websiteData.blazePricing.forEach(item => {
        blazeHTML += `
            <div class="pricing-item">
                <h4>${item.title}</h4>
                <p>${item.description}</p>
            </div>
        `;
    });
    
    sparkContainer.innerHTML = sparkHTML;
    blazeContainer.innerHTML = blazeHTML;
}

// 生成注意事項
function generateTips() {
    const generalContainer = document.getElementById('general-tips');
    const databaseContainer = document.getElementById('database-tips');
    const functionsContainer = document.getElementById('functions-tips');
    const storageContainer = document.getElementById('storage-tips');
    
    let generalHTML = '';
    websiteData.generalTips.forEach(tip => {
        generalHTML += `<div class="tip-item"><p>${tip}</p></div>`;
    });
    
    let databaseHTML = '';
    websiteData.databaseTips.forEach(tip => {
        databaseHTML += `<div class="tip-item"><p>${tip}</p></div>`;
    });
    
    let functionsHTML = '';
    websiteData.functionsTips.forEach(tip => {
        functionsHTML += `<div class="tip-item"><p>${tip}</p></div>`;
    });
    
    let storageHTML = '';
    websiteData.storageTips.forEach(tip => {
        storageHTML += `<div class="tip-item"><p>${tip}</p></div>`;
    });
    
    generalContainer.innerHTML += generalHTML;
    databaseContainer.innerHTML += databaseHTML;
    functionsContainer.innerHTML += functionsHTML;
    storageContainer.innerHTML += storageHTML;
}

// 生成方案建議
function generateRecommendations() {
    const sparkContainer = document.getElementById('spark-recommendations');
    const blazeContainer = document.getElementById('blaze-recommendations');
    const upgradeContainer = document.getElementById('upgrade-recommendations');
    
    let sparkHTML = '';
    websiteData.sparkRecommendations.forEach(item => {
        sparkHTML += `<li>${item}</li>`;
    });
    
    let blazeHTML = '';
    websiteData.blazeRecommendations.forEach(item => {
        blazeHTML += `<li>${item}</li>`;
    });
    
    let upgradeHTML = '';
    websiteData.upgradeRecommendations.forEach(item => {
        upgradeHTML += `<li>${item}</li>`;
    });
    
    sparkContainer.innerHTML = sparkHTML;
    blazeContainer.innerHTML = blazeHTML;
    upgradeContainer.innerHTML = upgradeHTML;
}

// 設置標籤頁切換
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 移除所有活動狀態
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // 添加當前活動狀態
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// 設置計算器
function setupCalculator() {
    const calculateBtn = document.getElementById('calculate-btn');
    
    calculateBtn.addEventListener('click', () => {
        const inputs = {
            authUsers: parseInt(document.getElementById('auth-users').value) || 0,
            storageGB: parseFloat(document.getElementById('storage-gb').value) || 0,
            databaseReads: parseInt(document.getElementById('database-reads').value) || 0,
            databaseWrites: parseInt(document.getElementById('database-writes').value) || 0,
            functionsInvocations: parseInt(document.getElementById('functions-invocations').value) || 0,
            bandwidthGB: parseFloat(document.getElementById('bandwidth-gb').value) || 0
        };
        
        // 檢查Spark方案是否可用
        let sparkResult = "免費";
        let sparkAvailable = true;
        
        if (inputs.authUsers > 50000) {
            sparkAvailable = false;
            sparkResult += "（超出MAU限制）";
        }
        
        if (inputs.functionsInvocations > 0) {
            sparkAvailable = false;
            sparkResult += "（不支持Cloud Functions）";
        }
        
        if (inputs.databaseReads > 50000) {
            sparkAvailable = false;
            sparkResult += "（超出讀取限制）";
        }
        
        if (inputs.databaseWrites > 20000) {
            sparkAvailable = false;
            sparkResult += "（超出寫入限制）";
        }
        
        if (inputs.storageGB > 5) {
            sparkAvailable = false;
            sparkResult += "（超出存儲限制）";
        }
        
        if (inputs.bandwidthGB > 10) {
            sparkAvailable = false;
            sparkResult += "（超出流量限制）";
        }
        
        if (sparkAvailable) {
            sparkResult = "免費（所有使用量在免費額度內）";
        }
        
        // 計算Blaze方案費用
        const blazeResult = calculator.calculateBlazeCost(inputs);
        
        // 更新結果
        document.getElementById('spark-result').textContent = sparkResult;
        document.getElementById('blaze-result').textContent = `$${blazeResult.totalCost}/月`;
        
        // 更新費用明細
        const breakdownContainer = document.getElementById('cost-breakdown');
        let breakdownHTML = '<h4>費用明細：</h4>';
        
        blazeResult.breakdown.forEach(item => {
            breakdownHTML += `
                <div class="cost-item">
                    <span>${item.service}</span>
                    <span>$${item.cost}</span>
                </div>
                <div class="cost-item-details">
                    <small>${item.details}</small>
                </div>
            `;
        });
        
        breakdownContainer.innerHTML = breakdownHTML;
    });
}

// 添加滾動動畫
function addScrollAnimations() {
    const sections = document.querySelectorAll('.section');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, { threshold: 0.1 });
    
    sections.forEach(section => {
        observer.observe(section);
    });
}

// 平滑滾動
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 70,
                behavior: 'smooth'
            });
        }
    });
});
