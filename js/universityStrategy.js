/**
 * 대입전략 수립 알고리즘 - 틀만 남겨두고 알고리즘을 비워둠
 * (추후 알고리즘 구현 예정)
 */

// 학생 데이터를 기반으로 대입전략 수립하는 함수
function getUniversityStrategies(studentData) {
    /**
     * 학생 데이터를 기반으로 대입전략 1순위, 2순위 추천
     * 현재는 빈 값 반환 (알고리즘 구현 전)
     * 
     * @param {Object} studentData - 학생 데이터 객체
     * @returns {Object} 1순위, 2순위 대입전략 추천 정보
     */

    // 추천 결과 초기화
    const strategies = {
        1: null, 
        2: null
    };

    // 모든 순위를 "조건에 맞는 추천 없음"으로 설정
    strategies[1] = "의치한약수 계열";
    strategies[2] = "SKY공학, 생명과학 계열";
    
    // 빈 추천 결과 반환
    return strategies;
}

