/**
 * 고교 추천 알고리즘 
 * 진학희망고교 유형과 B과목 개수에 따라 맞춤형 고교 추천
 */

// 학생 데이터를 기반으로 고등학교 1, 2지망을 추천하는 함수
function getHighSchoolRecommendations(studentData) {
    /**
     * 학생 데이터를 기반으로 고등학교 1, 2지망을 추천
     * 
     * @param {Object} studentData - 학생 데이터 객체
     * @returns {Object} 1, 2지망 추천 고등학교 정보
     */

    // 추천 결과 초기화
    const recommendations = {
        1: null, 
        2: null
    };
    
    // 학생의 진학희망고교 유형과 B등급 과목 수 가져오기
    const desiredSchoolType = studentData.desiredSchool || "일반고"; // 기본값 일반고
    const bGradeCount = studentData.bGradeCount || 0;
    
    // 1. 전국단위 자사고 희망인 경우
    if (desiredSchoolType === "전국단위자사고") {
        if (bGradeCount === 0) {
            // B과목 0개
            recommendations[1] = "외대부고/상산고/민사고/청심국제고";
            recommendations[2] = "현대청운고/북일고/포항제철고";
        } else {
            // B과목 1개 이상
            recommendations[1] = "현대청운고/북일고/포항제철고";
            recommendations[2] = "일반고";
        }
    }
    
    // 2. 국제고 희망인 경우
    else if (desiredSchoolType === "국제고") {
        if (bGradeCount <= 2) {
            // B과목 2개 이하
            recommendations[1] = "거주지역 소재 국제고";
            recommendations[2] = "거주지역 소재 외고";
        } else {
            // B과목 3개 이상
            recommendations[1] = "거주지역 소재 국제고";
            recommendations[2] = "일반고";
        }
    }
    
    // 3. 외고 희망인 경우
    else if (desiredSchoolType === "외국어고") {
        if (bGradeCount <= 2) {
            // B과목 2개 이하
            recommendations[1] = "거주지역 소재 외고";
            recommendations[2] = "거주지역 소재 자사고";
        } else {
            // B과목 3개 이상
            recommendations[1] = "거주지역 소재 외고";
            recommendations[2] = "일반고";
        }
    }
    
    // 4. 서울형 자사고 희망인 경우
    else if (desiredSchoolType === "서울형자사고") {
        recommendations[1] = "하나고";
        
        if (bGradeCount === 0) {
            // B과목 0개
            recommendations[2] = "거주지역 소재 자사고";
        } else {
            // B과목 1개 이상
            recommendations[2] = "일반고";
        }
    }
    
    // 5. 지역단위 자사고 희망인 경우
    else if (desiredSchoolType === "지역단위자사고") {
        recommendations[1] = "지역단위 자사고";
        recommendations[2] = "일반고";
    }
    
    // 6. 일반고 희망인 경우 (기본값)
    else {
        recommendations[1] = "일반고";
        recommendations[2] = "지역단위 자사고";
    }
    
    return recommendations;
}
