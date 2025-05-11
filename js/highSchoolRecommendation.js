/**
 * 고교 추천 알고리즘 - 학생 데이터를 기반으로 고등학교 1, 2, 3지망을 추천
 */

// 학생 데이터를 기반으로 고등학교 1, 2, 3지망을 추천하는 함수
function getHighSchoolRecommendations(studentData) {
    /**
     * 학생 데이터를 기반으로 고등학교 1, 2, 3지망을 추천
     * 
     * @param {Object} studentData - 학생 데이터 객체
     * @returns {Object} 1, 2, 3지망 추천 고등학교 정보
     */

    // 필요한 점수 추출
    const 자기조절능력_점수 = studentData.scaleScores.selfRegulation || 0;
    const 비교과활동수행력_점수 = studentData.scaleScores.extracurricular || 0;
    const 내면학업수행능력_점수 = studentData.scaleScores.internalAcademic || 0;
    const 언어정보처리능력_점수 = studentData.scaleScores.languageProcessing || 0;
    const 의약학적성_점수 = studentData.scaleScores.medicalAptitude || 0;
    
    // 면접형인재성향_점수는 비교과활동수행력 40문항 중 20문항 점수로 계산
    // 엑셀 데이터에 직접 컬럼이 없는 경우 비교과활동수행력_점수의 40%로 가정
    const 면접형인재성향_점수 = Math.round(비교과활동수행력_점수 * 0.4);

    // 학업성취도 데이터
    const TypeB_영어_원점수 = studentData.academicData.english.score || 0;
    const TypeB_수학_원점수 = studentData.academicData.math.score || 0;
    
    // B등급과목수 - Excel 필드에서 가져오기 (기본값 0)
    const B등급과목수_수치 = studentData.bGradeCount !== undefined ? studentData.bGradeCount : 0;
    
    // 거주지역
    const 거주지역 = studentData.region || "";

    // 점수 환산
    const TypeB_영어_100점환산 = (TypeB_영어_원점수 / 50) * 100;
    const TypeB_수학_100점환산 = (TypeB_수학_원점수 / 50) * 100;
    const 언어이해활용능력_50점만점 = TypeB_영어_원점수;
    const 언어이해활용능력_100점만점 = TypeB_영어_100점환산;

    // 추천 결과 초기화
    const recommendations = {1: null, 2: null, 3: null};
    const recommended_school_types = {1: null, 2: null, 3: null};

    // --- 1지망 추천 ---
    if (recommendations[1] === null) {
        if (자기조절능력_점수 >= 170 && TypeB_영어_100점환산 >= 90 && TypeB_수학_100점환산 >= 90 && B등급과목수_수치 === 0) {
            recommendations[1] = "외대부고, 하나고, 상산고, 민사고, 청심국제고 중 택1";
            recommended_school_types[1] = "전자사";
        } else if (자기조절능력_점수 >= 160 && (TypeB_영어_100점환산 >= 80 && TypeB_영어_100점환산 <= 90) &&
              (TypeB_수학_100점환산 >= 80 && TypeB_수학_100점환산 <= 90) && B등급과목수_수치 === 0) {
            recommendations[1] = "현대청운고, 북일고 중 택1";
            recommended_school_types[1] = "전자사";
        } else if (자기조절능력_점수 >= 160 && (TypeB_영어_100점환산 >= 80 && TypeB_영어_100점환산 <= 90) &&
              (TypeB_수학_100점환산 >= 80 && TypeB_수학_100점환산 <= 90) && B등급과목수_수치 === 1) {
            recommendations[1] = "포항제철고, 광양제철고, 김천고 중 택1";
            recommended_school_types[1] = "전자사";
        } else if (자기조절능력_점수 >= 160 && (TypeB_영어_100점환산 >= 80 && TypeB_영어_100점환산 <= 90) &&
              (TypeB_수학_100점환산 >= 80 && TypeB_수학_100점환산 <= 90) && B등급과목수_수치 === 0 &&
              면접형인재성향_점수 >= 90) {
            recommendations[1] = "하늘고";
            recommended_school_types[1] = "전자사";
        }
    }

    if (recommendations[1] === null) {
        if (비교과활동수행력_점수 >= 160 && TypeB_영어_100점환산 >= 90 && TypeB_수학_100점환산 >= 90 &&
                언어정보처리능력_점수 >= 160 && 의약학적성_점수 <= 120 && B등급과목수_수치 === 1) {
            recommendations[1] = `${거주지역} 소재 국제고`;
            recommended_school_types[1] = "국제고";
        }
    }

    if (recommendations[1] === null) {
        if (언어이해활용능력_50점만점 >= 40 && TypeB_영어_100점환산 >= 90 && 언어정보처리능력_점수 >= 160 &&
                (B등급과목수_수치 === 2 || B등급과목수_수치 === 3)) {
            recommendations[1] = `${거주지역} 소재 외고`;
            recommended_school_types[1] = "외고";
        }
    }
    
    const 자사고_거주지역_리스트 = ["서울", "인천", "대전", "대구", "부산", "충남", "경기"];
    if (recommendations[1] === null) {
        if (((의약학적성_점수 >= 160 || 언어정보처리능력_점수 >= 160)) &&
                TypeB_영어_100점환산 >= 80 && TypeB_수학_100점환산 >= 80 && 자기조절능력_점수 >= 160 &&
                내면학업수행능력_점수 >= 160 && 자사고_거주지역_리스트.includes(거주지역) &&
                B등급과목수_수치 <= 5) {
            recommendations[1] = `${거주지역} 소재 지역 자사고`;
            recommended_school_types[1] = "자사고";
        }
    }

    if (recommendations[1] === null) {
        if (내면학업수행능력_점수 >= 180) {
            recommendations[1] = "지역일반고";
            recommended_school_types[1] = "일반고";
        }
    }

    // 기본 일반고 추천 (모든 조건을 충족하지 못하는 경우)
    if (recommendations[1] === null) {
        recommendations[1] = "지역일반고";
        recommended_school_types[1] = "일반고";
    }

    // --- 2지망 추천 로직 ---
    let temp_recs2 = null;
    let temp_rec_type2 = null;

    if (recommendations[1] !== null) { // 1지망이 결정된 경우에만 2지망 탐색
        // 국제고 2지망 (1지망이 전자사일때)
        if (recommended_school_types[1] === "전자사") {
            if (TypeB_영어_100점환산 >= 80 && TypeB_수학_100점환산 >= 80 &&
                언어이해활용능력_100점만점 >= 90 && (B등급과목수_수치 === 2 || B등급과목수_수치 === 3)) {
                if ("국제고" !== recommended_school_types[1]) {
                    temp_recs2 = `${거주지역} 소재 국제고`;
                    temp_rec_type2 = "국제고";
                }
            }
        }
        
        // 외고 2지망 (1지망이 전자사 또는 국제고일때)
        if (temp_recs2 === null && ["전자사", "국제고"].includes(recommended_school_types[1])) {
            if (언어정보처리능력_점수 >= 160 && 의약학적성_점수 <= 120 && TypeB_영어_100점환산 >= 80) {
                if ("외고" !== recommended_school_types[1]) {
                     temp_recs2 = `${거주지역} 소재 외고`;
                     temp_rec_type2 = "외고";
                }
            }
        }

        // 자사고 2지망 (1지망이 전자사, 외고, 국제고일때)
        if (temp_recs2 === null && ["전자사", "외고", "국제고"].includes(recommended_school_types[1])) {
            if (내면학업수행능력_점수 >= 160 && TypeB_영어_100점환산 >= 80 && TypeB_수학_100점환산 >= 80 &&
                    자기조절능력_점수 >= 160 && 자사고_거주지역_리스트.includes(거주지역) &&
                    B등급과목수_수치 <= 5) {
                if ("자사고" !== recommended_school_types[1]) {
                    temp_recs2 = `${거주지역} 소재 지역 자사고`;
                    temp_rec_type2 = "자사고";
                }
            }
        }
        
        // 일반고 2지망 (1지망이 자사고일때)
        if (temp_recs2 === null && recommended_school_types[1] === "자사고") {
             if (의약학적성_점수 >= 160 || 언어정보처리능력_점수 >= 160) {
                if ("일반고" !== recommended_school_types[1]) {
                    temp_recs2 = "지역일반고";
                    temp_rec_type2 = "일반고";
                }
            }
        }
    }
    if (temp_recs2) {
        recommendations[2] = temp_recs2;
        recommended_school_types[2] = temp_rec_type2;
    } else if (recommendations[1] !== null && recommended_school_types[1] !== "일반고") {
        // 2지망이 결정되지 않은 경우 일반고를 기본 추천 (1지망이 일반고가 아닌 경우)
        recommendations[2] = "지역일반고";
        recommended_school_types[2] = "일반고";
    }

    // --- 3지망 추천 로직 ---
    let temp_recs3 = null;
    let temp_rec_type3 = null;

    if (recommendations[1] !== null) { // 1지망이 결정된 경우에만 3지망 탐색
        // 국제고 3지망 (2지망이 외고 또는 자사고일때)
        if (["외고", "자사고"].includes(recommended_school_types[2])) {
            if (TypeB_영어_100점환산 >= 70 && TypeB_수학_100점환산 >= 70 &&
                언어정보처리능력_점수 >= 150 && (B등급과목수_수치 === 2 || B등급과목수_수치 === 3)) {
                if (!["국제고"].includes(recommended_school_types[1]) && !["국제고"].includes(recommended_school_types[2])) {
                    temp_recs3 = `${거주지역} 소재 국제고`;
                    temp_rec_type3 = "국제고";
                }
            }
        }
        
        // 외고 3지망 (2지망이 국제고일때)
        if (temp_recs3 === null && recommended_school_types[2] === "국제고") {
            if (언어정보처리능력_점수 >= 150 && 의약학적성_점수 <= 120 && TypeB_영어_100점환산 >= 80) {
                if (!["외고"].includes(recommended_school_types[1]) && !["외고"].includes(recommended_school_types[2])) {
                    temp_recs3 = `${거주지역} 소재 외고`;
                    temp_rec_type3 = "외고";
                }
            }
        }

        // 자사고 3지망 (2지망이 외고 또는 국제고일때)
        if (temp_recs3 === null && ["외고", "국제고"].includes(recommended_school_types[2])) {
            if (TypeB_영어_100점환산 >= 60 && TypeB_수학_100점환산 >= 60 &&
                    자사고_거주지역_리스트.includes(거주지역) &&
                    B등급과목수_수치 <= 5) {
                if (!["자사고"].includes(recommended_school_types[1]) && !["자사고"].includes(recommended_school_types[2])) {
                    temp_recs3 = `${거주지역} 소재 지역 자사고`;
                    temp_rec_type3 = "자사고";
                }
            }
        }

        // 일반고 3지망 (1, 2지망에 일반고가 없을때)
        if (temp_recs3 === null) {
            if (!["일반고"].includes(recommended_school_types[1]) && !["일반고"].includes(recommended_school_types[2])) {
                temp_recs3 = "지역일반고";
                temp_rec_type3 = "일반고";
            }
        }
    }
    if (temp_recs3) {
        recommendations[3] = temp_recs3;
        recommended_school_types[3] = temp_rec_type3;
    }
            
    return recommendations;
}
