// Chart.js에 데이터라벨 플러그인 등록
Chart.register(ChartDataLabels);

// 방사형 차트 생성 함수
function createRadarChart(studentData) {
    const ctx = document.getElementById('radarChart').getContext('2d');
    
    // 5점 만점 기준 점수 배열
    const averageScores = SCALES.map(scale => 
        studentData.scaleScores[scale.key] / 40
    );
    
    // 차트 생성
    const radarChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: SCALES.map(scale => scale.name),
            datasets: [{
                label: '평균 점수 (5점 만점)',
                data: averageScores,
                fill: true,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgb(54, 162, 235)',
                pointBackgroundColor: SCALES.map(scale => scale.pointColor),
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgb(54, 162, 235)',
                borderWidth: 2,
                pointRadius: 6
            }]
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: '6척도 절대점수 프로파일',
                    color: '#ffffff',
                    font: {
                        size: 18,
                        weight: 'bold'
                    },
                    padding: {
                        top: 20,
                        bottom: 20
                    }
                },
                legend: {
                    display: false
                },
                datalabels: {
                    color: '#ffffff',
                    anchor: 'end',
                    align: 'end',
                    offset: 10,
                    formatter: (value) => value.toFixed(1),
                    font: {
                        weight: 'bold',
                        size: 14
                    }
                }
            },
            scales: {
                r: {
                    min: 0,
                    max: 5,
                    ticks: {
                        stepSize: 1,
                        display: true,
                        backdropColor: 'transparent',
                        color: 'rgba(255, 255, 255, 0.7)',
                        font: {
                            size: 12
                        }
                    },
                    angleLines: {
                        color: 'rgba(255, 255, 255, 0.2)'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.2)'
                    },
                    pointLabels: {
                        color: '#ffffff',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    }
                }
            }
        }
    });
    
    return radarChart;
}

// 정규분포 차트 생성 함수
function createNormalDistributionChart(canvasId, scaleKey, studentData) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    const scaleInfo = SCALES.find(s => s.key === scaleKey);
    const score = studentData.scaleScores[scaleKey];
    
    // 표준화된 점수로 변환 (실제 구현에서는 Excel 데이터의 Z-score 사용 가능)
    const zScore = calculateZScore(score, NORMAL_DIST.mean, NORMAL_DIST.stdDev);
    const percentile = calculatePercentile(zScore);
    
    // 정규분포 데이터 생성
    const normalDistData = generateNormalDistributionData(
        NORMAL_DIST.mean, 
        NORMAL_DIST.stdDev, 
        NORMAL_DIST.minScore, 
        NORMAL_DIST.maxScore
    );
    
    // 학생 점수 이상 영역 데이터
    const studentAreaData = normalDistData.filter(point => point.x >= score);
    
    // 차트 생성
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
                // 정규분포 곡선
                {
                    label: '정규분포',
                    data: normalDistData,
                    borderColor: 'rgba(100, 100, 100, 0.5)',
                    backgroundColor: 'rgba(100, 100, 100, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0
                },
                // 학생 위치 오른쪽 영역 채우기
                {
                    label: '상위 영역',
                    data: studentAreaData,
                    borderColor: scaleInfo.color,
                    backgroundColor: scaleInfo.color.replace(')', ', 0.3)').replace('rgb', 'rgba'),
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 0
                },
                // 학생 위치 포인트
                {
                    label: '학생 위치',
                    data: [{ 
                        x: score, 
                        y: (1 / (NORMAL_DIST.stdDev * Math.sqrt(2 * Math.PI))) * 
                            Math.exp(-(Math.pow((score - NORMAL_DIST.mean) / NORMAL_DIST.stdDev, 2) / 2)) 
                    }],
                    backgroundColor: scaleInfo.color,
                    borderColor: scaleInfo.color,
                    pointRadius: 8,
                    pointHoverRadius: 10,
                    showLine: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    min: NORMAL_DIST.minScore,
                    max: NORMAL_DIST.maxScore,
                    title: {
                        display: true,
                        text: '점수',
                        font: {
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(200, 200, 200, 0.3)'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '빈도',
                        font: {
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(200, 200, 200, 0.3)'
                    },
                    ticks: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: scaleInfo.name,
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                subtitle: {
                    display: true,
                    text: `Z점수: ${zScore.toFixed(2)}, 백분위: ${percentile}%`,
                    font: {
                        size: 12
                    },
                    padding: {
                        bottom: 10
                    }
                },
                datalabels: {
                    display: function(context) {
                        return context.datasetIndex === 2; // 학생 위치 데이터셋에만 표시
                    },
                    color: '#000000',
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    borderRadius: 4,
                    font: {
                        weight: 'bold',
                        size: 11
                    },
                    padding: 4,
                    formatter: function() {
                        return `상위 ${100 - percentile}%`;
                    }
                }
            }
        }
    });
    
    // 차트 높이 설정
    ctx.canvas.parentNode.style.height = '300px';
    
    return chart;
}

