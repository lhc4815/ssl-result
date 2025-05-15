/**
 * 통계 처리 스크립트
 * 
 * 모든 학생 데이터를 분석하여 통계 정보를 계산하고 저장합니다.
 * 새로운 학생 데이터가 추가될 때 통계를 갱신하는 기능을 제공합니다.
 * 
 * 사용 방법:
 * - 전체 통계 초기화: node updateStatistics.js --init
 * - 단일 학생 추가: node updateStatistics.js --add [student_id]
 */

const fs = require('fs');
const path = require('path');

// 기본 경로 설정
const DATA_DIR = path.join(__dirname, '..', 'data');
const STATS_FILE = path.join(DATA_DIR, 'statistics.json');

// 필요한 디렉토리 생성
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 학생 데이터 가져오기
function loadStudentsData() {
    const dataFilePath = path.join(__dirname, '..', 'js', 'data.js');
    
    if (!fs.existsSync(dataFilePath)) {
        console.error('학생 데이터 파일을 찾을 수 없습니다:', dataFilePath);
        process.exit(1);
    }
    
    // data.js 파일의 내용 읽기
    let content = fs.readFileSync(dataFilePath, 'utf8');
    
    // studentsData 객체 추출 (정규식 사용)
    const startIndex = content.indexOf('const studentsData = {');
    if (startIndex === -1) {
        console.error('studentsData 객체를 찾을 수 없습니다');
        process.exit(1);
    }
    
    const endIndex = content.indexOf('};', startIndex) + 1;
    const objectString = content.substring(startIndex + 'const studentsData = '.length, endIndex);
    
    // 객체 문자열을 JavaScript 객체로 변환
    let studentsData;
    try {
        // 객체 문자열에서 작은따옴표를 큰따옴표로 변환 (JSON 파싱 위해)
        const jsonString = objectString.replace(/'/g, '"');
        studentsData = JSON.parse(jsonString);
    } catch (error) {
        console.error('학생 데이터 파싱 오류:', error);
        console.error('다음 방법을 시도합니다...');
        
        // 파싱 실패 시 대안적인 방법 (임시 파일에 저장 후 require)
        try {
            const tempFile = path.join(__dirname, 'temp_data.js');
            fs.writeFileSync(tempFile, `module.exports = ${objectString}`);
            studentsData = require('./temp_data.js');
            fs.unlinkSync(tempFile); // 임시 파일 삭제
        } catch (error2) {
            console.error('대안적 학생 데이터 로드 실패:', error2);
            process.exit(1);
        }
    }
    
    return studentsData;
}

// 통계 데이터 초기화 및 계산
function initializeStatistics(studentsData) {
    console.log('통계 데이터 초기화 중...');
    
    // 통계 데이터 객체 생성
    const statisticsData = {
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
        means: {},
        stdDevs: {},
        count: 0,
        lastUpdated: new Date().toISOString()
    };
    
    // 모든 학생 데이터 처리
    const students = Object.values(studentsData);
    students.forEach(student => {
        // stat1~8 데이터 추출 및 저장
        for (let i = 1; i <= 8; i++) {
            const key = `stat${i}`;
            if (student[key] !== undefined && !isNaN(student[key])) {
                statisticsData.rawData[key].push(parseFloat(student[key]));
            }
        }
        
        statisticsData.count++;
    });
    
    // 평균 및 표준편차 계산
    Object.keys(statisticsData.rawData).forEach(key => {
        const values = statisticsData.rawData[key];
        
        if (values.length > 0) {
            // 평균 계산
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
    
    console.log(`통계 초기화 완료: ${statisticsData.count}명의 학생 데이터 처리됨`);
    return statisticsData;
}

// 통계 데이터 저장
function saveStatistics(statisticsData) {
    try {
        fs.writeFileSync(STATS_FILE, JSON.stringify(statisticsData, null, 2), 'utf8');
        console.log(`통계 데이터가 성공적으로 저장됨: ${STATS_FILE}`);
        return true;
    } catch (error) {
        console.error('통계 데이터 저장 실패:', error);
        return false;
    }
}

// 통계 데이터 로드
function loadStatistics() {
    try {
        if (!fs.existsSync(STATS_FILE)) {
            console.warn(`통계 파일이 없습니다: ${STATS_FILE}`);
            return null;
        }
        
        const data = fs.readFileSync(STATS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('통계 데이터 로드 실패:', error);
        return null;
    }
}

// 단일 학생 데이터로 통계 업데이트
function updateStatisticsWithStudent(studentId, studentsData, statisticsData) {
    const student = studentsData[studentId];
    
    if (!student) {
        console.error(`학생 ID를 찾을 수 없습니다: ${studentId}`);
        return null;
    }
    
    console.log(`학생 데이터를 통계에 추가 중: ${studentId}`);
    
    // stat1~8 데이터 추출 및 저장
    for (let i = 1; i <= 8; i++) {
        const key = `stat${i}`;
        if (student[key] !== undefined && !isNaN(student[key])) {
            statisticsData.rawData[key].push(parseFloat(student[key]));
        }
    }
    
    statisticsData.count++;
    
    // 평균 및 표준편차 재계산
    Object.keys(statisticsData.rawData).forEach(key => {
        const values = statisticsData.rawData[key];
        
        if (values.length > 0) {
            // 평균 계산
            const sum = values.reduce((acc, val) => acc + val, 0);
            statisticsData.means[key] = sum / values.length;
            
            // 표준편차 계산
            const squaredDifferences = values.map(val => 
                Math.pow(val - statisticsData.means[key], 2)
            );
            const variance = squaredDifferences.reduce((acc, val) => acc + val, 0) / values.length;
            statisticsData.stdDevs[key] = Math.sqrt(variance);
        }
    });
    
    statisticsData.lastUpdated = new Date().toISOString();
    console.log('통계 업데이트 완료');
    return statisticsData;
}

// 메인 함수
function main() {
    // 명령행 인수 파싱
    const args = process.argv.slice(2);
    
    // 모든 학생 데이터 로드
    const studentsData = loadStudentsData();
    
    // 명령 처리
    if (args.includes('--init') || args.includes('-i')) {
        // 전체 통계 초기화
        const statistics = initializeStatistics(studentsData);
        saveStatistics(statistics);
    } else if (args.includes('--add') || args.includes('-a')) {
        // 단일 학생 추가
        const studentIdIndex = args.indexOf('--add') !== -1 ? 
            args.indexOf('--add') + 1 : args.indexOf('-a') + 1;
        
        if (studentIdIndex >= args.length) {
            console.error('학생 ID가 필요합니다: --add [student_id]');
            process.exit(1);
        }
        
        const studentId = args[studentIdIndex];
        
        // 기존 통계 로드
        let statistics = loadStatistics();
        
        if (!statistics) {
            console.log('통계 파일이 없습니다. 새로 초기화합니다.');
            statistics = initializeStatistics(studentsData);
        } else {
            // 이미 존재하는 경우 업데이트
            statistics = updateStatisticsWithStudent(studentId, studentsData, statistics);
            
            if (!statistics) {
                process.exit(1);
            }
        }
        
        saveStatistics(statistics);
    } else {
        // 사용법 출력
        console.log(`
사용법:
  node updateStatistics.js --init      전체 통계 초기화
  node updateStatistics.js --add [ID]  단일 학생 추가
        `);
    }
}

// 스크립트 실행
main();
