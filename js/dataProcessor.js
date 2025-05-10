// 6척도 정의
const SCALES = [
    { 
        key: 'selfRegulation', 
        name: '자기조절능력', 
        color: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgb(54, 162, 235)',
        pointColor: 'rgb(54, 162, 235)',
        dataKey: 'stat1'  // Excel 컬럼명
    },
    { 
        key: 'extracurricular', 
        name: '비교과 수행능력', 
        color: 'rgba(75, 192, 192, 0.7)',
        borderColor: 'rgb(75, 192, 192)',
        pointColor: 'rgb(75, 192, 192)',
        dataKey: 'stat2'
    },
    { 
        key: 'internalAcademic', 
        name: '내면 학업수행능력', 
        color: 'rgba(153, 102, 255, 0.7)',
        borderColor: 'rgb(153, 102, 255)',
        pointColor: 'rgb(153, 102, 255)',
        dataKey: 'stat3'
    },
    { 
        key: 'languageProcessing', 
        name: '언어정보처리능력', 
        color: 'rgba(255, 205, 86, 0.7)',
        borderColor: 'rgb(255, 205, 86)',
        pointColor: 'rgb(255, 205, 86)',
        dataKey: 'stat4'
    },
    { 
        key: 'engineeringThinking', 
        name: '공학적 사고력', 
        color: 'rgba(255, 159, 64, 0.7)',
        borderColor: 'rgb(255, 159, 64)',
        pointColor: 'rgb(255, 159, 64)',
        dataKey: 'stat5'
    },
    { 
        key: 'medicalAptitude', 
        name: '의약학적성', 
        color: 'rgba(201, 203, 207, 0.7)',
        borderColor: 'rgb(158, 106, 198)',
        pointColor: 'rgb(158, 106, 198)',
        dataKey: 'stat6'
    }
];

// 정규분포 상수
const NORMAL_DIST = {
    mean: 100,      // 평균 점수 (정규화된 값)
    stdDev: 20,     // 표준편차
    minScore: 40,   // 최소 점수
    maxScore: 160,  // 최대 점수
    zMin: -3,       // 최소 Z-점수 
    zMax: 3,        // 최대 Z-점수
};

// Z-점수 계산 함수
function calculateZScore(score, mean, stdDev) {
    return (score - mean) / stdDev;
}

// Z-점수로부터 백분위 계산 함수
function calculatePercentile(z) {
    // 표준정규분포 누적분포함수 근사 계산
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;
    
    const sign = z < 0 ? -1 : 1;
    const absZ = Math.abs(z);
    
    // Abramowitz and Stegun 근사식 사용
    const t = 1.0 / (1.0 + p * absZ);
    const erf = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-absZ * absZ);
    
    // 백분위 계산 (0-100)
    return Math.round(((1.0 + sign * erf) / 2.0) * 100);
}

// 정규분포 곡선 데이터 생성 함수
function generateNormalDistributionData(mean, stdDev, min, max, points = 100) {
    const data = [];
    const step = (max - min) / points;

    for (let i = 0; i <= points; i++) {
        const x = min + (step * i);
        const z = (x - mean) / stdDev;
        const y = (1 / (stdDev * Math.sqrt(2 * Math.PI))) *
            Math.exp(-(Math.pow(z, 2) / 2));
        data.push({ x, y });
    }

    return data;
}

// Excel 데이터를 내부 데이터 구조로 변환하는 함수
function processExcelData(excelData) {
    // 예: excelData는 Excel에서 얻은 학생 데이터 객체

    const processedData = {
        id: excelData.학생ID,
        name: excelData.학생성명,
        school: excelData.출신학교,
        testDate: new Date().toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
        }),
        gender: excelData.성별,
        region: excelData.거주지역,
        bGradeCount: excelData.B등급과목수,
        desiredSchool: excelData.진학희망고교,

        // 6척도 원점수
        scaleScores: {
            selfRegulation: excelData.stat1,
            extracurricular: excelData.stat2,
            internalAcademic: excelData.stat3,
            languageProcessing: excelData.stat4,
            engineeringThinking: excelData.stat5,
            medicalAptitude: excelData.stat6
        },

        // 5점 만점 점수
        scaleScores5: {
            selfRegulation: excelData.stat_5scale_1,
            extracurricular: excelData.stat_5scale_2,
            internalAcademic: excelData.stat_5scale_3,
            languageProcessing: excelData.stat_5scale_4,
            engineeringThinking: excelData.stat_5scale_5,
            medicalAptitude: excelData.stat_5scale_6
        },

        // Z-score
        scaleZScores: {
            selfRegulation: excelData.stat_zscore_1,
            extracurricular: excelData.stat_zscore_2,
            internalAcademic: excelData.stat_zscore_3,
            languageProcessing: excelData.stat_zscore_4,
            engineeringThinking: excelData.stat_zscore_5,
            medicalAptitude: excelData.stat_zscore_6
        },

        // 사분면 좌표
        quadrantData: {
            x: excelData['x-axis'],  // 교과형(-) vs 종합형(+)
            y: excelData['y-axis']   // 면접형(-) vs 서류형(+)
        },

        // 학업성취도
        academicData: {
            english: {
                score: excelData.stat7,
                zScore: excelData.stat_zscore_7
            },
            math: {
                score: excelData.stat8,
                zScore: excelData.stat_zscore_8
            }
        }
    };

    return processedData;
}
