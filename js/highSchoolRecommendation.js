/**
 * 고교 추천 알고리즘 - 틀만 남겨두고 알고리즘을 비워둠
 * (추후 알고리즘 재구현)
 */

// 학생 데이터를 기반으로 고등학교 1, 2, 3지망을 추천하는 함수
function getHighSchoolRecommendations(studentData) {
    /**
     * 학생 데이터를 기반으로 고등학교 1, 2, 3지망을 추천
     * 현재는 빈 값 반환 (알고리즘 재구현 전)
     * 
     * @param {Object} studentData - 학생 데이터 객체
     * @returns {Object} 1, 2, 3지망 추천 고등학교 정보
     */

    // 추천 결과 초기화 - 모든 지망을 빈 값으로 설정
    const recommendations = {
        1: null, 
        2: null, 
        3: null
    };
    
    // 모든 지망을 "예시시"으로 설정
    recommendations[1] = "하나고등학교";
    recommendations[2] = "서울형자사고";
    recommendations[3] = "지역일반고";
    
    // 빈 추천 결과 반환
    return recommendations;
}
