/**
 * 대입전략 수립 알고리즘 - 틀만 남겨두고 알고리즘을 비워둠
 * (추후 알고리즘 구현 예정)
 */

// 학생 데이터를 기반으로 대입전략 수립하는 함수
function getUniversityStrategies(studentData) {
    /**
     * 학생 데이터를 기반으로 대입전략 1순위, 2순위 추천
     * 언어정보처리능력, 공학적 사고력, 의약학적성 점수를 비교하여 추천
     * 
     * @param {Object} studentData - 학생 데이터 객체
     * @returns {Object} 1순위, 2순위 대입전략 추천 정보
     */

    // 추천 결과 초기화
    const strategies = {
        1: null, 
        2: null
    };

    // 계열별 점수와 추천 계열 매핑
    const fieldScores = [
        { 
            field: "의치한약수계열", 
            score: studentData.scaleScores["medicalAptitude"] || 0 
        },
        { 
            field: "SKY이공계열", 
            score: studentData.scaleScores["engineeringThinking"] || 0 
        },
        { 
            field: "SKY인문사회계열", 
            score: studentData.scaleScores["languageProcessing"] || 0 
        }
    ];
    
    // 점수를 기준으로 내림차순 정렬 (높은 점수가 먼저 오도록)
    fieldScores.sort((a, b) => b.score - a.score);
    
    // 가장 높은 점수를 1순위, 두 번째로 높은 점수를 2순위로 설정
    strategies[1] = fieldScores[0].field;
    if (fieldScores.length > 1) {
        strategies[2] = fieldScores[1].field;
    }
    
    // 추천 결과 반환
    return strategies;
}
