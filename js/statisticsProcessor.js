/**
 * 학생 통계 데이터 처리 모듈
 * 
 * 학생들의 stat1~8 데이터를 처리하고, 
 * 평균과 표준편차를 계산 및 관리하는 기능을 제공합니다.
 */

// 통계 데이터를 저장할 객체
const statisticsData = {
    // 각 통계 항목별 데이터 배열
    rawData: {
        stat1: [],
        stat2: [],
        stat3: [],
        stat4: [],
        stat5: [],
        stat6: [],
        stat7: [],
        stat8: []
    },
    // 각 통계 항목별 계산된 평균
    means: {
        stat1: 0,
        stat2: 0,
        stat3: 0,
        stat4: 0,
        stat5: 0,
        stat6: 0,
        stat7: 0,
        stat8: 0
    },
    // 각 통계 항목별 계산된 표준편차
    stdDevs: {
        stat1: 0,
        stat2: 0,
        stat3: 0,
        stat4: 0,
        stat5: 0,
        stat6: 0,
        stat7: 0,
        stat8: 0
    },
    // 데이터 개수 (학생 수)
    count: 0,
    // 마지막 업데이트 시간
    lastUpdated: null
};

/**
 * 현재 저장된 모든 학생 데이터를 기반으로 통계를 초기화하고 계산합니다.
 */
function initializeStatistics() {
    console.log("통계 데이터 초기화 중...");
    
    // statisticsData 초기화
    resetStatisticsData();
    
    // data.js에서 모든 학생 데이터 가져오기
    const allStudents = Object.values(studentsData);
    
    // 모든 학생 데이터 통계에 추가
    allStudents.forEach(student => {
        addStudentToStatistics(student);
    });
    
    // 평균 및 표준편차 계산
    calculateStatistics();
    
    console.log(`통계 초기화 완료: ${statisticsData.count}명의 학생 데이터 처리됨`);
    return statisticsData;
}

/**
 * 통계 데이터를 초기화합니다.
 */
function resetStatisticsData() {
    // 데이터 배열 초기화
    Object.keys(statisticsData.rawData).forEach(key => {
        statisticsData.rawData[key] = [];
    });
    
    // 평균 초기화
    Object.keys(statisticsData.means).forEach(key => {
        statisticsData.means[key] = 0;
    });
    
    // 표준편차 초기화
    Object.keys(statisticsData.stdDevs).forEach(key => {
        statisticsData.stdDevs[key] = 0;
    });
    
    // 카운트 초기화
    statisticsData.count = 0;
    statisticsData.lastUpdated = new Date();
}

/**
 * 학생 데이터를 통계에 추가합니다.
 * @param {Object} student - 추가할 학생 데이터 객체
 */
function addStudentToStatistics(student) {
    // stat1~8 데이터 추출 및 저장
    for (let i = 1; i <= 8; i++) {
        const key = `stat${i}`;
        if (student[key] !== undefined && !isNaN(student[key])) {
            statisticsData.rawData[key].push(parseFloat(student[key]));
        }
    }
    
    // 학생 수 증가
    statisticsData.count++;
    statisticsData.lastUpdated = new Date();
}

/**
 * 저장된 데이터를 기반으로 평균과 표준편차를 계산합니다.
 */
function calculateStatistics() {
    // 각 통계 항목에 대해 평균과 표준편차 계산
    Object.keys(statisticsData.rawData).forEach(key => {
        const values = statisticsData.rawData[key];
        
        // 평균 계산
        if (values.length > 0) {
            const sum = values.reduce((acc, val) => acc + val, 0);
            statisticsData.means[key] = sum / values.length;
            
            // 표준편차 계산
            const squaredDifferences = values.map(val => 
                Math.pow(val - statisticsData.means[key], 2)
            );
            const variance = squaredDifferences.reduce((acc, val) => acc + val, 0) / values.length;
            statisticsData.stdDevs[key] = Math.sqrt(variance);
        } else {
            statisticsData.means[key] = 0;
            statisticsData.stdDevs[key] = 0;
        }
    });
    
    statisticsData.lastUpdated = new Date();
}

/**
 * 새로운 학생 데이터를 통계에 추가하고 갱신합니다.
 * @param {Object} student - 추가할 학생 데이터 객체
 * @returns {Object} 업데이트된 통계 데이터
 */
function updateStatisticsWithNewStudent(student) {
    console.log(`새 학생 데이터 추가 중: ${student.학생ID || 'Unknown ID'}`);
    
    // 학생 데이터 추가
    addStudentToStatistics(student);
    
    // 통계 재계산
    calculateStatistics();
    
    console.log("통계 업데이트 완료");
    return statisticsData;
}

/**
 * 특정 통계 항목의 Z점수를 계산합니다.
 * @param {string} statKey - 통계 항목 키 (예: 'stat1')
 * @param {number} value - 계산할 값
 * @returns {number} 계산된 Z점수
 */
function calculateZScore(statKey, value) {
    if (!statisticsData.stdDevs[statKey] || statisticsData.stdDevs[statKey] === 0) {
        return 0; // 표준편차가 0이거나 없으면 Z점수는 0
    }
    
    return (value - statisticsData.means[statKey]) / statisticsData.stdDevs[statKey];
}

