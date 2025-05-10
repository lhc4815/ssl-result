const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

// Excel 파일 경로
const excelFilePath = path.join(__dirname, '../db/survey_sample_data.xlsx');

// 결과 저장 경로
const outputPath = path.join(__dirname, '../js/data.js');

// Excel 파일 읽기
function readExcelFile() {
    try {
        console.log(`Excel 파일 읽기 시작: ${excelFilePath}`);
        
        // Excel 파일 로드
        const workbook = xlsx.readFile(excelFilePath);
        
        // 첫 번째 시트 가져오기
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // JSON으로 변환
        const data = xlsx.utils.sheet_to_json(worksheet);
        
        console.log(`Excel 데이터 로드 완료. 학생 수: ${data.length}`);
        return data;
    } catch (error) {
        console.error('Excel 파일 읽기 오류:', error);
        throw error;
    }
}

// 데이터를 studentsData 객체 형식으로 변환
function transformData(excelData) {
    const studentsData = {};
    
    excelData.forEach(row => {
        // ID 필드 확인 및 생성
        const studentId = row['학생ID'] || `STU${String(row['학생번호']).padStart(4, '0')}`;
        
        // 데이터 객체 생성
        studentsData[studentId] = {
            "학생ID": studentId,
            "학생성명": row['학생성명'],
            "출신학교": row['출신학교'],
            "성별": row['성별'],
            "거주지역": row['거주지역'],
            "B등급과목수": row['B등급과목수'] || 0,
            "진학희망고교": row['진학희망고교'],
            "stat1": Number(row['stat1']) || 0,
            "stat2": Number(row['stat2']) || 0,
            "stat3": Number(row['stat3']) || 0,
            "stat4": Number(row['stat4']) || 0,
            "stat5": Number(row['stat5']) || 0,
            "stat6": Number(row['stat6']) || 0,
            "stat7": Number(row['stat7'] || row['영어'] || 0),
            "stat8": Number(row['stat8'] || row['수학'] || 0),
            "stat_5scale_1": Number(row['stat_5scale_1']) || (Number(row['stat1']) / 40),
            "stat_5scale_2": Number(row['stat_5scale_2']) || (Number(row['stat2']) / 40),
            "stat_5scale_3": Number(row['stat_5scale_3']) || (Number(row['stat3']) / 40),
            "stat_5scale_4": Number(row['stat_5scale_4']) || (Number(row['stat4']) / 40),
            "stat_5scale_5": Number(row['stat_5scale_5']) || (Number(row['stat5']) / 40),
            "stat_5scale_6": Number(row['stat_5scale_6']) || (Number(row['stat6']) / 40),
            "stat_5scale_7": Number(row['stat_5scale_7']) || (Number(row['stat7'] || row['영어'] || 0) / 10),
            "stat_5scale_8": Number(row['stat_5scale_8']) || (Number(row['stat8'] || row['수학'] || 0) / 10),
            "stat_zscore_1": Number(row['stat_zscore_1']) || 0,
            "stat_zscore_2": Number(row['stat_zscore_2']) || 0,
            "stat_zscore_3": Number(row['stat_zscore_3']) || 0,
            "stat_zscore_4": Number(row['stat_zscore_4']) || 0,
            "stat_zscore_5": Number(row['stat_zscore_5']) || 0,
            "stat_zscore_6": Number(row['stat_zscore_6']) || 0,
            "stat_zscore_7": Number(row['stat_zscore_7']) || 0,
            "stat_zscore_8": Number(row['stat_zscore_8']) || 0,
            "x-axis": Number(row['x-axis']) || 0,
            "y-axis": Number(row['y-axis']) || 0
        };
    });
    
    return studentsData;
}

// data.js 파일 생성
function generateDataJsFile(studentsData) {
    // JavaScript 코드 생성
    const jsCode = `// 샘플 학생 데이터 (Excel에서 변환)
const studentsData = ${JSON.stringify(studentsData, null, 2)};

// 학생 데이터 가져오기 함수
function getStudentData(id, name) {
    return new Promise((resolve, reject) => {
        // 샘플 구현에서는 로컬 데이터 사용
        setTimeout(() => {
            const excelData = studentsData[id];
            if (excelData && excelData.학생성명 === name) {
                // Excel 데이터를 내부 데이터 구조로 변환
                const processedData = processExcelData(excelData);
                resolve(processedData);
            } else {
                reject(new Error("학생 정보를 찾을 수 없습니다. ID와 이름을 확인해주세요."));
            }
        }, 500); // 서버 요청 시뮬레이션
    });
}
`;

    // 파일 저장
    fs.writeFileSync(outputPath, jsCode, 'utf8');
    console.log(`data.js 파일이 생성되었습니다: ${outputPath}`);
}

// 메인 실행 코드
try {
    const excelData = readExcelFile();
    const studentsData = transformData(excelData);
    generateDataJsFile(studentsData);
    console.log('모든 작업이 완료되었습니다.');
} catch (error) {
    console.error('오류 발생:', error);
    process.exit(1);
}
