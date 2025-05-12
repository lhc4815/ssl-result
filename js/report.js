document.addEventListener('DOMContentLoaded', function() {
    // URL에서 학생 ID와 이름 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const studentId = urlParams.get('id');
    const studentName = urlParams.get('name');

    if (!studentId || !studentName) {
        // ID나 이름이 없으면 검색 페이지로 리다이렉트
        window.location.href = 'index.html';
        return;
    }

    const loadingDiv = document.getElementById('loading');
    const errorDiv = document.getElementById('error');
    const reportContentDiv = document.getElementById('report-content');

    // 학생 데이터 로딩 (샘플)
    fetch('data/students.json')
        .then(response => response.json())
        .then(students => {
            const student = students.find(s => s.학생ID === studentId && s.학생성명 === studentName);

            if (student) {
                loadingDiv.style.display = 'none';
                reportContentDiv.style.display = 'block';
                loadStudentData(student);
                createCharts(student);
            } else {
                loadingDiv.style.display = 'none';
                errorDiv.style.display = 'block';
                errorDiv.innerText = '학생 정보를 찾을 수 없습니다.';
            }
        })
        .catch(error => {
            loadingDiv.style.display = 'none';
            errorDiv.style.display = 'block';
            errorDiv.innerText = '데이터 로딩 중 오류가 발생했습니다.';
            console.error('데이터 로딩 오류:', error);
        });

    function loadStudentData(student) {
        document.getElementById('studentId').innerText = student.학생ID;
        document.getElementById('studentName').innerText = student.학생성명;
        document.getElementById('studentSchool').innerText = student.출신학교;
        document.getElementById('testDate').innerText = new Date().toLocaleDateString('ko-KR');
    }

    function createCharts(student) {
        const processedData = processExcelData(student);

        // 1. 6척도 절대점수 프로파일 (방사형 차트)
        createRadarChart(processedData);

        // 2. 6척도 상대점수 (표준정규분포)
        createNormalDistributionCharts(processedData);

        // 3. 6척도 점수 요약
        updateScaleTable(processedData);

        // 4. 교과형 vs 종합형, 서류형 vs 면접형
        createQuadrantChart(processedData);

        // 5. 학업성취도 분석
        createAcademicChart(processedData);
    }

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
    function createNormalDistributionCharts(studentData) {
        SCALES.forEach(scale => {
            const chartId = scale.key + 'Chart';
            const ctx = document.getElementById(chartId).getContext('2d');
            const chart = new Chart(ctx, {
                type: 'line',
                data: {
                    datasets: [
                        // 정규분포 곡선
                        {
                            label: '정규분포',
                            data: generateNormalDistributionData(100, 20, 40, 160),
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
                            data: generateNormalDistributionData(100, 20, 40, 160).filter(point => point.x >= studentData.scaleScores[scale.key]),
                            borderColor: scale.color,
                            backgroundColor: scale.color.replace(')', ', 0.3)').replace('rgb', 'rgba'),
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
                                x: studentData.scaleScores[scale.key], 
                                y: (1 / (NORMAL_DIST.stdDev * Math.sqrt(2 * Math.PI))) * 
                                    Math.exp(-(Math.pow((studentData.scaleScores[scale.key] - NORMAL_DIST.mean) / NORMAL_DIST.stdDev, 2) / 2)) 
                            }],
                            backgroundColor: scale.color,
                            borderColor: scale.color,
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
                            text: scale.name,
                            font: {
                                size: 16,
                                weight: 'bold'
                            }
                        },
                        subtitle: {
                            display: true,
                            text: `Z점수: ${calculateZScore(studentData.scaleScores[scale.key], NORMAL_DIST.mean, NORMAL_DIST.stdDev).toFixed(2)}, 백분위: ${calculatePercentile(calculateZScore(studentData.scaleScores[scale.key], NORMAL_DIST.mean, NORMAL_DIST.stdDev))}%`,
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
                        formatter: function(value, context) {
                            const zScore = calculateZScore(studentData.scaleScores[scale.key], NORMAL_DIST.mean, NORMAL_DIST.stdDev);
                            const percentile = calculatePercentile(zScore);
                            return `상위 ${(100 - percentile).toFixed(1)}%`;
                        }
                        }
                    }
                }
            });
            
            // 차트 높이 설정
            ctx.canvas.parentNode.style.height = '300px';
        });
    }

    function updateScaleTable(studentData) {
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

    // 닫는 괄호 추가: createQuadrantChart와 createAcademicChart 함수 정의
    function createQuadrantChart(studentData) {
        // 구현될 예정
    }

    function createAcademicChart(studentData) {
        // 구현될 예정
    }
});