/**
 * 모든 통계 항목에 대해 Z점수를 계산합니다.
 * @param {Object} student - 학생 데이터 객체
 * @returns {Object} 각 통계 항목의 Z점수 객체
 */
function calculateAllZScores(student) {
    const zScores = {};
    
    for (let i = 1; i <= 8; i++) {
        const key = `stat${i}`;
        if (student[key] !== undefined && !isNaN(student[key])) {
            zScores[key] = calculateZScore(key, parseFloat(student[key]));
        } else {
            zScores[key] = 0;
        }
    }
    
    return zScores;
}

/**
 * 현재 통계 정보를 JSON 파일로 저장합니다.
 * @param {string} filePath - 저장할 파일 경로 (선택적)
 */
function saveStatisticsToFile(filePath = 'data/statistics.json') {
    // 브라우저 환경에서는 내부 변수에만 저장
    if (typeof window !== 'undefined') {
        // 로컬 스토리지에 저장 (용량이 작은 경우에만 적합)
        try {
            localStorage.setItem('statisticsData', JSON.stringify(statisticsData));
            console.log('통계 데이터가 로컬 스토리지에 저장되었습니다.');
        } catch (e) {
            console.warn('로컬 스토리지에 통계 데이터 저장 실패:', e);
        }
        
        // AJAX 요청으로 서버에 저장하는 코드로 확장 가능
        // (필요시 구현)
    } 
    // Node.js 환경이라면 파일 시스템 사용
    else if (typeof module !== 'undefined' && module.exports) {
        try {
            const fs = require('fs');
            const path = require('path');
            
            // 디렉토리 확인 및 생성
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            // 파일 저장
            fs.writeFileSync(
                filePath, 
                JSON.stringify(statisticsData, null, 2), 
                'utf8'
            );
            
            console.log(`통계 데이터가 성공적으로 저장됨: ${filePath}`);
        } catch (error) {
            console.error('통계 데이터 저장 실패:', error);
        }
    }
}

/**
 * 저장된 통계 정보를 JSON 파일에서 로드합니다.
 * @param {string} filePath - 로드할 파일 경로 (선택적)
 * @returns {Promise<boolean>} 로드 성공 여부를 나타내는 Promise
 */
function loadStatisticsFromFile(filePath = 'data/statistics.json') {
    return new Promise((resolve, reject) => {
        // Node.js 환경이라면 파일 시스템 사용
        if (typeof module !== 'undefined' && module.exports) {
            try {
                const fs = require('fs');
                
                if (!fs.existsSync(filePath)) {
                    console.warn(`통계 파일이 없습니다: ${filePath}. 새로 초기화합니다.`);
                    initializeStatistics();
                    resolve(false);
                    return;
                }
                
                const data = fs.readFileSync(filePath, 'utf8');
                const loadedData = JSON.parse(data);
                
                // 로드된 데이터로 statisticsData 업데이트
                Object.assign(statisticsData, loadedData);
                console.log(`통계 데이터가 성공적으로 로드됨: ${filePath}`);
                resolve(true);
            } catch (error) {
                console.error('통계 데이터 로드 실패:', error);
                initializeStatistics(); // 실패 시 새로 초기화
                reject(error);
            }
        }
        // 브라우저 환경에서는 fetch 사용
        else if (typeof fetch !== 'undefined') {
            fetch(filePath)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`통계 파일을 불러올 수 없습니다: ${response.status}`);
                    }
                    return response.json();
                })
                .then(loadedData => {
                    // 로드된 데이터로 statisticsData 업데이트
                    Object.assign(statisticsData, loadedData);
                    console.log(`통계 데이터가 성공적으로 로드됨: ${filePath}`);
                    resolve(true);
                })
                .catch(error => {
                    console.warn(`통계 데이터 로드 실패: ${error.message}. 새로 초기화합니다.`);
                    initializeStatistics(); // 실패 시 새로 초기화
                    resolve(false);
                });
        } else {
            console.warn('지원되지 않는 환경입니다. 통계를 새로 초기화합니다.');
            initializeStatistics();
            resolve(false);
        }
    });
}

/**
 * 시작 시 통계 데이터를 초기화 또는 로드합니다.
 */
function initializeOrLoadStatistics() {
    // 파일에서 로드 시도
    loadStatisticsFromFile()
        .then(loaded => {
            if (!loaded) {
                // 로드 실패시 새로 초기화
                console.log('저장된 통계 데이터가 없습니다. 현재 데이터로 초기화합니다.');
                initializeStatistics();
                saveStatisticsToFile(); // 초기 통계 저장
            }
        })
        .catch(error => {
            console.error('통계 초기화 중 오류 발생:', error);
            // 오류 발생시 새로 초기화
            initializeStatistics();
        });
}

// 페이지 로드시 통계 데이터 초기화
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        console.log('통계 처리기 초기화 중...');
        initializeOrLoadStatistics();
    });
}

// 노출할 API
window.statisticsProcessor = {
    getStatisticsData: () => statisticsData,
    initializeStatistics,
    updateStatisticsWithNewStudent,
    calculateZScore,
    calculateAllZScores,
    saveStatisticsToFile,
    loadStatisticsFromFile
};