// 사분면 차트 생성 함수
function createQuadrantChart(studentData) {
    const ctx = document.getElementById('quadrantChart').getContext('2d');
    
    const chart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: '학생 위치',
                data: [{
                    x: studentData.quadrantData.x,
                    y: studentData.quadrantData.y
                }],
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgb(255, 99, 132)',
                pointRadius: 10,
                pointHoverRadius: 12
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    min: -100,
                    max: 100,
                    title: {
                        display: true,
                        text: '교과형(-) ⟷ 종합형(+)',
                        font: {
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: function(context) {
                            if (context.tick.value === 0) {
                                return 'rgba(0, 0, 0, 0.5)';
                            }
                            return 'rgba(0, 0, 0, 0.1)';
                        },
                        lineWidth: function(context) {
                            if (context.tick.value === 0) {
                                return 2;
                            }
                            return 1;
                        }
                    }
                },
                y: {
                    type: 'linear',
                    min: -100,
                    max: 100,
                    title: {
                        display: true,
                        text: '면접형(-) ⟷ 서류형(+)',
                        font: {
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: function(context) {
                            if (context.tick.value === 0) {
                                return 'rgba(0, 0, 0, 0.5)';
                            }
                            return 'rgba(0, 0, 0, 0.1)';
                        },
                        lineWidth: function(context) {
                            if (context.tick.value === 0) {
                                return 2;
                            }
                            return 1;
                        }
                    }
                },
                plugins: {
                    datalabels: {
                        color: '#000000',
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        borderRadius: 4,
                        font: {
                            weight: 'bold',
                            size: 11
                        },
                        padding: 4,
                        formatter: function() {
                            // 사분면에 따른 레이블
                            const x = studentData.quadrantData.x;
                            const y = studentData.quadrantData.y;
                            
                            if (x >= 0 && y >= 0) return '종합형-서류형';
                            if (x < 0 && y >= 0) return '교과형-서류형';
                            if (x < 0 && y < 0) return '교과형-면접형';
                            return '종합형-면접형';
                        }
                    }
                },
                // 사분면에 텍스트 추가
                animation: {
                    onComplete: function() {
                        const chart = this;
                        const ctx = chart.ctx;
                        const xAxis = chart.scales.x;
                        const yAxis = chart.scales.y;
                        
                        ctx.save();
                        ctx.font = '14px Arial';
                        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
                        ctx.textAlign = 'center';
                        
                        // 1사분면 (종합형-서류형)
                        ctx.fillText('종합형-서류형', 
                                    xAxis.getPixelForValue(70), 
                                    yAxis.getPixelForValue(70));
                        
                        // 2사분면 (교과형-서류형)
                        ctx.fillText('교과형-서류형', 
                                    xAxis.getPixelForValue(-70), 
                                    yAxis.getPixelForValue(70));
                        
                        // 3사분면 (교과형-면접형)
                        ctx.fillText('교과형-면접형', 
                                    xAxis.getPixelForValue(-70), 
                                    yAxis.getPixelForValue(-70));
                        
                        // 4사분면 (종합형-면접형)
                        ctx.fillText('종합형-면접형', 
                                    xAxis.getPixelForValue(70), 
                                    yAxis.getPixelForValue(-70));
                        
                        ctx.restore();
                    }
                }
            }
        }
    });
    
    // 차트 높이 설정
    ctx.canvas.parentNode.style.height = '400px';
    
    return chart;
}

// 학업성취도 차트 생성 함수
function createAcademicChart(studentData) {
    const ctx = document.getElementById('academicChart').getContext('2d');
    
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['B등급과목수', '영어(50점 만점)', '수학(50점 만점)'],
            datasets: [
                {
                    label: '원점수',
                    data: [
                        studentData.bGradeCount,
                        studentData.academicData.english.score,
                        studentData.academicData.math.score
                    ],
                    backgroundColor: 'rgba(54, 162, 235, 0.7)',
                    borderColor: 'rgb(54, 162, 235)',
                    borderWidth: 1,
                    order: 2
                },
                {
                    label: 'Z-Score (상대위치)',
                    data: [
                        0, // B등급과목수는 Z-Score 없음
                        studentData.academicData.english.zScore,
                        studentData.academicData.math.zScore
                    ],
                    backgroundColor: 'rgba(255, 99, 132, 0.7)',
                    borderColor: 'rgb(255, 99, 132)',
                    borderWidth: 1,
                    type: 'line',
                    order: 1,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '점수',
                        font: {
                            weight: 'bold'
                        }
                    }
                },
                y1: {
                    position: 'right',
                    beginAtZero: true,
                    min: -3,
                    max: 3,
                    title: {
                        display: true,
                        text: 'Z-Score',
                        font: {
                            weight: 'bold'
                        }
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            },
            plugins: {
                datalabels: {
                    color: '#000000',
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    borderRadius: 4,
                    font: {
                        weight: 'bold',
                        size: 11
                    },
                    padding: 4,
                    formatter: function(value, context) {
                        if (context.datasetIndex === 0) {
                            return value;
                        } else {
                            return value ? value.toFixed(2) : '';
                        }
                    }
                }
            }
        }
    });
    
    // 차트 높이 설정
    ctx.canvas.parentNode.style.height = '400px';
    
    return chart;
}

// 점수 테이블 업데이트 함수
function updateScoreTable(studentData) {
    const tableBody = document.getElementById('scaleTableBody');
    tableBody.innerHTML = '';
    
    SCALES.forEach(scale => {
        const score = studentData.scaleScores[scale.key];
        const averageScore = score / 40; // 5점 만점으로 변환
        
        // Z-score 및 백분위 계산
        const zScore = calculateZScore(score, NORMAL_DIST.mean, NORMAL_DIST.stdDev);
        const percentile = calculatePercentile(zScore);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${scale.name}</td>
            <td>${score}</td>
            <td>${averageScore.toFixed(1)}</td>
            <td>${zScore.toFixed(2)}</td>
            <td>${percentile}%</td>
            <td>상위 ${(100 - percentile).toFixed(1)}%</td>
        `;
        
        tableBody.appendChild(row);
    });
}
