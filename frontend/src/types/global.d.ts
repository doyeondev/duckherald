// orval 타입 선언
// 모듈을 사용하는데 타입 정의가 없는 경우의 임시 해결책
declare module "orval" {
  export function defineConfig(config: any): any;
}

// 추가 전역 타입 선언은 여기에 추가
