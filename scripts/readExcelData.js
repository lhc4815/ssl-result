// Excel 데이터를 읽고 JavaScript 데이터 파일로 변환하는 스크립트
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// 엑셀 파일 경로
const excelFilePath = path.resolve(__dirname, '../db/survey_sample_data.xlsx');
const outputJsPath = path.resolve(__dirname, '../js/data.js');
const dataProcessorPath = path.resolve(__dirname, '../js/dataProcessor.js');

// 엑셀 파일 읽기
function readExcelFile() {
    try {
        console.log(`엑셀 파일 읽는 중: ${excelFilePath}`);
        const workbook = XLSX.readFile(excelFilePath);
        const sheetName = workbook.SheetNames[0]; // 첫 번째 시트 사용
        const worksheet = workbook.Sheets[sheetName];
        
        // 엑셀 데이터를 JSON으로 변환
        const data = XLSX.utils.sheet_to_json(worksheet);
        console.log(`${data.length}개의 학생 데이터를 읽었습니다.`);
        return data;
    } catch (error) {
        console.error('엑셀 파일 읽기 오류:', error);
        throw error;
    }
}

// JSON 데이터를 학생 ID를 키로 사용하는 객체로 변환
function transformData(data) {
    const studentsData = {};
    
    data.forEach(row => {
        const studentId = row['학생ID'] || `STU${Object.keys(studentsData).length + 1}`.padStart(7, '0');
        
        studentsData[studentId] = {
            "학생ID": studentId,
            "학생성명": row['학생성명'] || '익명',
            "출신학교": row['출신학교'] || '미상',
            "성별": row['성별'] || '미상',
            "거주지역": row['거주지역'] || '미상',
            "B등급과목수": row['B등급과목수'] !== undefined ? row['B등급과목수'] : 0,
            "진학희망고교": row['진학희망고교'] || '미상',
            "stat1": row['stat1'] !== undefined ? row['stat1'] : 100,
            "stat2": row['stat2'] !== undefined ? row['stat2'] : 100,
            "stat3": row['stat3'] !== undefined ? row['stat3'] : 100,
            "stat4": row['stat4'] !== undefined ? row['stat4'] : 100,
            "stat5": row['stat5'] !== undefined ? row['stat5'] : 100,
            "stat6": row['stat6'] !== undefined ? row['stat6'] : 100,
            "stat7": row['stat7'] !== undefined ? row['stat7'] : 30,
            "stat8": row['stat8'] !== undefined ? row['stat8'] : 30,
            "stat_5scale_1": row['stat_5scale_1'] !== undefined ? row['stat_5scale_1'] : 3.0,
            "stat_5scale_2": row['stat_5scale_2'] !== undefined ? row['stat_5scale_2'] : 3.0,
            "stat_5scale_3": row['stat_5scale_3'] !== undefined ? row['stat_5scale_3'] : 3.0,
            "stat_5scale_4": row['stat_5scale_4'] !== undefined ? row['stat_5scale_4'] : 3.0,
            "stat_5scale_5": row['stat_5scale_5'] !== undefined ? row['stat_5scale_5'] : 3.0,
            "stat_5scale_6": row['stat_5scale_6'] !== undefined ? row['stat_5scale_6'] : 3.0,
            "stat_5scale_7": row['stat_5scale_7'] !== undefined ? row['stat_5scale_7'] : 3.0,
            "stat_5scale_8": row['stat_5scale_8'] !== undefined ? row['stat_5scale_8'] : 3.0,
            "stat_zscore_1": row['stat_zscore_1'] !== undefined ? row['stat_zscore_1'] : 0,
            "stat_zscore_2": row['stat_zscore_2'] !== undefined ? row['stat_zscore_2'] : 0,
            "stat_zscore_3": row['stat_zscore_3'] !== undefined ? row['stat_zscore_3'] : 0,
            "stat_zscore_4": row['stat_zscore_4'] !== undefined ? row['stat_zscore_4'] : 0,
            "stat_zscore_5": row['stat_zscore_5'] !== undefined ? row['stat_zscore_5'] : 0,
            "stat_zscore_6": row['stat_zscore_6'] !== undefined ? row['stat_zscore_6'] : 0,
            "stat_zscore_7": row['stat_zscore_7'] !== undefined ? row['stat_zscore_7'] : 0,
            "stat_zscore_8": row['stat_zscore_8'] !== undefined ? row['stat_zscore_8'] : 0,
            "x-axis": row['x-axis'] !== undefined ? row['x-axis'] : 0,
            "y-axis": row['y-axis'] !== undefined ? row['y-axis'] : 0
        };
    });
    
    return studentsData;
}

// 데이터를 JavaScript 파일로 저장
function saveToJsFile(data) {
    // dataProcessor.js의 내용 가져오기
    let dataProcessorContent = '';
    try {
        dataProcessorContent = fs.readFileSync(dataProcessorPath, 'utf8');
        console.log('dataProcessor.js 파일을 읽었습니다.');
    } catch (error) {
        console.error('dataProcessor.js 파일 읽기 오류:', error);
        // 오류가 발생하더라도 계속 진행
    }

    const jsContent = `// 학생 데이터 (Excel에서 자동 변환 - ${new Date().toLocaleString('ko-KR')})
const studentsData = ${JSON.stringify(data, null, 2)};

// 학생 데이터 가져오기 함수
function getStudentData(id, name) {
    return new Promise((resolve, reject) => {
        // 로컬 데이터에서 학생 찾기
        setTimeout(() => {
            const excelData = studentsData[id];
            if (excelData && excelData.학생성명 === name) {
                // Excel 데이터를 내부 데이터 구조로 변환 (dataProcessor.js의 함수 사용)
                const processedData = processExcelData(excelData);
                resolve(processedData);
            } else {
                reject(new Error("학생 정보를 찾을 수 없습니다. ID와 이름을 확인해주세요."));
            }
        }, 500); // 서버 요청 시뮬레이션
    });
}

// dataProcessor.js에서 정의된 processExcelData 함수는 유지합니다.
// 이 함수는 js/dataProcessor.js에 정의되어 있으므로 data.js에서는 접근 가능합니다.
`;

    try {
        fs.writeFileSync(outputJsPath, jsContent, 'utf8');
        console.log(`데이터가 저장되었습니다: ${outputJsPath}`);
    } catch (error) {
        console.error('파일 저장 오류:', error);
        throw error;
    }
}

// 메인 실행 함수
function main() {
    try {
        console.log('엑셀 데이터를 JavaScript로 변환합니다.');
        console.log('이 스크립트는 Excel 데이터를 읽어서 js/data.js 파일을 생성합니다.');
        console.log('생성된 data.js 파일은 dataProcessor.js의 processExcelData 함수를 사용합니다.');
        console.log('---------------------------------------------------------');
        
        const excelData = readExcelFile();
        const transformedData = transformData(excelData);
        saveToJsFile(transformedData);
        
        console.log('---------------------------------------------------------');
        console.log('데이터 변환 완료! 웹 애플리케이션에서 데이터를 사용할 수 있습니다.');
        console.log('사용 방법: student_report.html?id=학생ID&name=학생이름');
        console.log('예시: student_report.html?id=STU0021&name=안철수');
    } catch (error) {
        console.error('데이터 처리 오류:', error);
        process.exit(1);
    }
}

// 스크립트 실행
main();
