# 📋 Feature Specifications (SPEC)

## 1. Pose Matching Calibration Tool
### 1.1. Core Components
- **Framework**: MediaPipe Pose (JavaScript Solution).
- **Input**: Webcam 1080p/720p preferred.
- **Visualization**: HTML5 Canvas overlay on top of Video element.

### 1.2. Functional Requirements
#### A. Record Mode
- **Action**: 'Save' 버튼 클릭 시 현재 프레임의 랜드마크 데이터 캡처.
- **Data Points**:
    - **Angles**: 양 팔꿈치 각도(Left/Right Elbow Angle), 양 어깨 각도(Shoulder Tilt).
    - **Ratios**: 어깨 너비 대비 손목 거리(Depth 인식용), 신체 비율.
- **Output**: 화면에 캡처된 수치(Angles, Ratios) 표시. JSON 포맷 데이터 제공.

#### B. Live Compare Mode
- **Action**: 저장된 Target Pose 데이터와 실시간 Frame 데이터를 매 프레임 비교.
- **Metric**: Similarity Score (0~100%).
    - 각 요소(각도, 비율)별 차이(Difference)를 가중 평균하여 점수화.
    - 손목 랜드마크 크기/위치 비율을 통해 전후 거리감(Depth) 반영.
- **Feedback**:
    - **Score Display**: 화면 중앙 상단에 큰 텍스트로 퍼센트 표시.
    - **Visual Indicator**: 설정된 Threshold 초과 시 녹색(MATCHED!), 미만 시 적색/일반.

#### C. User Interface
- **Theme**: **Light Theme (B&W)**.
    - 배경: White (#FFFFFF).
    - 텍스트/UI: Black (#000000).
    - 심플하고 직관적인 디자인.
- **Control Panel**:
    - Save Button (현재 포즈 저장)
    - Reset Button (저장된 포즈 초기화)
    - Threshold Slider (Range Input, Default 80%)
- **Debug Info**: 현재 계산된 각도 및 비율 수치를 텍스트로 오버레이.

### 1.3. Technical Logic
- **Normalization**: 카메라 거리에 따른 오차를 줄이기 위해 절대 좌표(x,y,z) 대신 **상대적 각도**와 **신체 비율(Body Ratio)** 사용.
- **Depth Estimation**: '손목 랜드마크'와 '어깨' 사이의 거리를 '어깨 너비'로 나눈 비율을 사용하여 손이 카메라 앞으로 나왔는지 판단.
