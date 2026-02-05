# 📜 Project Story & History

## 📅 2026-02-05: Pose Matching Calibration Tool Initiation
- **Request**: 사용자가 MediaPipe Pose를 이용한 'Pose Matching Calibration Tool' 제작을 요청함.
- **Goal**: 웹캠을 통해 사용자 포즈를 인식하고, 저장된 타겟 포즈와의 유사도를 실시간으로 비교하는 도구 개발.
- **Key Features**:
    1. **Webcam Feed**: 실시간 포즈 랜드마크 시각화.
    2. **Record Mode**: 현재 포즈(각도, 비율, 스케일) 저장.
    3. **Live Compare Mode**: 타겟 포즈와 실시간 비교 (유사도 %).
    4. **Threshold Slider**: 일치 판정 임계값 조절.
    5. **Algorithm**: 좌표 절대값이 아닌 **각도**와 **비율(손목 크기 등)** 기반 비교.
- **Changes**:
    - (2026-02-05) UI 디자인을 초기 Dark Theme에서 **Light Theme(B&W)**로 변경. 심플함 강조.
    - (2026-02-05) **Full Screen Mode**: 카메라 화면을 전체 배경으로 확장하고, UI를 오버레이(Overlay) 방식으로 변경 요청. 카메라 해상도 최대치 사용.
    - (2026-02-05) **Refined Design**: "구리다"는 피드백 반영. Header(타이틀) 제거, 모든 UI 요소를 한쪽 사이드바(Sidebar)로 통합. 심미성 개선.
