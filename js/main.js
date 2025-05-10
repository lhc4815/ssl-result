const searchButton = document.getElementById('searchButton');
if (searchButton) {
    searchButton.addEventListener('click', function() {
        const studentId = document.getElementById('studentId').value;
        const studentName = document.getElementById('studentName').value;

        // TODO: 학생 ID와 이름을 사용하여 학생 정보를 검색하고,
        //       결과 페이지로 이동하는 로직을 구현합니다.
        // 실제 구현에서는 서버 요청 또는 로컬 스토리지 확인
        // 샘플 구현에서는 URL 파라미터로 전달
        window.location.href = `student_report.html?id=${encodeURIComponent(studentId)}&name=${encodeURIComponent(studentName)}`;
    });
}
